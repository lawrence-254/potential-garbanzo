#!/usr/bin/env python3
from flask import Flask
from flask_restful import Api, Resource

app = Flask(__name__)
api = Api(app)

class HelloWorld(Resource):
    def get(self):
        return {"greeting": "hello world"}

    def post(self):
        return {"data": "posted"}

api.add_resource(HelloWorld, "/helloworld/<int>")
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port="5001")