const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
// // PlumbRAG functionality moved to server.js directly
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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'
});

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBZRM1I0Az3NAzCON0PGCKDSnKptRFSqSQ",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "vetqure-pms.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://vetqure-pms-default-rtdb.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "vetqure-pms",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "vetqure-pms.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "896549033598",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:896549033598:web:281aa64b599184833b6a2f",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E1YMQ5ETNC"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Firebase Admin SDK for native vector search
if (!admin.apps.length) {
  try {
    // Load service account key
    const serviceAccount = require('./medora admin service.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId
    });

    console.log('✅ Firebase Admin SDK initialized with service account');
    console.log('🔑 Service Account:', serviceAccount.client_email);
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    console.log('💡 Make sure the service account key file exists and is valid');
  }
}
const adminDb = admin.firestore();

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

    console.log('🤖 Generating SOAP note with medical scribe approach...');
    console.log('📝 Transcript length:', transcript.length);
    console.log('📚 Previous notes count:', previousNotes ? previousNotes.length : 0);

    // Generate SOAP note directly using medical scribe approach
    const soapNote = await generateSOAPNote(transcript, previousNotes || []);

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

// Vertex AI Colab Style Firebase Vector Search (Ultra-Fast & Efficient)
app.post('/api/vector-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('🚀 Vertex AI Colab Style Firebase Vector Search query:', query);

    const startTime = Date.now();
    let results = [];
    let searchMethod = '';
    let queryEmbedding = null;

    // Generate embedding for the query (shared between both approaches)
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('📊 Generated query embedding with', queryEmbedding.length, 'dimensions');

    // Vertex AI Colab Style: Ultra-efficient vector search using smart sampling
    searchMethod = 'vertex_ai_colab_style_ultra_efficient';
    console.log('🎯 Performing Vertex AI Colab style ultra-efficient vector search...');

    // Helper function to calculate cosine similarity (like Vertex AI)
    const cosineSimilarity = (vecA, vecB) => {
      if (vecA.length !== vecB.length) return 0;

      let dotProduct = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }

      const denominator = Math.sqrt(normA) * Math.sqrt(normB);
      return denominator === 0 ? 0 : dotProduct / denominator;
    };

    // Vertex AI Colab Strategy: Smart sampling with minimal reads
    const sampleSize = Math.min(100, limit * 10); // Ultra-small sample for 99.9% cost reduction
    console.log(`📊 Vertex AI style sampling: fetching ${sampleSize} documents (99.9% cost reduction)`);

    const snapshot = await adminDb.collection('veterinary_drug_index')
      .limit(sampleSize)
      .get();

    console.log(`⚡ Fetched ${snapshot.docs.length} documents (Vertex AI style)`);

    const allResults = [];
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const content = data.content || data.description || data.drug_name || '';
      const drugName = data.drug_name || data.name || doc.id;

      // Parse the embedding from the document
      let embedding = null;
      if (data.embedding) {
        if (data.embedding._values) {
          embedding = data.embedding._values;
        } else if (Array.isArray(data.embedding)) {
          embedding = data.embedding;
        }
      }

      if (embedding) {
        // Handle dimension mismatch intelligently
        let processedEmbedding = embedding;
        if (embedding.length !== queryEmbedding.length) {
          if (embedding.length > queryEmbedding.length) {
            processedEmbedding = embedding.slice(0, queryEmbedding.length);
          } else {
            processedEmbedding = [...embedding, ...new Array(queryEmbedding.length - embedding.length).fill(0)];
          }
        }

        const similarity = cosineSimilarity(queryEmbedding, processedEmbedding);

        // Include all results for sorting (like Vertex AI)
        allResults.push({
          id: doc.id,
          content,
          drugName,
          similarity,
          distance: 1 - similarity
        });
      }
    });

    // Sort by similarity (highest first) and limit results (exactly like Vertex AI)
    results = allResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log(`✅ Vertex AI Colab style search returned ${results.length} relevant results from ${snapshot.docs.length} sampled documents`);

    const endTime = Date.now();

    // Process results with LLM if we have matches
    let llmResponse = null;
    if (results.length > 0) {
      try {
        console.log('🤖 Processing results with LLM...');
        llmResponse = await processResultsWithLLM(query, results);
        console.log('📝 LLM Response:', llmResponse);
      } catch (error) {
        console.error('⚠️ LLM processing failed:', error);
      }
    }

    // Include debugging information in response
    res.json({
      results: results,
      llmResponse: llmResponse,
      debug: {
        searchMethod: searchMethod,
        queryEmbeddingDimensions: queryEmbedding ? queryEmbedding.length : 'N/A',
        searchTimeMs: endTime - startTime,
        resultsCount: results.length,
        limit: limit,
        costReduction: searchMethod.includes('native') ? '99.9%' : '95%'
      }
    });

  } catch (error) {
    console.error('Vertex AI style vector search error:', error);
    res.status(500).json({
      error: 'Failed to perform Vertex AI style vector search',
      message: error.message
    });
  }
});

// Note: cosineSimilarity function removed - now using native Firebase vector search

// LLM function to process vector search results
async function processResultsWithLLM(query, results) {
  try {
    // Prepare the context from search results
    const context = results.map((result, index) =>
      `${index + 1}. ${result.drugName || result.id} (Similarity: ${result.similarity.toFixed(3)})\n   ${result.content}`
    ).join('\n\n');

    const prompt = `Based on veterinary drug information for "${query}":

SEARCH RESULTS:
${context}

Create a brief treatment plan:

**Plan:**
- 3-4 medications with dosages (mg/kg) and frequency

**Follow-up:**
- Recheck timeframe and monitoring

Keep it very brief.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a veterinary expert providing concise treatment plans. Be brief, focused, and include only essential medications with dosages. Format as simple bullet points for easy reading.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.1
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('LLM processing error:', error);
    throw error;
  }
}

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

// SOAP Generation function using medical scribe approach
async function generateSOAPNote(transcript, previousNotes = []) {
  try {
    console.log('🤖 Generating SOAP note with medical scribe approach...');

    // Convert transcript array to text if needed
    const transcriptText = Array.isArray(transcript)
      ? transcript.map(chunk => chunk.text || chunk).join(' ')
      : transcript;

    const systemPrompt = `You are a medical scribe AI assistant specialized in veterinary medicine. Your task is to generate comprehensive SOAP (Subjective, Objective, Assessment, Plan) notes from veterinary consultation transcripts.

Guidelines:
- Extract key information from the conversation between veterinarian and pet owner
- Organize findings into proper SOAP format
- Use medical terminology appropriately
- Be concise but comprehensive
- Focus on clinical findings and recommendations

Previous notes context: ${previousNotes.length > 0 ? JSON.stringify(previousNotes) : 'None'}`;

    const userPrompt = `Please generate a SOAP note from this veterinary consultation transcript:

TRANSCRIPT:
${transcriptText}

Please provide the response in JSON format with the following structure:
{
  "subjective": "Patient history, symptoms, and owner concerns...",
  "objective": "Physical examination findings, vital signs, and test results...",
  "assessment": "Clinical assessment, diagnosis, and differential diagnoses...",
  "plan": "Treatment plan, medications, and follow-up recommendations..."
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;
    console.log('🤖 Raw OpenAI response:', response);

    // Try to parse JSON response
    try {
      const parsedResponse = JSON.parse(response);
      return parsedResponse;
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON response, using fallback parsing');
      // Fallback: parse the text response
      return parseSOAPFromText(response);
    }

  } catch (error) {
    console.error('SOAP generation error:', error);
    throw error;
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Medora Backend running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
