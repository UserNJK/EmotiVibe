# !pip intall flask
# Paste below in replit main.py file

'''
from flask import Flask, request

app = Flask(__name__)

@app.route('/')
def home():
    return "This is the home page."

@app.route('/callback')
def callback():
    code = request.args.get('code')
    return f"Authorization code: {code}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
'''

#Not required anymore
