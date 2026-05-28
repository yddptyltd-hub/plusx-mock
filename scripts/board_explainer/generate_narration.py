#!/usr/bin/env python3
"""Generate narration MP3 for board-explainer Q3 v4."""

import asyncio
import json
import os
import subprocess
import tempfile
import edge_tts

VOICE = "en-US-AriaNeural"
BASE = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(BASE, "../../public/board-explainer")
TIMESTAMP_FILE = os.path.join(BASE, "section_timestamps.json")
OUTPUT_MP3 = os.path.join(OUTPUT_DIR, "narration.mp3")

# Load verbatim section text from companion file
from narration_text import SECTIONS


async def render_section(num, text, out):
    communicate = edge_tts.Communicate(text, VOICE, rate="-10%")
    await communicate.save(out)
    print(f"  Section {num}: done")


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    tmpdir = tempfile.mkdtemp(prefix="board_explainer_")

    section_files = []
    for num in range(1, 10):
        out = os.path.join(tmpdir, f"section_{num}.mp3")
        await render_section(num, SECTIONS[num], out)
        section_files.append(out)

    silence_mp3 = os.path.join(tmpdir, "silence.mp3")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=r=24000:cl=mono",
            "-t",
            "0.8",
            "-ar",
            "24000",
            "-ac",
            "1",
            "-b:a",
            "64k",
            silence_mp3,
        ],
        check=True,
        capture_output=True,
    )

    def dur(p):
        r = subprocess.run(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                p,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        return float(r.stdout.strip())

    sil_dur = dur(silence_mp3)
    timestamps, t = {}, 0.0
    for i, sf in enumerate(section_files):
        n = i + 1
        timestamps[n] = round(t, 3)
        t += dur(sf)
        if n < 9:
            t += sil_dur

    print(f"Timestamps: {timestamps}")
    with open(TIMESTAMP_FILE, "w") as f:
        json.dump(timestamps, f, indent=2)

    concat = os.path.join(tmpdir, "concat.txt")
    with open(concat, "w") as f:
        for i, sf in enumerate(section_files):
            f.write(f"file '{sf}'\n")
            if i < 8:
                f.write(f"file '{silence_mp3}'\n")

    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            concat,
            "-ar",
            "24000",
            "-ac",
            "1",
            "-b:a",
            "64k",
            OUTPUT_MP3,
        ],
        check=True,
    )

    size = os.path.getsize(OUTPUT_MP3)
    d = dur(OUTPUT_MP3)
    print(
        f"Duration: {d:.1f}s ({d / 60:.1f}min), Size: {size / 1024:.1f}KB ({size / 1024 / 1024:.2f}MB)"
    )

    if size > 4 * 1024 * 1024:
        tmp = OUTPUT_MP3 + ".tmp"
        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i",
                OUTPUT_MP3,
                "-ar",
                "22050",
                "-ac",
                "1",
                "-b:a",
                "48k",
                tmp,
            ],
            check=True,
            capture_output=True,
        )
        os.replace(tmp, OUTPUT_MP3)
        print(f"Re-encoded: {os.path.getsize(OUTPUT_MP3) / 1024:.1f}KB")


if __name__ == "__main__":
    asyncio.run(main())
