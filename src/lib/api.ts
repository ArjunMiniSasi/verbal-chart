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

export const testSoapGeneration = async (): Promise<any> => {
  try {
    console.log('🧪 Testing SOAP generation endpoint...');
    const response = await fetch(`${API_BASE_URL}/api/test-soap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🧪 Test response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Test SOAP error:', errorData);
      throw new Error(errorData.message || errorData.error || 'Test SOAP generation failed');
    }

    const result = await response.json();
    console.log('✅ Test SOAP successful:', result);
    return result;
  } catch (error) {
    console.error('💥 Test SOAP request failed:', error);
    throw error;
  }
};

export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export const generateSoapNote = async (transcript: string, previousNotes: SoapNote[] = []): Promise<SoapNote> => {
  console.log('🤖 Generating SOAP note via backend API...');
  console.log('📝 Transcript length:', transcript.length);
  console.log('📝 Transcript preview:', transcript.substring(0, 100) + '...');
  console.log('📚 Previous notes count:', previousNotes.length);
  console.log('🌐 API URL:', `${API_BASE_URL}/api/generate-soap`);

  try {
    const requestBody = {
      transcript,
      previousNotes
    };

    console.log('📤 Request body:', requestBody);

    const response = await fetch(`${API_BASE_URL}/api/generate-soap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📡 SOAP API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ SOAP generation error:', errorData);
      throw new Error(errorData.message || errorData.error || 'SOAP generation failed');
    }

    const result = await response.json();
    console.log('✅ SOAP note generated successfully:', result);
    return result;
  } catch (error) {
    console.error('💥 SOAP generation request failed:', error);
    throw error;
  }
};
