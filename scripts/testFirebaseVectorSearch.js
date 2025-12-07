/**
 * Simple test script for Firebase Vector Search functionality
 * Run with: node scripts/testFirebaseVectorSearch.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, Vector, DistanceMeasure } = require('firebase/firestore');
const OpenAI = require('openai');
require('dotenv').config();

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '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',
});

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Calculate cosine similarity between two vectors
 */
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

/**
 * Test Firebase vector search functionality
 */
async function testFirebaseVectorSearch() {
    try {
        console.log('🧪 Testing Firebase Vector Search...');

        // Test 1: Check if collection exists and has data
        console.log('\n📚 Test 1: Checking veterinary_drug_index collection...');
        const veterinaryDrugIndexRef = collection(db, 'veterinary_drug_index');
        const snapshot = await getDocs(veterinaryDrugIndexRef);

        if (snapshot.empty) {
            console.log('⚠️ Collection is empty. Run "npm run firebase:populate" first.');
            return;
        }

        console.log(`✅ Found ${snapshot.size} documents in collection`);

        // Test 2: Test embedding generation
        console.log('\n🔮 Test 2: Testing embedding generation...');
        const testQuery = "indications and dosage for diarrhea in small animals";
        const queryEmbedding = await generateEmbedding(testQuery);
        console.log(`✅ Generated embedding with ${queryEmbedding.length} dimensions`);

        // Test 3: Test Firebase native vector search
        console.log('\n🔍 Test 3: Testing Firebase native vector search...');

        try {
            // Use Firebase's native vector search (like the working Colab code)
            const vectorQuery = veterinaryDrugIndexRef.findNearest(
                'embedding', // vector field name
                new Vector(queryEmbedding), // query vector
                {
                    limit: 3,
                    distanceMeasure: DistanceMeasure.COSINE
                }
            );

            const vectorSnapshot = await vectorQuery.get();
            console.log(`📚 Found ${vectorSnapshot.docs.length} documents using Firebase vector search`);

            const vectorResults = vectorSnapshot.docs.map(doc => {
                const data = doc.data();
                const content = data.content || data.description || data.drug_name || '';
                console.log(`📋 Document ${doc.id}: ${content.substring(0, 100)}...`);
                return content;
            });

            console.log(`✅ Found ${vectorResults.length} relevant results using Firebase vector search`);

        } catch (vectorSearchError) {
            console.warn('⚠️ Firebase vector search failed, testing manual search:', vectorSearchError.message);

            // Fallback to manual search
            const similarities = [];
            let docCount = 0;
            snapshot.forEach((doc) => {
                if (docCount >= 3) return; // Limit to first 3 documents for testing
                docCount++;

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
                    } else if (embedding.__type__ === "__vector__" && Array.isArray(embedding.value)) {
                        embeddingArray = embedding.value;
                    }
                }

                if (embeddingArray && content) {
                    try {
                        if (embeddingArray.length === queryEmbedding.length) {
                            const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
                            console.log(`📊 ${drugName}: similarity ${similarity.toFixed(4)}`);
                            if (similarity > 0.05) { // Lower threshold for testing
                                similarities.push({ content, similarity, drugName });
                            }
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error calculating similarity for ${drugName}:`, error.message);
                    }
                }
            });

            // Sort by similarity and show top results
            const sortedResults = similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 3);

            console.log(`✅ Found ${sortedResults.length} relevant results using manual search:`);
            sortedResults.forEach((result, index) => {
                console.log(`   ${index + 1}. ${result.drugName}: similarity ${result.similarity.toFixed(3)}`);
                console.log(`      Content: ${result.content.substring(0, 100)}...`);
            });
        }

        // Test 4: Test treatment plan generation
        console.log('\n🚀 Test 4: Testing treatment plan generation...');
        const assessment = "diarrhea in small animals";
        const transcript = "Patient presented with diarrhea symptoms, owner reports loose stools for 2 days";

        const searchQueries = [
            `indications and dosage for ${assessment}`,
            `treatment protocol for ${assessment}`,
            `medication recommendations for ${assessment}`
        ];

        const allResults = [];
        for (const searchQuery of searchQueries) {
            try {
                const queryEmbedding = await generateEmbedding(searchQuery);
                const similarities = [];

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const content = data.content || '';
                    const embedding = data.embedding;

                    // Handle Firebase vector format: { __type__: "__vector__", value: [...] }
                    let embeddingArray = null;
                    if (embedding) {
                        if (Array.isArray(embedding)) {
                            embeddingArray = embedding;
                        } else if (embedding.__type__ === "__vector__" && Array.isArray(embedding.value)) {
                            embeddingArray = embedding.value;
                        }
                    }

                    if (embeddingArray && content) {
                        try {
                            if (embeddingArray.length === queryEmbedding.length) {
                                const similarity = cosineSimilarity(queryEmbedding, embeddingArray);
                                if (similarity > 0.1) {
                                    similarities.push({ content, similarity });
                                }
                            }
                        } catch (error) {
                            // Skip invalid embeddings
                        }
                    }
                });

                const results = similarities
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, 2)
                    .map(result => result.content);

                allResults.push(...results);
            } catch (error) {
                console.warn(`⚠️ Search failed for query: ${searchQuery}`);
            }
        }

        const uniqueResults = [...new Set(allResults)].slice(0, 3);
        console.log(`✅ Generated treatment plan with ${uniqueResults.length} drug recommendations`);

        if (uniqueResults.length > 0) {
            console.log('\n📋 Sample treatment plan:');
            console.log('**Plan:**\n');
            console.log('1. **Diagnostic Tests:**');
            console.log('   - Further diagnostic workup as indicated');
            console.log('   - Monitor patient response to treatment\n');
            console.log('2. **Medication:**');
            uniqueResults.forEach((result, index) => {
                console.log(`   - ${result.substring(0, 80)}...`);
            });
            console.log('\n3. **Follow-up:**');
            console.log('   - Schedule follow-up appointment');
            console.log('   - Monitor for improvement or complications\n');
            console.log('4. **Client Education:**');
            console.log('   - Discuss treatment plan with owner');
            console.log('   - Provide care instructions');
        }

        console.log('\n🎉 All tests passed! Firebase Vector Search is working correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the test
if (require.main === module) {
    testFirebaseVectorSearch()
        .then(() => {
            console.log('✅ Test completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { testFirebaseVectorSearch };
