# ✅ Essential Cloud Functions - Confirmed

## Only 3 Functions Deployed

### 1. **`transcribe`** - Audio to Transcript
- **Input:** Audio file (multipart/form-data)
- **Output:** Transcript text with timestamps
- **URL:** `https://REGION-PROJECT.cloudfunctions.net/transcribe`
- **Method:** POST
- **Purpose:** Convert audio recordings to text using OpenAI Whisper

### 2. **`generateSoap`** - Transcript to SOAP Note
- **Input:** Transcript text (JSON body)
- **Output:** SOAP note (Subjective, Objective, Assessment - Plan is empty)
- **URL:** `https://REGION-PROJECT.cloudfunctions.net/generateSoap`
- **Method:** POST
- **Purpose:** Generate SOAP note from transcript using RAG + LLM

### 3. **`generatePlan`** - Generate Treatment Plan from Firebase
- **Input:** SOA sections (assessment, subjective, objective, etc.)
- **Output:** Treatment plan with medications and dosages
- **URL:** `https://REGION-PROJECT.cloudfunctions.net/generatePlan`
- **Method:** POST
- **Purpose:** Generate treatment plan using Plumb data from Firebase Firestore `plumb_embeddings` collection

---

## ✅ Confirmed

- ✅ Only these 3 functions will be deployed
- ✅ All other functions removed
- ✅ `generatePlan` uses Firebase Firestore `plumb_embeddings` collection
- ✅ All helper functions included (for RAG, search, etc.)

---

## 📋 Function Details

### Function 1: transcribe
```javascript
exports.transcribe = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(...)
```

### Function 2: generateSoap
```javascript
exports.generateSoap = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(...)
```

### Function 3: generatePlan
```javascript
exports.generatePlan = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(...)
```

---

**Status:** ✅ Ready to deploy - Only 3 essential functions

