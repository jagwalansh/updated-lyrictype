import os
import subprocess
import uuid
import threading
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from faster_whisper import WhisperModel

app = FastAPI(title="KeyVerse AI Lyrics Sync Backend")

# Thread-safe model cache
models_cache = {}
models_lock = threading.Lock()

def get_model(model_size: str = "small"):
    """
    Returns a cached instance of the Whisper model, loading it if not already cached.
    """
    with models_lock:
        if model_size not in models_cache:
            # Using CPU with int8 quantization for memory efficiency and speed on general hosts
            models_cache[model_size] = WhisperModel(model_size, device="cpu", compute_type="int8")
        return models_cache[model_size]

class SyncRequest(BaseModel):
    youtubeUrl: str
    modelSize: str = "small"

def download_audio(youtube_url: str) -> str:
    """
    Downloads YouTube audio stream and saves it as an M4A file using pytubefix.
    """
    file_id = str(uuid.uuid4())
    os.makedirs("audio", exist_ok=True)
    
    from pytubefix import YouTube
    
    print(f"Downloading audio using pytubefix for URL: {youtube_url}")
    try:
        yt = YouTube(youtube_url)
        audio_stream = yt.streams.get_audio_only()
        if not audio_stream:
            raise HTTPException(
                status_code=500,
                detail="No audio-only stream found for this YouTube video."
            )
        
        filename = f"{file_id}.m4a"
        audio_stream.download(output_path="audio", filename=filename)
        
        expected_file = f"audio/{filename}"
        if not os.path.exists(expected_file):
            raise HTTPException(
                status_code=500,
                detail="Downloaded audio file was not found at expected location."
            )
        return expected_file
    except Exception as e:
        print(f"pytubefix error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to download audio using pytubefix: {str(e)}"
        )

def format_lrc_time(seconds: float) -> str:
    """
    Formats a duration in seconds into LRC timestamp format: [MM:SS.xx]
    """
    minutes = int(seconds // 60)
    sec = seconds % 60
    return f"[{minutes:02d}:{sec:05.2f}]"

@app.post("/generate-sync")
def generate_sync(request: SyncRequest):
    audio_path = None
    try:
        print(f"Starting sync generation for URL: {request.youtubeUrl} using model: {request.modelSize}")
        audio_path = download_audio(request.youtubeUrl)
        
        # Load whisper model
        model = get_model(request.modelSize)
        
        # Transcribe with word-level timestamps enabled for future alignment logic
        segments_generator, info = model.transcribe(audio_path, word_timestamps=True)
        
        lrc_lines = []
        segments_data = []
        
        # Consume generator (segments_generator is a generator)
        for segment in segments_generator:
            timestamp = format_lrc_time(segment.start)
            text = segment.text.strip()
            lrc_lines.append(f"{timestamp} {text}")
            
            # Format words for advanced alignment algorithms
            words_list = []
            if segment.words:
                for w in segment.words:
                    words_list.append({
                        "word": w.word.strip(),
                        "start": w.start,
                        "end": w.end,
                        "probability": w.probability
                    })
            
            segments_data.append({
                "start": segment.start,
                "end": segment.end,
                "text": text,
                "words": words_list
            })
            
        return {
            "status": "success",
            "lrc": "\n".join(lrc_lines),
            "language": info.language,
            "language_probability": info.language_probability,
            "duration": info.duration,
            "segments": segments_data
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Exception during transcribe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        # Cleanup audio files to save disk space
        if audio_path and os.path.exists(audio_path):
            try:
                os.remove(audio_path)
                print(f"Cleaned up temp file: {audio_path}")
            except Exception as cleanup_err:
                print(f"Error cleaning up {audio_path}: {cleanup_err}")
