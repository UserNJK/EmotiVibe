import spotipy
from spotipy.oauth2 import SpotifyOAuth
from fer import FER
import cv2
import webbrowser

# Spotify OAuth configuration
auth_manager = SpotifyOAuth(
    client_id="Your_client_ID",
    client_secret="Your_client_secret",
    redirect_uri="Your_replit_redirect/callback",  # Updated redirect URI
    scope="user-modify-playback-state user-read-playback-state"
)

# Open the Spotify authorization URL
auth_url = auth_manager.get_authorize_url()
print(f"Please go to the following URL to authorize the application: {auth_url}")
webbrowser.open(auth_url)

# Get the authorization code from the user
auth_code = input("Enter the authorization code from the URL: ")

# Obtain the access token
token_info = auth_manager.get_access_token(auth_code)
print("Token Info:", token_info)

sp = spotipy.Spotify(auth_manager=auth_manager)

# Function to capture image from webcam
def capture_face():
    # Start video capture from webcam
    cap = cv2.VideoCapture(0)

    # Set the duration to capture the image (e.g., 5 seconds)
    duration = 5
    start_time = cv2.getTickCount()

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        cv2.imshow("Webcam", frame)

        # Check if the duration has passed
        if (cv2.getTickCount() - start_time) / cv2.getTickFrequency() >= duration:
            print("Capturing image...")
            break

        # Exit if the user presses the 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("Exiting...")
            break

    cap.release()
    cv2.destroyAllWindows()
    return frame

# Capture the face from the webcam
image = capture_face()

# Initialize the FER detector
detector = FER()
emotion, score = detector.top_emotion(image)
print(f"Detected Emotion: {emotion} with score: {score}")

# Mapping detected emotions to songs
emotion_to_song = {
    "happy": "Shape of You by Ed Sheeran",
    "sad": "Someone Like You by Adele",
    "angry": "Bad Guy by Billie Eilish",
}

song_name_artist = emotion_to_song.get(emotion, "Shape of You by Ed Sheeran")
song_name, artist_name = song_name_artist.split(" by ")

# Function to get song ID from Spotify
def get_song_id(song_name, artist_name=None):
    query = f'track:{song_name}'
    if artist_name:
        query += f' artist:{artist_name}'

    results = sp.search(q=query, type='track', limit=1)
    if results['tracks']['items']:
        track = results['tracks']['items'][0]
        track_id = track['id']
        track_uri = track['uri']
        print(f"Track ID: {track_id}")
        print(f"Track URI: {track_uri}")
        return track_id, track_uri
    else:
        print("Song not found")
        return None, None

# Get the track ID and URI
track_id, track_uri = get_song_id(song_name, artist_name)

# Function to play the song on Spotify
def play_song_on_spotify(song_uri):
    print("Getting Spotify devices...")
    try:
        devices = sp.devices()
        print("Devices response:", devices)
        if devices['devices']:
            device_id = devices['devices'][0]['id']
            print(f"Using device ID: {device_id}")
            sp.start_playback(device_id=device_id, uris=[song_uri])
            print("Playback started")
        else:
            print("No Spotify devices available")
    except Exception as e:
        print(f"Error fetching devices or starting playback: {e}")

# Play the song if the track URI is found
if track_uri:
    play_song_on_spotify(track_uri)
else:
    print("Could not find the track to play.")
