#!/usr/bin/env python3
import cmd
from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, ForeignKey, String

Base = declarative_base()
class Student(Base):
    __tablename__ = 'students'
    id = Column(integer, primary_key=True)
    email = Column(String(100), unique=True)
    name = Column(String(50))
    corrections = relationship('corrections', back_populates='students')

    def add_correction(self, correction):
        self.corrections.append(correction)


class Correction:
    def __init__(self, link):
        self.link = link


class Storage:
    def __init__(self,):
        self.connection = MySQLdb.connect(host='localhost', user='root', password='', db='marks')
        self.cursor = self.connection.cursor()
        self.students = self.fetch_all_students()

    def fetch_all_students(self):
        students = []
        query = """
        SELECT students.name, students.email, corrections.link
        FROM students
        LEFT JOIN corrections ON students.id = corrections.student_id
        """
        self.cursor.execute(query)
        current_student = None
        for row in self.cursor.fetchall():
            name, email, link = row
            if not current_student or current_student.email != email:
                current_student = Student(name,email)
                students.append(current_student)
            if link:
                current_student.add_correction(Correction(link))
        return students

    def add_student(self, name, email):
        new_student = Student(name,email)
        self.students.append(new_student)
        query = "INSERT INTO students (name, email) VALUES (%s, %s)"
        self.cursor.execute(query, (name, email))
        print('student added successfully')
        self.connection.commit()

    def add_correction(self, std_email, link):
        for student in self.students:
            if student.email == std_email:
                correction = Correction(link)
                student.add_correction(correction)

                query = "SELECT id FROM students WHERE email = %s"
                self.cursor.execute(query, (std_email))
                std_id = self.cursor.fetchone()[0]

                query = "INSERT INTO corrections (link, student_id) VALUES (%s, %s)"
                self.cursor.execute(query,(link, std_id))
                print('correction successful')
                self.connection.commit()
            else:
                print('email not found')


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