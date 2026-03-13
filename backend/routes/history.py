from fastapi import APIRouter, HTTPException
from models import HistoryResponse
from database import get_database

router = APIRouter()


@router.get("/history", response_model=list[HistoryResponse])
async def get_all_history():
    """Get all detection history records."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    records = []
    cursor = db.history.find().sort("date", -1).limit(100)
    async for doc in cursor:
        records.append(
            HistoryResponse(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                audio_filename=doc["audio_filename"],
                prediction=doc["prediction"],
                confidence=doc["confidence"],
                explanation=doc.get("explanation", ""),
                date=doc["date"].isoformat() if doc.get("date") else "",
                audio_path=doc.get("audio_path", ""),
            )
        )
    return records


@router.get("/user-history/{user_id}", response_model=list[HistoryResponse])
async def get_user_history(user_id: str):
    """Get detection history for a specific user."""
    db = get_database()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not available")

    records = []
    cursor = db.history.find({"user_id": user_id}).sort("date", -1).limit(100)
    async for doc in cursor:
        records.append(
            HistoryResponse(
                id=str(doc["_id"]),
                user_id=doc["user_id"],
                audio_filename=doc["audio_filename"],
                prediction=doc["prediction"],
                confidence=doc["confidence"],
                explanation=doc.get("explanation", ""),
                date=doc["date"].isoformat() if doc.get("date") else "",
                audio_path=doc.get("audio_path", ""),
            )
        )
    return records
