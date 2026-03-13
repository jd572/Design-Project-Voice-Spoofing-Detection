import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

export interface PredictionResult {
  prediction: 'REAL' | 'SPOOF';
  confidence: number;
  explanation: string;
  features: {
    mfcc_mean: number[];
    delta_mfcc_mean: number[];
    zero_crossing_rate: number;
    spectral_centroid: number;
    spectral_rolloff: number;
    rms_energy: number;
  };
  audio_filename: string;
}

export interface HistoryRecord {
  id: string;
  user_id: string;
  audio_filename: string;
  prediction: string;
  confidence: number;
  explanation: string;
  date: string;
  audio_path: string;
}

export interface AudioUploadResponse {
  message: string;
  filename: string;
  audio_path: string;
}

export async function uploadAudio(file: File, userId?: string): Promise<AudioUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) formData.append('user_id', userId);

  const response = await api.post<AudioUploadResponse>('/upload-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function uploadRecording(blob: Blob, userId?: string): Promise<AudioUploadResponse> {
  const formData = new FormData();
  formData.append('file', new File([blob], 'recording.webm', { type: blob.type }));
  if (userId) formData.append('user_id', userId);

  const response = await api.post<AudioUploadResponse>('/record-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function predictAudio(audioPath: string, userId?: string): Promise<PredictionResult> {
  const response = await api.post<PredictionResult>('/predict', {
    audio_path: audioPath,
    user_id: userId,
  });
  return response.data;
}

export async function getUserHistory(userId: string): Promise<HistoryRecord[]> {
  const response = await api.get<HistoryRecord[]>(`/user-history/${userId}`);
  return response.data;
}

export async function getAllHistory(): Promise<HistoryRecord[]> {
  const response = await api.get<HistoryRecord[]>('/history');
  return response.data;
}

export default api;
