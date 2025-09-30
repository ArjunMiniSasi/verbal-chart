import { ChromaApi, OpenAIEmbeddingFunction } from 'chromadb';
import OpenAI from 'openai';

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

// Initialize ChromaDB client
const chromaClient = new ChromaApi();

// Global collection reference
let plumbCollection: any = null;

// Embedding function for OpenAI
const embedder = new OpenAIEmbeddingFunction({
  openai_api_key: import.meta.env.VITE_OPENAI_API_KEY,
  openai_model: 'text-embedding-3-small'
});

/**
 * Interface for the plumb embeddings data structure
 */
interface PlumbEmbeddings {
  chunks: string[];
  embeddings: number[][];
}

/**
 * Initialize the PlumbRAG system by loading embeddings and creating Chroma collection
 */
export async function initializePlumbRAG(): Promise<void> {
  try {
    console.log('🔧 Initializing PlumbRAG system...');
    
    // Load the preprocessed embeddings
    const response = await fetch('/data/plumb_embeddings.json');
    if (!response.ok) {
      throw new Error(`Failed to load plumb embeddings: ${response.statusText}`);
    }
    
    const data: PlumbEmbeddings = await response.json();
    console.log(`📚 Loaded ${data.chunks.length} chunks from plumb embeddings`);
    
    // Create or get the collection
    try {
      plumbCollection = await chromaClient.getCollection({
        name: 'plumb_drug_handbook',
        embeddingFunction: embedder
      });
      console.log('📖 Retrieved existing plumb collection');
    } catch (error) {
      // Collection doesn't exist, create it
      plumbCollection = await chromaClient.createCollection({
        name: 'plumb_drug_handbook',
        embeddingFunction: embedder
      });
      console.log('📖 Created new plumb collection');
    }
    
    // Check if collection is empty and needs to be populated
    const count = await plumbCollection.count();
    if (count === 0) {
      console.log('📝 Populating collection with plumb data...');
      
      // Prepare data for insertion
      const ids = data.chunks.map((_, index) => `chunk_${index}`);
      const documents = data.chunks;
      const embeddings = data.embeddings;
      
      // Insert all chunks and embeddings
      await plumbCollection.add({
        ids: ids,
        documents: documents,
        embeddings: embeddings
      });
      
      console.log(`✅ Successfully inserted ${data.chunks.length} chunks into Chroma collection`);
    } else {
      console.log(`📊 Collection already contains ${count} documents`);
    }
    
    console.log('✅ PlumbRAG system initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing PlumbRAG system:', error);
    throw error;
  }
}

/**
 * Search the Plumb drug handbook for relevant information
 * @param query - The search query
 * @param k - Number of results to return (default: 3)
 * @returns Promise<string[]> - Array of relevant chunk texts
 */
export async function searchPlumb(query: string, k: number = 3): Promise<string[]> {
  try {
    console.log(`🔍 Searching Plumb for: "${query}" (k=${k})`);
    
    if (!plumbCollection) {
      console.warn('⚠️ PlumbRAG not initialized, initializing now...');
      await initializePlumbRAG();
    }
    
    // Search the collection
    const results = await plumbCollection.query({
      queryTexts: [query],
      nResults: k
    });
    
    // Extract the documents from results
    const documents = results.documents[0] || [];
    console.log(`📖 Found ${documents.length} relevant chunks`);
    
    return documents;
    
  } catch (error) {
    console.error('❌ Error searching Plumb:', error);
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Get embedding for a text using OpenAI
 * @param text - Text to embed
 * @returns Promise<number[]> - Embedding vector
 */
export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ Error getting embedding:', error);
    throw error;
  }
}

/**
 * Test function to verify PlumbRAG is working
 */
export async function testPlumbRAG(): Promise<void> {
  try {
    console.log('🧪 Testing PlumbRAG system...');
    
    await initializePlumbRAG();
    
    const testQuery = 'antibiotics for skin infections in dogs';
    const results = await searchPlumb(testQuery, 2);
    
    console.log('🔍 Test query:', testQuery);
    console.log('📖 Results:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.substring(0, 100)}...`);
    });
    
    console.log('✅ PlumbRAG test completed successfully');
    
  } catch (error) {
    console.error('❌ PlumbRAG test failed:', error);
  }
}

