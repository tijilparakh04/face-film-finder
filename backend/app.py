from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import os
import pandas as pd
from keras.models import load_model
import cv2
import re
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', '_mini_XCEPTION.73.hdf5')

# Global variables to store loaded data
emotion_model = None
movie_data = None
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def load_emotion_model():
    """Load the emotion recognition model"""
    global emotion_model
    if emotion_model is None:
        try:
            emotion_model = load_model(MODEL_PATH)
            print("Emotion recognition model loaded successfully!")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
            return False
    return True

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the server is running and models are loaded"""
    model_loaded = load_emotion_model()
    
    return jsonify({
        'status': 'healthy' if model_loaded else 'unhealthy',
        'model_loaded': model_loaded,
    })

@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """Detect emotion from a base64 encoded image"""
    if not load_emotion_model():
        return jsonify({'error': 'Failed to load emotion model'}), 500
    
    try:
        # Get base64 image data
        data = request.json
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Extract base64 string
        base64_image = data['image']
        base64_data = re.sub('^data:image/.+;base64,', '', base64_image)
        
        # Decode base64 string to image
        image_bytes = base64.b64decode(base64_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Process the image
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Use face detection (optional, can be added later)
        # For now, just process the whole image
        face_roi = cv2.resize(gray, (48, 48))
        
        # Preprocess for model
        face_input = face_roi / 255.0
        face_input = np.reshape(face_input, (1, 48, 48, 1))
        
        # Predict emotion
        emotion_scores = emotion_model.predict(face_input)[0]
        max_index = int(np.argmax(emotion_scores))
        dominant_emotion = EMOTIONS[max_index]
        
        # Prepare response
        result = {
            'dominantEmotion': dominant_emotion,
            'emotions': {emotion: float(score) for emotion, score in zip(EMOTIONS, emotion_scores)}
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Load models at startup
    load_emotion_model()
    app.run(debug=True, host='0.0.0.0', port=5000)
