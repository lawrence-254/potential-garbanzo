#!/usr/bin/env python3
'''
A module that tests three string methods
'''
import unittest

class TestingStringMethods(unittest.TestCase):
    '''
    a class containing tests for various string methods
    '''

    def test_upper(self):
        '''
        tests if the characters of a given string is in uppercase
        '''
        self.assertEqual('foo'.upper(), 'FOO')