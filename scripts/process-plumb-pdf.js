// Script to process Plumb's Veterinary Drug Handbook PDF and generate embeddings
// Run this script to convert your PDF into the required embeddings format

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key-here'
});

/**
 * Extract text from PDF (you'll need to install pdf-parse or similar)
 * For now, this is a placeholder - you'll need to implement PDF parsing
 */
async function extractTextFromPDF(pdfPath) {
  // TODO: Implement PDF text extraction
  // You can use libraries like:
  // - pdf-parse (npm install pdf-parse)
  // - pdf2pic + tesseract for OCR
  // - PyPDF2 (if using Python)
  
  console.log(`📄 Extracting text from: ${pdfPath}`);
  
  // Placeholder - replace with actual PDF extraction
  const sampleText = `
    Amoxicillin is a broad-spectrum antibiotic commonly used in veterinary medicine for treating bacterial infections in dogs and cats. Effective against gram-positive and some gram-negative bacteria. Dosage: 10-20 mg/kg PO q12h for 7-14 days. Common side effects include gastrointestinal upset. Contraindicated in patients with penicillin allergy.
    
    Cephalexin is a first-generation cephalosporin antibiotic effective against skin infections, urinary tract infections, and respiratory infections in small animals. Good activity against Staphylococcus and Streptococcus species. Dosage: 10-15 mg/kg PO q8-12h for 7-14 days. Generally well-tolerated with minimal side effects.
    
    Metronidazole is an antimicrobial agent used for treating anaerobic bacterial infections and protozoal infections like giardia. Also effective against Helicobacter pylori. Dosage: 10-25 mg/kg PO q12h for 5-10 days. Can cause neurological side effects with prolonged use. Avoid in pregnant animals.
  `;
  
  return sampleText;
}

/**
 * Split text into chunks for embedding
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}

/**
 * Generate embeddings for text chunks
 */
async function generateEmbeddings(chunks) {
  console.log(`🔮 Generating embeddings for ${chunks.length} chunks...`);
  
  const embeddings = [];
  
  for (let i = 0; i < chunks.length; i++) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunks[i]
      });
      
      embeddings.push(response.data[0].embedding);
      
      // Progress indicator
      if ((i + 1) % 10 === 0) {
        console.log(`   Processed ${i + 1}/${chunks.length} chunks`);
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Error generating embedding for chunk ${i}:`, error);
      // Add a zero vector as placeholder
      embeddings.push(new Array(1536).fill(0));
    }
  }
  
  return embeddings;
}

/**
 * Main processing function
 */
async function processPlumbPDF(pdfPath) {
  try {
    console.log('🚀 Starting Plumb PDF processing...');
    
    // Step 1: Extract text from PDF
    const text = await extractTextFromPDF(pdfPath);
    console.log(`📝 Extracted ${text.length} characters of text`);
    
    // Step 2: Split into chunks
    const chunks = chunkText(text);
    console.log(`📦 Created ${chunks.length} text chunks`);
    
    // Step 3: Generate embeddings
    const embeddings = await generateEmbeddings(chunks);
    console.log(`🔮 Generated ${embeddings.length} embeddings`);
    
    // Step 4: Save to JSON file
    const outputData = {
      chunks: chunks,
      embeddings: embeddings
    };
    
    const outputPath = path.join(process.cwd(), 'data', 'plumb_embeddings.json');
    
    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`✅ Saved embeddings to: ${outputPath}`);
    
    console.log('🎉 Plumb PDF processing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error processing Plumb PDF:', error);
    throw error;
  }
}

// Command line usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const pdfPath = process.argv[2];
  
  if (!pdfPath) {
    console.log('Usage: node process-plumb-pdf.js <path-to-plumb-pdf>');
    console.log('Example: node process-plumb-pdf.js ./plumb-veterinary-drug-handbook.pdf');
    process.exit(1);
  }
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found: ${pdfPath}`);
    process.exit(1);
  }
  
  processPlumbPDF(pdfPath).catch(console.error);
}

export { processPlumbPDF };

