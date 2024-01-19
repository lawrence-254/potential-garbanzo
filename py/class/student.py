#!/usr/bin/env python3

class Student:
    def __init__(self, name, admin_no, course):
        self.name = name
        self.admin_no = admin_no
        self.course = course

student1 = Student('jane', 456, 'dcom')

print(student1.name)