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

    def add_correction(self, std_email, link):
        for student in self.students:
            if student.email == std_email:
                correction = Correction(link)
                student.add_correction(correction)

    def list_students(self):
        for student in self.students:
            print(f"student: {student.name}, email: {student.email}")
            for student in student.corrections:
                print(f" correction: {correction.link}")

class StudentAssignmentCli(cmd.Cmd):
    def __init__(self):
        super().__init__()
        self.prompt ="@∞# "
        self.intro = "Welcome to correction management tool"

    def do_add_student(self, arg):
        '''used to add student: add_student <student_name> <student_email>'''
        args = arg.split()
        if  len(args) != 2:
            print(f'Usage: add_student <student_name> <student_email>')
            return
        name, email = args
        storage.add_student(name, email)

    def do_add_correction(self, arg):
        '''used to make correction: add_correction <student_email> <correction_link>'''
        args = arg.split()
        if len(args) != 2:
            print(f'Usage: add_correction <student_email> <correction_link>')
            return
        email, link = args
        storage.add_correction(email, link)

    def do_list_students(self, arg):
        '''lists all students and corrections'''
        storage.list_students()


    def do_quit(self, arg):
        '''exists the prompt'''
        print('BYE...')
        return True

if __name__ == '__main__':
    storage =Storage()
    cli = StudentAssignmentCli()
    cli.cmdloop()