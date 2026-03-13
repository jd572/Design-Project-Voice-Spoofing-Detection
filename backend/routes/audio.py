import os
import aiofiles
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models import AudioUploadResponse
from utils.audio_utils import (
    is_allowed_file,
    generate_unique_filename,
    convert_to_wav,
    ensure_upload_dir,
)
from config import settings

router = APIRouter()


@router.post("/upload-audio", response_model=AudioUploadResponse)
async def upload_audio(
    file: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
):
    """
    Upload an audio file for spoofing detection.
    Accepts WAV, MP3, M4A, FLAC, OGG, AAC formats.
    Automatically converts to WAV using ffmpeg if needed.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Check file size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB"
        )

    ensure_upload_dir()

    # Save uploaded file
    unique_name = generate_unique_filename(file.filename)
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Convert to WAV if needed
    try:
        wav_path = convert_to_wav(file_path)
    except RuntimeError as e:
        # Clean up uploaded file on conversion failure
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

    return AudioUploadResponse(
        message="Audio uploaded successfully",
        filename=file.filename,
        audio_path=wav_path,
    )


@router.post("/record-audio", response_model=AudioUploadResponse)
async def record_audio(
    file: UploadFile = File(...),
    user_id: str = Form(default="anonymous"),
):
    """
    Upload recorded audio from browser microphone.
    The browser sends WebM/WAV recording which is converted to WAV.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No recording provided")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Empty recording")

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Recording too large")

    ensure_upload_dir()

    # Save recording (browser typically sends as .webm or .wav)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "webm"
    unique_name = f"{__import__('uuid').uuid4().hex}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Convert to WAV
    try:
        wav_path = convert_to_wav(file_path)
    except RuntimeError as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

    return AudioUploadResponse(
        message="Recording uploaded successfully",
        filename=file.filename or "recording.webm",
        audio_path=wav_path,
    )
