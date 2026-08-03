import librosa
import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration

MODEL_PATH = "./twi_trained_whisper"

processor = WhisperProcessor.from_pretrained(MODEL_PATH)
model = WhisperForConditionalGeneration.from_pretrained(MODEL_PATH)

audio, sr = librosa.load(r"C:\Users\AfifIbrahimKwameKyer\Downloads\AsantiTwiFm23-AOUkiFh4-Tmp024-bXcSlE.mp3", sr=16000)

inputs = processor(audio, sampling_rate=16000, return_tensors="pt")

with torch.no_grad():
    predicted_ids = model.generate(inputs.input_features)

transcription = processor.batch_decode(
    predicted_ids,
    skip_special_tokens=True
)[0]

print(transcription)