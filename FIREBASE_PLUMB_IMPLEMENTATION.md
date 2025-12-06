# Firebase Plumb Embeddings Implementation

## Overview
This document describes the implementation of Firebase Firestore integration for Plumb Veterinary Drug Handbook embeddings. The system now uses Firebase as the primary data source, with local JSON file as fallback.

## Changes Made

### 1. Server-Side Changes (`server/server.js`)

#### New Functions Added:

**`ingestPlumbToFirestore()`**
- Stores `plumb_embeddings.json` data into Firebase `plumb_embeddings` collection
- Collection: `plumb_embeddings`
- Document ID format: `plumb__{index}` (e.g., `plumb__0`, `plumb__1`)
- Batch processing: 50 documents per batch
- Returns: `{ ok: true, chunksCount: number, collection: 'plumb_embeddings' }`

**`searchPlumbFromFirestore(query, k, sampleSize)`**
- Searches Plumb data from Firebase `plumb_embeddings` collection
- Parameters:
  - `query`: Search query text
  - `k`: Number of top results (default: 5)
  - `sampleSize`: Number of documents to sample (default: 2000)
- Returns: Array of top-k relevant chunks with similarity scores
- Uses cosine similarity for vector matching

**Updated `searchPlumbData(query, k)`**
- **PRIMARY**: Tries Firebase Firestore first (`searchPlumbFromFirestore`)
- **FALLBACK**: Uses local JSON file if Firebase fails or is unavailable
- Maintains backward compatibility
- No changes needed to existing code that calls this function

#### New Endpoint:

**`POST /api/ingest-plumb-to-firestore`**
- One-time endpoint to ingest Plumb data into Firebase
- Reads from `data/plumb_embeddings.json`
- Stores to `plumb_embeddings` collection
- Returns success/error status with chunk count

### 2. Frontend Changes

**No UI changes required!** ✅

The frontend code (`SOAPEditor.tsx`, `ManualSOAEditor.tsx`) continues to work as-is because:
- They call `/api/generate-plan` endpoint (unchanged)
- `/api/generate-plan` calls `searchPlumbData()` (updated internally)
- The API response format remains the same

## Data Flow

### Before (Local File Only):
```
User clicks "Generate Plan"
  ↓
Frontend → POST /api/generate-plan
  ↓
searchPlumbData() reads local JSON file
  ↓
Returns results
```

### After (Firebase Primary):
```
User clicks "Generate Plan"
  ↓
Frontend → POST /api/generate-plan
  ↓
searchPlumbData() tries Firebase first
  ├─→ searchPlumbFromFirestore() → Firebase plumb_embeddings collection
  └─→ (if fails) → Local JSON file fallback
  ↓
Returns results
```

## Firebase Collection Structure

### Collection: `plumb_embeddings`

**Document Structure:**
```javascript
{
  chunk_id: "plumb__0",              // Unique identifier
  content: "...",                     // Text chunk from Plumb handbook
  embedding: [1536 numbers],          // Vector embedding (text-embedding-3-small)
  chunk_index: 0,                    // Index in original array
  doc_id: "plumb_drug_handbook",     // Source document identifier
  meta: {
    source: "plumb",
    type: "drug_handbook",
    ingested_at: "2024-12-06T..."
  },
  created_at: "2024-12-06T..."       // Timestamp
}
```

**Document ID Format:** `plumb__{index}` (e.g., `plumb__0`, `plumb__1`, ..., `plumb__2285`)

## Setup Instructions

### Step 1: Ingest Data to Firebase (One-Time)

Run this endpoint once to populate Firebase:

```bash
curl -X POST http://localhost:3001/api/ingest-plumb-to-firestore
```

Or use a tool like Postman:
- Method: POST
- URL: `http://localhost:3001/api/ingest-plumb-to-firestore`
- Headers: `Content-Type: application/json`

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully ingested 2286 Plumb chunks into 'plumb_embeddings' collection",
  "chunksCount": 2286,
  "collection": "plumb_embeddings",
  "ok": true
}
```

**Time Estimate:** ~2-3 minutes for 2286 chunks (50 per batch)

### Step 2: Verify Data in Firebase

Check Firestore console:
- Collection: `plumb_embeddings`
- Should have 2286 documents
- Each document should have `content`, `embedding`, `chunk_id`, etc.

### Step 3: Test Generate Plan

1. Open the application
2. Complete SOA sections (Subjective, Objective, Assessment)
3. Click "Generate Plan" button
4. Check server logs - should see:
   ```
   🔍 [PLUMB RAG] Attempting to search from Firebase Firestore...
   🔍 [FIREBASE PLUMB] Searching Plumb embeddings from Firestore collection...
   ✅ [PLUMB RAG] Successfully retrieved X results from Firebase
   ```

## Benefits

1. **Scalability**: No need to load 44MB file into memory
2. **Performance**: Can sample intelligently from Firebase
3. **Reliability**: Data persisted in cloud, accessible from multiple servers
4. **Flexibility**: Can update/refresh data without redeploying
5. **Backward Compatible**: Falls back to local file if Firebase unavailable

## Error Handling

The system gracefully handles errors:

1. **Firebase not initialized**: Falls back to local file
2. **Firebase collection empty**: Falls back to local file
3. **Firebase query fails**: Falls back to local file
4. **Local file missing**: Returns empty array (existing behavior)

## Monitoring

Check server logs for:
- `🔍 [FIREBASE PLUMB]` - Firebase search operations
- `🔍 [PLUMB RAG]` - General Plumb search operations
- `⚠️` - Warnings (fallback to local file)
- `❌` - Errors

## Troubleshooting

### Issue: "No results from Firebase"
**Solution:** Run `/api/ingest-plumb-to-firestore` endpoint first

### Issue: "adminDb not initialized"
**Solution:** Check Firebase Admin SDK configuration in `.env.local`

### Issue: "Collection not found"
**Solution:** Verify collection name is `plumb_embeddings` (not `plumb_embedding`)

### Issue: Slow performance
**Solution:** Reduce `sampleSize` parameter in `searchPlumbFromFirestore()` (default: 2000)

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/generate-plan` | POST | Generate treatment plan (uses Firebase automatically) |
| `/api/ingest-plumb-to-firestore` | POST | One-time ingestion to Firebase |
| `/api/ingest-plumb` | POST | Legacy endpoint (stores to `medora_chunks`) |

## Files Modified

- `server/server.js`:
  - Added `ingestPlumbToFirestore()` function
  - Added `searchPlumbFromFirestore()` function
  - Updated `searchPlumbData()` function
  - Added `/api/ingest-plumb-to-firestore` endpoint

## Files NOT Modified (No Changes Needed)

- `src/components/SOAPEditor.tsx` ✅
- `src/components/ManualSOAEditor.tsx` ✅
- Any frontend files ✅

## Next Steps

1. ✅ Run `/api/ingest-plumb-to-firestore` to populate Firebase
2. ✅ Test "Generate Plan" functionality
3. ✅ Monitor server logs to verify Firebase usage
4. ✅ (Optional) Remove local JSON file dependency after confirming Firebase works

---

**Last Updated:** December 6, 2024
**Status:** ✅ Implementation Complete

