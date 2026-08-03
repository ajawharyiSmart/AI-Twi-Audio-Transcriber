import os

os.environ["PATH"] += os.pathsep + r"C:\ffmpeg-master-latest-win64-gpl-shared\ffmpeg-master-latest-win64-gpl-shared\bin"
import pandas as pd
import whisper
from pathlib import Path
from jiwer import wer


model = whisper.load_model("base")


csv_path = r"C:\Users\AfifIbrahimKwameKyer\OneDrive - Ismart Ghana\Desktop\AI-Twi-Audio-Transcriber\data\cleaned_data.csv"


audio_folder = Path(
    r"C:\Users\AfifIbrahimKwameKyer\OneDrive - Ismart Ghana\Desktop\AI-Twi-Audio-Transcriber\data\fisd-asanti-twi-90p\fisd-asanti-twi-90p\audios"
)


df = pd.read_csv(csv_path)


print("Total samples:", len(df))


evaluation_data = (
    df.drop_duplicates(
        subset=["Transcription"]
    )
    .sample(
        50,
        random_state=42
    )
)


print("Evaluation samples:", len(evaluation_data))


results = []


for _, row in evaluation_data.iterrows():

    # Only take filename from CSV
    filename = Path(row["Filepath"]).name

    audio_path = audio_folder / filename


    print("\nProcessing:")
    print(filename)


    if not audio_path.exists():
        print("FILE NOT FOUND")
        continue


    prediction = model.transcribe(
        str(audio_path)
    )


    results.append({

        "audio_file": filename,

        "actual_twi": row["Transcription"],

        "whisper_output": prediction["text"],

        "detected_language": prediction["language"]

    })


results_df = pd.DataFrame(results)


if len(results_df) > 0:

    results_df.to_csv(
        "whisper_evaluation_results.csv",
        index=False,
        encoding="utf-8"
    )


    score = wer(
        results_df["actual_twi"],
        results_df["whisper_output"]
    )


    print("\n====================")
    print("Evaluation Complete")
    print("====================")

    print("Files processed:", len(results_df))
    print("WER:", score)

else:

    print("No audio files were processed.")