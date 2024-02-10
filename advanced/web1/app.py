#!/bin/env python3
from flask import Flask, render_template
import request
import json


app = Flask(__name__)


def fetch_reddit_mem():
    reddit_url = "https://meme-api.herokuapp.com/gimme"
    response = json.loads(requests.request("GET", url).text)
    meme = response["preview"][-2]
    subreddit = response["subreddit"]
    return meme, subreddit


@app.route("/")
def index():
    meme, subreddit = fetch_reddit_mem()
    return 'home'


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port="5000")