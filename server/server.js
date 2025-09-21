const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit (OpenAI Whisper limit)
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medora Backend is running' });
});

// Test SOAP generation endpoint
app.post('/api/test-soap', async (req, res) => {
  try {
    const testTranscript = "The dog has been coughing for 3 days. Owner says it worsens at night. Temperature is 102.5°F, heart rate elevated. Lungs sound clear. Suspect kennel cough.";
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical scribe specialized in veterinary care. 
Your job is to extract and summarize the relevant information 
from the transcript into a structured SOAP note. 
Do not copy raw dialogue. Do not include greetings or small talk. 
Focus on clinical details only. 

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "subjective": "Patient's reported symptoms and history",
  "objective": "Physical examination findings and observations", 
  "assessment": "Clinical diagnosis and evaluation",
  "plan": "Treatment plan and follow-up recommendations"
}

Do not include any text before or after the JSON. Do not use markdown formatting.`
        },
        {
          role: "user",
          content: `Please create a SOAP note from this consultation transcript:\n\n${testTranscript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    console.log('Test SOAP response:', content);
    
    res.json({ 
      status: 'success', 
      response: content,
      parsed: JSON.parse(content)
    });
  } catch (error) {
    console.error('Test SOAP error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log('Processing audio file:', req.file.filename);

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      words: transcription.words || []
    });

  } catch (error) {
    console.error('Transcription error:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file on error:', err);
      });
    }

    res.status(500).json({ 
      error: 'Transcription failed', 
      message: error.message 
    });
  }
});

// SOAP note generation endpoint
app.post('/api/generate-soap', async (req, res) => {
  try {
    const { transcript, previousNotes = [] } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log(`Generating SOAP note for transcript: ${transcript.substring(0, 100)}...`);

    // Prepare historical context
    const historyContext = previousNotes.length > 0 
      ? previousNotes.map((note, index) => 
          `Previous Note ${index + 1}:\n` +
          `Subjective: ${note.subjective}\n` +
          `Objective: ${note.objective}\n` +
          `Assessment: ${note.assessment}\n` +
          `Plan: ${note.plan}\n`
        ).join('\n---\n')
      : 'No previous medical history available.';

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical scribe specialized in veterinary care. 
Your job is to extract and summarize the relevant information 
from the transcript into a structured SOAP note. 
Do not copy raw dialogue. Do not include greetings or small talk. 
Focus on clinical details only. 

IMPORTANT: You must respond with ONLY valid JSON in this exact format:
{
  "subjective": "Patient's reported symptoms and history",
  "objective": "Physical examination findings and observations", 
  "assessment": "Clinical diagnosis and evaluation",
  "plan": "Treatment plan and follow-up recommendations"
}

Do not include any text before or after the JSON. Do not use markdown formatting.

Additional context: Consider the patient's medical history from previous SOAP notes to ensure continuity and reference ongoing treatments or follow-up items where relevant.`
        },
        {
          role: "user",
          content: `Please create a SOAP note from this consultation transcript, considering the patient's medical history:

CURRENT CONSULTATION TRANSCRIPT:
${transcript}

PATIENT'S MEDICAL HISTORY:
${historyContext}

Generate a new SOAP note that builds upon the historical context while focusing on today's visit.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    console.log('Raw OpenAI response:', content);

    // Try to parse the JSON response
    try {
      const soapNote = JSON.parse(content);
      console.log('Parsed SOAP note:', soapNote);
      
      // Validate that all required fields are present
      if (!soapNote.subjective || !soapNote.objective || !soapNote.assessment || !soapNote.plan) {
        console.error('Missing required fields:', {
          subjective: !!soapNote.subjective,
          objective: !!soapNote.objective,
          assessment: !!soapNote.assessment,
          plan: !!soapNote.plan
        });
        throw new Error('Invalid SOAP note structure - missing required fields');
      }

      console.log('SOAP note generated successfully');
      res.json(soapNote);
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // Try to extract SOAP sections using regex as fallback
      const subjectiveMatch = content.match(/subjective[":\s]*([^}]+)/i);
      const objectiveMatch = content.match(/objective[":\s]*([^}]+)/i);
      const assessmentMatch = content.match(/assessment[":\s]*([^}]+)/i);
      const planMatch = content.match(/plan[":\s]*([^}]+)/i);

      if (subjectiveMatch && objectiveMatch && assessmentMatch && planMatch) {
        console.log('Extracted SOAP note using regex fallback');
        res.json({
          subjective: subjectiveMatch[1].trim().replace(/[",}]/g, ''),
          objective: objectiveMatch[1].trim().replace(/[",}]/g, ''),
          assessment: assessmentMatch[1].trim().replace(/[",}]/g, ''),
          plan: planMatch[1].trim().replace(/[",}]/g, '')
        });
      } else {
        // Return fallback empty SOAP note
        res.json({
          subjective: "Unable to generate subjective notes from transcript.",
          objective: "Unable to generate objective findings from transcript.",
          assessment: "Unable to generate assessment from transcript.",
          plan: "Unable to generate treatment plan from transcript."
        });
      }
    }

  } catch (error) {
    console.error('Error generating SOAP note:', error);
    res.status(500).json({ 
      error: 'SOAP note generation failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
    }
  }
  
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Medora Backend running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
