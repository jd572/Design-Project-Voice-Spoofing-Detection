# 🛡️ VoiceGuard AI — Voice Spoofing Detection

A production-level web application for detecting spoofed/synthetic voice audio using deep learning. Built with **Next.js**, **FastAPI**, **TensorFlow**, and **MongoDB**.

---

## 📁 Project Structure

```
voice spoofing detecting/
├── backend/                    # FastAPI Backend
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration settings
│   ├── database.py             # MongoDB connection (async motor)
│   ├── models.py               # Pydantic request/response models
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment variable template
│   ├── routes/
│   │   ├── audio.py            # Upload & record audio endpoints
│   │   ├── predict.py          # Prediction endpoint
│   │   └── history.py          # History endpoints
│   ├── ml/
│   │   ├── feature_extraction.py   # Librosa audio feature extraction
│   │   ├── model.py            # CNN-LSTM model (TensorFlow/Keras)
│   │   └── explain.py          # Prediction explanation engine
│   └── utils/
│       └── audio_utils.py      # Audio file handling & ffmpeg conversion
│
├── frontend/                   # Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── .env.local.example
│   └── src/
│       ├── middleware.ts        # Clerk auth middleware
│       ├── lib/
│       │   └── api.ts          # API client with TypeScript interfaces
│       ├── components/
│       │   ├── Navbar.tsx       # Navigation bar with tooltips
│       │   ├── ThemeProvider.tsx # Dark/Light mode provider
│       │   ├── Tooltip.tsx      # Animated tooltip component
│       │   ├── AudioWaveform.tsx # WaveSurfer.js waveform viewer
│       │   ├── ConfidenceMeter.tsx # Circular confidence meter
│       │   ├── ResultCard.tsx   # Detection result card
│       │   └── HistoryTable.tsx # Animated history table
│       └── app/
│           ├── globals.css      # Design system & animations
│           ├── layout.tsx       # Root layout with Clerk + theme
│           ├── page.tsx         # Landing page
│           ├── sign-in/         # Clerk sign-in page
│           ├── sign-up/         # Clerk sign-up page
│           ├── dashboard/       # Dashboard with quick actions
│           ├── upload/          # Drag & drop file upload
│           ├── record/          # Microphone recorder (WebRTC)
│           ├── result/          # Detection result display
│           └── history/         # History dashboard
│
├── model/                      # ML model directory (auto-created)
└── uploads/                    # Uploaded audio storage (auto-created)
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (running locally or Atlas connection string)
- **ffmpeg** (for audio format conversion)
- **Clerk account** (for authentication — get keys at https://clerk.com)

### 1. Clone & Navigate

```bash
cd "voice spoofing detecting"
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your MongoDB URL and Clerk keys

# Create the demo ML model
python -c "from ml.model import create_demo_model; create_demo_model()"

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000** with Swagger docs at **/docs**.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.local.example .env.local
# Edit .env.local with your Clerk publishable key and secret key

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection string (default: `mongodb://localhost:27017`) |
| `MONGODB_DB_NAME` | Database name (default: `voice_spoofing_db`) |
| `CLERK_SECRET_KEY` | Clerk secret key for auth verification |
| `FRONTEND_URL` | Frontend URL for CORS (default: `http://localhost:3000`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000`) |

---

## 🧠 ML Model

### Architecture

```
Mel Spectrogram (128 × 128 × 1)
        ↓
   Conv2D (32) → BatchNorm → MaxPool → Dropout
   Conv2D (64) → BatchNorm → MaxPool → Dropout
   Conv2D (128) → BatchNorm → MaxPool → Dropout
   Conv2D (256) → BatchNorm → MaxPool → Dropout
        ↓
   Reshape → Bidirectional LSTM (128)
           → Bidirectional LSTM (64)
        ↓
   Dense (128) → Dense (64) → Sigmoid
        ↓
   Output: Real (>0.5) / Spoof (≤0.5)
```

### Extracted Features

| Feature | Count | Description |
|---|---|---|
| MFCC | 40 | Mel-frequency cepstral coefficients |
| Delta MFCC | 40 | Temporal derivatives of MFCC |
| Zero Crossing Rate | 1 | Rate of sign changes in the signal |
| Spectral Centroid | 1 | Center of mass of the spectrum |
| Spectral Roll-off | 1 | Frequency below which 85% of energy is contained |
| RMS Energy | 1 | Root mean square energy |
| Mel Spectrogram | 128×128 | Used as model input |

### Training on ASVspoof Dataset

The included model is a **demo model** with the correct architecture. To train on the actual ASVspoof dataset:

1. Download the ASVspoof 2019 dataset from https://www.asvspoof.org/
2. Extract mel spectrograms using `ml/feature_extraction.py`
3. Train the model using `ml/model.py`'s `build_model()` function
4. Save the trained model to `model/spoofing_model.keras`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload-audio` | Upload audio file for analysis |
| `POST` | `/record-audio` | Upload browser recording |
| `POST` | `/predict` | Run spoofing detection on audio |
| `GET` | `/history` | Get all detection history |
| `GET` | `/user-history/{user_id}` | Get user-specific history |
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger API documentation |

---

## 🎨 Features

- ✅ **Clerk Authentication** — Register, login, protected routes, session management
- ✅ **Audio Upload** — Drag & drop with WAV/MP3/M4A/FLAC/OGG/AAC support
- ✅ **Audio Recording** — Browser microphone recording with live waveform
- ✅ **Auto Conversion** — Automatic WAV conversion via ffmpeg
- ✅ **CNN-LSTM Detection** — Deep learning model for real/spoof classification
- ✅ **Confidence Scoring** — Visual confidence meter with percentage
- ✅ **Explanation Engine** — Feature-based justification for predictions
- ✅ **History Dashboard** — MongoDB-backed detection history with stats
- ✅ **Dark Mode** — Full dark/light theme support
- ✅ **Tooltips** — Every button has descriptive hover tooltips
- ✅ **Waveform Preview** — WaveSurfer.js audio visualization
- ✅ **Responsive Design** — Works on desktop and mobile
- ✅ **Animations** — Framer Motion transitions throughout
