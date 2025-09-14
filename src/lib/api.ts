const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface TranscriptionResponse {
  text: string;
  language: string;
  duration: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
  }>;
}

export interface TranscriptionError {
  error: string;
  message?: string;
}

export const transcribeAudio = async (audioFile: File): Promise<TranscriptionResponse> => {
  console.log('🎤 Starting transcription for file:', audioFile.name, 'Size:', audioFile.size);
  console.log('🌐 API URL:', `${API_BASE_URL}/api/transcribe`);
  
  const formData = new FormData();
  formData.append('audio', audioFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData: TranscriptionError = await response.json();
      console.error('❌ Transcription error:', errorData);
      throw new Error(errorData.message || errorData.error || 'Transcription failed');
    }

    const result = await response.json();
    console.log('✅ Transcription successful:', result);
    return result;
  } catch (error) {
    console.error('💥 Transcription request failed:', error);
    throw error;
  }
};

export const checkServerHealth = async (): Promise<boolean> => {
  try {
    console.log('🏥 Checking server health at:', `${API_BASE_URL}/health`);
    const response = await fetch(`${API_BASE_URL}/health`);
    console.log('🏥 Health check response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('🏥 Health check failed:', error);
    return false;
  }
};
