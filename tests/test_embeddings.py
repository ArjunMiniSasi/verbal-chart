#!/usr/bin/env python3
"""
Test script to verify the processed Plumb embeddings work correctly
"""

import json
import os
import sys
from pathlib import Path

def test_embeddings_file(embeddings_path):
    """Test the embeddings file structure and content"""
    print(f"🧪 Testing embeddings file: {embeddings_path}")
    
    if not os.path.exists(embeddings_path):
        print(f"❌ Embeddings file not found: {embeddings_path}")
        return False
    
    try:
        with open(embeddings_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("✅ Successfully loaded embeddings file")
        
        # Check structure
        if 'chunks' not in data or 'embeddings' not in data:
            print("❌ Invalid file structure - missing 'chunks' or 'embeddings' keys")
            return False
        
        chunks = data['chunks']
        embeddings = data['embeddings']
        
        print(f"📊 File statistics:")
        print(f"   - Chunks: {len(chunks)}")
        print(f"   - Embeddings: {len(embeddings)}")
        
        # Check if counts match
        if len(chunks) != len(embeddings):
            print(f"❌ Mismatch: {len(chunks)} chunks vs {len(embeddings)} embeddings")
            return False
        
        # Check embedding dimensions
        if embeddings:
            embedding_dim = len(embeddings[0])
            print(f"   - Embedding dimension: {embedding_dim}")
            
            # Check if all embeddings have the same dimension
            for i, emb in enumerate(embeddings):
                if len(emb) != embedding_dim:
                    print(f"❌ Embedding {i} has wrong dimension: {len(emb)} (expected {embedding_dim})")
                    return False
        
        # Check chunk content
        if chunks:
            print(f"   - First chunk preview: {chunks[0][:100]}...")
            print(f"   - Last chunk preview: {chunks[-1][:100]}...")
        
        # Check for empty chunks
        empty_chunks = [i for i, chunk in enumerate(chunks) if not chunk.strip()]
        if empty_chunks:
            print(f"⚠️  Warning: Found {len(empty_chunks)} empty chunks at indices: {empty_chunks[:10]}")
        
        print("✅ All tests passed!")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error testing embeddings: {e}")
        return False

def test_search_simulation():
    """Simulate a search to test the data quality"""
    print("\n🔍 Testing search simulation...")
    
    embeddings_path = Path(__file__).parent.parent / "data" / "plumb_embeddings.json"
    
    if not os.path.exists(embeddings_path):
        print("❌ Embeddings file not found for search test")
        return False
    
    try:
        with open(embeddings_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        chunks = data['chunks']
        
        # Test queries
        test_queries = [
            "antibiotics for skin infections",
            "pain management in dogs",
            "heart failure treatment",
            "diabetes medication"
        ]
        
        print("📝 Testing search relevance...")
        
        for query in test_queries:
            print(f"\n🔍 Query: '{query}'")
            
            # Simple keyword matching (basic relevance test)
            relevant_chunks = []
            for i, chunk in enumerate(chunks):
                if any(word.lower() in chunk.lower() for word in query.split()):
                    relevant_chunks.append((i, chunk[:100] + "..."))
            
            if relevant_chunks:
                print(f"   Found {len(relevant_chunks)} potentially relevant chunks:")
                for i, (idx, preview) in enumerate(relevant_chunks[:3]):  # Show top 3
                    print(f"   {i+1}. Chunk {idx}: {preview}")
            else:
                print("   No relevant chunks found (this might be normal)")
        
        print("\n✅ Search simulation completed")
        return True
        
    except Exception as e:
        print(f"❌ Error in search simulation: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Plumb Embeddings Test Suite")
    print("=" * 40)
    
    # Get embeddings file path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    embeddings_path = project_root / "data" / "plumb_embeddings.json"
    
    # Test 1: File structure and content
    test1_passed = test_embeddings_file(embeddings_path)
    
    # Test 2: Search simulation
    test2_passed = test_search_simulation()
    
    # Summary
    print("\n" + "=" * 40)
    print("📋 Test Summary:")
    print(f"   File Structure Test: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"   Search Simulation: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! Your PlumbRAG system is ready to use.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())

