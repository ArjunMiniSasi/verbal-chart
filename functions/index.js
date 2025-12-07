// Firebase Cloud Functions for Medora AI Backend
// Essential Functions Only: Transcribe, Generate SOAP, Generate Plan

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const OpenAI = require('openai');
const busboy = require('busboy');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
// CORS helper function for Cloud Functions
function setCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
}

// Initialize Firebase Admin (uses default service account in Cloud Functions)
admin.initializeApp();
const adminDb = admin.firestore();
const storage = new Storage();

// Initialize OpenAI - Use Firebase Functions Config (already set)
const openaiApiKey = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set!');
  console.error('   Set it using: firebase functions:config:set openai.api_key="your-key"');
} else {
  console.log('✅ OpenAI API Key loaded from Firebase Functions Config');
}

const openai = new OpenAI({
  apiKey: openaiApiKey
});

// Constants
const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE || '700', 10);
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP || '120', 10);
const GCS_BUCKET_NAME = functions.config().storage?.bucket_name || process.env.GCS_BUCKET_NAME || 'medora-uploads';

// Helper Functions
function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB)) return 0;
  if (vecA.length !== vecB.length) {
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

// File upload helper for Cloud Functions (using busboy)
// Simplified and more reliable approach for Cloud Functions
function parseMultipartFormData(req) {
  return new Promise((resolve, reject) => {
    const fileData = { file: null, fields: {} };
    let tempPath = null;
    let writeStream = null;
    let fileInfo = null;
    let fileSize = 0;
    let hasFile = false;

    try {
      // Create busboy instance
      const bb = busboy({
        headers: req.headers,
        limits: {
          fileSize: 50 * 1024 * 1024 // 50MB
        }
      });

      bb.on('file', (name, file, info) => {
        console.log('📁 File field received:', name);
        hasFile = true;
        const { filename, encoding, mimeType } = info;
        console.log('📁 File info:', { filename, encoding, mimeType });

        fileInfo = { filename: filename || 'audio', encoding, mimeType };
        tempPath = `/tmp/${uuidv4()}${path.extname(filename || 'audio')}`;
        console.log('📁 Writing to:', tempPath);

        writeStream = fs.createWriteStream(tempPath);
        fileSize = 0;

        file.on('data', (chunk) => {
          fileSize += chunk.length;
          writeStream.write(chunk);
        });

        file.on('end', () => {
          console.log('📁 File stream ended, size:', fileSize, 'bytes');
          writeStream.end();
        });

        file.on('error', (err) => {
          console.error('❌ File read error:', err);
          if (writeStream) writeStream.destroy();
          reject(err);
        });

        writeStream.on('finish', () => {
          console.log('✅ File written successfully, size:', fileSize, 'bytes');
          fileData.file = {
            path: tempPath,
            filename: fileInfo.filename,
            encoding: fileInfo.encoding,
            mimetype: fileInfo.mimeType,
            size: fileSize
          };
        });

        writeStream.on('error', (err) => {
          console.error('❌ File write error:', err);
          reject(err);
        });
      });

      bb.on('field', (name, value) => {
        console.log('📝 Field:', name, '=', value);
        fileData.fields[name] = value;
      });

      bb.on('finish', () => {
        console.log('✅ Busboy parsing complete');
        if (!hasFile) {
          return reject(new Error('No file found in form data'));
        }

        // Wait for write stream to finish
        if (writeStream) {
          writeStream.on('close', () => {
            if (fileData.file && fs.existsSync(fileData.file.path)) {
              const stats = fs.statSync(fileData.file.path);
              console.log('✅ File verified on disk, size:', stats.size, 'bytes');
              resolve(fileData);
            } else {
              reject(new Error('File not found after write'));
            }
          });
        } else {
          // If writeStream finished before this, check immediately
          setTimeout(() => {
            if (fileData.file && fs.existsSync(fileData.file.path)) {
              resolve(fileData);
            } else {
              reject(new Error('File not available'));
            }
          }, 100);
        }
      });

      bb.on('error', (err) => {
        console.error('❌ Busboy error:', err.message);
        if (writeStream) writeStream.destroy();
        reject(err);
      });

      // In Cloud Functions, collect the request body
      // Check if rawBody is available first (some Cloud Functions versions)
      if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
        console.log('📦 Using req.rawBody, size:', req.rawBody.length, 'bytes');
        bb.end(req.rawBody);
      } else {
        // Collect body from stream
        let bodyChunks = [];
        let bodySize = 0;

        req.on('data', (chunk) => {
          bodyChunks.push(chunk);
          bodySize += chunk.length;
          console.log('📦 Received chunk, total:', bodySize, 'bytes');
        });

        req.on('end', () => {
          const body = Buffer.concat(bodyChunks);
          console.log('📦 Collected complete body, size:', body.length, 'bytes');
          if (body.length === 0) {
            return reject(new Error('Request body is empty'));
          }
          bb.end(body);
        });

        req.on('error', (err) => {
          console.error('❌ Request stream error:', err);
          if (writeStream) writeStream.destroy();
          reject(err);
        });
      }

    } catch (err) {
      console.error('❌ Parse error:', err);
      if (writeStream) writeStream.destroy();
      reject(err);
    }
  });
}

// Upload file to Cloud Storage
async function uploadToGCS(buffer, filename, mimetype) {
  const bucket = storage.bucket(GCS_BUCKET_NAME);
  const file = bucket.file(`uploads/${Date.now()}-${filename}`);
  await file.save(buffer, {
    metadata: { contentType: mimetype },
    resumable: false
  });
  return file;
}

// Download file from Cloud Storage to /tmp
async function downloadFromGCS(filePath) {
  const bucket = storage.bucket(GCS_BUCKET_NAME);
  const file = bucket.file(filePath);
  const tempPath = `/tmp/${uuidv4()}${path.extname(filePath)}`;
  await file.download({ destination: tempPath });
  return tempPath;
}

// Delete file from Cloud Storage
async function deleteFromGCS(filePath) {
  try {
    const bucket = storage.bucket(GCS_BUCKET_NAME);
    await bucket.file(filePath).delete();
  } catch (err) {
    console.warn('Error deleting file from GCS:', err);
  }
}

// Search Plumb data from Firebase Firestore plumb_embeddings collection
async function searchPlumbFromFirestore(query, k = 5, sampleSize = 2000) {
  if (!adminDb) {
    console.warn('⚠️ adminDb not initialized, cannot search Firebase');
    return [];
  }

  try {
    console.log(`🔍 [FIREBASE PLUMB] Searching Plumb embeddings from Firestore collection...`);
    console.log(`🔍 [FIREBASE PLUMB] Query: "${query.substring(0, 100)}..."`);

    // Generate query embedding
    const embResp = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    });
    const qEmb = embResp.data[0].embedding;
    console.log(`🔍 [FIREBASE PLUMB] Query embedding generated: ${qEmb.length} dimensions`);

    // Sample documents from plumb_embeddings collection
    const plumbRef = adminDb.collection('plumb_embeddings');
    const snapshot = await plumbRef.limit(sampleSize).get();

    if (snapshot.empty) {
      console.warn('⚠️ [FIREBASE PLUMB] No documents found in plumb_embeddings collection.');
      return [];
    }

    console.log(`🔍 [FIREBASE PLUMB] Sampling ${snapshot.size} documents from Firestore...`);

    const candidates = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data || !data.embedding || !data.content) return;

      let emb = data.embedding;
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
        similarity: sim,
        chunk_index: data.chunk_index || 0
      });
    });

    console.log(`🔍 [FIREBASE PLUMB] Calculated similarity for ${candidates.length} Plumb chunks`);

    // Sort by similarity and return top-k
    candidates.sort((a, b) => b.similarity - a.similarity);
    const topK = candidates.slice(0, k);

    console.log(`📖 [FIREBASE PLUMB] Top ${topK.length} Plumb references selected:`);
    topK.forEach((ref, idx) => {
      console.log(`   ${idx + 1}. Similarity: ${ref.similarity.toFixed(4)} | Chunk ID: ${ref.chunk_id} | Preview: "${ref.content.substring(0, 80)}..."`);
    });
    console.log(`📖 [FIREBASE PLUMB] Found ${topK.length} relevant Plumb references (top similarity: ${topK[0]?.similarity?.toFixed(3) || 0})`);

    return topK;
  } catch (err) {
    console.error('❌ [FIREBASE PLUMB] Error searching Plumb data from Firestore:', err);
    return [];
  }
}

// Search Plumb data (uses Firebase Firestore)
async function searchPlumbData(query, k = 5) {
  try {
    console.log('🔍 [PLUMB RAG] Attempting to search from Firebase Firestore...');
    const firebaseResults = await searchPlumbFromFirestore(query, k, 2000);

    if (firebaseResults && firebaseResults.length > 0) {
      console.log(`✅ [PLUMB RAG] Successfully retrieved ${firebaseResults.length} results from Firebase`);
      return firebaseResults;
    } else {
      console.warn('⚠️ [PLUMB RAG] No results from Firebase');
      return [];
    }
  } catch (firebaseErr) {
    console.warn('⚠️ [PLUMB RAG] Firebase search failed:', firebaseErr.message);
    return [];
  }
}

// Hybrid retrieval for SOAP generation
async function hybridRetrieve(query, opts = {}) {
  const {
    vectorTopK = 10,
    sampleSize = 200,
    graphHops = 1,
    alpha = 0.7
  } = opts;

  const embResp = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  const qEmb = embResp.data[0].embedding;

  const candidates = [];

  if (adminDb) {
    const snapshot = await adminDb.collection('medora_chunks').limit(sampleSize).get();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data || !data.embedding) return;
      let emb = data.embedding;
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
  }

  try {
    const plumbResults = await searchPlumbData(query, Math.min(vectorTopK, 10));
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
  } catch (plumbErr) {
    console.warn('⚠️ Plumb search failed in hybrid retrieval:', plumbErr.message);
  }

  candidates.sort((a, b) => b.sim - a.sim);
  const topVectors = candidates.slice(0, vectorTopK);

  let qEntities = [];
  try {
    const eResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: `Extract main entities/clinical items from this query and return a JSON array: "${query}"` }],
      temperature: 0.0,
      max_tokens: 200
    });
    const raw = (eResp.choices[0].message.content || '').replace(/^```/, '').replace(/```$/, '').trim();
    qEntities = JSON.parse(raw);
    if (!Array.isArray(qEntities)) qEntities = [];
  } catch (e) {
    qEntities = query.split(/\s+/).slice(0, 8);
  }

  const graphChunkScores = {};
  const visitedNodes = new Set();
  let frontier = [...qEntities];

  for (let depth = 0; depth < graphHops; depth++) {
    const nextFrontier = [];
    for (const node of frontier) {
      if (visitedNodes.has(node)) continue;
      visitedNodes.add(node);
      const edgesSnap = await adminDb.collection('medora_graph_edges').where('from', '==', node).get();
      edgesSnap.forEach(e => {
        const ed = e.data();
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
    await sleep(60);
  }

  let maxg = 0;
  Object.values(graphChunkScores).forEach(v => { if (v > maxg) maxg = v; });
  if (maxg > 0) { Object.keys(graphChunkScores).forEach(k => graphChunkScores[k] /= maxg); }

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
  }).sort((a, b) => b.final_score - a.final_score);

  return { query, qEmb, qEntities, topVectors, graphChunkScores: graphChunkScores, merged };
}

async function llmRerank(query, candidates) {
  try {
    const blocks = candidates.map((c, i) => `${i + 1}. [${c.chunk_id}] (${c.doc_id})\n${c.content.slice(0, 400)}`).join('\n\n');
    const prompt = `Rate how well each passage answers the query "${query}". Return a JSON array [{"chunk_id":"...","score":0.0}] with score 0..1.\n\nPassages:\n${blocks}\n\nReturn only JSON.`;
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.0,
      max_tokens: 800
    });
    let raw = (resp.choices[0].message.content || '').trim();
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      raw = jsonMatch[0];
    }
    let json = [];
    try {
      json = JSON.parse(raw);
      if (!Array.isArray(json)) {
        return candidates.map(c => ({ ...c, rerank_score: c.final_score || 0 }));
      }
    } catch (e) {
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
    const topK = topCandidates && topCandidates.length > 0 ? topCandidates.slice(0, 8) : [];
    const context = topK.length > 0
      ? topK.map((c, i) => `${i + 1}. [${c.chunk_id || c.id || 'unknown'}] (${c.doc_id || 'unknown'})\n${c.content || ''}`).join('\n\n')
      : 'No relevant evidence passages found. Generate SOAP note based on the transcript alone.';

    let plumbSection = '';
    if (plumbContext && plumbContext.length > 0) {
      plumbSection = `\n\nPLUMB DRUG HANDBOOK REFERENCE (for Plan section):
${plumbContext.map((p, i) => `${i + 1}. [${p.chunk_id || p.id}]\n${p.content}`).join('\n\n')}`;
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
    let out = (resp.choices[0].message.content || '').replace(/^```/, '').replace(/```$/, '').trim();
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

// ============= ESSENTIAL CLOUD FUNCTIONS (3 ONLY) =============

// 1. Transcribe Audio → Transcript
exports.transcribe = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    let tempFilePath = null;
    try {

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      console.log('📥 Received transcription request');
      console.log('📋 Method:', req.method);
      console.log('📋 Content-Type:', req.headers['content-type']);
      console.log('📋 Content-Length:', req.headers['content-length']);

      const formData = await parseMultipartFormData(req);
      console.log('📦 Form data parsed:', {
        hasFile: !!formData.file,
        filePath: formData.file?.path,
        fileName: formData.file?.filename,
        fileSize: formData.file?.size,
        mimeType: formData.file?.mimetype,
        fields: Object.keys(formData.fields)
      });

      if (!formData.file || !formData.file.path) {
        console.error('❌ No file in form data');
        return res.status(400).json({ error: 'No audio file provided' });
      }

      tempFilePath = formData.file.path;
      console.log('📁 Processing audio file:', formData.file.filename);
      console.log('📁 Temp file path:', tempFilePath);
      console.log('📁 File size:', formData.file.size, 'bytes');
      console.log('📁 MIME type:', formData.file.mimetype);

      // Verify file exists
      if (!fs.existsSync(tempFilePath)) {
        throw new Error('Temporary file not found after upload');
      }

      const fileStats = fs.statSync(tempFilePath);
      console.log('📊 File stats:', fileStats.size, 'bytes');

      // Transcribe using OpenAI Whisper
      console.log('🎤 Starting OpenAI Whisper transcription...');
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['word']
      });

      console.log('✅ Transcription successful');
      console.log('📝 Text length:', transcription.text?.length || 0);
      console.log('🌐 Language:', transcription.language);

      // Cleanup temp file
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
          console.log('🧹 Cleaned up temp file');
        }
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup error:', cleanupErr);
      }

      res.json({
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        words: transcription.words || []
      });
    } catch (error) {
      console.error('❌ Transcription error:', error);
      console.error('❌ Error stack:', error.stack);

      // Cleanup temp file on error
      try {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (cleanupErr) {
        console.warn('⚠️ Cleanup error:', cleanupErr);
      }

      res.status(500).json({
        error: 'Transcription failed',
        message: error.message || String(error),
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

// 2. Generate SOAP from Transcript
exports.generateSoap = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    try {
      let { transcript, previousNotes, usePlumb = true } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'Transcript is required' });
      }

      if (Array.isArray(transcript)) {
        transcript = transcript.map(chunk => typeof chunk === 'string' ? chunk : (chunk.text || chunk.content || '')).join(' ');
      } else if (typeof transcript !== 'string') {
        return res.status(400).json({ error: 'Transcript must be a string or array' });
      }

      if (!transcript.trim()) {
        return res.status(400).json({ error: 'Transcript cannot be empty' });
      }

      console.log('📝 Processing transcript, length:', transcript.length);

      let hr = null;
      let rerankedCandidates = [];
      if (adminDb) {
        try {
          hr = await hybridRetrieve(transcript, { vectorTopK: 20, sampleSize: 400, graphHops: 2, alpha: 0.75 });
          const topMerged = hr.merged.slice(0, 20);
          rerankedCandidates = await llmRerank(transcript, topMerged);
          rerankedCandidates.sort((a, b) => b.rerank_score - a.rerank_score);
        } catch (retrievalErr) {
          console.warn('⚠️ Hybrid retrieval failed, continuing without RAG context:', retrievalErr.message);
          hr = null;
        }
      }

      const topCandidates = rerankedCandidates.length > 0 ? rerankedCandidates.slice(0, 12) : [];
      const composeRes = await composeSOAPWithEvidence(transcript, topCandidates, previousNotes || [], []);

      const soapData = composeRes.parsed || {};
      const response = {
        soapNote: {
          subjective: soapData.subjective?.text || soapData.subjective || '',
          objective: soapData.objective?.text || soapData.objective || '',
          assessment: soapData.assessment?.text || soapData.assessment || '',
          plan: '' // Leave plan empty - it should only be generated via Generate Plan button
        },
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

// 3. Generate Plan from Firebase Firestore (plumb_embeddings collection)
exports.generatePlan = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    try {
      const { assessment, diagnosis, symptoms, subjective, objective, k = 5 } = req.body;

      let queryParts = [];
      if (subjective) queryParts.push(`Subjective: ${subjective}`);
      if (objective) queryParts.push(`Objective: ${objective}`);
      if (assessment) queryParts.push(`Assessment: ${assessment}`);
      if (diagnosis && !assessment) queryParts.push(`Diagnosis: ${diagnosis}`);
      if (symptoms && !subjective) queryParts.push(`Symptoms: ${symptoms}`);

      if (queryParts.length === 0) {
        return res.status(400).json({ error: 'At least one of: assessment, diagnosis, symptoms, subjective, or objective is required' });
      }

      const soaQuery = queryParts.join(' ');
      const enhancedQuery = `${soaQuery} treatment medications dosages administration veterinary`;

      console.log('🔍 Generating treatment plan using Plumb data from Firebase Firestore...');
      console.log('📝 [PLUMB RAG DEBUG] SOA Query constructed from:');
      if (subjective) console.log(`   - Subjective: ${subjective.substring(0, 100)}...`);
      if (objective) console.log(`   - Objective: ${objective.substring(0, 100)}...`);
      if (assessment) console.log(`   - Assessment: ${assessment.substring(0, 100)}...`);
      console.log('📝 [PLUMB RAG DEBUG] Enhanced Query:', enhancedQuery);

      // Search Plumb data from Firebase Firestore
      console.log('🔍 [PLUMB RAG DEBUG] Searching Plumb embeddings from Firebase Firestore...');
      const plumbResults = await searchPlumbData(enhancedQuery, k);
      console.log(`📖 Found ${plumbResults.length} Plumb references from Firebase`);

      if (plumbResults.length === 0) {
        console.warn('⚠️ No Plumb references found, generating plan without Plumb data');
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
          message: 'Plan generated without Plumb data (no references found in Firebase).'
        });
      }

      const plumbContext = plumbResults.map((p, i) => `${i + 1}. ${p.content}`).join('\n\n');

      console.log(`🔍 [PLUMB RAG DEBUG] Using ${plumbResults.length} Plumb references from Firebase to generate plan`);
      console.log(`🔍 [PLUMB RAG DEBUG] Plumb context length: ${plumbContext.length} characters`);
      console.log(`🔍 [PLUMB RAG DEBUG] First Plumb reference preview: "${plumbResults[0]?.content?.substring(0, 150)}..."`);

      const systemPrompt = `You are a veterinary expert. Create a brief, structured treatment plan based on the Plumb's Veterinary Drug Handbook references provided.`;
      const userPrompt = `Based on veterinary drug information for "${soaQuery}":

SEARCH RESULTS:

${plumbContext}

Create a brief treatment plan with the following sections:

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
