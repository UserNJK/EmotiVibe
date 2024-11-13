from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fer import FER
import cv2
import base64

app = Flask(__name__)
CORS(app)

# Spotify OAuth configuration
auth_manager = SpotifyOAuth(
    client_id="Your client ID",
    client_secret="Your client Secret",
    redirect_uri="http://localhost:8888/callback",
    scope="user-modify-playback-state user-read-playback-state"
)

sp = spotipy.Spotify(auth_manager=auth_manager)
detector = FER()

# Emotion to song mapping
emotion_to_song = {
    "happy": ("Shape of You", "Ed Sheeran"),
    "sad": ("Someone Like You", "Adele"),
    "angry": ("Bad Guy", "Billie Eilish"),
}

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    image_data = request.json.get('image')
    image_bytes = base64.b64decode(image_data)
    image_np = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

    emotion, score = detector.top_emotion(image) or ("neutral", 0)
    song_name, artist_name = emotion_to_song.get(emotion, ("Shape of You", "Ed Sheeran"))

    track_id, track_uri = get_song_id(song_name, artist_name)
    if track_uri:
        play_song_on_spotify(track_uri)
        return jsonify({"emotion": emotion, "song": song_name, "artist": artist_name})
    else:
        return jsonify({"error": "Song not found"}), 404

def get_song_id(song_name, artist_name=None):
    query = f'track:{song_name}'
    if artist_name:
        query += f' artist:{artist_name}'

    results = sp.search(q=query, type='track', limit=1)
    if results['tracks']['items']:
        return results['tracks']['items'][0]['id'], results['tracks']['items'][0]['uri']
    return None, None

def play_song_on_spotify(song_uri):
    devices = sp.devices()
    if devices['devices']:
        sp.start_playback(device_id=devices['devices'][0]['id'], uris=[song_uri])

if __name__ == '__main__':
    app.run(port=5000)
