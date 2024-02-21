#!/usr/bin/env python3
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=["get", "post"])
def register():
    name = request.form.get("name")
    area = request.form.get("course")
    if not name or not area:
        return "failure"
    return render_template('register.html', area=area, name=name)


if __name__=="__main__":
    app.run(debug=True)