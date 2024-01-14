#!/usr/bin/env python3
'''
Array in python is also known as lists
'''

'''defines a list'''
my_list = [1,2,3,4,5]

print('My list without any modification: ', my_list)
'''adds the number 6 at the end of the list'''
my_list.append(6)

print('My list after appending 6: ', my_list)
'''adds the number 7 at the specified index 7(in this case)'''
my_list.insert(6,7)

print('My list after inserting 7 at index 6: ', my_list)
'''removes the first occurence of the number 7 from the list'''
my_list.remove(7)

print('My list after removing 7: ', my_list)
'''remove and returns the specified index from the list'''
my_list.pop(4)

print('My list after popping 1: ', my_list)

for l in my_list:
    print(l)
