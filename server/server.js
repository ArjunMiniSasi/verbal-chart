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

// SOAP Generation endpoint
app.post('/api/generate-soap', async (req, res) => {
  try {
    const { systemPrompt, userPrompt } = req.body;

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'System prompt and user prompt are required' });
    }

    console.log('🤖 Generating SOAP with OpenAI...');
    console.log('📝 User prompt length:', userPrompt.length);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const response = completion.choices[0]?.message?.content;
    console.log('📋 Raw OpenAI response:', response);
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response to extract JSON from markdown code blocks
    let cleanedResponse = response.trim();
    
    // Remove markdown code block markers
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
    }
    
    console.log('🧹 Cleaned response:', cleanedResponse);

    // Try to parse as JSON
    let soapNote;
    try {
      soapNote = JSON.parse(cleanedResponse);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.log('⚠️ JSON parse failed, trying text parsing...');
      console.log('Parse error:', parseError.message);
      
      // Fallback: parse the text response
      soapNote = parseSOAPFromText(cleanedResponse);
      console.log('📝 Text parsing result:', soapNote);
    }

    console.log('🎯 Final SOAP note:', soapNote);
    res.json({ soapNote });
  } catch (error) {
    console.error('SOAP generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate SOAP notes',
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

app.listen(PORT, () => {
  console.log(`🚀 Medora Backend running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
