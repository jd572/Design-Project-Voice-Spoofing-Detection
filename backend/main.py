from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import settings
from database import connect_to_mongo, close_mongo_connection
from routes import audio, predict, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: connect to DB on startup, close on shutdown."""
    await connect_to_mongo()

    # Pre-load the ML model at startup
    print("[*] Loading ML model...")
    from ml.model import load_model
    load_model()
    print("[OK] Voice Spoofing Detection API ready!")

    yield

    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API for detecting spoofed/synthetic voice audio using deep learning",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(audio.router, tags=["Audio"])
app.include_router(predict.router, tags=["Prediction"])
app.include_router(history.router, tags=["History"])


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
