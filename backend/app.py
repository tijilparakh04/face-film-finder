from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import numpy as np
import os
import pandas as pd
from tensorflow.keras.models import load_model
import cv2
import re
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Paths
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'emotion_recognition_model.h5')
FACE_CASCADE_PATH = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')

# Global variables to store loaded models
emotion_model = None
face_detection = None
EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

def preprocess_input(x, v2=True):
    """Preprocess the input image the same way as in training"""
    x = x.astype('float32')
    x = x / 255.0
    if v2:
        x = x - 0.5
        x = x * 2.0
    return x

def load_models():
    """Load the emotion recognition model and face detection cascade"""
    global emotion_model, face_detection
    
    # Check if face detection cascade exists, if not download it
    if not os.path.exists(FACE_CASCADE_PATH):
        print(f"Downloading face cascade classifier...")
        import urllib.request
        url = "https://raw.githubusercontent.com/opencv/opencv/master/data/haarcascades/haarcascade_frontalface_default.xml"
        urllib.request.urlretrieve(url, FACE_CASCADE_PATH)
        print("Download complete!")
    
    # Load face detection model
    if face_detection is None:
        try:
            face_detection = cv2.CascadeClassifier(FACE_CASCADE_PATH)
            print("Face detection model loaded successfully!")
        except Exception as e:
            print(f"Error loading face detection model: {e}")
            return False
    
    # Load emotion recognition model
    if emotion_model is None:
        try:
            emotion_model = load_model(MODEL_PATH, compile=False)
            print("Emotion recognition model loaded successfully!")
        except Exception as e:
            print(f"Error loading emotion model: {e}")
            return False
    
    return True

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the server is running and models are loaded"""
    models_loaded = load_models()
    
    return jsonify({
        'status': 'healthy' if models_loaded else 'unhealthy',
        'models_loaded': models_loaded,
    })

@app.route('/api/detect-emotion', methods=['POST'])
def detect_emotion():
    """Detect emotion from a base64 encoded image"""
    if not load_models():
        return jsonify({'error': 'Failed to load models'}), 500
    
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
        
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_detection.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Initialize default response
        dominant_emotion = "Neutral"
        emotion_scores = {emotion: 0.0 for emotion in EMOTIONS}
        
        # If faces detected, use the first face
        if len(faces) > 0:
            # Extract the first face
            x, y, w, h = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize to model input size (48x48)
            face_roi = cv2.resize(face_roi, (48, 48))
            
            # Preprocess for model
            face_input = np.expand_dims(face_roi, axis=0)
            face_input = np.expand_dims(face_input, axis=-1)  # Add channel dimension
            face_input = preprocess_input(face_input)
            
            # Predict emotion
            emotion_scores = emotion_model.predict(face_input)[0]
            max_index = int(np.argmax(emotion_scores))
            dominant_emotion = EMOTIONS[max_index]
            
            # Convert to dictionary
            emotion_scores = {emotion: float(score) for emotion, score in zip(EMOTIONS, emotion_scores)}
        else:
            # If no face detected, process the whole image as a fallback
            face_roi = cv2.resize(gray, (48, 48))
            face_input = np.expand_dims(face_roi, axis=0)
            face_input = np.expand_dims(face_input, axis=-1)
            face_input = preprocess_input(face_input)
            
            emotion_scores = emotion_model.predict(face_input)[0]
            max_index = int(np.argmax(emotion_scores))
            dominant_emotion = EMOTIONS[max_index]
            
            # Convert to dictionary
            emotion_scores = {emotion: float(score) for emotion, score in zip(EMOTIONS, emotion_scores)}
        
        # Return in the format expected by the frontend
        response = {
            'dominantEmotion': dominant_emotion,
            'emotions': emotion_scores
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze an uploaded image and return emotion detection results"""
    if not load_models():
        return jsonify({'error': 'Failed to load models'}), 500
    
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        
        # Check if file is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Read image
        file_bytes = file.read()
        np_arr = np.frombuffer(file_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        # Process the image
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_detection.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        # Initialize default response
        dominant_emotion = "Neutral"
        emotion_scores = {emotion: 0.0 for emotion in EMOTIONS}
        
        # If faces detected, use the first face
        if len(faces) > 0:
            # Extract the first face
            x, y, w, h = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize to model input size (48x48)
            face_roi = cv2.resize(face_roi, (48, 48))
            
            # Preprocess for model
            face_input = np.expand_dims(face_roi, axis=0)
            face_input = np.expand_dims(face_input, axis=-1)
            face_input = preprocess_input(face_input)
            
            # Predict emotion
            emotion_scores = emotion_model.predict(face_input)[0]
            max_index = int(np.argmax(emotion_scores))
            dominant_emotion = EMOTIONS[max_index]
            
            # Convert to dictionary
            emotion_scores = {emotion: float(score) for emotion, score in zip(EMOTIONS, emotion_scores)}
        else:
            # If no face detected, process the whole image as a fallback
            face_roi = cv2.resize(gray, (48, 48))
            face_input = np.expand_dims(face_roi, axis=0)
            face_input = np.expand_dims(face_input, axis=-1)
            face_input = preprocess_input(face_input)
            
            emotion_scores = emotion_model.predict(face_input)[0]
            max_index = int(np.argmax(emotion_scores))
            dominant_emotion = EMOTIONS[max_index]
            
            # Convert to dictionary
            emotion_scores = {emotion: float(score) for emotion, score in zip(EMOTIONS, emotion_scores)}
        
        # Return in the format expected by the frontend
        response = {
            'dominantEmotion': dominant_emotion,
            'emotions': emotion_scores
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error analyzing image: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load models at startup
    load_models()
    app.run(debug=True, host='0.0.0.0', port=5000)