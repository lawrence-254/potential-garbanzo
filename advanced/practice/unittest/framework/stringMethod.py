#!/usr/bin/env python3
'''
A module that tests string methods
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

    def test_split(self):
        '''
        splits a word at space or specified differentiator
        '''
        s = 'hello python3'
        self.assertEqual(s.split(), [hello python3])

        with self.assertRaises(TypeError):
            s.split(2)

if __name__ == '__main__':
    unittest.main