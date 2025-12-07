# How to Restart Server and Ingest Data

## Current Status
- ✅ Server is running (process 67841)
- ✅ Data file exists (`data/plumb_embeddings.json`)
- ✅ Service account file exists (`server/medora admin service.json`)
- ⚠️ Server needs restart to load new endpoint code
- ⚠️ Firebase Admin needs to be initialized

## Steps to Ingest Data

### Step 1: Restart the Server

**Option A: Stop and Restart Manually**
1. Find the server process:
   ```bash
   ps aux | grep "node server/server.js"
   ```
2. Stop it (Ctrl+C in the terminal where it's running, or):
   ```bash
   kill <process_id>
   ```
3. Restart:
   ```bash
   cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
   npm run server
   # or
   cd server && node server.js
   ```

**Option B: Use the Script**
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
npm run server
```

### Step 2: Verify Server is Running

Check health endpoint:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"OK","message":"Medora Backend running"}`

### Step 3: Check Firebase Admin Initialization

Look for these messages in server logs:
- ✅ `✅ Firebase Admin initialized with service account`
- ✅ `✅ Firebase Admin Firestore initialized`

If you see warnings instead, check:
- Service account file path
- Environment variables

### Step 4: Run Ingestion

Once server is restarted with Firebase Admin initialized:

```bash
curl -X POST http://localhost:3001/api/ingest-plumb-to-firestore \
  -H "Content-Type: application/json"
```

Or use the test script:
```bash
./test-ingest.sh
```

## Expected Output

**Success Response:**
```json
{
  "success": true,
  "message": "Successfully ingested 2286 Plumb chunks into 'plumb_embeddings' collection",
  "chunksCount": 2286,
  "collection": "plumb_embeddings",
  "ok": true
}
```

**Server Logs:**
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

## Troubleshooting

### Error: "adminDb not initialised"
- **Cause:** Firebase Admin SDK not initialized
- **Solution:** Check service account file path and restart server

### Error: "Cannot POST /api/ingest-plumb-to-firestore"
- **Cause:** Server running old code
- **Solution:** Restart server to load updated code

### Error: "Plumb data file not found"
- **Cause:** File path incorrect
- **Solution:** Ensure `data/plumb_embeddings.json` exists

### Error: "Invalid Plumb data structure"
- **Cause:** JSON file corrupted or wrong format
- **Solution:** Verify file has `chunks` and `embeddings` arrays

