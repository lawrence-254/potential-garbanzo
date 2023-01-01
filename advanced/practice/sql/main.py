#!/usr/bin/env python3
import cmd

class Student:
    def __init__(self, name, email):
        self.email = email
        self.name = name
        self.corrections = []

    def add_correction(self, correction):

        self.corrections.append(correction)


class Correction:
    def __init__(self, link):
        self.link = link


class Storage:
    def __init__(self,):
        self.students = []

    def add_student(self, name, email):
        new_student = Student(name,email)