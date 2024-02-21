#!/usr/bin/env python3
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

STUDENTS={}

COURSES = ['Arts','Education','Humanities','Medicine', 'science','Tech']

@app.route('/')
def index():
    return render_template('index.html', courses=COURSES)

@app.route('/register', methods=["get", "post"])
def register():
    name = request.form.get("name")
    area = request.form.get("course")
    if not name or area not in COURSES:
        return "failure"
    STUDENTS[name] = area
    return redirect("/review")


@app.route('/review')
def review():
    return render_template('review.html', std=STUDENTS)


if __name__=="__main__":
    app.run(debug=True)