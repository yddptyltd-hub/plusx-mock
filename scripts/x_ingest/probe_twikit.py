import asyncio
import time
from twikit import Client

async def main():
    start = time.time()
    try:
        client = Client('en-US')
        # Twikit usually requires login, but let's test guest access if any
        # client.login(...) is required, but we are testing guest-flow
        tweets = await client.search_tweet('PulseChain LPX', 'Latest')
        print(f"count: {len(tweets)}")
        for t in list(tweets)[:3]:
            print(t.user.name, t.text[:50])
    except Exception as e:
        print(f"Error: {e}")
    print(f"Time elapsed: {time.time() - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(main())
