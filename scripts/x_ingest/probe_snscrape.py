import subprocess
import time

start = time.time()
try:
    # Use snscrape via subprocess to avoid any potential import issues with Python 3.12
    # (since finding/loading modules in snscrape was flagged as a bug)
    cmd = ["snscrape", "--max-results", "3", "twitter-search", "PulseChain LPX"]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    print(f"Stdout:\n{res.stdout}")
    print(f"Stderr:\n{res.stderr}")
    print(f"Return code: {res.returncode}")
except Exception as e:
    print(f"Error: {e}")
print(f"Time elapsed: {time.time() - start:.2f}s")
