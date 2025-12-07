// Quick script to process Plumb PDF and generate embeddings
// Uses the same code as the server

require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
// Use pdf-parse with error handling
let pdf;
try {
  pdf = require('pdf-parse');
} catch (err) {
  console.error('Error loading pdf-parse:', err);
  console.error('Please install: npm install pdf-parse');
  process.exit(1);
}
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
});

const CHUNK_SIZE = 700;
const CHUNK_OVERLAP = 120;

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

async function processPlumbPDF() {
  try {
    const pdfPath = path.resolve(__dirname, '../medical_pdfs/Veternary_Drug_Handbook.pdf');
    const outputPath = path.resolve(__dirname, '../data/plumb_embeddings.json');

    console.log('🚀 Starting Plumb PDF processing...');
    console.log(`📁 PDF Path: ${pdfPath}`);
    console.log(`📁 Output Path: ${outputPath}`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    // Step 1: Extract text from PDF
    console.log('📄 Extracting text from PDF...');
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const text = pdfData.text;

    console.log(`📝 Extracted ${text.length} characters from PDF`);
    console.log(`📖 Number of pages: ${pdfData.numpages}`);

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from PDF');
    }

    // Step 2: Chunk text
    console.log('📦 Chunking text...');
    const chunks = chunkText(text);
    console.log(`✅ Created ${chunks.length} text chunks`);

    // Step 3: Generate embeddings
    console.log('🔮 Generating embeddings...');
    const embeddings = [];
    const BATCH_SIZE = 50;

    for (let b = 0; b < chunks.length; b += BATCH_SIZE) {
      const slice = chunks.slice(b, b + BATCH_SIZE);
      
      try {
        const embeddingResp = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: slice
        });
        
        const embs = embeddingResp.data.map(d => d.embedding);
        embeddings.push(...embs);
        
        console.log(`  ✓ Generated embeddings for batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (${embeddings.length}/${chunks.length})`);
        
        // Rate limiting
        if (b + BATCH_SIZE < chunks.length) {
          await sleep(100);
        }
      } catch (error) {
        console.error(`❌ Error in batch ${Math.floor(b / BATCH_SIZE) + 1}:`, error.message);
        // Add zero vectors as placeholders
        for (let i = 0; i < slice.length; i++) {
          embeddings.push(new Array(1536).fill(0));
        }
      }
    }

    console.log(`✅ Generated ${embeddings.length} embeddings`);

    // Step 4: Save to JSON file
    const outputData = {
      chunks: chunks,
      embeddings: embeddings,
      metadata: {
        source: 'plumb',
        type: 'drug_handbook',
        filename: 'Veternary_Drug_Handbook.pdf',
        pages: pdfData.numpages,
        processed_at: new Date().toISOString(),
        chunksCount: chunks.length
      }
    };

    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');
    
    const fileSizeMB = fs.statSync(outputPath).size / 1024 / 1024;
    console.log(`✅ Saved embeddings to: ${outputPath}`);
    console.log(`📊 File size: ${fileSizeMB.toFixed(2)} MB`);
    console.log(`📊 Final stats:`);
    console.log(`   - Chunks: ${chunks.length}`);
    console.log(`   - Embeddings: ${embeddings.length}`);
    console.log(`   - Pages: ${pdfData.numpages}`);
    
    console.log('\n🎉 Plumb PDF processing completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. The embeddings file has been created and is ready to use');
    console.log('2. Your Generate Plan feature will now use Plumb data');
    console.log('3. You can test it by generating a treatment plan');

  } catch (error) {
    console.error('❌ Error processing Plumb PDF:', error);
    process.exit(1);
  }
}

// Run the processing
processPlumbPDF();

