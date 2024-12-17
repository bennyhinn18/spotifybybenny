from flask import Flask, request, jsonify, render_template
from yt_dlp import YoutubeDL
import requests
import os
from dotenv import load_dotenv
from youtubesearchpython import VideosSearch

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
API_KEY = os.getenv('API_KEY')
RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY')
BASE_URL = 'https://www.googleapis.com/youtube/v3'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query')
    url = f"{BASE_URL}/search?part=snippet&type=video&q={query}&key={API_KEY}"
    response = requests.get(url)
    data = response.json()
    results = [
        {
            'title': item['snippet']['title'],
            'videoId': item['id']['videoId'],
            'thumbnail': item['snippet']['thumbnails']['default']['url']
        }
        for item in data.get('items', [])
    ]
    return jsonify(results)

@app.route('/recommend', methods=['GET'])
def recommend():
    video_id = request.args.get('video_id')
    if not video_id:
        return jsonify({'error': 'Video ID is required'}), 400

    # Fetch recommended videos using RapidAPI YouTube Data API
    url = "https://youtube-v31.p.rapidapi.com/search"
    querystring = {
        "relatedToVideoId": video_id,
        "part": "id,snippet",
        "type": "video",
        "maxResults": "50"
    }
    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "youtube-v31.p.rapidapi.com"
    }
    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()

    # Check if 'items' key is in the response
    if 'items' not in data:
        return jsonify({'error': 'No recommendations found'}), 404

    recommendations = [
        {
            'title': item['snippet']['title'],
            'videoId': item['id']['videoId'],
            'thumbnail': item['snippet']['thumbnails']['default']['url']
        }
        for item in data['items']
    ]
    return jsonify(recommendations)

@app.route('/stream', methods=['GET'])
def stream():
    video_id = request.args.get('video_id')
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {'format': 'bestaudio/best', 'quiet': True}
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
        return jsonify({'audio_url': info['url']})

if __name__ == '__main__':
    app.run(debug=True)