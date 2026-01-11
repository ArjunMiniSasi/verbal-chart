const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

async function testTranscription() {
  try {
    // Test if server is running
    console.log('Testing server health...');
    const healthResponse = await fetch('http://localhost:3001/health');
    const healthData = await healthResponse.text();
    console.log('Health check response:', healthData);

    // Test transcription endpoint
    console.log('\nTesting transcription endpoint...');
    
    // Create a simple test audio file (you can replace this with an actual audio file)
    const formData = new FormData();
    
    // For testing, we'll create a simple text file and send it
    // In real usage, this would be an audio file
    const testFile = Buffer.from('test audio content');
    formData.append('audio', testFile, {
      filename: 'test.wav',
      contentType: 'audio/wav'
    });

    const response = await fetch('http://localhost:3001/api/transcribe', {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    console.log('Transcription response:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTranscription();
