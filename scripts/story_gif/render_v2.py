import asyncio
import os
import subprocess
from playwright.async_api import async_playwright

FPS = 30
DURATION = 5.5
TOTAL_FRAMES = int(FPS * DURATION)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            viewport={"width": 1080, "height": 1920}, device_scale_factor=1
        )

        # We must serve via local HTTP server to avoid CORS issues with fonts, as per instructions.
        # Start a local HTTP server in the background
        import http.server
        import socketserver
        import threading

        PORT = 8000
        Handler = http.server.SimpleHTTPRequestHandler

        # We need a custom handler to serve from the correct directory without changing cwd
        class CustomHandler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=".", **kwargs)

        httpd = socketserver.TCPServer(("", PORT), CustomHandler)
        server_thread = threading.Thread(target=httpd.serve_forever)
        server_thread.daemon = True
        server_thread.start()

        # Load the HTML
        file_path = f"http://localhost:{PORT}/scripts/story_gif/scene_v2.html"
        await page.goto(file_path)
        # Wait for fonts to load
        await page.evaluate("document.fonts.ready")

        # Since we use requestAnimationFrame with timestamp, we can control time by
        # overriding performance.now and Date.now, OR we can just use a simpler approach
        # like stepping time in the animation loop.

        # Let's inject a time-controlling script before starting animation
        await page.evaluate("""
            window.currentTime = 0;
            window.originalRequestAnimationFrame = window.requestAnimationFrame;
            window.animationCallbacks = [];

            window.requestAnimationFrame = function(cb) {
                window.animationCallbacks.push(cb);
                return 0;
            };

            window.stepTime = function(ms) {
                window.currentTime = ms;
                const callbacks = window.animationCallbacks;
                window.animationCallbacks = [];
                for (const cb of callbacks) {
                    cb(window.currentTime);
                }
            };
        """)

        # Start animation (it sets startTime=0, then we control it)
        await page.evaluate("window.startAnimation()")

        print("Rendering frames...")
        for frame in range(TOTAL_FRAMES):
            ms = (frame / FPS) * 1000
            await page.evaluate(f"window.stepTime({ms})")

            # Wait a tiny bit just to ensure rendering is complete
            # but playwright's screenshot usually ensures it
            await page.screenshot(path=f"scripts/story_gif/frame_{frame:04d}.png")

            if frame % 10 == 0:
                print(f"Frame {frame}/{TOTAL_FRAMES}")

        await browser.close()
        httpd.shutdown()

    print("Composing GIF...")
    subprocess.run(
        'ffmpeg -y -framerate 30 -i scripts/story_gif/frame_%04d.png -vf "fps=20,scale=1080:-1:flags=lanczos,palettegen" scripts/story_gif/palette.png',
        shell=True,
        check=True,
    )
    subprocess.run(
        'ffmpeg -y -framerate 30 -i scripts/story_gif/frame_%04d.png -i scripts/story_gif/palette.png -lavfi "fps=20,scale=1080:-1:flags=lanczos[x];[x][1:v]paletteuse" public/share/lpx-story-v2.gif',
        shell=True,
        check=True,
    )

    print("Optimizing GIF...")
    subprocess.run(
        "gifsicle -O3 --lossy=80 public/share/lpx-story-v2.gif -o public/share/lpx-story-v2.gif",
        shell=True,
        check=True,
    )

    print("Composing MP4...")
    subprocess.run(
        "ffmpeg -y -framerate 30 -i scripts/story_gif/frame_%04d.png -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart public/share/lpx-story-v2.mp4",
        shell=True,
        check=True,
    )

    print("Cleanup...")
    subprocess.run(
        "rm scripts/story_gif/frame_*.png scripts/story_gif/palette.png", shell=True
    )

    # Verification
    gif_size = os.path.getsize("public/share/lpx-story-v2.gif")
    print(f"GIF Size: {gif_size / 1024 / 1024:.2f} MB")
    if gif_size < 4_500_000:
        print("OK GIF size")
    else:
        print("WARNING: GIF SIZE > 4.5MB!")


if __name__ == "__main__":
    asyncio.run(main())
