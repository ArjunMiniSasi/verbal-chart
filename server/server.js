const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializePlumbRAG, generateEnhancedSOAP } = require('./plumbRAG');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
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

// Enhanced SOAP Generation endpoint with PlumbRAG
app.post('/api/generate-soap', async (req, res) => {
  try {
    const { transcript, previousNotes } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log('🤖 Generating enhanced SOAP with PlumbRAG...');
    console.log('📝 Transcript length:', transcript.length);
    console.log('📚 Previous notes count:', previousNotes ? previousNotes.length : 0);

    // Use our enhanced SOAP generation with PlumbRAG (SOA only, no plan)
    const soapNote = await generateEnhancedSOAP(transcript, previousNotes || [], false);

    console.log('🎯 Final enhanced SOAP note:', soapNote);
    res.json({ soapNote });
  } catch (error) {
    console.error('Enhanced SOAP generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate enhanced SOAP notes',
      message: error.message 
    });
  }
});

// Generate Plan from Manual SOA endpoint
app.post('/api/generate-plan-from-soa', async (req, res) => {
  try {
    const { subjective, objective, assessment, previousNotes } = req.body;

    if (!subjective || !objective || !assessment) {
      return res.status(400).json({ 
        error: 'Subjective, Objective, and Assessment are all required' 
      });
    }

    console.log('🎯 Generating plan from manual SOA...');
    console.log('📝 Subjective length:', subjective.length);
    console.log('📝 Objective length:', objective.length);
    console.log('📝 Assessment length:', assessment.length);
    console.log('📚 Previous notes count:', previousNotes ? previousNotes.length : 0);

    // Create a combined transcript from the SOA sections
    const combinedTranscript = `Subjective: ${subjective}\n\nObjective: ${objective}\n\nAssessment: ${assessment}`;
    
    // Use our enhanced SOAP generation with PlumbRAG, but only generate the plan
    const soapNote = await generateEnhancedSOAP(combinedTranscript, previousNotes || [], true);
    
    // Return only the plan section
    const response = {
      plan: soapNote.plan,
      petInfo: {
        species: 'unknown',
        breed: 'unknown', 
        age: 'unknown',
        weight: 'unknown',
        sex: 'unknown'
      }
    };

    console.log('🎯 Generated plan from manual SOA:', response.plan);
    res.json(response);
  } catch (error) {
    console.error('Plan generation from SOA error:', error);
    res.status(500).json({ 
      error: 'Failed to generate plan from SOA',
      message: error.message 
    });
  }
});

// Generate Plan from existing SOA endpoint (for auto mode)
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { subjective, objective, assessment, previousNotes } = req.body;

    if (!subjective || !objective || !assessment) {
      return res.status(400).json({ 
        error: 'Subjective, Objective, and Assessment are all required' 
      });
    }

    console.log('🎯 Generating plan from existing SOA...');
    console.log('📝 Subjective length:', subjective.length);
    console.log('📝 Objective length:', objective.length);
    console.log('📝 Assessment length:', assessment.length);
    console.log('📚 Previous notes count:', previousNotes ? previousNotes.length : 0);

    // Create a combined transcript from the SOA sections
    const combinedTranscript = `Subjective: ${subjective}\n\nObjective: ${objective}\n\nAssessment: ${assessment}`;
    
    // Use our enhanced SOAP generation with PlumbRAG, but only generate the plan
    const soapNote = await generateEnhancedSOAP(combinedTranscript, previousNotes || [], true);
    
    // Return only the plan section
    const response = {
      plan: soapNote.plan,
      petInfo: {
        species: 'unknown',
        breed: 'unknown', 
        age: 'unknown',
        weight: 'unknown',
        sex: 'unknown'
      }
    };

    console.log('🎯 Generated plan from existing SOA:', response.plan);
    res.json(response);
  } catch (error) {
    console.error('Plan generation from existing SOA error:', error);
    res.status(500).json({ 
      error: 'Failed to generate plan from existing SOA',
      message: error.message 
    });
  }
});

// Helper function to parse SOAP from text
function parseSOAPFromText(text) {
  console.log('🔍 Parsing text for SOAP sections...');
  console.log('Text to parse:', text.substring(0, 200) + '...');
  
  const sections = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  };

  // Enhanced text parsing to extract sections
  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.includes('subjective') || lowerLine.includes('s —') || lowerLine.includes('chief complaint')) {
      currentSection = 'subjective';
      console.log('📍 Found subjective section');
    } else if (lowerLine.includes('objective') || lowerLine.includes('o —') || lowerLine.includes('physical exam')) {
      currentSection = 'objective';
      console.log('📍 Found objective section');
    } else if (lowerLine.includes('assessment') || lowerLine.includes('a —') || lowerLine.includes('impression')) {
      currentSection = 'assessment';
      console.log('📍 Found assessment section');
    } else if (lowerLine.includes('plan') || lowerLine.includes('p —') || lowerLine.includes('treatment')) {
      currentSection = 'plan';
      console.log('📍 Found plan section');
    } else if (currentSection && line.trim()) {
      sections[currentSection] += line.trim() + ' ';
    }
  }

  // Clean up the sections
  Object.keys(sections).forEach(key => {
    sections[key] = sections[key].trim();
  });

  console.log('📊 Parsed sections:', sections);
  return sections;
}

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
    }
  }
  
  res.status(500).json({ error: error.message });
});

// Initialize PlumbRAG on server start
initializePlumbRAG().then(() => {
  console.log('✅ PlumbRAG system ready');
}).catch((error) => {
  console.log('⚠️ PlumbRAG initialization failed, continuing without it:', error.message);
});

app.listen(PORT, () => {
  console.log(`🚀 Medora Backend running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
