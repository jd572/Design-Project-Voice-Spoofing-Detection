import os
import subprocess
import uuid
from config import settings


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def is_allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    ext = get_file_extension(filename)
    return ext in settings.ALLOWED_EXTENSIONS


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename preserving original extension."""
    ext = get_file_extension(original_filename)
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return unique_name


def convert_to_wav(input_path: str) -> str:
    """
    Convert any audio format to WAV using ffmpeg.
    Returns the path to the converted WAV file.
    """
    if input_path.lower().endswith(".wav"):
        return input_path

    output_path = input_path.rsplit(".", 1)[0] + ".wav"

    try:
        cmd = [
            "ffmpeg", "-i", input_path,
            "-ar", str(settings.SAMPLE_RATE),
            "-ac", "1",
            "-y",
            output_path
        ]
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg conversion failed: {result.stderr}")

        return output_path
    except FileNotFoundError:
        raise RuntimeError(
            "ffmpeg is not installed. Please install ffmpeg to convert audio files. "
            "Download from https://ffmpeg.org/download.html"
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError("Audio conversion timed out")


def ensure_upload_dir():
    """Ensure uploads directory exists."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
