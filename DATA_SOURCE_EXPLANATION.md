# Data Source for RAG/Search/Plan Generation

## ✅ Answer: It Uses Firebase Firestore FIRST, Then Falls Back to Local JSON

---

## How It Works

### Current Implementation (After Ingestion)

When you click **"Generate Plan"** or any RAG search happens:

```
1. searchPlumbData() is called
   ↓
2. 🔍 Tries Firebase Firestore FIRST
   ├─→ searchPlumbFromFirestore() queries 'plumb_embeddings' collection
   ├─→ If successful → Returns Firebase results ✅
   └─→ If fails or no results → Falls back to local JSON file
   ↓
3. 📁 Fallback: Local plumb_embeddings.json file
   └─→ Only used if Firebase is unavailable
```

---

## Priority Order

### 1. **PRIMARY: Firebase Firestore** ⭐
- **Collection:** `plumb_embeddings`
- **Documents:** 2,286 chunks
- **Used when:** Firebase Admin is initialized and collection has data
- **Advantages:**
  - ✅ Faster (no need to load 44MB file)
  - ✅ Scalable (can handle concurrent searches)
  - ✅ Cloud-based (accessible from anywhere)

### 2. **FALLBACK: Local JSON File**
- **File:** `data/plumb_embeddings.json`
- **Used when:**
  - Firebase Admin not initialized
  - Firebase collection is empty
  - Firebase query fails
  - Network issues
- **Advantages:**
  - ✅ Works offline
  - ✅ Backup option
  - ✅ No Firebase dependency

---

## Code Flow

### When "Generate Plan" is Clicked:

```javascript
// 1. Frontend calls /api/generate-plan
POST /api/generate-plan
{
  assessment: "...",
  subjective: "...",
  objective: "..."
}

// 2. Server calls searchPlumbData()
const plumbResults = await searchPlumbData(enhancedQuery, k);

// 3. searchPlumbData() tries Firebase FIRST
async function searchPlumbData(query, k = 5) {
  // Try Firebase first
  try {
    const firebaseResults = await searchPlumbFromFirestore(query, k, 2000);
    if (firebaseResults && firebaseResults.length > 0) {
      return firebaseResults; // ✅ Uses Firebase
    }
  } catch (firebaseErr) {
    // Falls back to local file
  }
  
  // Fallback to local JSON file
  // ... loads from plumb_embeddings.json
}
```

---

## What You'll See in Server Logs

### When Using Firebase (Normal Case):
```
🔍 [PLUMB RAG] Attempting to search from Firebase Firestore...
🔍 [FIREBASE PLUMB] Searching Plumb embeddings from Firestore collection...
🔍 [FIREBASE PLUMB] Sampling 2000 documents from Firestore...
🔍 [FIREBASE PLUMB] Calculated similarity for 2000 Plumb chunks
📖 [FIREBASE PLUMB] Top 5 Plumb references selected
✅ [PLUMB RAG] Successfully retrieved 5 results from Firebase
```

### When Falling Back to Local File:
```
🔍 [PLUMB RAG] Attempting to search from Firebase Firestore...
⚠️ [PLUMB RAG] Firebase search failed, falling back to local file: adminDb not initialized
🔍 [PLUMB RAG] Searching from local plumb_embeddings.json file...
🔍 [PLUMB RAG DEBUG] Searching 2286 Plumb chunks locally...
📖 Found 5 relevant Plumb references
```

---

## Current Status (After Ingestion)

✅ **Firebase has 2,286 documents**  
✅ **Firebase Admin is initialized**  
✅ **System will use Firebase FIRST**

**Result:** All RAG searches and "Generate Plan" will use **Firebase Firestore** by default!

---

## How to Verify

### Test 1: Check Server Logs
When you click "Generate Plan", look for:
- `🔍 [FIREBASE PLUMB]` messages = Using Firebase ✅
- `🔍 [PLUMB RAG DEBUG] Searching from local` = Using local file ⚠️

### Test 2: Check Firebase Console
1. Go to Firebase Console → Firestore
2. Collection: `plumb_embeddings`
3. Should see 2,286 documents
4. Documents should have `content`, `embedding`, `chunk_id`

### Test 3: Performance
- **Firebase:** Faster, no file I/O
- **Local File:** Slower, loads 44MB into memory

---

## Summary

| Feature | Data Source | Status |
|---------|-------------|--------|
| **Generate Plan** | Firebase Firestore (primary) | ✅ Active |
| **RAG Search** | Firebase Firestore (primary) | ✅ Active |
| **Hybrid Retrieval** | Firebase Firestore (primary) | ✅ Active |
| **Local JSON** | Fallback only | ✅ Available |

---

## Important Notes

1. **Firebase is PRIMARY** - Used by default when available
2. **Local JSON is FALLBACK** - Only used if Firebase fails
3. **Both work** - System is resilient with fallback
4. **No code changes needed** - Already implemented!

---

**Last Updated:** December 6, 2024  
**Status:** ✅ Firebase is the primary data source

