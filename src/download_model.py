from huggingface_hub import snapshot_download

snapshot_download(
    repo_id="CiBeDL/twi_trained_whisper",
    local_dir="./twi_trained_whisper",
)

print("Done!")