#!/usr/bin/env python3
'''
Array in python is also known as lists
'''

my_list = [1,2,3,4,5]

print('My list without any modification: ', my_list)

my_list.append(6)

print('My list after appending 6: ', my_list)

my_list.insert(6,7)

print('My list after inserting 7 at index 6: ', my_list)

my_list.remove(7)

print('My list after removing 7: ', my_list)

my_list.pop(6)

print('My list after popping 1: ', my_list)
