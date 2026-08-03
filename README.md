# AI Twi Audio Transcriber

A web application for transcribing Twi audio files using a custom-trained Whisper model specifically optimized for the Twi language.

## Features

- **Audio Upload**: Drag-and-drop or file selection for audio files
- **Custom Twi Model**: Uses a Whisper model specifically trained on Twi language data for improved accuracy
- **Real-time Transcription**: Fast transcription with language detection
- **Download Results**: Export transcriptions as text files
- **Modern UI**: Clean, responsive interface built with React and TailwindCSS

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS for styling
- Lucide React for icons
- Custom UI components (Button, Card)

### Backend
- FastAPI
- Hugging Face Transformers
- Custom Twi-trained Whisper model
- Librosa for audio processing
- PyTorch for model inference

## Prerequisites

- Python 3.8+
- Node.js 16+

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Upload an audio file (drag-and-drop or click to select)
3. Click "Transcribe Audio"
4. View the transcription result with detected language
5. Download the transcription as a text file

**Note**: The application uses a custom Twi-trained Whisper model that will be automatically downloaded from Hugging Face on the first run.

## API Endpoints

### POST /api/transcribe
Transcribe an audio file using the custom Twi-trained Whisper model.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `file`: Audio file

**Response:**
```json
{
  "text": "Transcribed text",
  "language": "tw",
  "model": "custom_twi"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "custom_twi_model_loaded": true,
  "model_path": "./twi_trained_whisper"
}
```

## Project Structure

```
AI-Twi-Audio-Transcriber/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/          # UI components
│   │   ├── App.jsx          # Main application
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── twi_trained_whisper/     # Custom Twi model (downloaded on first run)
├── data/                    # Audio dataset
├── src/                     # Original Python scripts
└── Project Documentation/   # Project documentation
```

## Notes

- The first transcription will take longer as the custom Twi model needs to be downloaded from Hugging Face (~700MB)
- The custom Twi model is specifically trained on Twi language data for improved accuracy compared to generic Whisper models
- The application supports various audio formats (MP3, WAV, OGG, etc.)
- Librosa handles audio processing internally (no FFmpeg required for this implementation)

## License

This project is part of the AI Twi Audio Transcriber initiative.
