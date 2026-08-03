# AI Twi Audio Transcriber - Mobile App Development Guide

## Project Overview

The AI Twi Audio Transcriber is a web application that transcribes Twi audio files using a custom-trained Whisper model and provides automatic English translation using a fine-tuned NLLB model with LoRA adapter.

### Key Features
- Twi audio transcription using custom Whisper model
- Automatic English translation using NLLB-200 with LoRA adapter
- Audio recording directly in the browser
- File upload support (drag-and-drop)
- Transcription history with local storage
- Download functionality for transcriptions and translations
- Progress indicators for long audio processing

---

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104.1
- **Audio Processing**: librosa 0.10.1
- **ML Models**: PyTorch, Transformers
- **Database**: SQLite with SQLAlchemy
- **File Storage**: Local filesystem
- **CORS**: Enabled for frontend communication

### Frontend
- **Framework**: React with Vite
- **UI Components**: TailwindCSS, shadcn/ui
- **Icons**: Lucide React
- **Audio Recording**: MediaRecorder API

### ML Models
- **Transcription**: Custom Whisper model (Twi-trained)
  - Location: `../twi_trained_whisper`
  - Base: WhisperForConditionalGeneration
- **Translation**: Facebook NLLB-200-distilled-600M with LoRA adapter
  - Base model: `facebook/nllb-200-distilled-600M`
  - Adapter: `mclanorjeff/NLLB-Twi-Human-Aligned`
  - Language codes: `aka_GH` (Twi), `eng_Latn` (English)

---

## API Endpoints

### 1. POST /api/transcribe
Transcribes an audio file and returns Twi transcription with English translation.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (audio file)

**Response:**
```json
{
  "text": "Twi transcription text",
  "translation": "English translation text",
  "language": "tw",
  "model": "custom_twi",
  "file_id": "unique-file-identifier"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

### 2. GET /api/history
Retrieves all transcriptions from history.

**Request:**
- Method: GET
- No parameters required

**Response:**
```json
[
  {
    "file_id": "unique-file-identifier",
    "original_filename": "audio.mp3",
    "transcription": "Twi transcription text",
    "translation": "English translation text",
    "language": "tw",
    "created_at": "2024-07-23T12:00:00",
    "audio_expires_at": "2024-08-22T12:00:00",
    "transcription_expires_at": "2024-10-21T12:00:00"
  }
]
```

### 3. GET /api/transcription/{file_id}
Retrieves a specific transcription by file ID.

**Request:**
- Method: GET
- URL Parameter: `file_id` (string)

**Response:**
```json
{
  "file_id": "unique-file-identifier",
  "original_filename": "audio.mp3",
  "transcription": "Twi transcription text",
  "translation": "English translation text",
  "language": "tw",
  "created_at": "2024-07-23T12:00:00",
  "audio_expires_at": "2024-08-22T12:00:00",
  "transcription_expires_at": "2024-10-21T12:00:00"
}
```

**Error Response:**
- Status: 404 Not Found
- Body: `{"detail": "Transcription not found"}`

### 4. DELETE /api/transcription/{file_id}
Deletes a transcription and its associated audio file.

**Request:**
- Method: DELETE
- URL Parameter: `file_id` (string)

**Response:**
```json
{
  "message": "Transcription deleted successfully"
}
```

**Error Response:**
- Status: 404 Not Found
- Body: `{"detail": "Transcription not found"}`

### 5. GET /api/health
Health check endpoint to verify system status.

**Request:**
- Method: GET
- No parameters required

**Response:**
```json
{
  "status": "healthy",
  "custom_twi_model_loaded": true,
  "translation_model_loaded": true,
  "model_path": "/path/to/twi_trained_whisper"
}
```

---

## Database Schema

### Transcription Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer (Primary Key) | Auto-incrementing ID |
| file_id | String (Unique) | UUID for file identification |
| original_filename | String | Original uploaded filename |
| file_path | String | Local path to stored audio file |
| transcription | Text | Twi transcription text |
| translation | Text | English translation text |
| language | String | Detected language code (e.g., "tw") |
| created_at | DateTime | Timestamp of transcription |
| audio_expires_at | DateTime | Audio file expiration (30 days) |
| transcription_expires_at | DateTime | Text expiration (90 days) |

---

## File Storage Structure

### Backend Directory Structure
```
AI-Twi-Audio-Transcriber/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   ├── transcriptions.db    # SQLite database
│   └── uploads/             # Audio file storage
│       └── {file_id}.{ext}  # Stored audio files
├── twi_trained_whisper/      # Custom Whisper model
└── frontend/
    └── src/
        └── App.jsx          # React application
```

### Data Retention Policy
- **Audio Files**: 30 days from creation
- **Transcription Text**: 90 days from creation
- **Manual Deletion**: Users can delete anytime via API

---

## Frontend Components

### Main Application Structure
```jsx
function App() {
  // State Management
  const [file, setFile] = useState(null)
  const [transcribing, setTranscribing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [translation, setTranslation] = useState('')
  const [detectedLanguage, setDetectedLanguage] = useState('')
  const [error, setError] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [processingStage, setProcessingStage] = useState('')
  const [history, setHistory] = useState([])
  
  // Key Functions
  const handleFileChange = (e) => { /* ... */ }
  const handleTranscribe = async () => { /* ... */ }
  const handleDownload = () => { /* ... */ }
  const fetchHistory = async () => { /* ... */ }
  const handleDelete = async (fileId) => { /* ... */ }
  const handleHistoryClick = (item) => { /* ... */ }
  const startRecording = async () => { /* ... */ }
  const stopRecording = () => { /* ... */ }
}
```

### UI Components
1. **File Upload Card**: Drag-and-drop or click to upload
2. **Recording Controls**: Start/Stop recording with timer
3. **Processing Indicators**: Progress stages (uploading, processing, receiving)
4. **Transcription Result**: Displays Twi text and English translation
5. **History Section**: Scrollable list of past transcriptions
6. **Download Button**: Exports transcription as text file

---

## Mobile App Development Considerations

### 1. Framework Selection
**Recommended Options:**
- **React Native**: Leverage existing React knowledge
- **Flutter**: Cross-platform with excellent performance
- **Native (Swift/Kotlin)**: Best performance, platform-specific features

### 2. Audio Recording
**Mobile-Specific Considerations:**
- Use platform-specific audio recording APIs
- Handle microphone permissions
- Manage audio quality vs file size
- Background recording support
- Audio format compatibility (AAC, MP3, WAV)

**React Native Libraries:**
- `react-native-audio-recorder-player`
- `@react-native-community/audio-toolkit`
- `react-native-voice`

### 3. File Upload
**Mobile-Specific Considerations:**
- Handle network interruptions
- Implement retry mechanisms
- Show upload progress
- Compress audio before upload
- Background upload support

### 4. Offline Support
**Considerations:**
- Cache transcriptions locally
- Queue uploads for when online
- Store audio files temporarily
- Sync when connection restored

### 5. Push Notifications
**Potential Use Cases:**
- Notify when long transcription is complete
- Remind about expiring audio files
- System status updates

### 6. User Interface
**Mobile Adaptations:**
- Responsive design for different screen sizes
- Touch-optimized controls
- Bottom navigation for easy access
- Swipe gestures for history navigation
- Dark mode support

### 7. Performance Optimization
**Considerations:**
- Lazy loading of history
- Image/audio thumbnail generation
- Efficient list rendering
- Memory management for large audio files
- Background processing

### 8. Security
**Mobile-Specific Considerations:**
- Secure storage of API endpoints
- Certificate pinning for API calls
- Secure local storage for sensitive data
- Biometric authentication (if adding user accounts)

### 9. Platform-Specific Features
**iOS:**
- Background audio recording
- Share sheet integration
- Siri shortcuts
- Widget support

**Android:**
- Foreground service for recording
- File provider for sharing
- Widget support
- Notification channels

### 10. Testing
**Mobile-Specific Testing:**
- Device fragmentation testing
- Network condition testing
- Battery usage optimization
- Memory leak detection
- Permission handling

---

## Configuration Details

### Backend Configuration
```python
# CORS Settings
allow_origins=["http://localhost:3000"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]

# Model Paths
MODEL_PATH = "../twi_trained_whisper"
UPLOAD_DIR = "../uploads"

# Database
DATABASE_URL = "sqlite:///transcriptions.db"

# Server
HOST = "0.0.0.0"
PORT = 8000
```

### Model Loading
```python
# Whisper Model
processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)

# Translation Model
base_model = "facebook/nllb-200-distilled-600M"
adapter_model = "mclanorjeff/NLLB-Twi-Human-Aligned"
tokenizer = AutoTokenizer.from_pretrained(base_model, src_lang="aka_GH")
base_model = AutoModelForSeq2SeqLM.from_pretrained(base_model)
translation_model = PeftModel.from_pretrained(base_model, adapter_model)
```

### Audio Processing
```python
# Audio Loading
audio, sr = librosa.load(file_path, sr=16000)

# Transcription
inputs = processor(audio, sampling_rate=16000, return_tensors="pt")
predicted_ids = model.generate(inputs.input_features)
transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]

# Translation
encoded_inputs = tokenizer(transcription, return_tensors="pt")
generated_tokens = translation_model.generate(
    **encoded_inputs,
    forced_bos_token_id=tokenizer.convert_tokens_to_ids("eng_Latn"),
    max_length=512,
    num_beams=5
)
translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
```

---

## Development Workflow

### Backend Setup
1. Install Python dependencies: `pip install -r requirements.txt`
2. Ensure custom Whisper model is in `../twi_trained_whisper`
3. Create `uploads` directory
4. Run server: `python main.py`

### Frontend Setup
1. Install Node dependencies: `npm install`
2. Run development server: `npm run dev`
3. Access at: `http://localhost:3000`

### API Base URL
- Development: `http://localhost:8000`
- Production: Configure based on deployment

---

## Error Handling

### Common Errors
1. **Model Loading Errors**: Check model paths and internet connection
2. **Audio Format Errors**: Ensure supported formats (MP3, WAV, OGG)
3. **Database Errors**: Check SQLite file permissions
4. **File Upload Errors**: Verify file size limits and format
5. **Translation Errors**: Check NLLB model availability

### Error Codes
- **500**: Server error during transcription
- **404**: Transcription not found
- **400**: Invalid request parameters

---

## Future Enhancements for Mobile

### Potential Features
1. **User Authentication**: Add login/signup for personal history
2. **Cloud Storage**: Replace local storage with cloud solutions
3. **Real-time Processing**: WebSocket support for live transcription
4. **Batch Processing**: Process multiple files at once
5. **Audio Editing**: Trim/cut audio before transcription
6. **Voice Commands**: Voice-activated transcription
7. **Sharing**: Share transcriptions via social media
8. **Export Options**: PDF, Word, JSON formats
9. **Search**: Search through transcription history
10. **Analytics**: Usage statistics and insights

---

## Performance Considerations

### Backend Optimization
- Model caching to avoid reloading
- Async processing for long audio files
- Connection pooling for database
- File compression for storage
- CDN for static assets (if deployed)

### Mobile Optimization
- Lazy loading of history items
- Audio compression before upload
- Efficient memory management
- Background processing
- Network-aware features

---

## Deployment Considerations

### Backend Deployment
- **Server**: AWS EC2, Google Cloud, Azure
- **Container**: Docker for easy deployment
- **Scaling**: Horizontal scaling for multiple users
- **Monitoring**: Health checks and logging
- **Backup**: Database and file backups

### Mobile App Deployment
- **App Stores**: Apple App Store, Google Play Store
- **Updates**: Over-the-air updates
- **Analytics**: Crash reporting and usage analytics
- **Testing**: Beta testing programs

---

## Contact & Support

For questions or issues related to mobile app development, refer to:
- Backend API documentation
- Database schema documentation
- Model configuration details
- Error handling guidelines

---

## License & Usage

Ensure compliance with:
- Hugging Face model licenses
- Open source library licenses
- Data privacy regulations
- App store guidelines

---

*Last Updated: July 23, 2026*
*Version: 1.0*
