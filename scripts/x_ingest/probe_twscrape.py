import asyncio
from twscrape import API, gather

async def main():
    api = API()
    # add account (guest-flow equivalent?) -> twscrape needs accounts
    # await api.pool.add_account("user", "pass", "email", "email_pass")
    # await api.pool.login_all()
    try:
        tweets = await gather(api.search("PulseChain LPX", limit=3))
        print(f"count: {len(tweets)}")
        for t in tweets:
            print(t.user.username, t.rawContent[:50])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
