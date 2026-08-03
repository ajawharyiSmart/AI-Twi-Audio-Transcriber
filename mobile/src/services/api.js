import { API_BASE_URL, ENDPOINTS } from '../config';

/**
 * API Service for communicating with the FastAPI backend.
 * Handles transcription, history, and health check requests.
 */

/**
 * Upload and transcribe an audio file.
 * @param {object} audioFile - The audio file object with uri, name, type properties
 * @param {function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<object>} Transcription result with text, translation, language, file_id
 */
export async function transcribeAudio(audioFile, onProgress = () => {}) {
  const formData = new FormData();
  formData.append('file', {
    uri: audioFile.uri,
    name: audioFile.name || 'recording.m4a',
    type: audioFile.type || 'audio/m4a',
  });

  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.TRANSCRIBE}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Transcription failed with status ${response.status}`);
    }

    const data = await response.json();
    onProgress(100);
    return data;
  } catch (error) {
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend is running and try again.'
      );
    }
    throw error;
  }
}

/**
 * Fetch all transcription history from the server.
 * @returns {Promise<Array>} List of transcription records
 */
export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HISTORY}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch history: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend is running.'
      );
    }
    throw error;
  }
}

/**
 * Fetch a specific transcription by file ID.
 * @param {string} fileId - The unique file identifier
 * @returns {Promise<object>} Transcription record
 */
export async function fetchTranscription(fileId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Transcription not found');
      }
      throw new Error(`Failed to fetch transcription: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend is running.'
      );
    }
    throw error;
  }
}

/**
 * Delete a transcription and its associated audio file.
 * @param {string} fileId - The unique file identifier to delete
 * @returns {Promise<object>} Deletion confirmation
 */
export async function deleteTranscription(fileId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${ENDPOINTS.TRANSCRIPTION(fileId)}`,
      {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Transcription not found');
      }
      throw new Error(`Failed to delete transcription: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Network request failed')) {
      throw new Error(
        'Cannot connect to the server. Please ensure the backend is running.'
      );
    }
    throw error;
  }
}

/**
 * Check the health status of the backend server.
 * @returns {Promise<object>} Health status with model load state
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.HEALTH}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Network request failed')) {
      throw new Error('Backend server is not reachable.');
    }
    throw error;
  }
}