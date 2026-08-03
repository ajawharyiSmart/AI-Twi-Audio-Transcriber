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
  if (msg.includes('Network request failed') || msg.includes('fetch')) {
    throw new Error('Cannot connect to the server. Please ensure the backend is running and try again.');
  }
  throw e instanceof Error ? e : new Error(msg);
}

export async function transcribeAudio(
  audioFile: { uri: string; name: string; type: string },
  onProgress: (p: number) => void = () => {},
): Promise<TranscriptionResult> {
  const formData = new FormData();
  formData.append('file', { uri: audioFile.uri, name: audioFile.name, type: audioFile.type } as any);

  try {
    // Do not set Content-Type manually — fetch must add the multipart boundary.
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIBE}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const detail = (errData as any).detail || (errData as any).error;
      throw new Error(detail || `Transcription failed: ${response.status}`);
    }

    onProgress(100);
    return response.json();
  } catch (e) {
    return networkError(e);
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
