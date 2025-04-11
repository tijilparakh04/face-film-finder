
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
DATASET_PATH = os.path.join(os.path.dirname(__file__), 'data', 'tmdb.csv')

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

def load_movie_data():
    """Load the movie dataset"""
    global movie_data
    if movie_data is None:
        try:
            movie_data = pd.read_csv(DATASET_PATH)
            print(f"Movie dataset loaded successfully with {len(movie_data)} entries!")
        except Exception as e:
            print(f"Error loading movie data: {e}")
            return False
    return True

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if the server is running and models are loaded"""
    model_loaded = load_emotion_model()
    data_loaded = load_movie_data()
    
    return jsonify({
        'status': 'healthy' if model_loaded and data_loaded else 'unhealthy',
        'model_loaded': model_loaded,
        'data_loaded': data_loaded
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

@app.route('/api/recommend-movies/<emotion>', methods=['GET'])
def recommend_movies(emotion):
    """Recommend movies based on emotion"""
    if not load_movie_data():
        return jsonify({'error': 'Failed to load movie data'}), 500
    
    try:
        # Validate emotion
        emotion = emotion.lower()
        valid_emotions = [e.lower() for e in EMOTIONS]
        if emotion not in valid_emotions:
            return jsonify({'error': f'Invalid emotion. Must be one of {valid_emotions}'}), 400
        
        # Simple recommendation logic based on emotion
        # This can be enhanced with a more sophisticated algorithm
        recommendations = []
        
        # Map emotions to genres/keywords that might be suitable
        emotion_genre_map = {
            'happy': ['comedy', 'animation', 'adventure'],
            'sad': ['drama', 'romance'],
            'angry': ['action', 'thriller'],
            'fear': ['horror', 'thriller', 'mystery'],
            'disgust': ['horror', 'comedy'],
            'surprise': ['mystery', 'sci-fi', 'thriller'],
            'neutral': ['documentary', 'drama', 'biography']
        }
        
        # Get suitable genres for the emotion
        suitable_genres = emotion_genre_map.get(emotion, ['drama'])
        
        # Filter movies that have at least one of the suitable genres
        # For simplicity, assume we have a 'genres' column as a string list
        filtered_movies = movie_data[movie_data['genres'].apply(
            lambda x: any(genre.lower() in str(x).lower() for genre in suitable_genres)
        )].copy()
        
        # Sort by popularity or rating
        if 'popularity' in filtered_movies.columns:
            filtered_movies = filtered_movies.sort_values('popularity', ascending=False)
        elif 'vote_average' in filtered_movies.columns:
            filtered_movies = filtered_movies.sort_values('vote_average', ascending=False)
        
        # Get top N recommendations
        limit = request.args.get('limit', default=8, type=int)
        top_movies = filtered_movies.head(limit)
        
        # Convert to list of dictionaries
        for _, movie in top_movies.iterrows():
            movie_dict = movie.to_dict()
            # Convert non-serializable objects to strings
            for key, value in movie_dict.items():
                if not isinstance(value, (str, int, float, bool, type(None))):
                    movie_dict[key] = str(value)
            recommendations.append(movie_dict)
        
        return jsonify({
            'emotion': emotion,
            'recommendations': recommendations
        })
        
    except Exception as e:
        print(f"Error recommending movies: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load models at startup
    load_emotion_model()
    load_movie_data()
    app.run(debug=True, host='0.0.0.0', port=5000)
