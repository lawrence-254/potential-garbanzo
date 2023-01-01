#!/usr/bin/env python3
'''
a function that inserts an item at any position in an array
'''


def insert_at_any_point(array, num_to_insert, index_to_insert_to, arr_size):
    '''
    new array
    '''
    # arr_size = len(array)
    # while (arr_size > index_to_insert_to):
    for i in range(arr_size - 1, index_to_insert_to-1, -1):
        array[i + 1] = array[i]

    array[index_to_insert_to]


if __name__ == '__main__':
    pass