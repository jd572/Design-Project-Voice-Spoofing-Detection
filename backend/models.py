from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PredictionRequest(BaseModel):
    audio_path: str
    user_id: Optional[str] = None


class FeatureSet(BaseModel):
    mfcc_mean: list[float] = []
    delta_mfcc_mean: list[float] = []
    zero_crossing_rate: float = 0.0
    spectral_centroid: float = 0.0
    spectral_rolloff: float = 0.0
    rms_energy: float = 0.0


class PredictionResponse(BaseModel):
    prediction: str  # "REAL" or "SPOOF"
    confidence: float
    explanation: str
    features: FeatureSet
    audio_filename: str


class HistoryRecord(BaseModel):
    user_id: str
    audio_filename: str
    prediction: str
    confidence: float
    explanation: str
    audio_path: str
    date: datetime = Field(default_factory=datetime.utcnow)


class HistoryResponse(BaseModel):
    id: str
    user_id: str
    audio_filename: str
    prediction: str
    confidence: float
    explanation: str
    date: str
    audio_path: str


class AudioUploadResponse(BaseModel):
    message: str
    filename: str
    audio_path: str
