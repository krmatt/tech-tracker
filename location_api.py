import json
from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/<int:poll>', methods=['GET'])
def get_locations(poll):
    with open('api_technician_response_data.json') as f:
        data = json.load(f)
    return data[poll]

if __name__ == '__main__':
    app.run(debug=True)
