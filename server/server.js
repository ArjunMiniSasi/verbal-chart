const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializePlumbRAG, generateEnhancedSOAP } = require('./plumbRAG');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
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

    // Use our enhanced SOAP generation with PlumbRAG
    const soapNote = await generateEnhancedSOAP(transcript, previousNotes || []);

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

// Firebase Vector Search endpoint
app.post('/api/vector-search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('🔍 Vector search query:', query);

    // Generate embedding for the query using a model that produces 768 dimensions
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small', // This model produces 1536 dimensions, but we'll truncate to 768
      input: query,
    });
    // Truncate to 768 dimensions to match stored embeddings
    const queryEmbedding = embeddingResponse.data[0].embedding.slice(0, 768);

    console.log('📊 Generated query embedding with', queryEmbedding.length, 'dimensions');

    // Use Firebase client SDK for vector search
    const veterinaryDrugIndexRef = collection(db, 'veterinary_drug_index');

    // Get documents and perform manual vector search
    const snapshot = await getDocs(veterinaryDrugIndexRef);
    console.log(`📚 Found ${snapshot.size} documents in collection`);

    const similarities = [];

    let processedCount = 0;
    let validEmbeddingCount = 0;

    snapshot.forEach((doc) => {
      processedCount++;
      if (processedCount <= 5) { // Debug first 5 documents
        console.log(`📄 Document ${processedCount}: ${doc.id}`);
      }

      const data = doc.data();
      const content = data.content || data.description || data.drug_name || '';
      const drugName = data.drug_name || doc.id;
      const embedding = data.embedding;

      // Handle Firebase vector format: { _values: [...] }
      let embeddingArray = null;
      if (embedding) {
        if (Array.isArray(embedding)) {
          embeddingArray = embedding;
        } else if (embedding._values && Array.isArray(embedding._values)) {
          embeddingArray = embedding._values;
        } else if (embedding.__type__ === "__vector__" && embedding.value && Array.isArray(embedding.value)) {
          embeddingArray = embedding.value;
        }
      }

      // Debug embedding format for first few documents
      if (processedCount <= 3 && embedding) {
        console.log(`🔍 Document ${processedCount} embedding format:`, {
          type: typeof embedding,
          isArray: Array.isArray(embedding),
          keys: Object.keys(embedding),
          hasValues: !!embedding._values,
          hasValue: !!embedding.value,
          hasType: !!embedding.__type__
        });
      }

      if (embeddingArray && content && embeddingArray.length === queryEmbedding.length) {
        validEmbeddingCount++;
        try {
          const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
          if (processedCount <= 5) {
            console.log(`📊 ${drugName}: similarity ${similarity.toFixed(4)}`);
          }
          if (similarity > 0.01) { // Very low threshold for testing
            similarities.push({ content, similarity, drugName, id: doc.id });
          }
        } catch (error) {
          console.warn(`⚠️ Error calculating similarity for ${drugName}:`, error);
        }
      }
    });

    console.log(`📊 Processed ${processedCount} documents, ${validEmbeddingCount} had valid embeddings`);

    // Sort by similarity and return top results
    const sortedResults = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(result => ({
        id: result.id,
        content: result.content,
        drugName: result.drugName,
        similarity: result.similarity
      }));

    console.log(`✅ Found ${sortedResults.length} relevant results using manual vector search`);

    // Process results with LLM if we have matches
    let llmResponse = null;
    if (sortedResults.length > 0) {
      try {
        console.log('🤖 Processing results with LLM...');
        llmResponse = await processResultsWithLLM(query, sortedResults);
        console.log('📝 LLM Response:', llmResponse);
      } catch (error) {
        console.error('⚠️ LLM processing failed:', error);
      }
    }

    // Include debugging information in response
    res.json({
      results: sortedResults,
      llmResponse: llmResponse,
      debug: {
        totalDocuments: processedCount,
        validEmbeddings: validEmbeddingCount,
        queryEmbeddingDimensions: queryEmbedding.length,
        similarityThreshold: 0.01
      }
    });

  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({
      error: 'Failed to perform vector search',
      message: error.message
    });
  }
});

// Helper function for cosine similarity
function cosineSimilarity(a, b) {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

// LLM function to process vector search results
async function processResultsWithLLM(query, results) {
  try {
    // Prepare the context from search results
    const context = results.map((result, index) =>
      `${index + 1}. ${result.drugName || result.id} (Similarity: ${result.similarity.toFixed(3)})\n   ${result.content}`
    ).join('\n\n');

    const prompt = `Based on the following veterinary drug information retrieved for the query "${query}", provide a concise treatment plan for doctors:

SEARCH RESULTS:
${context}

Provide ONLY a simple, doctor-friendly treatment plan with:
**Plan:** List core medications with dosages (max 3-4 items)
**Follow-up:** When to recheck and what to monitor

Format as a simple list. Be brief and focused.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a veterinary expert providing concise treatment plans for doctors. Be brief, focused, and include only essential medications with dosages. Avoid lengthy explanations or multiple sections.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
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
