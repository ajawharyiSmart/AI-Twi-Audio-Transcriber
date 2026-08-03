from transformers import WhisperProcessor, WhisperForConditionalGeneration

MODEL_PATH = "./twi_trained_whisper"

processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)

print("Model loaded successfully!")