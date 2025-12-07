# GCP Deployment Steps for server.js

## ✅ Yes, It's Possible!

Your `server.js` can be deployed to **Google Cloud Run** (recommended) or **Google App Engine**.

---

## 📋 Pre-Deployment Checklist

### What Needs to Be Changed:

1. ✅ **File Storage** - Move from local filesystem to Cloud Storage
2. ✅ **Environment Variables** - Use Cloud Run secrets/env vars
3. ✅ **Service Account** - Use default service account or Secret Manager
4. ✅ **Dockerfile** - Create container image
5. ✅ **Build Configuration** - Set up build process

---

## 🚀 Deployment Steps Overview

### Phase 1: Preparation (Local Changes)
1. Update server.js to use Cloud Storage instead of local filesystem
2. Create Dockerfile
3. Test locally with Docker
4. Update environment variable handling

### Phase 2: Google Cloud Setup
1. Create GCP project (or use existing)
2. Enable required APIs
3. Create Cloud Storage bucket
4. Set up service account permissions
5. Configure Secret Manager (optional)

### Phase 3: Build & Deploy
1. Build Docker container
2. Push to Google Container Registry/Artifact Registry
3. Deploy to Cloud Run
4. Configure environment variables
5. Test endpoints

### Phase 4: Frontend Update
1. Update API base URL
2. Test integration
3. Deploy frontend (if needed)

---

## 📝 Detailed Steps

### STEP 1: Update server.js for Cloud Storage

**Current Code:**
```javascript
const uploadDir = path.resolve(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  // ...
});
```

**Change To:**
```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');

// Use multer memory storage, then upload to Cloud Storage
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });
```

**Files to Update:**
- File upload handling (multer configuration)
- File reading (transcription, PDF processing)
- File cleanup (after processing)

**Estimated Time:** 1-2 hours

---

### STEP 2: Create Dockerfile

**Location:** `server/Dockerfile`

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy server code
COPY . .

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "server.js"]
```

**Estimated Time:** 15 minutes

---

### STEP 3: Create .dockerignore

**Location:** `server/.dockerignore`

```
node_modules
npm-debug.log
.env
.env.local
uploads/*
*.log
.git
.gitignore
```

**Estimated Time:** 5 minutes

---

### STEP 4: Google Cloud Project Setup

**Commands:**
```bash
# Install Google Cloud SDK (if not installed)
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Create project (or use existing)
gcloud projects create medora-ai --name="Medora AI"

# Set as default project
gcloud config set project medora-ai

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  storage-component.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

**Estimated Time:** 10 minutes

---

### STEP 5: Create Cloud Storage Bucket

**Commands:**
```bash
# Create bucket for file uploads
gsutil mb -p medora-ai -l us-central1 gs://medora-uploads

# Set CORS (if needed for direct uploads)
gsutil cors set cors.json gs://medora-uploads
```

**CORS Configuration (`cors.json`):**
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

**Estimated Time:** 5 minutes

---

### STEP 6: Set Up Service Account

**Option A: Use Default Service Account (Easiest)**
- Cloud Run automatically uses default service account
- Grant necessary permissions

**Commands:**
```bash
# Get default service account email
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

**Option B: Use Secret Manager for Service Account JSON**
```bash
# Upload service account JSON to Secret Manager
gcloud secrets create firebase-service-account \
  --data-file="server/medora admin service.json"

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor"
```

**Estimated Time:** 10 minutes

---

### STEP 7: Build Docker Image

**Commands:**
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart/server"

# Build and push to Artifact Registry
gcloud builds submit --tag gcr.io/medora-ai/medora-server

# Or use Artifact Registry (recommended)
gcloud artifacts repositories create medora-repo \
  --repository-format=docker \
  --location=us-central1

gcloud builds submit --tag us-central1-docker.pkg.dev/medora-ai/medora-repo/medora-server:latest
```

**Estimated Time:** 5-10 minutes (depends on image size)

---

### STEP 8: Deploy to Cloud Run

**Commands:**
```bash
gcloud run deploy medora-server \
  --image us-central1-docker.pkg.dev/medora-ai/medora-repo/medora-server:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --max-instances 10 \
  --set-env-vars "PORT=8080" \
  --set-env-vars "OPENAI_API_KEY=your-key-here" \
  --set-env-vars "VITE_FIREBASE_API_KEY=your-key" \
  --set-env-vars "VITE_FIREBASE_AUTH_DOMAIN=your-domain" \
  --set-env-vars "VITE_FIREBASE_PROJECT_ID=your-project-id" \
  --set-env-vars "VITE_FIREBASE_STORAGE_BUCKET=medora-uploads" \
  --set-env-vars "GCS_BUCKET_NAME=medora-uploads"
```

**Or use Secret Manager for sensitive data:**
```bash
# Create secrets
gcloud secrets create openai-api-key --data-file=- <<< "your-key"
gcloud secrets create firebase-config --data-file=- <<< '{"apiKey":"...","authDomain":"..."}'

# Deploy with secrets
gcloud run deploy medora-server \
  --image us-central1-docker.pkg.dev/medora-ai/medora-repo/medora-server:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600 \
  --update-secrets OPENAI_API_KEY=openai-api-key:latest \
  --set-env-vars "GCS_BUCKET_NAME=medora-uploads"
```

**Estimated Time:** 5 minutes

---

### STEP 9: Get Deployment URL

**Command:**
```bash
gcloud run services describe medora-server \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'
```

**Output:** `https://medora-server-xxxxx-uc.a.run.app`

**Estimated Time:** 1 minute

---

### STEP 10: Update Frontend

**File:** `.env.local` or environment variables

**Change:**
```javascript
// From:
const API_BASE_URL = 'http://localhost:3001';

// To:
const API_BASE_URL = 'https://medora-server-xxxxx-uc.a.run.app';
```

**Or use environment variable:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

**Estimated Time:** 5 minutes

---

### STEP 11: Test Deployment

**Commands:**
```bash
# Test health endpoint
curl https://medora-server-xxxxx-uc.a.run.app/health

# Test API endpoint
curl -X POST https://medora-server-xxxxx-uc.a.run.app/api/generate-plan \
  -H "Content-Type: application/json" \
  -d '{"assessment":"test","subjective":"test","objective":"test"}'
```

**Estimated Time:** 5 minutes

---

## 📊 Time Estimate

| Phase | Steps | Time |
|-------|-------|------|
| **Preparation** | Update code, Dockerfile | 2-3 hours |
| **GCP Setup** | Project, APIs, Storage | 30 minutes |
| **Build & Deploy** | Build, push, deploy | 20 minutes |
| **Testing** | Test endpoints, frontend | 30 minutes |
| **Total** | | **3.5-4.5 hours** |

---

## 💰 Cost Estimate

### Cloud Run (Pay-per-use)
- **Free Tier:** 2M requests/month, 360K GiB-seconds, 180K vCPU-seconds
- **After Free Tier:**
  - $0.00002400 per vCPU-second
  - $0.00000250 per GiB-second
  - Example: 1M requests/month = ~$50-100/month

### Cloud Storage
- **Free Tier:** 5GB storage, 5GB egress/month
- **After Free Tier:** $0.020 per GB/month

### Total Estimated Cost
- **Low Traffic (< 10K requests/month):** FREE
- **Medium Traffic (10K-1M requests/month):** $50-150/month
- **High Traffic (> 1M requests/month):** $150-500/month

---

## ⚠️ Important Considerations

### 1. File Storage Changes
- **Current:** Local filesystem (`server/uploads/`)
- **Cloud:** Google Cloud Storage bucket
- **Impact:** Need to update multer configuration and file handling

### 2. Environment Variables
- **Current:** `.env.local` file
- **Cloud:** Cloud Run environment variables or Secret Manager
- **Impact:** Need to set all env vars in Cloud Run

### 3. Service Account
- **Current:** Local JSON file
- **Cloud:** Default service account or Secret Manager
- **Impact:** Need to grant proper permissions

### 4. Data Files
- **Current:** `data/plumb_embeddings.json` (44MB)
- **Cloud:** Already in Firebase (good!)
- **Impact:** No changes needed

### 5. Port Configuration
- **Current:** Port 3001
- **Cloud:** Cloud Run sets PORT env var (usually 8080)
- **Impact:** Use `process.env.PORT || 3001`

---

## 🔧 Required Code Changes Summary

### Files to Modify:

1. **server/server.js**
   - Replace multer diskStorage with memoryStorage
   - Add Cloud Storage upload logic
   - Update file reading to use Cloud Storage
   - Update file cleanup

2. **server/package.json**
   - Add `@google-cloud/storage` dependency

3. **server/Dockerfile** (NEW)
   - Create Dockerfile for containerization

4. **server/.dockerignore** (NEW)
   - Create .dockerignore file

5. **Frontend .env** (UPDATE)
   - Update API_BASE_URL

---

## ✅ Prerequisites

Before starting deployment:

- [ ] Google Cloud account
- [ ] Google Cloud SDK installed
- [ ] Billing enabled on GCP project
- [ ] Firebase project already set up
- [ ] Service account JSON file available
- [ ] All environment variables documented

---

## 🎯 Deployment Options

### Option 1: Manual Deployment (Step-by-step)
- Follow all steps above
- Full control
- Good for learning

### Option 2: Automated Script
- Create deployment script
- One-command deployment
- Faster for repeated deployments

### Option 3: CI/CD Pipeline
- GitHub Actions / Cloud Build
- Automatic deployment on push
- Best for production

---

## 📝 Next Steps (When Ready)

1. ✅ Review this document
2. ✅ Confirm you want to proceed
3. ✅ I'll implement the code changes
4. ✅ Create Dockerfile and build files
5. ✅ Provide deployment commands
6. ✅ Guide you through GCP setup

---

## ❓ Questions to Consider

1. **Which region?** (us-central1, us-east1, etc.)
2. **Memory/CPU?** (2GB/2CPU recommended)
3. **Max instances?** (10 recommended for start)
4. **Authentication?** (Allow unauthenticated for now)
5. **Custom domain?** (Optional, can add later)

---

**Last Updated:** December 6, 2024  
**Status:** Ready for implementation (pending your approval)

