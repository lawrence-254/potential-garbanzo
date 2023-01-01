#!/usr/bin/env python3
'''
A method that determines if a given data set represents a valid UTF-8 encoding
'''


def validUTF8(data):
    '''
    return True if data is a valid utf-8 encoding, else return false
    A character in UTF-8 can be 1 to 4 bytes long
    The data set can contain multiple characters
    The data will be represented by a list of integers
    Each integer represents 1 byte of data, therefore you only need to handle
    the 8 least significant bits of each integer
    '''