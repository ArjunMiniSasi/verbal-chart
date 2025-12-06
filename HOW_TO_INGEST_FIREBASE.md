# How to Ingest Data into Firebase Firestore

## ❌ NOT the Export Button!

The **"Export"** button in Firebase Console is for **EXPORTING** data **OUT** of Firestore, not importing.

---

## ✅ Methods to Ingest Data into Firestore

### Method 1: Using API Endpoint (RECOMMENDED) ⭐

We've already created an endpoint for you! Just call it:

#### Option A: Using cURL (Terminal)

```bash
# Make sure your server is running first!
# Then run:
curl -X POST http://localhost:3001/api/ingest-plumb-to-firestore
```

#### Option B: Using Postman

1. Open Postman
2. Create new request
3. Method: **POST**
4. URL: `http://localhost:3001/api/ingest-plumb-to-firestore`
5. Headers: `Content-Type: application/json`
6. Click **Send**

#### Option C: Using Browser (if CORS allows)

Open browser and go to:
```
http://localhost:3001/api/ingest-plumb-to-firestore
```
(But POST requests need a tool like Postman or cURL)

#### Option D: Using JavaScript/Frontend

```javascript
fetch('http://localhost:3001/api/ingest-plumb-to-firestore', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));
```

---

## 📋 Step-by-Step Instructions

### Step 1: Start Your Server

```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
npm run server
# or
cd server && node server.js
```

Wait for: `🚀 Medora Backend running on port 3001`

### Step 2: Run the Ingestion Endpoint

**Using Terminal (cURL):**
```bash
curl -X POST http://localhost:3001/api/ingest-plumb-to-firestore
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Successfully ingested 2286 Plumb chunks into 'plumb_embeddings' collection",
  "chunksCount": 2286,
  "collection": "plumb_embeddings",
  "ok": true
}
```

**Server Logs Will Show:**
```
🚀 Starting Plumb data ingestion to Firestore plumb_embeddings collection...
📚 Loading Plumb data from: /path/to/data/plumb_embeddings.json
📖 Ingesting 2286 Plumb chunks into Firestore 'plumb_embeddings' collection...
  ✓ Ingested batch 1/46
  ✓ Ingested batch 2/46
  ...
  ✓ Ingested batch 46/46
✅ Successfully ingested 2286 Plumb chunks into 'plumb_embeddings' collection
```

**Time:** ~2-3 minutes for 2286 chunks

### Step 3: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Look for collection: **`plumb_embeddings`**
5. You should see **2286 documents**
6. Click on a document to see structure:
   ```json
   {
     "chunk_id": "plumb__0",
     "content": "...",
     "embedding": [...],
     "chunk_index": 0,
     "doc_id": "plumb_drug_handbook",
     "meta": {...},
     "created_at": "..."
   }
   ```

---

## 🔍 Alternative Methods (Not Recommended for This Use Case)

### Method 2: Firebase Console (Manual) ❌

**Why NOT recommended:**
- You'd need to manually add 2286 documents
- Each document has 1536 embedding values
- Would take days/weeks
- Prone to errors

**Only use for:** Testing with 1-2 documents

**Steps:**
1. Firebase Console → Firestore Database
2. Click "Start collection"
3. Collection ID: `plumb_embeddings`
4. Add document manually
5. Repeat 2285 more times... 😅

### Method 3: Firebase Admin SDK Script

You could create a standalone script, but the API endpoint is easier!

---

## 🐛 Troubleshooting

### Error: "adminDb not initialized"

**Solution:**
- Check Firebase Admin SDK configuration
- Ensure `SERVICE_ACCOUNT_PATH` is set in `.env.local`
- Or ensure service account JSON file exists

### Error: "Plumb data file not found"

**Solution:**
- Ensure `data/plumb_embeddings.json` exists
- Check file path in server logs

### Error: "Connection refused" or "Cannot POST"

**Solution:**
- Make sure server is running on port 3001
- Check: `http://localhost:3001/health` (should return `{"status":"OK"}`)

### Error: "Invalid Plumb data structure"

**Solution:**
- Check that `plumb_embeddings.json` has `chunks` and `embeddings` arrays
- Ensure both arrays have same length

### No documents appear in Firebase

**Solution:**
- Wait a few minutes (Firebase Console can be slow to update)
- Refresh the page
- Check server logs for errors
- Verify collection name is exactly `plumb_embeddings`

---

## ✅ Success Indicators

After running the endpoint, you should see:

1. **Server Response:**
   ```json
   {
     "success": true,
     "chunksCount": 2286,
     "collection": "plumb_embeddings"
   }
   ```

2. **Firebase Console:**
   - Collection `plumb_embeddings` exists
   - 2286 documents
   - Each document has `content`, `embedding`, `chunk_id`

3. **Server Logs:**
   - No errors
   - "Successfully ingested" message

---

## 🎯 Quick Reference

| Method | Best For | Time | Difficulty |
|--------|----------|------|------------|
| **API Endpoint** | Production use | 2-3 min | ⭐ Easy |
| Firebase Console | Testing 1-2 docs | Hours | ⭐⭐⭐ Hard |
| Script | Custom needs | 2-3 min | ⭐⭐ Medium |

---

## 📝 Summary

**To ingest data into Firebase Firestore:**

1. ✅ **Start your server** (`npm run server`)
2. ✅ **Call the endpoint** (`POST /api/ingest-plumb-to-firestore`)
3. ✅ **Wait 2-3 minutes**
4. ✅ **Verify in Firebase Console**

**NOT:**
- ❌ Don't use the "Export" button (that's for exporting OUT)
- ❌ Don't manually add 2286 documents in Console
- ❌ Don't use Firebase Console import (that's for importing exported data)

---

**Last Updated:** December 6, 2024

