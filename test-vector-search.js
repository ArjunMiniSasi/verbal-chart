/**
 * Simple test for vector search functionality
 */

const fetch = require('node-fetch');

async function testVectorSearch() {
    try {
        console.log('🧪 Testing vector search API...');

        const response = await fetch('http://localhost:3001/api/vector-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: "indications and dosage for diarrhea in small animals",
                limit: 3
            }),
        });

        const data = await response.json();

        if (data.error) {
            console.error('❌ Error:', data.error);
            console.error('Message:', data.message);
        } else {
            console.log('✅ Success!');
            console.log(`📚 Found ${data.results.length} results:`);
            data.results.forEach((result, index) => {
                console.log(`\n${index + 1}. ${result.drugName || result.id}`);
                console.log(`   Similarity: ${result.similarity ? result.similarity.toFixed(3) : 'N/A'}`);
                console.log(`   Content: ${result.content.substring(0, 100)}...`);
            });
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testVectorSearch();
