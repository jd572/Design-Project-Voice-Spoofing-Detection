import os
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import PredictionRequest, PredictionResponse, FeatureSet, HistoryRecord
from ml.feature_extraction import extract_features
from ml.model import predict
from ml.explain import generate_explanation
from database import get_database

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict_audio(request: PredictionRequest):
    """
    Run spoofing detection on an uploaded/recorded audio file.
    Extracts features, runs the CNN-LSTM model, and generates explanation.
    """
    audio_path = request.audio_path

    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")

    try:
        # Extract features
        features = extract_features(audio_path)

        # Run prediction using actual extracted features
        prediction, confidence = predict(features)

        # Build feature set for response
        feature_set = FeatureSet(
            mfcc_mean=features["mfcc_mean"],
            delta_mfcc_mean=features["delta_mfcc_mean"],
            zero_crossing_rate=features["zero_crossing_rate"],
            spectral_centroid=features["spectral_centroid"],
            spectral_rolloff=features["spectral_rolloff"],
            rms_energy=features["rms_energy"],
        )

        # Generate explanation
        explanation = generate_explanation(prediction, confidence, features)

        # Get filename from path
        audio_filename = os.path.basename(audio_path)

        # Store in history (always, use 'anonymous' if no user_id)
        db = get_database()
        if db is not None:
            history_record = HistoryRecord(
                user_id=request.user_id or "anonymous",
                audio_filename=audio_filename,
                prediction=prediction,
                confidence=confidence,
                explanation=explanation,
                audio_path=audio_path,
                date=datetime.utcnow(),
            )
            await db.history.insert_one(history_record.model_dump())

        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            explanation=explanation,
            features=feature_set,
            audio_filename=audio_filename,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )
