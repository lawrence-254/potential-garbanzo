#!/usr/bin/env python3
import sys
# print(type(sys))
def linux_interaction():
    assert('darwin' in sys.platform), 'requires darwin to run'
    print('running')
try:
    linux_interaction()
except AssertionError as e:
    print(e)
    print('not darwin')