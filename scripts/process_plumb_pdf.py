#!/usr/bin/env python3
"""
Script to process Plumb's Veterinary Drug Handbook PDF and generate embeddings
Based on the Google Colab code provided by the user
"""

import os
import json
import sys
from pathlib import Path
import time

# Install required packages if not already installed
try:
    from openai import OpenAI
    from PyPDF2 import PdfReader
except ImportError as e:
    print(f"❌ Missing required package: {e}")
    print("Please install required packages:")
    print("pip install openai PyPDF2")
    sys.exit(1)

# Chromadb is optional (only used for testing, not for generating embeddings)
try:
    import chromadb
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    print("ℹ️  chromadb not available (optional - only used for testing)")

def load_pdf(file_path):
    """Extract text from PDF file"""
    print(f"📄 Loading PDF: {file_path}")
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    reader = PdfReader(file_path)
    text = ""
    
    print(f"📖 Processing {len(reader.pages)} pages...")
    
    for i, page in enumerate(reader.pages):
        page_text = page.extract_text()
        text += page_text + "\n"
        
        # Progress indicator
        if (i + 1) % 50 == 0:
            print(f"   Processed {i + 1}/{len(reader.pages)} pages")
    
    print(f"✅ Extracted {len(text)} characters from PDF")
    return text

def chunk_text(text, chunk_size=500, overlap=50):
    """Split text into overlapping chunks"""
    print(f"📦 Chunking text (size: {chunk_size}, overlap: {overlap})...")
    
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i:i+chunk_size])
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk.strip())
    
    print(f"✅ Created {len(chunks)} text chunks")
    return chunks

def get_embedding(text, openai_client, model="text-embedding-3-small"):
    """Get embedding for text using OpenAI"""
    try:
        response = openai_client.embeddings.create(
            model=model,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"❌ Error getting embedding: {e}")
        return None

def process_plumb_pdf(pdf_path, output_path, openai_api_key):
    """Main processing function"""
    try:
        print("🚀 Starting Plumb PDF processing...")
        
        # Initialize OpenAI client
        openai_client = OpenAI(api_key=openai_api_key)
        
        # Step 1: Load PDF
        text = load_pdf(pdf_path)
        print(f"📝 Preview (first 1000 chars):\n{text[:1000]}...\n")
        
        # Step 2: Chunk text
        chunks = chunk_text(text)
        print(f"📦 Preview of first chunk:\n{chunks[0][:300]}...\n")
        
        # Step 3: Generate embeddings
        print("🔮 Generating embeddings...")
        embeddings = []
        
        for i, chunk in enumerate(chunks):
            embedding = get_embedding(chunk, openai_client)
            
            if embedding is not None:
                embeddings.append(embedding)
            else:
                # Add zero vector as placeholder if embedding fails
                embeddings.append([0.0] * 1536)  # text-embedding-3-small has 1536 dimensions
            
            # Progress indicator
            if (i + 1) % 10 == 0:
                print(f"   Generated {i + 1}/{len(chunks)} embeddings")
            
            # Rate limiting - wait 100ms between requests
            time.sleep(0.1)
        
        print(f"✅ Generated {len(embeddings)} embeddings")
        
        # Step 4: Save to JSON file
        output_data = {
            "chunks": chunks,
            "embeddings": embeddings
        }
        
        # Ensure output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Saved embeddings to: {output_path}")
        print(f"📊 Final stats:")
        print(f"   - Chunks: {len(chunks)}")
        print(f"   - Embeddings: {len(embeddings)}")
        print(f"   - File size: {os.path.getsize(output_path) / 1024 / 1024:.2f} MB")
        
        # Step 5: Test the embeddings
        print("\n🧪 Testing embeddings...")
        test_query = "antibiotics for bronchitis in dogs"
        query_embedding = get_embedding(test_query, openai_client)
        
        if query_embedding:
            print(f"✅ Test query embedding generated successfully")
            print(f"🔍 Test query: '{test_query}'")
            print(f"📏 Embedding dimension: {len(query_embedding)}")
        
        print("\n🎉 Plumb PDF processing completed successfully!")
        print("\n📋 Next steps:")
        print("1. The embeddings file has been created and is ready to use")
        print("2. Your PlumbRAG system will automatically load this file")
        print("3. You can now generate SOAP notes with evidence-based treatments")
        
    except Exception as e:
        print(f"❌ Error processing Plumb PDF: {e}")
        raise

def main():
    """Command line interface"""
    if len(sys.argv) < 2:
        print("Usage: python process_plumb_pdf.py <pdf_path> [openai_api_key]")
        print("Example: python process_plumb_pdf.py ./plumb-veterinary-drug-handbook.pdf")
        print("\nIf you don't provide an API key, the script will look for OPENAI_API_KEY environment variable")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    openai_api_key = sys.argv[2] if len(sys.argv) > 2 else os.getenv('OPENAI_API_KEY')
    
    if not openai_api_key:
        print("❌ OpenAI API key not provided!")
        print("Please provide it as an argument or set the OPENAI_API_KEY environment variable")
        sys.exit(1)
    
    # Set output path
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_path = project_root / "data" / "plumb_embeddings.json"
    
    print(f"📁 PDF Path: {pdf_path}")
    print(f"📁 Output Path: {output_path}")
    print(f"🔑 Using OpenAI API Key: {openai_api_key[:10]}...")
    
    process_plumb_pdf(pdf_path, str(output_path), openai_api_key)

if __name__ == "__main__":
    main()

