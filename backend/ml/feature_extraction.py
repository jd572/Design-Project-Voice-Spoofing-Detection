import numpy as np
import librosa
from config import settings


def extract_features(audio_path: str) -> dict:
    """
    Extract comprehensive audio features for spoofing detection.

    Features extracted:
    - MFCC (40 coefficients)
    - Delta MFCC
    - Zero Crossing Rate
    - Spectral Centroid
    - Spectral Roll-off
    - RMS Energy
    - Mel Spectrogram (for CNN-LSTM model input)
    """
    # Load audio
    y, sr = librosa.load(audio_path, sr=settings.SAMPLE_RATE, mono=True)
    
    print(f"\n[DEBUG] Audio loaded from {audio_path}")
    print(f"[DEBUG] Length: {len(y)} samples, Max Amplitude: {np.max(np.abs(y))}")

    # Ensure minimum length
    min_samples = settings.SAMPLE_RATE * 1  # at least 1 second
    if len(y) < min_samples:
        print("[DEBUG] Audio too short, padding with zeros.")
        y = np.pad(y, (0, min_samples - len(y)), mode='constant')

    # --- MFCC (40 coefficients) ---
    mfcc = librosa.feature.mfcc(
        y=y, sr=sr,
        n_mfcc=settings.N_MFCC,
        hop_length=settings.HOP_LENGTH
    )
    mfcc_mean = np.mean(mfcc, axis=1).tolist()

    # --- Delta MFCC ---
    delta_mfcc = librosa.feature.delta(mfcc)
    delta_mfcc_mean = np.mean(delta_mfcc, axis=1).tolist()

    # --- Zero Crossing Rate ---
    zcr = librosa.feature.zero_crossing_rate(y, hop_length=settings.HOP_LENGTH)
    zcr_mean = float(np.mean(zcr))

    # --- Spectral Centroid ---
    spectral_centroid = librosa.feature.spectral_centroid(
        y=y, sr=sr, hop_length=settings.HOP_LENGTH
    )
    spectral_centroid_mean = float(np.mean(spectral_centroid))

    # --- Spectral Roll-off ---
    spectral_rolloff = librosa.feature.spectral_rolloff(
        y=y, sr=sr, hop_length=settings.HOP_LENGTH
    )
    spectral_rolloff_mean = float(np.mean(spectral_rolloff))

    # --- RMS Energy ---
    rms = librosa.feature.rms(y=y, hop_length=settings.HOP_LENGTH)
    rms_mean = float(np.mean(rms))

    # --- Mel Spectrogram (model input) ---
    mel_spec = librosa.feature.melspectrogram(
        y=y, sr=sr,
        n_mels=settings.N_MELS,
        hop_length=settings.HOP_LENGTH
    )
    mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

    # Normalize mel spectrogram
    mel_spec_db = (mel_spec_db - mel_spec_db.mean()) / (mel_spec_db.std() + 1e-8)

    # Pad or truncate to fixed time steps
    if mel_spec_db.shape[1] < settings.MAX_TIME_STEPS:
        mel_spec_db = np.pad(
            mel_spec_db,
            ((0, 0), (0, settings.MAX_TIME_STEPS - mel_spec_db.shape[1])),
            mode='constant'
        )
    else:
        mel_spec_db = mel_spec_db[:, :settings.MAX_TIME_STEPS]

    # Reshape for model: (n_mels, time_steps, 1)
    mel_input = mel_spec_db[..., np.newaxis]

    return {
        "mel_spectrogram": mel_input,
        "mfcc_mean": mfcc_mean,
        "delta_mfcc_mean": delta_mfcc_mean,
        "zero_crossing_rate": zcr_mean,
        "spectral_centroid": spectral_centroid_mean,
        "spectral_rolloff": spectral_rolloff_mean,
        "rms_energy": rms_mean,
    }
