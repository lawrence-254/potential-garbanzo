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
        self.students.append(new_student)

    def add_correction_std(self, std_email, link):
        for student in self.students:
            if student.email == std_email:
                correction = Correction.link
                student.add_correction(correction)

    def list_students(self):
        for student in self.students:
            print(f"student: {student.name}, email: {student.email}")
            for student in student.correction:
                print(f" correction: {correction.link}")