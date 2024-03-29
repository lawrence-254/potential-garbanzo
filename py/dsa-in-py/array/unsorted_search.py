#!/usr/bin/env python 3
'''search operation in unsorted array'''


def searchElem(arr, arr_size, key):
    '''
    returns the searched items if found else returns -1
    '''
    for i in range(arr_size):
        '''iterates through the array to search for the given value'''
        if (arr[i] == key):
            return i
    return -1


if __name__ == '__main__':
    arr = [1, 3, 5, 7, 9]
    key = 9
    arr_size = len(arr)

    item = searchElem(arr, arr_size, key)
    if item != -1:
        print('element is at index: ' + str(item))
    else:
        print('not found')
