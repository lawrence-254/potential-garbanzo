#!/usr/bin/env python3
'''
imports async generator then writes a coroutine called async_comprehension
that takes no arguments.
the coroutine will collect 10 random numbers using an async comprehensing over async_generator
then return the 10 random numbers
'''


import asyncio
import random
async_generator = __import__('0-async_generator').async_generator