import * as FileSystem from 'expo-file-system/legacy';
import { API_BASE_URL, ENDPOINTS } from '../config';

function networkError(error) {
  if (
    error?.message?.includes('Network request failed') ||
    error?.message?.includes('Unable to resolve host')
  ) {
    throw new Error(
      'Cannot connect to the server. Please ensure the backend is running and try again.',
    );
  }
  throw error;
}

function guessMimeType(name, fallback = 'audio/mpeg') {
  const ext = name.split('.').pop()?.toLowerCase();
  const map = {
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
export async function transcribeAudio(audioFile, onProgress = () => {}) {
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
    return JSON.parse(upload.body);
  } catch (error) {
    return networkError(error);
  } finally {
    FileSystem.deleteAsync(uploadUri, { idempotent: true }).catch(() => {});
  }
}

export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HISTORY}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
    return await response.json();
  } catch (error) {
    return networkError(error);
  }
}

export async function fetchTranscription(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) throw new Error('Transcription not found');
    if (!response.ok) throw new Error(`Failed to fetch transcription: ${response.status}`);
    return await response.json();
  } catch (error) {
    return networkError(error);
  }
}

export async function deleteTranscription(fileId) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (response.status === 404) throw new Error('Transcription not found');
    if (!response.ok) throw new Error(`Failed to delete transcription: ${response.status}`);
    return await response.json();
  } catch (error) {
    return networkError(error);
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    return networkError(error);
  }
}
