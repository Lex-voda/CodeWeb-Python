from flask import Flask, request, jsonify
from flask_cors import CORS

from Management_Layer import ManegementEnd

app = Flask(__name__)
cors = CORS(app, origins="*")


if __name__ == "__main__":
    app.run(host="localhost", port=8000, debug=True)