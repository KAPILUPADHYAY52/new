from flask import Flask, request, jsonify, send_file

app = Flask(__name__)


@app.route("/")
def home():
    return send_file("intex.html")


@app.route("/crop.css")
def css():
    return send_file("crop.css")


@app.route("/cropjs.js")
def javascript():
    return send_file("cropjs.js")


@app.route("/analyze", methods=["POST"])
def analyze():

    image = request.files.get("image")

    if image is None:
        return jsonify({
            "error": "No image received"
        }), 400

    print("Image received:", image.filename)

    return jsonify({
        "crop": "Tomato",
        "disease": "Leaf Blight",
        "confidence": 92,
        "risk": "High"
    })


if __name__ == "__main__":
    app.run(debug=True)