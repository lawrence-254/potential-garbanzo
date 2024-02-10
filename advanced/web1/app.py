#!/bin/env python3
from flask import Flask, render_template
import requests
import json


app = Flask(__name__)


def fetch_reddit_mem():
    reddit_url = "https://meme-api.com/gimme"

    # Make the GET request
    response = requests.get(reddit_url)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Extract the meme URL and subreddit
        meme_url = data["preview"][-1]  # Use [-1] instead of [-2] to get the highest resolution image
        subreddit = data["subreddit"]

        return meme_url, subreddit
    else:
        # If the request was not successful, print an error message
        print(f"Failed to fetch meme. Status code: {response.status_code}")
        return None, None

@app.route("/")
def index():
    meme, subreddit = fetch_reddit_mem()
    return render_template('index.html', meme=meme, subreddit=subreddit)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port="5000")