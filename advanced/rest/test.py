#!/usr/bin/env python3
import requests

BASE = "http://0.0.0.0:5001/"

response=requests.get(BASE + "helloworld")
print(response.json())