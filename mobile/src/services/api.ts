import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL, ENDPOINTS } from '../config';

export interface TranscriptionResult {
  text: string;
  translation: string;
  language: string;
  model: string;
  file_id: string;
}

export interface HistoryItem {
  file_id: string;
  original_filename: string;
  transcription: string;
  translation: string;
  language: string;
  created_at: string;
  audio_expires_at: string;
  transcription_expires_at: string;
}

export interface HealthStatus {
  status: string;
  custom_twi_model_loaded: boolean;
  translation_model_loaded: boolean;
  model_path: string;
}

function networkError(e: unknown): never {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('Network request failed') || msg.includes('fetch') || msg.includes('Unable to resolve host')) {
    throw new Error('Cannot connect to the server. Please ensure the backend is running and try again.');
  }
  throw e instanceof Error ? e : new Error(msg);
}

function guessMimeType(name: string, fallback = 'audio/mpeg'): string {
  const ext = name.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
    webm: 'audio/webm',
    mp4: 'video/mp4',
  };
  return (ext && map[ext]) || fallback;
}

/**
 * Upload via expo-file-system multipart.
 * RN FormData `{ uri, name, type }` throws "Unsupported FormDataPart implementation"
 * under Expo's fetch stack on modern Android builds.
 */
export async function transcribeAudio(
  audioFile: { uri: string; name: string; type: string },
  onProgress: (p: number) => void = () => {},
): Promise<TranscriptionResult> {
  const safeName = (audioFile.name || 'recording.mp3').replace(/[^\w.\-() ]+/g, '_');
  const mimeType = audioFile.type || guessMimeType(safeName);
  const uploadUri = `${FileSystem.cacheDirectory}haki-upload-${Date.now()}-${safeName}`;

  try {
    onProgress(10);
    await FileSystem.copyAsync({ from: audioFile.uri, to: uploadUri });
    onProgress(30);

    const upload = await FileSystem.uploadAsync(
      `${API_BASE_URL}${ENDPOINTS.TRANSCRIBE}`,
      uploadUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        mimeType,
      },
    );

    if (upload.status < 200 || upload.status >= 300) {
      let detail = `Transcription failed: ${upload.status}`;
      try {
        const errData = JSON.parse(upload.body);
        detail = errData.detail || errData.error || detail;
      } catch {
        if (upload.body) detail = upload.body.slice(0, 200);
      }
      throw new Error(detail);
    }

    onProgress(100);
    return JSON.parse(upload.body) as TranscriptionResult;
  } catch (e) {
    return networkError(e);
  } finally {
    FileSystem.deleteAsync(uploadUri, { idempotent: true }).catch(() => {});
  }
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HISTORY}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
    return response.json();
  } catch (e) {
    return networkError(e);
  }
}

export async function fetchTranscription(fileId: string): Promise<HistoryItem> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) throw new Error('Transcription not found');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    return response.json();
  } catch (e) {
    return networkError(e);
  }
}

export async function deleteTranscription(fileId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) throw new Error('Transcription not found');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    return response.json();
  } catch (e) {
    return networkError(e);
  }
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return response.json();
  } catch (e) {
    return networkError(e);
  }
}
