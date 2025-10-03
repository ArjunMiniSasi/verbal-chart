# PlumbRAG Integration

This document describes the PlumbRAG (Plumb's Veterinary Drug Handbook RAG) integration for the Medora veterinary AI scribe system.

## Overview

PlumbRAG enhances the SOAP note generation by providing access to a comprehensive veterinary drug handbook through Retrieval-Augmented Generation (RAG). This allows the AI to suggest evidence-based treatments with specific dosages and administration guidelines.

## Architecture

### Components

1. **`lib/plumbRAG.ts`** - Core PlumbRAG functionality
2. **`data/plumb_embeddings.json`** - Preprocessed drug handbook data
3. **Enhanced SOAP Generator** - Updated to use PlumbRAG for Plan sections

### Data Structure

The `plumb_embeddings.json` file contains:
- `chunks`: Array of drug information text chunks
- `embeddings`: Corresponding embedding vectors for semantic search

## Key Functions

### `initializePlumbRAG()`
- Loads embeddings from JSON file
- Initializes ChromaDB collection in memory
- Populates collection with drug handbook data

### `searchPlumb(query: string, k: number = 3)`
- Embeds the query using OpenAI text-embedding-3-small
- Searches ChromaDB for top-k relevant chunks
- Returns matching drug information as string array

### Enhanced `createSoapNoteWithHistory()`
- Generates S, O, A sections normally
- For Plan section:
  1. Builds query from Assessment
  2. Retrieves relevant drug context via PlumbRAG
  3. Generates evidence-based treatment plan
  4. Falls back gracefully if PlumbRAG fails

## Usage Example

```typescript
import { createSoapNoteWithHistory } from './lib/soapGenerator';

const transcript = "Patient presents with skin infection...";
const previousNotes = [];

const soapNote = await createSoapNoteWithHistory(transcript, previousNotes);
// Plan section will now include evidence-based treatments from Plumb's handbook
```

## Error Handling

- If PlumbRAG initialization fails, SOAP generation continues with original plan
- If no relevant drug context is found, original plan is preserved
- All errors are logged but don't break the SOAP generation pipeline

## Testing

Run the test functions to verify integration:

```typescript
import { testPlumbRAG } from './lib/plumbRAG';
import { testSoapWithPlumbRAG } from './lib/soapGenerator';

await testPlumbRAG(); // Test PlumbRAG system
await testSoapWithPlumbRAG(); // Test full SOAP generation
```

## Dependencies

- `chromadb` - Vector database for semantic search
- `openai` - For embedding generation and LLM calls

## Configuration

Ensure the following environment variables are set:
- `VITE_OPENAI_API_KEY` - OpenAI API key for embeddings and LLM calls

## Future Enhancements

1. **Real-time Embedding Generation**: Generate embeddings on-the-fly instead of using preprocessed data
2. **Dynamic Data Updates**: Allow updating the drug handbook without restarting the application
3. **Confidence Scoring**: Add confidence scores to retrieved drug information
4. **Multi-modal Search**: Support searching by symptoms, conditions, or drug names
5. **Dosage Validation**: Cross-reference suggested dosages with patient weight and condition

