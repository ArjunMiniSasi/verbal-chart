// server.js — Medora hybrid RAG server (complete)
// Drop into your project (replace/merge as needed).

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
// Lazy load pdf-parse only when needed to avoid DOMMatrix issues
let pdf = null;
function getPdfParser() {
  if (!pdf) {
    try {
      pdf = require('pdf-parse');
    } catch (err) {
      console.error('Error loading pdf-parse:', err);
      throw new Error('PDF parsing not available. Please install pdf-parse: npm install pdf-parse');
    }
  }
  return pdf;
}

// OpenAI client (keep same style as your earlier code)
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Firebase client (for non-admin reads/writes if needed)
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Firebase Admin (for server-side wide access & vector indexing storage)
const admin = require('firebase-admin');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '6mb' })); // adjust if transcripts large

// ------------- Firebase client init (optional) -------------
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

try {
  initializeApp(firebaseConfig);
  console.log('✅ Firebase web client initialized');
} catch (e) {
  console.warn('⚠️ Firebase web client init error (may be already initialized):', e.message || e);
}

// ------------- Firebase Admin init (server) -------------
try {
  const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || './medora admin service.json';
  if (!fs.existsSync(serviceAccountPath)) {
    console.warn('⚠️ Firebase service account file not found at', serviceAccountPath, '. Make sure to provide SERVICE_ACCOUNT_PATH in env or put the json there.');
  } else {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId
    });
    console.log('✅ Firebase Admin initialized with service account');
  }
} catch (err) {
  console.error('❌ Firebase Admin initialization failed:', err.message || err);
}

// Initialize adminDb only if admin is initialized
let adminDb = null;
try {
  if (admin.apps.length > 0) {
    adminDb = admin.firestore();
    console.log('✅ Firebase Admin Firestore initialized');
  } else {
    console.warn('⚠️ Firebase Admin not initialized, RAG features will be limited');
  }
} catch (err) {
  console.error('❌ Failed to initialize Firestore:', err.message || err);
}

// ------------- Multer setup for audio upload -------------
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Allow audio files for transcription
    if (file.mimetype.startsWith('audio/')) cb(null, true);
    // Allow PDF files for Plumb processing
    else if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only audio or PDF files allowed'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB (PDFs can be larger)
});

// Separate multer instance for PDFs (with different field name)
const uploadPdf = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ------------- Small utils -------------
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== vecB.length) {
    // pad/trim to match
    const min = Math.min(vecA.length, vecB.length);
    vecA = vecA.slice(0, min);
    vecB = vecB.slice(0, min);
  }
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    na += vecA[i] * vecA[i];
    nb += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ------------- Transcript transcription endpoint -------------
app.get('/health', (req, res) => res.json({ status: 'OK', message: 'Medora Backend running' }));

app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio provided' });

    console.log('Processing audio file:', req.file.filename);
    // Use OpenAI's whisper endpoint style used in your code
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    });

    // cleanup
    fs.unlink(req.file.path, (err) => { if (err) console.warn('upload cleanup error', err); });

    res.json({
      text: transcription.text,
      language: transcription.language,
      duration: transcription.duration,
      words: transcription.words || []
    });
  } catch (error) {
    console.error('Transcription error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: 'Transcription failed', message: error.message || String(error) });
  }
});

// ------------- Chunking & ingestion helpers -------------
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '700', 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '120', 10);

// ------------- Plumb RAG Integration -------------
const PLUMB_DATA_PATH = path.resolve(__dirname, '../data/plumb_embeddings.json');

/**
 * Ingest Plumb Veterinary Drug Handbook data into Firestore
 * This loads the pre-computed embeddings from plumb_embeddings.json
 */
async function ingestPlumbDataToFirestore() {
  if (!adminDb) throw new Error('adminDb not initialised');
  
  try {
    console.log('📚 Loading Plumb data from:', PLUMB_DATA_PATH);
    
    if (!fs.existsSync(PLUMB_DATA_PATH)) {
      console.warn('⚠️ Plumb data file not found at', PLUMB_DATA_PATH);
      return { ok: false, error: 'Plumb data file not found' };
    }
    
    const plumbData = JSON.parse(fs.readFileSync(PLUMB_DATA_PATH, 'utf8'));
    const { chunks, embeddings } = plumbData;
    
    if (!chunks || !embeddings || chunks.length !== embeddings.length) {
      throw new Error('Invalid Plumb data structure');
    }
    
    console.log(`📖 Ingesting ${chunks.length} Plumb chunks into Firestore...`);
    
    const chunksRef = adminDb.collection('medora_chunks');
    const BATCH_SIZE = 50;
    
    for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
      const slice = chunks.slice(b, b + BATCH_SIZE);
      const embSlice = embeddings.slice(b, b + BATCH_SIZE);
      
      const batch = adminDb.batch();
      for (let i = 0; i < slice.length; i++) {
        const chunkIndex = b + i;
        const chunkId = `plumb__${chunkIndex}`;
        const docRef = chunksRef.doc(chunkId);
        batch.set(docRef, {
          doc_id: 'plumb_drug_handbook',
          chunk_id: chunkId,
          chunk_index: chunkIndex,
          content: slice[i],
          embedding: embSlice[i],
          meta: { 
            source: 'plumb',
            type: 'drug_handbook',
            ingested_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        }, { merge: true });
      }
      await batch.commit();
      console.log(`  ✓ Ingested batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
      if (b + BATCH_SIZE < chunks.length) await sleep(100);
    }
    
    console.log(`✅ Successfully ingested ${chunks.length} Plumb chunks`);
    return { ok: true, chunksCount: chunks.length };
  } catch (err) {
    console.error('❌ Error ingesting Plumb data:', err);
    return { ok: false, error: err.message || String(err) };
  }
}

/**
 * Search Plumb data specifically for treatment/drug information
 * Uses Firebase Firestore if available, falls back to local JSON file
 * Returns top-k relevant chunks from Plumb drug handbook
 */
async function searchPlumbData(query, k = 5) {
  try {
    // Embed the query first
    console.log(`🔍 [PLUMB RAG DEBUG] Generating query embedding for: "${query.substring(0, 100)}..."`);
    const embResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    const qEmb = embResp.data[0].embedding;
    console.log(`🔍 [PLUMB RAG DEBUG] Query embedding generated: ${qEmb.length} dimensions`);
    
    // Try Firebase first if available
    if (adminDb) {
      try {
        console.log(`🔍 [PLUMB RAG DEBUG] Searching Plumb data from Firebase...`);
        
        // Query Plumb chunks from Firestore
        const plumbQuery = adminDb.collection('medora_chunks')
          .where('meta.source', '==', 'plumb')
          .limit(1000); // Limit for performance
        
        const snapshot = await plumbQuery.get();
        
        if (snapshot.empty) {
          console.warn('⚠️ No Plumb data found in Firebase. Falling back to local file or ingesting data.');
          // Fall through to local file check
        } else {
          console.log(`🔍 [PLUMB RAG DEBUG] Found ${snapshot.size} Plumb chunks in Firebase`);
          
          const candidates = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (!data || !data.embedding || !data.content) return;
            
            let emb = data.embedding;
            // Handle dimension mismatch
            if (emb.length !== qEmb.length) {
              if (emb.length > qEmb.length) emb = emb.slice(0, qEmb.length);
              else emb = emb.concat(new Array(qEmb.length - emb.length).fill(0));
            }
            
            const sim = cosineSimilarity(qEmb, emb);
            candidates.push({
              id: doc.id,
              chunk_id: data.chunk_id || doc.id,
              content: data.content,
              doc_id: data.doc_id || 'plumb_drug_handbook',
              similarity: sim
            });
          });
          
          console.log(`🔍 [PLUMB RAG DEBUG] Calculated similarity for ${candidates.length} Plumb chunks from Firebase`);
          
          // Sort by similarity and return top-k
          candidates.sort((a, b) => b.similarity - a.similarity);
          const topK = candidates.slice(0, k);
          console.log(`📖 [PLUMB RAG DEBUG] Top ${topK.length} Plumb references selected from Firebase:`);
          topK.forEach((ref, idx) => {
            console.log(`   ${idx + 1}. Similarity: ${ref.similarity.toFixed(4)} | Chunk ID: ${ref.chunk_id} | Preview: "${ref.content.substring(0, 80)}..."`);
          });
          console.log(`📖 Found ${topK.length} relevant Plumb references from Firebase (top similarity: ${topK[0]?.similarity?.toFixed(3) || 0})`);
          return topK;
        }
      } catch (firebaseErr) {
        console.warn('⚠️ Error querying Firebase for Plumb data, falling back to local file:', firebaseErr.message);
        // Fall through to local file check
      }
    }
    
    // Fallback to local JSON file
    console.log(`🔍 [PLUMB RAG DEBUG] Falling back to local JSON file...`);
    
    if (!fs.existsSync(PLUMB_DATA_PATH)) {
      console.warn('⚠️ Plumb data file not found at', PLUMB_DATA_PATH);
      console.warn('💡 Tip: Use /api/ingest-plumb-data to upload embeddings to Firebase, or process PDF via /api/process-plumb-pdf');
      return [];
    }

    // Load Plumb data from local JSON file with error handling
    let plumbData;
    try {
      const fileContent = fs.readFileSync(PLUMB_DATA_PATH, 'utf8');
      
      // Check if file is empty or too small
      if (!fileContent || fileContent.trim().length < 100) {
        console.warn('⚠️ Plumb data file appears to be empty or incomplete');
        return [];
      }
      
      // Try to parse JSON
      plumbData = JSON.parse(fileContent);
    } catch (parseErr) {
      console.error('❌ Error parsing Plumb data file:', parseErr.message);
      console.error('⚠️ File might be corrupted or still being written. Check if processing script is still running.');
      return [];
    }
    
    const { chunks, embeddings } = plumbData || {};
    
    if (!chunks || !embeddings || chunks.length === 0) {
      console.warn('⚠️ Plumb data file is empty or invalid structure');
      return [];
    }
    
    if (chunks.length !== embeddings.length) {
      console.warn(`⚠️ Plumb data mismatch: ${chunks.length} chunks but ${embeddings.length} embeddings`);
      // Use the minimum to avoid index errors
      const minLength = Math.min(chunks.length, embeddings.length);
      chunks.splice(minLength);
      embeddings.splice(minLength);
    }

    console.log(`🔍 [PLUMB RAG DEBUG] Searching ${chunks.length} Plumb chunks from local file...`);
    console.log(`🔍 [PLUMB RAG DEBUG] Loaded ${embeddings.length} Plumb embeddings from JSON file`);
    
    // Calculate similarity for all chunks (or sample if too many)
    const MAX_CHUNKS_TO_SEARCH = 1000; // Limit search to first 1000 chunks for performance
    const searchChunks = chunks.slice(0, MAX_CHUNKS_TO_SEARCH);
    const searchEmbeddings = embeddings.slice(0, MAX_CHUNKS_TO_SEARCH);
    console.log(`🔍 [PLUMB RAG DEBUG] Comparing query embedding against ${searchChunks.length} Plumb embeddings...`);
    
    const candidates = [];
    for (let i = 0; i < searchChunks.length; i++) {
      if (!searchEmbeddings[i]) continue;
      
      let emb = searchEmbeddings[i];
      // Handle dimension mismatch
      if (emb.length !== qEmb.length) {
        if (emb.length > qEmb.length) emb = emb.slice(0, qEmb.length);
        else emb = emb.concat(new Array(qEmb.length - emb.length).fill(0));
      }
      const sim = cosineSimilarity(qEmb, emb);
      candidates.push({ 
        id: `plumb__${i}`,
        chunk_id: `plumb__${i}`,
        content: searchChunks[i], 
        doc_id: 'plumb_drug_handbook', 
        similarity: sim
      });
    }
    
    console.log(`🔍 [PLUMB RAG DEBUG] Calculated similarity for ${candidates.length} Plumb chunks`);
    
    // Sort by similarity and return top-k
    candidates.sort((a, b) => b.similarity - a.similarity);
    const topK = candidates.slice(0, k);
    console.log(`📖 [PLUMB RAG DEBUG] Top ${topK.length} Plumb references selected:`);
    topK.forEach((ref, idx) => {
      console.log(`   ${idx + 1}. Similarity: ${ref.similarity.toFixed(4)} | Chunk ID: ${ref.chunk_id} | Preview: "${ref.content.substring(0, 80)}..."`);
    });
    console.log(`📖 Found ${topK.length} relevant Plumb references from local file (top similarity: ${topK[0]?.similarity?.toFixed(3) || 0})`);
    return topK;
  } catch (err) {
    console.error('Error searching Plumb data:', err);
    return [];
  }
}

function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + size);
    out.push(chunk);
    i += (size - overlap);
  }
  return out;
}

/**
 * Ingest transcript text into Firestore collection 'medora_chunks'
 * Each chunk stored as a doc with chunk_id = `${docId}__${index}`
 */
async function ingestTranscriptToFirestore(docId, text, meta = {}) {
  if (!adminDb) throw new Error('adminDb not initialised');
  const chunks = chunkText(text);
  console.log(`Ingesting ${chunks.length} chunks for doc ${docId}`);

  // break into smaller batches for embeddings
  const BATCH_SIZE = 50;
  const chunksRef = adminDb.collection('medora_chunks');

  for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
    const slice = chunks.slice(b, b + BATCH_SIZE);
    // call OpenAI embeddings for the slice
    const embeddingResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: slice
    });
    const embs = embeddingResp.data.map(d => d.embedding);
    // batch commit to firestore
    const batch = adminDb.batch();
    for (let i = 0; i < slice.length; i++) {
      const chunkIndex = b + i;
      const chunkId = `${docId}__${chunkIndex}`;
      const docRef = chunksRef.doc(chunkId);
      batch.set(docRef, {
        doc_id: docId,
        chunk_id: chunkId,
        chunk_index: chunkIndex,
        content: slice[i],
        embedding: embs[i],
        meta: meta || {},
        created_at: new Date().toISOString()
      }, { merge: true });
    }
    await batch.commit();
    // gentle pause if many batches
    if (b + BATCH_SIZE < chunks.length) await sleep(100);
  }

  return { ok: true, chunksCount: chunks.length };
}

// optional ingestion endpoint
app.post('/api/ingest-transcript', async (req, res) => {
  try {
    const { docId, transcript, meta } = req.body;
    if (!docId || !transcript) return res.status(400).json({ error: 'docId and transcript required' });
    const out = await ingestTranscriptToFirestore(docId, transcript, meta || {});
    res.json(out);
  } catch (err) {
    console.error('ingest-transcript error', err);
    res.status(500).json({ error: 'ingest failed', message: err.message || String(err) });
  }
});

// Plumb data ingestion endpoint (from JSON file)
app.post('/api/ingest-plumb', async (req, res) => {
  try {
    const out = await ingestPlumbDataToFirestore();
    if (out.ok) {
      res.json({ success: true, message: `Ingested ${out.chunksCount} Plumb chunks`, ...out });
    } else {
      res.status(500).json({ error: 'Plumb ingestion failed', ...out });
    }
  } catch (err) {
    console.error('ingest-plumb error', err);
    res.status(500).json({ error: 'ingest-plumb failed', message: err.message || String(err) });
  }
});

// Plumb PDF processing endpoint - extracts text from PDF and saves to local JSON file
app.post('/api/process-plumb-pdf', uploadPdf.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    console.log('📄 Processing Plumb PDF:', req.file.filename);
    console.log('📏 File size:', req.file.size, 'bytes');

    // Extract text from PDF
    const dataBuffer = fs.readFileSync(req.file.path);
    const pdfParser = getPdfParser();
    const pdfData = await pdfParser(dataBuffer);
    const text = pdfData.text;

    console.log(`📝 Extracted ${text.length} characters from PDF`);
    console.log(`📖 Number of pages: ${pdfData.numpages}`);

    if (!text || text.trim().length === 0) {
      // Cleanup
      fs.unlink(req.file.path, (err) => { if (err) console.warn('upload cleanup error', err); });
      return res.status(400).json({ error: 'No text could be extracted from PDF' });
    }

    // Chunk the text
    const chunks = chunkText(text);
    console.log(`📦 Created ${chunks.length} chunks`);

    // Generate embeddings in batches
    console.log('🔮 Generating embeddings...');
    const embeddings = [];
    const BATCH_SIZE = 50;

    for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
      const slice = chunks.slice(b, b + BATCH_SIZE);
      
      // Generate embeddings for the slice
      const embeddingResp = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: slice
      });
      
      const embs = embeddingResp.data.map(d => d.embedding);
      embeddings.push(...embs);
      
      console.log(`  ✓ Generated embeddings for batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (${embeddings.length}/${chunks.length})`);
      
      // Rate limiting
      if (b + BATCH_SIZE < chunks.length) await sleep(100);
    }

    // Save to local JSON file
    const outputData = {
      chunks: chunks,
      embeddings: embeddings,
      metadata: {
        source: 'plumb',
        type: 'drug_handbook',
        filename: req.file.originalname,
        pages: pdfData.numpages,
        processed_at: new Date().toISOString(),
        chunksCount: chunks.length
      }
    };

    // Ensure data directory exists
    const dataDir = path.dirname(PLUMB_DATA_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to JSON file
    fs.writeFileSync(PLUMB_DATA_PATH, JSON.stringify(outputData, null, 2), 'utf8');
    console.log(`✅ Saved embeddings to: ${PLUMB_DATA_PATH}`);

    // Cleanup uploaded file
    fs.unlink(req.file.path, (err) => { if (err) console.warn('upload cleanup error', err); });

    const fileSizeMB = fs.statSync(PLUMB_DATA_PATH).size / 1024 / 1024;

    res.json({
      success: true,
      message: `Successfully processed PDF and saved ${chunks.length} Plumb chunks to local file`,
      chunksCount: chunks.length,
      pages: pdfData.numpages,
      textLength: text.length,
      filePath: PLUMB_DATA_PATH,
      fileSizeMB: fileSizeMB.toFixed(2)
    });

  } catch (error) {
    console.error('process-plumb-pdf error:', error);
    // Cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => { if (err) console.warn('upload cleanup error', err); });
    }
    res.status(500).json({ error: 'PDF processing failed', message: error.message || String(error) });
  }
});

// ------------- LLM entity & relation extractor (LLM-assisted) -------------
async function llmExtractEntitiesAndRelations(text) {
  try {
    const prompt = `
Extract entities and relations from the following veterinary consultation text.
Return JSON with keys:
"entities": [{"id":"entity_text","label":"PERSON|ORG|SYMPTOM|MEDICATION|ANATOMY|OTHER","confidence":0.0}],
"relations": [{"from":"entity_text","to":"entity_text","type":"relation_type","confidence":0.0,"evidence":"short snippet"}]

Text:
"""${text.substring(0, 2500)}"""

Return ONLY valid JSON.
`;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      max_tokens: 800
    });
    let content = resp.choices[0].message.content || resp.choices[0].text || '';
    // remove fences
    content = content.replace(/^```(?:json)?/, '').replace(/```$/,'').trim();
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (e) {
      console.warn('llmExtract parse failed, returning empty', e);
      return { entities: [], relations: [] };
    }
  } catch (err) {
    console.error('llmExtract error', err);
    return { entities: [], relations: [] };
  }
}

async function upsertGraphFromChunk(chunkDoc) {
  // chunkDoc must have chunk_id and content
  try {
    const { chunk_id, content } = chunkDoc;
    const out = await llmExtractEntitiesAndRelations(content);
    const nodesRef = adminDb.collection('medora_graph_nodes');
    const edgesRef = adminDb.collection('medora_graph_edges');

    // upsert nodes and evidence
    for (const ent of out.entities || []) {
      const id = ent.id;
      const nref = nodesRef.doc(id);
      await nref.set({
        name: id,
        label: ent.label || 'ENTITY',
        last_seen: new Date().toISOString()
      }, { merge: true });
      // evidence as subcollection doc
      await nref.collection('evidence').doc(chunk_id).set({ chunk_id, snippet: content.slice(0, 300), confidence: ent.confidence || 0.7 });
    }

    // upsert edges and evidence
    for (const rel of out.relations || []) {
      const edgeId = `${rel.from}__${rel.to}__${rel.type}`;
      const eref = edgesRef.doc(edgeId);
      await eref.set({
        from: rel.from,
        to: rel.to,
        type: rel.type,
        last_seen: new Date().toISOString()
      }, { merge: true });
      await eref.collection('evidence').doc(chunk_id).set({
        chunk_id,
        snippet: rel.evidence || content.slice(0, 300),
        confidence: rel.confidence || 0.6
      });
    }
    return { ok: true };
  } catch (err) {
    console.error('upsertGraphFromChunk error', err);
    return { ok: false, error: err.message || String(err) };
  }
}

// ------------- Hybrid retriever -------------
/**
 * hybridRetrieve(query, opts)
 * - vectorTopK: number of top vector matches to keep
 * - sampleSize: number of random documents to scan (sampling strategy)
 * - graphHops: BFS depth in graph
 * - alpha: blend weight (0..1) where 1 -> pure vector, 0 -> pure graph
 */
async function hybridRetrieve(query, opts = {}) {
  const {
    vectorTopK = 10,
    sampleSize = 200,
    graphHops = 1,
    alpha = 0.7
  } = opts;

  // 1) embed query
  const embResp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  const qEmb = embResp.data[0].embedding;

  // 2) sample subset of medora_chunks (smart sampling) - from Firebase if available
  const candidates = [];
  
  if (adminDb) {
    const snapshot = await adminDb.collection('medora_chunks').limit(sampleSize).get();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data || !data.embedding) return;
      let emb = data.embedding;
      // handle mismatch
      if (emb.length !== qEmb.length) {
        if (emb.length > qEmb.length) emb = emb.slice(0, qEmb.length);
        else emb = emb.concat(new Array(qEmb.length - emb.length).fill(0));
      }
      const sim = cosineSimilarity(qEmb, emb);
      const isPlumb = data.meta && data.meta.source === 'plumb';
      candidates.push({ 
        id: doc.id, 
        content: data.content, 
        doc_id: data.doc_id, 
        sim, 
        chunk_index: data.chunk_index,
        is_plumb: isPlumb || false
      });
    });
    console.log(`🔍 [HYBRID RAG DEBUG] Found ${candidates.length} candidates from Firebase`);
  }
  
  // 2b) Also search Plumb data from local JSON file
  try {
    console.log(`🔍 [HYBRID RAG DEBUG] Searching Plumb embeddings for hybrid retrieval...`);
    const plumbResults = await searchPlumbData(query, Math.min(vectorTopK, 10));
    console.log(`🔍 [HYBRID RAG DEBUG] Found ${plumbResults.length} Plumb candidates for hybrid retrieval`);
    
    // Add Plumb results to candidates with is_plumb flag
    plumbResults.forEach(plumb => {
      candidates.push({
        id: plumb.id || plumb.chunk_id,
        content: plumb.content,
        doc_id: plumb.doc_id || 'plumb_drug_handbook',
        sim: plumb.similarity,
        chunk_index: parseInt(plumb.chunk_id?.replace('plumb__', '') || '0'),
        is_plumb: true,
        chunk_id: plumb.chunk_id
      });
    });
    console.log(`🔍 [HYBRID RAG DEBUG] Total candidates after adding Plumb: ${candidates.length}`);
  } catch (plumbErr) {
    console.warn('⚠️ [HYBRID RAG DEBUG] Plumb search failed in hybrid retrieval:', plumbErr.message);
  }

  candidates.sort((a,b) => b.sim - a.sim);
  const topVectors = candidates.slice(0, vectorTopK);
  console.log(`🔍 [HYBRID RAG DEBUG] Top ${topVectors.length} vectors selected (Plumb count: ${topVectors.filter(v => v.is_plumb).length})`);

  // 3) Graph phase — extract query entities (LLM or heuristic)
  let qEntities = [];
  try {
    const eResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Extract main entities/clinical items from this query and return a JSON array: "${query}"` }],
      temperature: 0.0,
      max_tokens: 200
    });
    const raw = (eResp.choices[0].message.content || eResp.choices[0].text || '').replace(/^```/, '').replace(/```$/,'').trim();
    qEntities = JSON.parse(raw);
    if (!Array.isArray(qEntities)) qEntities = [];
  } catch (e) {
    // fallback: simple tokens
    qEntities = query.split(/\s+/).slice(0, 8);
  }

  // BFS in Firestore graph to collect chunk evidence
  const graphChunkScores = {}; // chunk_id -> score
  const visitedNodes = new Set();
  let frontier = [...qEntities];

  for (let depth = 0; depth < graphHops; depth++) {
    const nextFrontier = [];
    for (const node of frontier) {
      if (visitedNodes.has(node)) continue;
      visitedNodes.add(node);
      // get outgoing edges
      const edgesSnap = await adminDb.collection('medora_graph_edges').where('from', '==', node).get();
      edgesSnap.forEach(e => {
        const ed = e.data();
        // fetch evidence subcollection for this edge
        // (we'll synchronously fetch, could be optimized)
        // read evidence docs
        e.ref.collection('evidence').get().then(evSnap => {
          evSnap.forEach(ev => {
            const evd = ev.data();
            const cid = evd.chunk_id;
            const baseScore = 1.0 / (1 + depth);
            graphChunkScores[cid] = Math.max(graphChunkScores[cid] || 0, baseScore * (evd.confidence || 0.6));
          });
        }).catch(err => console.warn('edge evidence read err', err));
        if (ed && ed.to) nextFrontier.push(ed.to);
      });
    }
    frontier = nextFrontier;
    // small wait to allow evidence reads to resolve (Firestore concurrency)
    await sleep(60);
  }

  // normalize graph scores if any
  let maxg = 0;
  Object.values(graphChunkScores).forEach(v => { if (v > maxg) maxg = v; });
  if (maxg > 0) { Object.keys(graphChunkScores).forEach(k => graphChunkScores[k] /= maxg); }

  // merge vector and graph candidates
  const mergedMap = {};
  for (const v of topVectors) {
    mergedMap[v.id] = { 
      chunk_id: v.id || v.chunk_id, 
      content: v.content, 
      doc_id: v.doc_id, 
      vector_score: v.sim || 0, 
      graph_score: graphChunkScores[v.id] || 0,
      is_plumb: v.is_plumb || false
    };
  }
  
  if (adminDb) {
    for (const [cid, gs] of Object.entries(graphChunkScores)) {
      if (!mergedMap[cid]) {
        // fetch chunk content
        const docSnap = await adminDb.collection('medora_chunks').doc(cid).get();
        if (docSnap.exists) {
          const d = docSnap.data();
          mergedMap[cid] = { chunk_id: cid, content: d.content, doc_id: d.doc_id, vector_score: 0, graph_score: gs, is_plumb: (d.meta && d.meta.source === 'plumb') || false };
        }
      }
    }
  }

  const merged = Object.values(mergedMap).map(item => {
    item.final_score = alpha * (item.vector_score || 0) + (1 - alpha) * (item.graph_score || 0);
    return item;
  }).sort((a,b) => b.final_score - a.final_score);

  // DEBUG: Log Plumb usage in hybrid retrieval
  const plumbCount = merged.filter(m => m.is_plumb).length;
  console.log(`🔍 [HYBRID RAG DEBUG] Merged ${merged.length} candidates (${plumbCount} from Plumb embeddings)`);
  if (plumbCount > 0) {
    const topPlumb = merged.filter(m => m.is_plumb).slice(0, 3);
    console.log(`🔍 [HYBRID RAG DEBUG] Top Plumb results in hybrid retrieval:`);
    topPlumb.forEach((p, i) => {
      console.log(`   ${i+1}. Score: ${p.final_score.toFixed(4)} | ${p.doc_id} | "${p.content.substring(0, 60)}..."`);
    });
  }

  return { query, qEmb, qEntities, topVectors, graphChunkScores: graphChunkScores, merged };
}

// ------------- Reranker (LLM) and composition -------------
async function llmRerank(query, candidates) {
  try {
    const blocks = candidates.map((c, i) => `${i+1}. [${c.chunk_id}] (${c.doc_id})\n${c.content.slice(0, 400)}`).join('\n\n');
    const prompt = `Rate how well each passage answers the query "${query}". Return a JSON array [{"chunk_id":"...","score":0.0}] with score 0..1.\n\nPassages:\n${blocks}\n\nReturn only JSON.`;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      max_tokens: 800
    });
    let raw = (resp.choices[0].message.content || resp.choices[0].text || '').trim();
    
    // Remove markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // Try to extract JSON array if there's extra text
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      raw = jsonMatch[0];
    }
    
    let json = [];
    try {
      json = JSON.parse(raw);
      if (!Array.isArray(json)) {
        console.warn('rerank: response is not an array, using fallback');
        return candidates.map(c => ({ ...c, rerank_score: c.final_score || 0 }));
      }
    } catch (e) {
      console.warn('rerank parse failed:', e.message);
      console.warn('Raw response:', raw.substring(0, 200));
      return candidates.map(c => ({ ...c, rerank_score: c.final_score || 0 }));
    }
    const scoreMap = json.reduce((acc, cur) => { acc[cur.chunk_id] = cur.score; return acc; }, {});
    return candidates.map(c => ({ ...c, rerank_score: scoreMap[c.chunk_id] || 0 }));
  } catch (err) {
    console.error('llmRerank error', err);
    return candidates.map(c => ({ ...c, rerank_score: c.final_score || 0 }));
  }
}

async function composeSOAPWithEvidence(query, topCandidates, previousNotes = [], plumbContext = []) {
  try {
    // Handle empty candidates gracefully
    const topK = topCandidates && topCandidates.length > 0 ? topCandidates.slice(0, 8) : [];
    const context = topK.length > 0 
      ? topK.map((c, i) => `${i+1}. [${c.chunk_id || c.id || 'unknown'}] (${c.doc_id || 'unknown'})\n${c.content || ''}`).join('\n\n')
      : 'No relevant evidence passages found. Generate SOAP note based on the transcript alone.';
    
    // Add Plumb context if available
    let plumbSection = '';
    if (plumbContext && plumbContext.length > 0) {
      plumbSection = `\n\nPLUMB DRUG HANDBOOK REFERENCE (for Plan section):
${plumbContext.map((p, i) => `${i+1}. [${p.chunk_id || p.id}]\n${p.content}`).join('\n\n')}`;
    }
    
    const system = `You are a veterinary medical scribe. Generate a JSON SOAP note from the consultation transcript. ${topK.length > 0 ? 'Use the evidence passages provided when available.' : 'Generate the SOAP note based on the transcript content.'} For each claim include the supporting chunk_id(s) if evidence is provided. If no evidence is available, generate based on the transcript content.

IMPORTANT: For the Plan section, prioritize using information from the PLUMB DRUG HANDBOOK REFERENCE if provided. Include specific drug names, dosages, and administration instructions from the Plumb reference when available.`;
    const userPrompt = `Consultation Transcript: ${query}
${previousNotes.length > 0 ? `Previous notes: ${JSON.stringify(previousNotes)}\n` : ''}${topK.length > 0 ? `Evidence passages:\n${context}\n` : ''}${plumbSection}

Produce a JSON SOAP note with the following structure:
{
 "subjective": {"text":"...","evidence":[]},
 "objective": {"text":"...","evidence":[]},
 "assessment": {"text":"...","evidence":[]},
 "plan": {"text":"...","evidence":[]}
}

Extract information from the consultation transcript. Use concise medical language. Return ONLY valid JSON, no additional text.`;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: userPrompt }],
      temperature: 0.0,
      max_tokens: 1500
    });
    let out = (resp.choices[0].message.content || resp.choices[0].text || '').replace(/^```/, '').replace(/```$/,'').trim();
    try {
      const parsed = JSON.parse(out);
      return { parsed, raw: out };
    } catch (e) {
      console.warn('compose parse failed', e);
      return { parsed: null, raw: out, error: 'parse_failed' };
    }
  } catch (err) {
    console.error('composeSOAPWithEvidence error', err);
    return { parsed: null, raw: '', error: String(err) };
  }
}

// ------------- generate-soap endpoint (main RAG flow) -------------
app.post('/api/generate-soap', async (req, res) => {
  try {
    let { transcript, previousNotes, usePlumb = true } = req.body;
    if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

    // Handle transcript as array (from frontend) or string
    if (Array.isArray(transcript)) {
      // If it's an array of chunks with text property
      transcript = transcript.map(chunk => typeof chunk === 'string' ? chunk : (chunk.text || chunk.content || '')).join(' ');
    } else if (typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript must be a string or array' });
    }

    if (!transcript.trim()) {
      return res.status(400).json({ error: 'Transcript cannot be empty' });
    }

    console.log('📝 Processing transcript, length:', transcript.length);

    // Check if adminDb is available
    if (!adminDb) {
      console.warn('⚠️ adminDb not initialized, skipping hybrid retrieval');
      // Continue without RAG, just use LLM
    }

    // Hybrid retrieval from general knowledge base (if adminDb is available)
    let hr = null;
    let rerankedCandidates = [];
    if (adminDb) {
      try {
        hr = await hybridRetrieve(transcript, { vectorTopK: 20, sampleSize: 400, graphHops: 2, alpha: 0.75 });
        
        // Rerank top merged candidates with LLM
        const topMerged = hr.merged.slice(0, 20);
        rerankedCandidates = await llmRerank(transcript, topMerged);
        rerankedCandidates.sort((a,b) => b.rerank_score - a.rerank_score);
      } catch (retrievalErr) {
        console.warn('⚠️ Hybrid retrieval failed, continuing without RAG context:', retrievalErr.message);
        hr = null;
      }
    }

    // NOTE: We don't search Plumb data here - Plan should only be generated via /api/generate-plan endpoint
    // This endpoint only generates SOA (Subjective, Objective, Assessment) sections

    // Compose SOAP grounded in evidence (SOA only, no Plan)
    const topCandidates = rerankedCandidates.length > 0 ? rerankedCandidates.slice(0, 12) : [];
    const composeRes = await composeSOAPWithEvidence(transcript, topCandidates, previousNotes || [], []);

    // Extract SOAP sections from the parsed response
    const soapData = composeRes.parsed || {};
    
    // Build response matching frontend expectations
    // Frontend expects: { soapNote: { subjective, objective, assessment, plan } } or { subjective, objective, assessment, plan }
    // NOTE: Plan should be empty when generating SOA - it should only be generated via /api/generate-plan
    const response = {
      soapNote: {
        subjective: soapData.subjective?.text || soapData.subjective || '',
        objective: soapData.objective?.text || soapData.objective || '',
        assessment: soapData.assessment?.text || soapData.assessment || '',
        plan: '' // Leave plan empty - it should only be generated via Generate Plan button
      },
      // Also include raw response for debugging
      soap: composeRes.parsed || null,
      raw_composition: composeRes.raw,
      top_passages: rerankedCandidates.slice(0, 8).map(p => ({ chunk_id: p.chunk_id, doc_id: p.doc_id, snippet: p.content.slice(0, 500), rerank_score: p.rerank_score })),
      retrieval_debug: hr ? {
        merged_top: hr.merged.slice(0, 10),
        graph_chunk_scores: hr.graphChunkScores,
        query_entities: hr.qEntities
      } : { message: 'RAG retrieval skipped (adminDb not available)' }
    };

    res.json(response);

  } catch (error) {
    console.error('generate-soap error', error);
    res.status(500).json({ error: 'generate-soap failed', message: error.message || String(error) });
  }
});

// ------------- generate-plan endpoint (Plumb-focused) -------------
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { assessment, diagnosis, symptoms, subjective, objective, k = 5 } = req.body;
    
    // Build query from SOA sections (Subjective, Objective, Assessment)
    // Prioritize: Assessment > Diagnosis > Symptoms, and include Subjective/Objective if available
    let queryParts = [];
    if (subjective) queryParts.push(`Subjective: ${subjective}`);
    if (objective) queryParts.push(`Objective: ${objective}`);
    if (assessment) queryParts.push(`Assessment: ${assessment}`);
    if (diagnosis && !assessment) queryParts.push(`Diagnosis: ${diagnosis}`);
    if (symptoms && !subjective) queryParts.push(`Symptoms: ${symptoms}`);
    
    if (queryParts.length === 0) {
      return res.status(400).json({ error: 'At least one of: assessment, diagnosis, symptoms, subjective, or objective is required' });
    }

    // Build comprehensive query from SOA
    const soaQuery = queryParts.join(' ');
    const enhancedQuery = `${soaQuery} treatment medications dosages administration veterinary`;

    console.log('🔍 Generating treatment plan using Plumb data...');
    console.log('📝 [PLUMB RAG DEBUG] SOA Query constructed from:');
    if (subjective) console.log(`   - Subjective: ${subjective.substring(0, 100)}...`);
    if (objective) console.log(`   - Objective: ${objective.substring(0, 100)}...`);
    if (assessment) console.log(`   - Assessment: ${assessment.substring(0, 100)}...`);
    console.log('📝 [PLUMB RAG DEBUG] Enhanced Query:', enhancedQuery);

    // Search Plumb data from local file using SOA query
    console.log('🔍 [PLUMB RAG DEBUG] Searching Plumb embeddings using SOA query...');
    const plumbResults = await searchPlumbData(enhancedQuery, k);
    console.log(`📖 Found ${plumbResults.length} Plumb references`);

    if (plumbResults.length === 0) {
      console.warn('⚠️ No Plumb references found, generating plan without Plumb data');
      // Fallback: generate plan without Plumb references
      const systemPrompt = `You are a veterinary expert. Create a brief, structured treatment plan based on the assessment provided.`;
      const userPrompt = `Based on veterinary drug information for "${soaQuery}":

SEARCH RESULTS:
(No Plumb references available - using general veterinary knowledge)

Create a brief treatment plan with the following sections:

*Diagnosis:*
- Include the diagnosis if applicable based on the assessment and symptoms
- If diagnosis is not clear or not applicable, write "Not applicable"

*Plan:*
- 3-4 medications with dosages (mg/kg) and frequency

*Follow-up:*
- Recheck timeframe and monitoring

Keep it very brief.`;

      const llmResp = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 800
      });

      const planText = llmResp.choices[0].message.content || '';

      return res.json({
        plan: planText,
        plumb_references: [],
        plumb_available: false,
        message: 'Plan generated without Plumb data (no references found). Process PDF via /api/process-plumb-pdf to generate embeddings file.'
      });
    }

    // Use LLM to synthesize a treatment plan from Plumb references
    const plumbContext = plumbResults.map((p, i) => `${i+1}. ${p.content}`).join('\n\n');
    
    // DEBUG: Log that Plumb references are being used
    console.log(`🔍 [PLUMB RAG DEBUG] Using ${plumbResults.length} Plumb references to generate plan`);
    console.log(`🔍 [PLUMB RAG DEBUG] Plumb context length: ${plumbContext.length} characters`);
    console.log(`🔍 [PLUMB RAG DEBUG] First Plumb reference preview: "${plumbResults[0]?.content?.substring(0, 150)}..."`);
    
    const systemPrompt = `You are a veterinary expert. Create a brief, structured treatment plan based on the Plumb's Veterinary Drug Handbook references provided.`;
    const userPrompt = `Based on veterinary drug information for "${soaQuery}":

SEARCH RESULTS:

${plumbContext}

Create a brief treatment plan with the following sections:
+
*Diagnosis:*
- Include the diagnosis if applicable based on the assessment and symptoms
- If diagnosis is not clear or not applicable, write "Not applicable"

*Plan:*
- 3-4 medications with dosages (mg/kg) and frequency

*Follow-up:*
- Recheck timeframe and monitoring

Keep it very brief.`;
    
    console.log(`🔍 [PLUMB RAG DEBUG] Sending ${plumbResults.length} Plumb references to LLM for plan generation`);

    const llmResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 800
    });

    const planText = llmResp.choices[0].message.content || '';

    res.json({
      plan: planText,
      plumb_references: plumbResults.map(p => ({
        chunk_id: p.chunk_id || p.id,
        snippet: p.content.slice(0, 500),
        similarity: p.similarity
      })),
      plumb_available: true
    });

  } catch (error) {
    console.error('generate-plan error', error);
    res.status(500).json({ error: 'generate-plan failed', message: error.message || String(error) });
  }
});

// ------------- vector-search endpoint (Vertex-style sampling approach) -------------
app.post('/api/vector-search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });

    const start = Date.now();
    // embed query
    const embResp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: query });
    const qEmb = embResp.data[0].embedding;

    // sample docs
    const sampleSize = Math.min(200, limit * 10);
    const snapshot = await adminDb.collection('medora_chunks').limit(sampleSize).get();

    const all = [];
    snapshot.forEach(doc => {
      const d = doc.data();
      if (!d || !d.embedding) return;
      let emb = d.embedding;
      if (emb.length !== qEmb.length) {
        if (emb.length > qEmb.length) emb = emb.slice(0, qEmb.length);
        else emb = emb.concat(new Array(qEmb.length - emb.length).fill(0));
      }
      const sim = cosineSimilarity(qEmb, emb);
      all.push({ id: doc.id, content: d.content, doc_id: d.doc_id, similarity: sim, distance: 1 - sim });
    });
    const results = all.sort((a,b) => b.similarity - a.similarity).slice(0, limit);

    let llmResponse = null;
    if (results.length > 0) {
      try {
        llmResponse = await processResultsWithLLM(query, results);
      } catch (e) {
        console.warn('processResultsWithLLM failed', e);
      }
    }

    res.json({
      results,
      llmResponse,
      debug: {
        sampleSize: snapshot.size,
        queryEmbeddingDimensions: qEmb.length,
        timeMs: Date.now() - start
      }
    });

  } catch (err) {
    console.error('vector-search error', err);
    res.status(500).json({ error: 'vector-search failed', message: err.message || String(err) });
  }
});

// helper: process results into a small LLM-generated plan (used by vector search endpoint)
async function processResultsWithLLM(query, results) {
  try {
    const context = results.map((r, i) => `${i+1}. ${r.doc_id} (Sim: ${r.similarity.toFixed(3)})\n${r.content}`).join('\n\n');
    const prompt = `Based on veterinary information for "${query}":\n\nSEARCH RESULTS:\n${context}\n\nCreate a brief treatment plan (3-4 meds with dosages, follow-up). Keep it brief.`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a veterinary expert providing concise treatment plans.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 240
    });
    return completion.choices[0].message.content;
  } catch (err) {
    console.error('processResultsWithLLM error', err);
    return null;
  }
}

// ------------- parseSOAPFromText fallback (if LLM doesn't return JSON) -------------
function parseSOAPFromText(text) {
  const sections = { subjective: '', objective: '', assessment: '', plan: '' };
  const lines = (text || '').split('\n');
  let current = null;
  for (const line of lines) {
    const l = line.trim().toLowerCase();
    if (l.startsWith('subjective') || l.startsWith('s —') || l.includes('chief complaint')) { current = 'subjective'; continue; }
    if (l.startsWith('objective') || l.startsWith('o —') || l.includes('physical exam')) { current = 'objective'; continue; }
    if (l.startsWith('assessment') || l.startsWith('a —') || l.includes('impression')) { current = 'assessment'; continue; }
    if (l.startsWith('plan') || l.startsWith('p —') || l.includes('treatment')) { current = 'plan'; continue; }
    if (current && line.trim()) sections[current] += line.trim() + ' ';
  }
  for (const k of Object.keys(sections)) sections[k] = sections[k].trim();
  return sections;
}

// ----------------------- Grounding pipeline helpers & endpoint -----------------------
// Add after existing helpers (e.g., chunkText, processLocalPdfDirectory, parseSOAPFromText)

//
// Prompt templates for grounding
//
function evidenceExtractionPrompt(transcript) {
  return `
You are a precise veterinary evidence extractor. Read the transcript below and extract every clinician- or owner-reported
clinical fact that could be relevant to a SOAP note. 

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code fences, no explanatory text.

Output a JSON object with an "evidence" array. Each evidence item must include:
- "type": one of ["symptom","finding","history","exposure","medication","other"]
- "normalized": a short normalized key (e.g., "vomiting", "dehydration", "plant_ingestion")
- "quote": the exact short quoted text (1-2 lines) from the transcript supporting this fact
- "line_index": an integer sentence index (0-based) if available (optional)

Only include facts actually present in the transcript. Do not infer, do not add background info.

Transcript:
"""${transcript}"""

Respond with ONLY the JSON object, starting with { and ending with }.
 `.trim();
}

function soapFromEvidencePrompt(evidenceJson) {
  return `
You are a veterinary medical scribe. Using ONLY the evidence array provided below, create a concise SOAP note in JSON.

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code fences, no explanatory text.

Create a JSON object with keys: "subjective", "objective", "assessment", "plan".
Rules:
- Use only information present in the evidence list.
- Do not invent symptoms, exam findings, or treatments.
- Assessment should include a short ranked differential if the evidence allows it.
- Plan should include diagnostics, medications (only when supported by evidence and Plumb references), and follow-up.

Evidence:
${JSON.stringify(evidenceJson, null, 2)}

Respond with ONLY the JSON object, starting with { and ending with }.
 `.trim();
}

function verifierPrompt(transcript, evidenceJson, soapJson) {
  return `
You are a verifier. We have:
1) A transcript
2) A structured evidence list (JSON)
3) A drafted SOAP note (JSON)

IMPORTANT: You must respond with ONLY valid JSON, no markdown, no code fences, no explanatory text.

For each claim in the SOAP (subjective, objective, assessment, plan), match it to at least one evidence item from the evidence list.
Return a JSON object with this structure:
{
  "valid": { "subjective": [...], "objective": [...], "assessment": [...], "plan": [...] },
  "invalid": { "subjective": [...], "objective": [...], "assessment": [...], "plan": [...] }
}
Each item in arrays should include the claim text and either the matched evidence index or a short reason why it is invalid.

Transcript:
"""${transcript}"""
Evidence:
${JSON.stringify(evidenceJson, null, 2)}
SOAP:
${JSON.stringify(soapJson, null, 2)}

Respond with ONLY the JSON object, starting with { and ending with }.
 `.trim();
}

//
// Simple deterministic rule validator (symptom -> block med rules etc.)
//
function ruleValidate(evidence) {
  const normalized = (evidence || []).map(e => e.normalized && String(e.normalized).toLowerCase());
  const flags = { blockedMeds: [], notes: [] };

  // Example: block diarrhea-only meds if no diarrhea evidence
  if (!normalized.includes('diarrhea')) {
    flags.blockedMeds.push('kaolin_pectin');
    flags.notes.push('No diarrhea evidence — blocking diarrhea-only meds.');
  }

  // Example: prefer antiemetic when vomiting present
  if (normalized.includes('vomiting')) {
    flags.notes.push('Vomiting evidence found — recommend antiemetic + hydration.');
  }

  return flags;
}

//
// Medication checker that uses local Plumb embeddings search + simple species check
// (re-uses your searchPlumbData function to find plumb references)
//
async function medChecker(planText, meta = {}) {
  // naive med extraction: look for some common med names or plumb matches
  const warnings = [];
  const meds = [];

  // quick check for explicit med names (very small list — expand with your Plumb DB)
  const knownMeds = ['maropitant','famotidine','amoxicillin','metronidazole','kaolin','pectin','prochlorperazine'];
  const low = (planText || '').toLowerCase();

  for (const m of knownMeds) {
    if (low.includes(m)) meds.push(m);
  }

  // For each med, check Plumb context
  for (const med of meds) {
    // run a small Plumb search for the med name to validate species compatibility
    try {
      const refs = await searchPlumbData(med, 3);
      if (refs.length === 0) {
        warnings.push({ med, reason: 'No Plumb reference found for this medication' });
      } else {
        // naive species check: look for species string in ref content
        if (meta.species && !refs.some(r => (r.content || '').toLowerCase().includes(meta.species.toLowerCase()))) {
          warnings.push({ med, reason: `Plumb references do not explicitly mention species ${meta.species}` });
        }
      }
    } catch (err) {
      warnings.push({ med, reason: `Plumb search error: ${err.message}` });
    }
  }

  return { meds, warnings };
}

//
// Small wrapper for calling your existing openai chat completion (keeps temp low)
//
async function callLLMChat(prompt, opts = {}) {
  const model = opts.model || 'gpt-4o-mini';
  const temperature = typeof opts.temperature === 'number' ? opts.temperature : 0.0;
  const max_tokens = opts.max_tokens || 800;
  const messages = [
    { role: 'system', content: 'You are a helpful assistant that responds with valid JSON only. Do not use markdown code fences, do not add explanatory text. Return only the JSON object.' },
    { role: 'user', content: prompt }
  ];
  const resp = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens
  });
  return (resp.choices && resp.choices[0] && (resp.choices[0].message?.content || resp.choices[0].text)) || '';
}

//
// Endpoint: grounded-note
// Orchestrates: evidence extraction -> SOAP-from-evidence -> verifier -> rule check -> med check
//
app.post('/api/grounded-note', async (req, res) => {
  const { transcript, meta = {} } = req.body || {};
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({ error: 'transcript (string) required' });
  }

  const requestId = `ground__${Date.now()}`;
  const audit = { id: requestId, createdAt: new Date().toISOString(), transcript: transcript.slice(0,1000), meta, steps: {} };

  try {
    // 1) Evidence extraction
    const evPrompt = evidenceExtractionPrompt(transcript);
    const evRaw = await callLLMChat(evPrompt, { max_tokens: 800 });
    let evidenceJson = { evidence: [] };
    try {
      // Try to parse directly first
      evidenceJson = JSON.parse(evRaw);
    } catch (e) {
      // Strip markdown code fences if present
      let cleaned = evRaw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
      try {
        evidenceJson = JSON.parse(cleaned);
      } catch (e2) {
        // Try to extract JSON object from the response
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            evidenceJson = JSON.parse(jsonMatch[0]);
          } catch (e3) {
            console.error('Failed to parse evidence JSON:', evRaw.substring(0, 200));
            throw new Error('Evidence extractor returned non-JSON response: ' + e3.message);
          }
        } else {
          console.error('No JSON found in evidence response:', evRaw.substring(0, 200));
          throw new Error('Evidence extractor returned non-JSON response: no JSON object found');
        }
      }
    }
    // normalize missing normalized keys
    evidenceJson.evidence = (evidenceJson.evidence || []).map((it, idx) => {
      if (!it.normalized) {
        const norm = (it.quote || it.type || `e${idx}`).toLowerCase().replace(/[^a-z0-9]+/g,'_').slice(0,40);
        it.normalized = norm;
      }
      return it;
    });
    audit.steps.evidenceCount = evidenceJson.evidence.length;

    // 2) Rule-based pre-check
    const ruleFlags = ruleValidate(evidenceJson.evidence);
    audit.steps.ruleFlags = ruleFlags;

    // 3) Generate SOAP from evidence ONLY
    const soapPrompt = soapFromEvidencePrompt(evidenceJson.evidence);
    const soapRaw = await callLLMChat(soapPrompt, { max_tokens: 1000 });
    let soapJson = {};
    try {
      soapJson = JSON.parse(soapRaw);
    } catch (e) {
      // Strip markdown code fences if present
      let cleaned = soapRaw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
      try {
        soapJson = JSON.parse(cleaned);
      } catch (e2) {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            soapJson = JSON.parse(m[0]);
          } catch (e3) {
            console.error('Failed to parse SOAP JSON:', soapRaw.substring(0, 200));
            throw new Error('SOAP generator returned non-JSON response: ' + e3.message);
          }
        } else {
          console.error('No JSON found in SOAP response:', soapRaw.substring(0, 200));
          throw new Error('SOAP generator returned non-JSON response: no JSON object found');
        }
      }
    }
    audit.steps.soapDraft = soapJson;

    // 4) Verifier: ensure each SOAP claim maps to evidence
    const verPrompt = verifierPrompt(transcript, evidenceJson, soapJson);
    const verRaw = await callLLMChat(verPrompt, { max_tokens: 800 });
    let verJson = {};
    try {
      verJson = JSON.parse(verRaw);
    } catch (e) {
      // Strip markdown code fences if present
      let cleaned = verRaw.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
      try {
        verJson = JSON.parse(cleaned);
      } catch (e2) {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            verJson = JSON.parse(m[0]);
          } catch (e3) {
            console.error('Failed to parse verifier JSON:', verRaw.substring(0, 200));
            throw new Error('Verifier returned non-JSON response: ' + e3.message);
          }
        } else {
          console.error('No JSON found in verifier response:', verRaw.substring(0, 200));
          throw new Error('Verifier returned non-JSON response: no JSON object found');
        }
      }
    }
    audit.steps.verifier = verJson;

    // If invalid claims exist, return review_required with cleaned soap and invalid list
    const invalidCount = Object.values(verJson.invalid || {}).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    if (invalidCount > 0) {
      // attach evidence references to the SOAP draft and return review_required
      audit.steps.invalid = verJson.invalid;
      return res.status(200).json({
        id: requestId,
        status: 'review_required',
        reason: 'One or more SOAP claims could not be grounded in transcript evidence.',
        verifier: verJson,
        soapDraft: soapJson,
        evidence: evidenceJson
      });
    }

    // 5) Medication check on plan text (if any)
    const planText = typeof soapJson.plan === 'string' ? soapJson.plan : JSON.stringify(soapJson.plan || {});
    const medCheck = await medChecker(planText, meta);
    audit.steps.medCheck = medCheck;

    if (medCheck.warnings && medCheck.warnings.length) {
      return res.status(200).json({
        id: requestId,
        status: 'med_review_required',
        reason: 'Medication warnings detected',
        medWarnings: medCheck.warnings,
        soap: soapJson,
        evidence: evidenceJson
      });
    }

    // 6) Final: return grounded SOAP + evidence + audit pointer
    audit.steps.final = { status: 'ok' };
    // optionally persist audit to disk (small)
    try {
      const AUDIT_DIR = path.resolve(__dirname, 'audit_grounding');
      if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR);
      fs.writeFileSync(path.join(AUDIT_DIR, `${requestId}.json`), JSON.stringify(audit, null, 2));
    } catch (e) {
      console.warn('Failed to write grounding audit:', e.message || e);
    }

    return res.json({
      id: requestId,
      status: 'ok',
      soap: soapJson,
      evidence: evidenceJson,
      medCheck
    });

  } catch (err) {
    console.error('grounded-note error', err);
    return res.status(500).json({ error: 'grounded-note failed', message: err.message || String(err) });
  }
});


// ------------- Error middleware -------------
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 25MB)' });
  }
  console.error('Unhandled error middleware:', err);
  res.status(500).json({ error: err.message || String(err) });
});

// ----- Add near your other helpers (after chunkText, ingestTranscriptToFirestore, etc.) -----

/**
 * Recursively list PDF file paths in a directory
 */
function listPdfFilesRecursively(dirPath) {
  const results = [];
  if (!fs.existsSync(dirPath)) return results;
  const items = fs.readdirSync(dirPath);
  for (const it of items) {
    const full = path.join(dirPath, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results.push(...listPdfFilesRecursively(full));
    } else if (stat.isFile() && path.extname(full).toLowerCase() === '.pdf') {
      results.push(full);
    }
  }
  return results;
}

/**
 * Process a directory of local PDFs (recursive), create chunks, generate embeddings, and
 * optionally write the result to a local JSON file and/or ingest into Firestore.
 *
 * - dirPath: local directory to scan (absolute or relative)
 * - outputJsonPath: where to write combined embeddings JSON (optional, set to your plumb path)
 * - opts:
 *    { batchSize = 50, chunkSize = CHUNK_SIZE, chunkOverlap = CHUNK_OVERLAP, ingestToFirestore = false, firestoreDocPrefix = 'localpdf' }
 *
 * Returns: { ok: true, filesProcessed, totalChunks, outputPath }
 */
async function processLocalPdfDirectory(dirPath, outputJsonPath = PLUMB_DATA_PATH, opts = {}) {
  const { batchSize = 50, chunkSize = CHUNK_SIZE, chunkOverlap = CHUNK_OVERLAP, ingestToFirestore = false, firestoreDocPrefix = 'localpdf' } = opts;

  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const pdfPaths = listPdfFilesRecursively(dirPath);
  console.log(`📁 Found ${pdfPaths.length} PDF files under ${dirPath}`);

  const allChunks = [];
  const allEmbeddings = [];
  const metadataList = []; // metadata per chunk or per-file if you prefer to group

  let fileCount = 0;

  for (const pdfPath of pdfPaths) {
    fileCount++;
    console.log(`\n📄 [${fileCount}/${pdfPaths.length}] Processing PDF: ${pdfPath}`);
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const pdfData = await pdf(dataBuffer);
      const text = pdfData.text || '';
      const pages = pdfData.numpages || null;
      if (!text || text.trim().length === 0) {
        console.warn(`⚠️ No text extracted from ${pdfPath} - skipping`);
        continue;
      }

      // chunk the text (character-based)
      const localChunks = chunkText(text, chunkSize, chunkOverlap);
      console.log(`  ➤ Extracted ${localChunks.length} chunks (pages: ${pages || '?'})`);

      // push file-level metadata for reference
      const fileMeta = {
        filename: path.basename(pdfPath),
        filepath: pdfPath,
        pages,
        source_dir: path.dirname(pdfPath),
        processed_at: new Date().toISOString()
      };

      // Generate embeddings in batches for this file
      for (let i = 0; i < localChunks.length; i += batchSize) {
        const slice = localChunks.slice(i, i + batchSize);
        // call OpenAI embeddings
        console.log(`    • embedding batch ${Math.floor(i/batchSize)+1} for ${slice.length} chunks...`);
        const embResp = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: slice
        });
        const embs = embResp.data.map(d => d.embedding);

        // append to combined arrays
        for (let j = 0; j < slice.length; j++) {
          const globalIndex = allChunks.length;
          const chunkId = `${firestoreDocPrefix}__${fileCount}__${globalIndex}`; // unique-ish id
          allChunks.push(slice[j]);
          allEmbeddings.push(embs[j]);
          metadataList.push({
            chunk_id: chunkId,
            filename: fileMeta.filename,
            filepath: fileMeta.filepath,
            pages: fileMeta.pages,
            chunk_index_in_file: i + j,
            source_dir: fileMeta.source_dir,
            source: 'local_pdf',
            processed_at: new Date().toISOString()
          });
        }

        // rate-limit friendly pause
        if (i + batchSize < localChunks.length) await sleep(120);
      }

      // optional short pause between files
      await sleep(80);

    } catch (err) {
      console.error(`Error processing PDF ${pdfPath}:`, err);
      // continue with other files
    }
  } // end for each file

  // Write combined JSON
  const outObj = {
    chunks: allChunks,
    embeddings: allEmbeddings,
    metadatas: metadataList,
    metadata: {
      source_dir: dirPath,
      files_processed: pdfPaths.length,
      total_chunks: allChunks.length,
      generated_at: new Date().toISOString()
    }
  };

  // Ensure output directory exists
  const outDir = path.dirname(outputJsonPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(outputJsonPath, JSON.stringify(outObj, null, 2), 'utf8');
  console.log(`✅ Saved combined embeddings JSON to: ${outputJsonPath} (${allChunks.length} chunks)`);

  // Optional Firestore ingestion
  if (ingestToFirestore) {
    if (!adminDb) {
      console.warn('⚠️ adminDb not available — skipping Firestore ingestion');
    } else {
      console.log(`📥 Ingesting ${allChunks.length} chunks into Firestore (collection: medora_chunks)...`);
      // ingest in batches
      const chunksRef = adminDb.collection('medora_chunks');
      const BATCH = 100; // firestore batch size safety
      for (let i = 0; i < allChunks.length; i += BATCH) {
        const batch = adminDb.batch();
        const sliceChunks = allChunks.slice(i, i + BATCH);
        const sliceEmbs = allEmbeddings.slice(i, i + BATCH);
        const sliceMeta = metadataList.slice(i, i + BATCH);
        for (let j = 0; j < sliceChunks.length; j++) {
          const globalIndex = i + j;
          const m = sliceMeta[j];
          const docRef = chunksRef.doc(m.chunk_id);
          batch.set(docRef, {
            doc_id: m.filename,
            chunk_id: m.chunk_id,
            chunk_index: m.chunk_index_in_file,
            content: sliceChunks[j],
            embedding: sliceEmbs[j],
            meta: { source: 'local_pdf', filepath: m.filepath, source_dir: m.source_dir },
            created_at: new Date().toISOString()
          }, { merge: true });
        }
        await batch.commit();
        console.log(`  ✓ Committed firestore batch ${Math.floor(i / BATCH) + 1}`);
        if (i + BATCH < allChunks.length) await sleep(120);
      }
      console.log(`✅ Ingested ${allChunks.length} chunks into Firestore`);
    }
  }

  return { ok: true, filesProcessed: pdfPaths.length, totalChunks: allChunks.length, outputPath: outputJsonPath };
}


// ----- Endpoint: process local PDFs and write a combined embeddings JSON -----
// Example usage (POST): { "dir": "./medical_pdfs", "out": "./data/local_medical_embeddings.json", "ingest": true }
app.post('/api/process-local-pdfs', async (req, res) => {
  try {
    const { dir = 'medical_pdfs', out = PLUMB_DATA_PATH, ingest = false, batchSize = 50 } = req.body || {};
    const dirPath = path.resolve(__dirname, dir);
    console.log('API /api/process-local-pdfs called for:', dirPath);
    const result = await processLocalPdfDirectory(dirPath, out, { batchSize: Number(batchSize), ingestToFirestore: Boolean(ingest) });
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('/api/process-local-pdfs error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// ------------- Start server -------------
app.listen(PORT, () => {
  console.log(`🚀 Medora Backend running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
});
