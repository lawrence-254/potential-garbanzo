#!/usr/bin/env python3

'''
inserts an item at the end of an array
'''

def insert_at_the_end(arr, item):
    arr.append(item)

if __name__ == '__main__':
    odd = [1, 3. 5, 7, 9]
    no = 11

    insert(odd, no)
    print(odd)