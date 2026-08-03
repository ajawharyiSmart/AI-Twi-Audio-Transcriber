from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration, AutoTokenizer, AutoModelForSeq2SeqLM
from peft import PeftModel
import os
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
import uuid

# Allowed audio MIME types
ALLOWED_AUDIO_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/wave",
    "audio/ogg", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/aac",
    "audio/flac", "audio/webm", "video/mp4", "video/webm",
}
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".webm", ".mp4"}

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for mobile app development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
Base = declarative_base()
engine = create_engine('sqlite:///transcriptions.db')
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Storage configuration
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Custom Twi model path
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "twi_trained_whisper")

# Load the custom Twi model (cached globally)
processor = None
model = None

# Load the translation model (cached globally)
translation_tokenizer = None
translation_model = None

# Database model
class Transcription(Base):
    __tablename__ = "transcriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(String, unique=True, index=True)
    original_filename = Column(String)
    file_path = Column(String)
    transcription = Column(Text)
    translation = Column(Text)
    language = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    audio_expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))
    transcription_expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=90))

# Create database tables
Base.metadata.create_all(bind=engine)

def load_translation_model():
    """Load the Twi-to-English translation model."""
    global translation_tokenizer, translation_model
    if translation_tokenizer is None or translation_model is None:
        print("Loading Twi-to-English translation model...")
        # Load base NLLB model
        base_model_name = "facebook/nllb-200-distilled-600M"
        adapter_model_name = "mclanorjeff/NLLB-Twi-Human-Aligned"
        
        translation_tokenizer = AutoTokenizer.from_pretrained(base_model_name, src_lang="aka_GH")
        base_model = AutoModelForSeq2SeqLM.from_pretrained(base_model_name)
        
        # Load LoRA adapter
        translation_model = PeftModel.from_pretrained(base_model, adapter_model_name)
        print("Translation model loaded successfully!")
    return translation_tokenizer, translation_model

def load_custom_model():
    """Load the custom Twi-trained Whisper model."""
    global processor, model
    if processor is None or model is None:
        print("Loading custom Twi Whisper model...")
        processor = WhisperProcessor.from_pretrained(MODEL_PATH)
        model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)
        print("Custom Twi model loaded successfully!")
    return processor, model

@app.post("/api/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...)
):
    """
    Transcribe an audio file using custom Twi-trained Whisper model.

    Args:
        file: Audio file to transcribe

    Returns:
        JSON with transcription text and detected language
    """
    # Validate file type
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    content_type = (file.content_type or "").lower()
    if file_ext not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file_ext}'. Please upload an audio file (MP3, WAV, M4A, OGG, FLAC, etc.)"
        )

    try:
        # Load the custom model
        proc, mod = load_custom_model()
        
        # Create a temporary file to save the uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as temp_file:
            # Write uploaded file content to temp file
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Load audio with librosa (16kHz sampling rate as required by Whisper)
            print(f"Loading audio: {file.filename}")
            audio, sr = librosa.load(temp_file_path, sr=16000)
            
            # Process audio for the model
            inputs = proc(audio, sampling_rate=16000, return_tensors="pt")
            
            # Generate transcription
            print("Transcribing audio with custom Twi model...")
            with torch.no_grad():
                predicted_ids = mod.generate(inputs.input_features)
            
            # Decode the transcription
            transcription = proc.batch_decode(
                predicted_ids,
                skip_special_tokens=True
            )[0]
            
            # Translate to English
            print("Translating to English...")
            tokenizer, trans_model = load_translation_model()
            # Tokenize the Twi transcription
            encoded_inputs = tokenizer(transcription, return_tensors="pt")
            # Get the forced BOS token ID for English
            forced_bos_token_id = tokenizer.convert_tokens_to_ids("eng_Latn")
            with torch.no_grad():
                generated_tokens = trans_model.generate(
                    **encoded_inputs,
                    forced_bos_token_id=forced_bos_token_id,
                    max_length=512,
                    num_beams=5  # Use beam search for better quality
                )
            translation = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
            
            # Save audio file permanently
            file_id = str(uuid.uuid4())
            file_extension = Path(file.filename).suffix
            permanent_file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_extension}")
            
            # Copy from temp to permanent location
            shutil.copy2(temp_file_path, permanent_file_path)
            
            # Save to database
            db = SessionLocal()
            try:
                db_transcription = Transcription(
                    file_id=file_id,
                    original_filename=file.filename,
                    file_path=permanent_file_path,
                    transcription=transcription,
                    translation=translation,
                    language="tw"
                )
                db.add(db_transcription)
                db.commit()
            finally:
                db.close()
            
            # Return the transcription and translation
            return {
                "text": transcription,
                "translation": translation,
                "language": "tw",  # Twi language
                "model": "custom_twi",
                "file_id": file_id
            }
            
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history():
    """Get all transcriptions from history."""
    db = SessionLocal()
    try:
        transcriptions = db.query(Transcription).order_by(Transcription.created_at.desc()).all()
        return [{
            "file_id": t.file_id,
            "original_filename": t.original_filename,
            "transcription": t.transcription,
            "translation": t.translation,
            "language": t.language,
            "created_at": t.created_at.isoformat(),
            "audio_expires_at": t.audio_expires_at.isoformat(),
            "transcription_expires_at": t.transcription_expires_at.isoformat()
        } for t in transcriptions]
    finally:
        db.close()

@app.get("/api/transcription/{file_id}")
async def get_transcription(file_id: str):
    """Get a specific transcription by file ID."""
    db = SessionLocal()
    try:
        transcription = db.query(Transcription).filter(Transcription.file_id == file_id).first()
        if not transcription:
            raise HTTPException(status_code=404, detail="Transcription not found")
        return {
            "file_id": transcription.file_id,
            "original_filename": transcription.original_filename,
            "transcription": transcription.transcription,
            "translation": transcription.translation,
            "language": transcription.language,
            "created_at": transcription.created_at.isoformat(),
            "audio_expires_at": transcription.audio_expires_at.isoformat(),
            "transcription_expires_at": transcription.transcription_expires_at.isoformat()
        }
    finally:
        db.close()

@app.delete("/api/transcription/{file_id}")
async def delete_transcription(file_id: str):
    """Delete a transcription and its audio file."""
    db = SessionLocal()
    try:
        transcription = db.query(Transcription).filter(Transcription.file_id == file_id).first()
        if not transcription:
            raise HTTPException(status_code=404, detail="Transcription not found")
        
        # Delete audio file
        if os.path.exists(transcription.file_path):
            os.unlink(transcription.file_path)
        
        # Delete from database
        db.delete(transcription)
        db.commit()
        
        return {"message": "Transcription deleted successfully"}
    finally:
        db.close()

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    global processor, model, translation_tokenizer, translation_model
    model_loaded = processor is not None and model is not None
    translator_loaded = translation_tokenizer is not None and translation_model is not None
    return {
        "status": "healthy", 
        "custom_twi_model_loaded": model_loaded,
        "translation_model_loaded": translator_loaded,
        "model_path": MODEL_PATH
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
