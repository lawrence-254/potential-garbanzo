#!/usr/bin/env python3



import asyncio

async def run(num: int):
    for i in range(num):
        yield i
        await asyncio.sleep(0.5)

async def main():
    odd_num = [i async for i in run(100) if i % 2]
    print(odd_num)

if __name__ == '__main__':
    e_loop = asyncio.get_event_loop()
    try:
        e_loop.run_until_complete(main())
    finally:
        e_loop.close()

loop = asyncio.get_event_loop()
loop.run_until_complete(run())
