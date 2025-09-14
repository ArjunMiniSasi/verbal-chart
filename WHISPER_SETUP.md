# Whisper AI Integration Setup

This guide will help you set up the Whisper AI integration for real-time audio transcription in the Medora AI Medical Scribe application.

## Prerequisites

1. **OpenAI API Key**: You need an active OpenAI API key with access to the Whisper API
2. **Node.js**: Version 16 or higher
3. **npm**: Package manager

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
PORT=3001
```

### 3. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## Frontend Setup

### 1. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Start the Frontend

```bash
# Development mode
npm run dev

# Or run both frontend and backend together
npm run dev:full
```

## Usage

### Audio Upload
1. Navigate to the patient template page
2. In the Quick Actions sidebar, use the "Audio Upload" component
3. Select an audio file (MP3, WAV, MP4)
4. Click "Transcribe Audio" to process with Whisper AI

### Live Recording
1. On the patient template page, use the large "Start Voice Recording" button
2. Click to start recording (browser will request microphone permission)
3. Speak your consultation notes
4. Click the stop button to end recording
5. The audio will be automatically transcribed using Whisper AI

## Features

- **Real-time Transcription**: Uses OpenAI Whisper API for accurate speech-to-text
- **Multiple Audio Formats**: Supports MP3, WAV, MP4, and WebM
- **Live Recording**: Browser-based audio recording with MediaRecorder API
- **Server Health Monitoring**: Visual indicator of backend connection status
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **File Size Validation**: 25MB limit (OpenAI Whisper limit)
- **Automatic Cleanup**: Temporary files are automatically deleted after processing

## API Endpoints

- `GET /health` - Server health check
- `POST /api/transcribe` - Audio transcription endpoint

## Troubleshooting

### Common Issues

1. **"Server offline" indicator**
   - Ensure the backend server is running on port 3001
   - Check if the OPENAI_API_KEY is correctly set

2. **Microphone permission denied**
   - Grant microphone access in your browser
   - Check browser settings for site permissions

3. **Transcription fails**
   - Verify your OpenAI API key is valid and has credits
   - Check the console for detailed error messages
   - Ensure audio file is not corrupted

4. **File upload issues**
   - Check file size (must be under 25MB)
   - Ensure file format is supported (MP3, WAV, MP4, WebM)

### Browser Compatibility

- **Chrome/Edge**: Full support for MediaRecorder API
- **Firefox**: Full support for MediaRecorder API
- **Safari**: Limited support (may need polyfills)

## Security Notes

- Never commit your `.env` files to version control
- Keep your OpenAI API key secure
- The backend automatically cleans up uploaded files after processing
- CORS is configured to allow frontend requests

## Development

### Running Both Services

```bash
# Install dependencies for both frontend and backend
npm install
cd server && npm install && cd ..

# Run both services concurrently
npm run dev:full
```

This will start:
- Frontend on `http://localhost:5173`
- Backend on `http://localhost:3001`

### Testing the Integration

1. Start both services
2. Navigate to a patient template page
3. Try uploading an audio file or using live recording
4. Check the browser console and server logs for any issues
