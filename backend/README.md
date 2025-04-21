
# Emotion-Based Movie Recommender Backend

This Flask backend handles emotion detection and movie recommendations for the Emotion-Based Movie Recommender app.

## Setup

1. Place your emotion recognition model (`emotion_recognition_model.h5`) in the `models/` directory
2. Place your TMDB dataset (`tmdb.csv`) in the `data/` directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Run the Flask application:

```bash
python app.py
```

The server will start on http://localhost:5000

## API Endpoints

- `/api/health` - Health check endpoint
- `/api/detect-emotion` - Detects emotion from base64 image data
- `/api/recommend-movies/<emotion>` - Gets movie recommendations for a given emotion

## Model Requirements

The emotion recognition model should accept 48x48 grayscale images and output 7 emotions:
- Angry
- Disgust
- Fear
- Happy
- Sad
- Surprise
- Neutral
