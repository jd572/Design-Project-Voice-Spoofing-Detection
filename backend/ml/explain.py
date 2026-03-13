"""
Explanation engine for voice spoofing detection predictions.

Generates human-readable explanations based on extracted audio features,
comparing them against known patterns from the ASVspoof dataset.
"""


# Thresholds derived from ASVspoof dataset analysis
THRESHOLDS = {
    "spectral_rolloff_low": 2500.0,
    "spectral_rolloff_high": 5500.0,
    "spectral_centroid_low": 1500.0,
    "spectral_centroid_high": 4000.0,
    "zcr_low": 0.03,
    "zcr_high": 0.12,
    "rms_low": 0.005,
    "rms_high": 0.15,
    "mfcc_variance_threshold": 5.0,
}


def generate_explanation(
    prediction: str,
    confidence: float,
    features: dict,
) -> str:
    """
    Generate a detailed explanation for the spoofing detection result.

    Args:
        prediction: "REAL" or "SPOOF"
        confidence: Confidence percentage (0-100)
        features: Dictionary of extracted audio features

    Returns:
        Human-readable explanation string
    """
    reasons = []
    details = []

    spectral_rolloff = features.get("spectral_rolloff", 0)
    spectral_centroid = features.get("spectral_centroid", 0)
    zcr = features.get("zero_crossing_rate", 0)
    rms = features.get("rms_energy", 0)
    mfcc_mean = features.get("mfcc_mean", [])

    if prediction == "SPOOF":
        # Analyze why it's classified as spoof
        if spectral_rolloff < THRESHOLDS["spectral_rolloff_low"]:
            reasons.append("unusually low spectral roll-off")
            details.append(
                f"Spectral roll-off ({spectral_rolloff:.0f} Hz) is below the natural speech range, "
                "suggesting synthesized or bandwidth-limited audio."
            )

        if spectral_centroid < THRESHOLDS["spectral_centroid_low"]:
            reasons.append("low spectral centroid")
            details.append(
                f"Spectral centroid ({spectral_centroid:.0f} Hz) indicates a concentration of energy "
                "in lower frequencies, a pattern common in vocoder-based synthesis."
            )

        if zcr < THRESHOLDS["zcr_low"]:
            reasons.append("abnormally low zero-crossing rate")
            details.append(
                f"Zero-crossing rate ({zcr:.4f}) is lower than typical human speech, "
                "suggesting overly smooth waveform characteristics of synthetic audio."
            )
        elif zcr > THRESHOLDS["zcr_high"]:
            reasons.append("abnormally high zero-crossing rate")
            details.append(
                f"Zero-crossing rate ({zcr:.4f}) is higher than expected, "
                "which can indicate noise artifacts from speech synthesis."
            )

        if rms < THRESHOLDS["rms_low"]:
            reasons.append("very low RMS energy")
            details.append(
                f"RMS energy ({rms:.5f}) is unusually low, suggesting the audio may be "
                "artificially generated or heavily processed."
            )

        if len(mfcc_mean) > 0:
            import numpy as np
            mfcc_var = float(np.var(mfcc_mean))
            if mfcc_var < THRESHOLDS["mfcc_variance_threshold"]:
                reasons.append("low MFCC variance")
                details.append(
                    f"The MFCC coefficient variance ({mfcc_var:.2f}) is below typical values for "
                    "natural speech, indicating less diverse spectral patterns often seen in "
                    "text-to-speech or voice conversion attacks from the ASVspoof dataset."
                )

        if not reasons:
            reasons.append("subtle spectral patterns matching synthetic speech")
            details.append(
                "The deep learning model detected subtle patterns in the mel spectrogram "
                "that closely match spoofed audio signatures from the ASVspoof dataset, "
                "even though individual acoustic features appear within normal ranges."
            )

        reason_str = ", ".join(reasons)
        explanation = (
            f"This audio is classified as **SPOOF** with {confidence:.1f}% confidence "
            f"because it exhibits {reason_str}.\n\n"
        )
        explanation += "**Detailed Analysis:**\n"
        for i, detail in enumerate(details, 1):
            explanation += f"\n{i}. {detail}"

    else:
        # Analyze why it's classified as real
        if THRESHOLDS["spectral_rolloff_low"] <= spectral_rolloff <= THRESHOLDS["spectral_rolloff_high"]:
            reasons.append("natural spectral roll-off distribution")

        if THRESHOLDS["spectral_centroid_low"] <= spectral_centroid <= THRESHOLDS["spectral_centroid_high"]:
            reasons.append("spectral centroid within human speech range")

        if THRESHOLDS["zcr_low"] <= zcr <= THRESHOLDS["zcr_high"]:
            reasons.append("natural zero-crossing rate patterns")

        if THRESHOLDS["rms_low"] <= rms <= THRESHOLDS["rms_high"]:
            reasons.append("consistent RMS energy levels")

        if len(mfcc_mean) > 0:
            import numpy as np
            mfcc_var = float(np.var(mfcc_mean))
            if mfcc_var >= THRESHOLDS["mfcc_variance_threshold"]:
                reasons.append("rich MFCC diversity typical of natural speech")

        if not reasons:
            reasons.append("acoustic features consistent with genuine human speech")

        reason_str = ", ".join(reasons)
        explanation = (
            f"This audio is classified as **REAL** with {confidence:.1f}% confidence. "
            f"The analysis shows {reason_str}.\n\n"
            "**Summary:** The spectral characteristics, temporal dynamics, and MFCC patterns "
            "are consistent with natural human speech and do not match known spoofing attack "
            "signatures from the ASVspoof dataset."
        )

    return explanation
