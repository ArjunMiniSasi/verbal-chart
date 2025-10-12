# Firebase Vector Search Setup for Veterinary Drug Index

## Overview
This document explains how to set up and populate the Firebase Firestore collection for veterinary drug vector search.

## Collection Structure

### Collection Name: `veterinary_drug_index`

Each document should have the following structure:

```json
{
  "drug_name": "Metronidazole",
  "content": "Metronidazole is an antibiotic and antiprotozoal medication used to treat various infections in small animals. Indications include: diarrhea caused by Giardia, Clostridium perfringens, and other anaerobic bacteria. Dosage: 10-15 mg/kg PO BID for 5-7 days in dogs and cats. Contraindications: pregnancy, liver disease. Side effects may include vomiting, diarrhea, and neurological signs with high doses.",
  "embedding": [0.1, 0.2, 0.3, ...], // 1536-dimensional vector from OpenAI text-embedding-3-small
  "category": "antibiotic",
  "species": ["dog", "cat"],
  "conditions": ["diarrhea", "giardia", "anaerobic_infection"]
}
```

## Required Fields

1. **drug_name**: Name of the veterinary drug
2. **content**: Detailed information about the drug including indications, dosage, contraindications, and side effects
3. **embedding**: Vector embedding generated using OpenAI's text-embedding-3-small model
4. **category**: Drug category (antibiotic, anti-inflammatory, etc.)
5. **species**: Array of species the drug is used for
6. **conditions**: Array of conditions the drug treats

## Sample Documents

### Example 1: Antibiotic
```json
{
  "drug_name": "Amoxicillin",
  "content": "Amoxicillin is a broad-spectrum penicillin antibiotic. Indications: skin infections, respiratory infections, urinary tract infections. Dosage: 10-20 mg/kg PO BID-TID for 7-14 days. Contraindications: penicillin allergy. Side effects: gastrointestinal upset, allergic reactions.",
  "embedding": [/* 1536-dimensional vector */],
  "category": "antibiotic",
  "species": ["dog", "cat"],
  "conditions": ["skin_infection", "respiratory_infection", "uti"]
}
```

### Example 2: Anti-inflammatory
```json
{
  "drug_name": "Meloxicam",
  "content": "Meloxicam is a non-steroidal anti-inflammatory drug (NSAID). Indications: pain management, inflammation, osteoarthritis. Dosage: 0.1 mg/kg PO SID for dogs, 0.05 mg/kg PO SID for cats. Contraindications: renal disease, gastrointestinal ulcers, bleeding disorders. Side effects: gastrointestinal upset, renal toxicity.",
  "embedding": [/* 1536-dimensional vector */],
  "category": "anti_inflammatory",
  "species": ["dog", "cat"],
  "conditions": ["pain", "inflammation", "osteoarthritis"]
}
```

## How to Populate the Collection

### Option 1: Using Firebase Console
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Create collection `veterinary_drug_index`
4. Add documents with the structure above
5. Generate embeddings using OpenAI API and add to `embedding` field

### Option 2: Using Script
Create a script to populate the collection:

```javascript
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function addDrugToIndex(drugData) {
  // Generate embedding
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: drugData.content,
  });
  
  const embedding = response.data[0].embedding;
  
  // Add to Firestore
  await addDoc(collection(db, 'veterinary_drug_index'), {
    ...drugData,
    embedding
  });
}

// Example usage
await addDrugToIndex({
  drug_name: "Metronidazole",
  content: "Metronidazole is an antibiotic...",
  category: "antibiotic",
  species: ["dog", "cat"],
  conditions: ["diarrhea", "giardia"]
});
```

## Testing the Vector Search

Once populated, you can test the vector search functionality:

```javascript
import { searchVectorDatabase } from './firebaseVectorSearch';

// Test search
const results = await searchVectorDatabase(
  "indications and dosage for diarrhea in small animals",
  5
);

console.log('Search results:', results);
```

## Performance Considerations

1. **Index Size**: Keep the collection size manageable for better performance
2. **Embedding Dimensions**: Using text-embedding-3-small (1536 dimensions) for optimal balance of performance and accuracy
3. **Query Optimization**: Limit results to top 5-10 most relevant matches
4. **Caching**: Consider caching frequently searched queries

## Security Rules

Ensure your Firestore security rules allow read access to the veterinary_drug_index collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /veterinary_drug_index/{document} {
      allow read: if true; // Adjust based on your security requirements
      allow write: if false; // Only allow writes from admin scripts
    }
  }
}
```

## Integration with SOAPEditor

The SOAPEditor component now uses this Firebase vector search instead of the server API. When the "Generate Plan" button is clicked:

1. It takes the assessment text and transcript
2. Generates multiple search queries based on the assessment
3. Searches the veterinary_drug_index collection using vector similarity
4. Combines the results into a structured treatment plan
5. Updates the SOAP note with the generated plan

This provides more accurate and up-to-date drug recommendations based on your specific veterinary drug database.
