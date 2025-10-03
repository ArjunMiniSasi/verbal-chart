// Test script for PlumbRAG integration
import { testPlumbRAG } from './src/lib/plumbRAG.js';
import { testSoapWithPlumbRAG } from './src/lib/soapGenerator.js';

async function runTests() {
  console.log('🧪 Starting PlumbRAG integration tests...\n');
  
  try {
    // Test 1: PlumbRAG initialization and search
    console.log('Test 1: PlumbRAG System');
    console.log('======================');
    await testPlumbRAG();
    console.log('\n');
    
    // Test 2: SOAP generation with PlumbRAG
    console.log('Test 2: SOAP Generation with PlumbRAG');
    console.log('=====================================');
    await testSoapWithPlumbRAG();
    console.log('\n');
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };

