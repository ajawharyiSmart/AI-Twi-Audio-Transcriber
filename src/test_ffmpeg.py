import subprocess

ffmpeg_path = r"C:\ffmpeg-master-latest-win64-gpl-shared\ffmpeg-master-latest-win64-gpl-shared\bin\ffmpeg.exe"

result = subprocess.run(
    [ffmpeg_path, "-version"],
    capture_output=True,
    text=True
)

print(result.stdout[:200])