# Firebase Cloud Functions Deployment Guide

## ✅ Cloud Functions Created

All endpoints from `server/server.js` have been converted to Firebase Cloud Functions:

### Functions Created:

1. **`health`** - Health check endpoint
   - URL: `https://REGION-PROJECT.cloudfunctions.net/health`
   - Method: GET

2. **`transcribe`** - Audio transcription
   - URL: `https://REGION-PROJECT.cloudfunctions.net/transcribe`
   - Method: POST
   - Handles: Multipart form data with audio file

3. **`ingestTranscript`** - Ingest transcript to Firestore
   - URL: `https://REGION-PROJECT.cloudfunctions.net/ingestTranscript`
   - Method: POST

4. **`ingestPlumbToFirestore`** - Ingest Plumb data to Firestore
   - URL: `https://REGION-PROJECT.cloudfunctions.net/ingestPlumbToFirestore`
   - Method: POST

5. **`ingestPlumb`** - Legacy endpoint (returns 501)
   - URL: `https://REGION-PROJECT.cloudfunctions.net/ingestPlumb`
   - Method: POST

6. **`processPlumbPdf`** - Process Plumb PDF
   - URL: `https://REGION-PROJECT.cloudfunctions.net/processPlumbPdf`
   - Method: POST
   - Handles: Multipart form data with PDF file

7. **`generateSoap`** - Generate SOAP notes
   - URL: `https://REGION-PROJECT.cloudfunctions.net/generateSoap`
   - Method: POST

8. **`generatePlan`** - Generate treatment plan
   - URL: `https://REGION-PROJECT.cloudfunctions.net/generatePlan`
   - Method: POST

9. **`vectorSearch`** - Vector search
   - URL: `https://REGION-PROJECT.cloudfunctions.net/vectorSearch`
   - Method: POST

10. **`processLocalPdfs`** - Process local PDFs (limited in Cloud Functions)
    - URL: `https://REGION-PROJECT.cloudfunctions.net/processLocalPdfs`
    - Method: POST
    - Note: Returns 501 - not fully supported in Cloud Functions

---

## 📋 Deployment Steps

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not done)

```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
firebase init functions
```

**Options:**
- Use existing project: Yes (select your Firebase project)
- Language: JavaScript
- ESLint: Yes
- Install dependencies: Yes

### Step 4: Update .firebaserc

Edit `.firebaserc` and replace `"your-project-id"` with your actual Firebase project ID.

### Step 5: Set Environment Variables

```bash
# Set OpenAI API Key
firebase functions:config:set openai.api_key="your-openai-api-key"

# Set Cloud Storage bucket name (optional)
firebase functions:config:set storage.bucket_name="your-bucket-name"
```

**Or use Secret Manager (Recommended for production):**

```bash
# Create secrets
echo -n "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-

# Grant access to Cloud Functions service account
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 6: Create Cloud Storage Bucket

```bash
# Create bucket for file uploads
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://medora-uploads

# Set CORS (if needed)
gsutil cors set cors.json gs://medora-uploads
```

**cors.json:**
```json
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
```

### Step 7: Install Dependencies

```bash
cd functions
npm install
```

### Step 8: Test Locally (Optional)

```bash
# Start emulator
firebase emulators:start --only functions

# Test endpoint
curl http://localhost:5001/YOUR_PROJECT/us-central1/health
```

### Step 9: Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:transcribe
```

### Step 10: Get Function URLs

After deployment, Firebase will show you the URLs. They'll look like:
```
https://us-central1-YOUR_PROJECT.cloudfunctions.net/health
https://us-central1-YOUR_PROJECT.cloudfunctions.net/transcribe
https://us-central1-YOUR_PROJECT.cloudfunctions.net/generateSoap
...
```

---

## 🔄 Frontend Updates

### Update API Base URL

**File:** `.env.local` or environment variables

**Change:**
```javascript
// From:
const API_BASE_URL = 'http://localhost:3001';

// To:
const API_BASE_URL = 'https://us-central1-YOUR_PROJECT.cloudfunctions.net';
```

### Update Endpoint Calls

**Current:**
```javascript
fetch(`${API_BASE_URL}/api/transcribe`, ...)
fetch(`${API_BASE_URL}/api/generate-soap`, ...)
```

**New:**
```javascript
fetch(`${API_BASE_URL}/transcribe`, ...)
fetch(`${API_BASE_URL}/generateSoap`, ...)
```

**Note:** Function names are camelCase (e.g., `generateSoap` not `generate-soap`)

---

## 📝 Function URL Mapping

| Old Endpoint | New Function | URL Pattern |
|--------------|--------------|-------------|
| `GET /health` | `health` | `/health` |
| `POST /api/transcribe` | `transcribe` | `/transcribe` |
| `POST /api/ingest-transcript` | `ingestTranscript` | `/ingestTranscript` |
| `POST /api/ingest-plumb-to-firestore` | `ingestPlumbToFirestore` | `/ingestPlumbToFirestore` |
| `POST /api/process-plumb-pdf` | `processPlumbPdf` | `/processPlumbPdf` |
| `POST /api/generate-soap` | `generateSoap` | `/generateSoap` |
| `POST /api/generate-plan` | `generatePlan` | `/generatePlan` |
| `POST /api/vector-search` | `vectorSearch` | `/vectorSearch` |

---

## ⚠️ Important Notes

### 1. File Uploads
- Files are uploaded to Cloud Storage (`gs://medora-uploads/uploads/`)
- Temporary files are stored in `/tmp` (ephemeral)
- Files are automatically cleaned up after processing

### 2. Timeout Limits
- **Max timeout:** 9 minutes (540 seconds)
- All functions are configured with `timeoutSeconds: 540`
- If operations exceed this, consider using Cloud Tasks or Cloud Run

### 3. Memory Limits
- **Max memory:** 8GB
- Functions are configured with `memory: '2GB'`
- Increase if needed for large PDF processing

### 4. Environment Variables
- Use `functions.config()` for Firebase Functions config
- Or use Secret Manager for sensitive data
- Update code to read from Secret Manager if needed

### 5. Local File Access
- Cloud Functions cannot access local directories
- `processLocalPdfs` returns 501 (not implemented)
- Use Cloud Storage for file storage

### 6. Plumb Data Ingestion
- `ingestPlumbToFirestore` needs `plumb_embeddings.json` in Cloud Storage
- Upload file to `gs://medora-uploads/data/plumb_embeddings.json` first
- Or use the existing Firestore collection (already ingested)

---

## 🧪 Testing

### Test Health Endpoint

```bash
curl https://us-central1-YOUR_PROJECT.cloudfunctions.net/health
```

### Test Generate Plan

```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/generatePlan \
  -H "Content-Type: application/json" \
  -d '{
    "assessment": "Canine dermatitis",
    "subjective": "Patient presents with skin irritation",
    "objective": "Red, inflamed skin on abdomen"
  }'
```

### Test Transcription (with file)

```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/transcribe \
  -F "audio=@path/to/audio.mp3"
```

---

## 📊 Function Configuration

All functions are configured with:
- **Timeout:** 540 seconds (9 minutes)
- **Memory:** 2GB
- **Region:** us-central1 (default, can be changed)

To change region:
```bash
firebase functions:config:set functions.region="us-east1"
```

---

## 🔍 Monitoring

### View Logs

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only generatePlan

# Real-time
firebase functions:log --follow
```

### View in Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Functions**
4. Click on a function to see logs, metrics, etc.

---

## 💰 Cost Estimate

### Cloud Functions
- **Free Tier:** 2M invocations/month, 400K GB-seconds, 200K GHz-seconds
- **After Free Tier:** 
  - $0.0000004 per invocation
  - $0.0000025 per GB-second
  - Example: 1M requests/month = ~$50-100/month

### Cloud Storage
- **Free Tier:** 5GB storage, 5GB egress/month
- **After Free Tier:** $0.020 per GB/month

---

## 🐛 Troubleshooting

### Error: "Function failed to deploy"
- Check Firebase CLI is logged in
- Verify project ID in `.firebaserc`
- Check function code for syntax errors

### Error: "OPENAI_API_KEY is not set"
- Set using: `firebase functions:config:set openai.api_key="..."`
- Or use Secret Manager

### Error: "Permission denied" on Cloud Storage
- Grant Storage Admin role to Cloud Functions service account
- Or use default service account with proper permissions

### Error: "Timeout exceeded"
- Increase timeout (max 540 seconds)
- Or split operation into smaller functions
- Or use Cloud Run for long operations

### Error: "Memory limit exceeded"
- Increase memory: `memory: '4GB'` or `'8GB'`
- Optimize code to use less memory

---

## ✅ Deployment Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Project initialized with `firebase init functions`
- [ ] `.firebaserc` updated with correct project ID
- [ ] Environment variables set (`openai.api_key`, etc.)
- [ ] Cloud Storage bucket created
- [ ] Dependencies installed (`npm install` in functions/)
- [ ] Functions tested locally (optional)
- [ ] Functions deployed (`firebase deploy --only functions`)
- [ ] Function URLs noted
- [ ] Frontend updated with new API URLs
- [ ] Tested all endpoints

---

**Last Updated:** December 6, 2024  
**Status:** ✅ Ready for deployment

