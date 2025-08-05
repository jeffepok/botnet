from flask import Flask
import threading

app = Flask(__name__)

@app.route("/")
def index():
    return "OK", 200

def run_flask():
    app.run(host="0.0.0.0", port=8001)

def start_flask_in_thread():
    thread = threading.Thread(target=run_flask)
    thread.daemon = True
    thread.start()
