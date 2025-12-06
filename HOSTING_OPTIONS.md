# Hosting Options for server.js - Medora AI Backend

## ✅ YES, It's Possible!

Your `server.js` can be hosted on **Google Cloud Platform** (GCP). Here are the best options:

---

## 🎯 Recommended Options

### 1. **Google Cloud Run** ⭐ (BEST CHOICE)

**Why it's perfect:**
- ✅ Supports Express.js servers out of the box
- ✅ Handles file uploads (multer) perfectly
- ✅ Auto-scales (0 to N instances)
- ✅ Pay only for what you use (serverless)
- ✅ Supports long-running processes
- ✅ Easy deployment
- ✅ Built-in HTTPS
- ✅ Can handle 50MB file uploads
- ✅ Supports environment variables
- ✅ Works with Firebase Admin SDK

**Limitations:**
- ⚠️ Request timeout: 60 minutes (max)
- ⚠️ Memory: Up to 8GB per instance
- ⚠️ CPU: Up to 4 vCPUs per instance
- ⚠️ Ephemeral storage: 32GB (files deleted after request)

**Cost:** ~$0.00002400 per vCPU-second, ~$0.00000250 per GiB-second

**Process:**
1. Containerize your server (Docker)
2. Push to Google Container Registry (GCR) or Artifact Registry
3. Deploy to Cloud Run
4. Set environment variables
5. Done!

---

### 2. **Google App Engine** (Alternative)

**Why it works:**
- ✅ Fully managed platform
- ✅ Auto-scaling
- ✅ Built-in load balancing
- ✅ Supports Express.js
- ✅ File uploads work (with Cloud Storage)

**Limitations:**
- ⚠️ More complex setup
- ⚠️ File storage must use Cloud Storage (not local filesystem)
- ⚠️ Request timeout: 60 seconds (standard), 60 minutes (flexible)
- ⚠️ More expensive than Cloud Run

**Best for:** Long-term, enterprise applications

---

### 3. **Google Compute Engine (GCE)** (Traditional VPS)

**Why it works:**
- ✅ Full control (like your own server)
- ✅ No timeout limits
- ✅ Persistent disk storage
- ✅ Can run exactly as you do locally

**Limitations:**
- ⚠️ You manage everything (updates, security, scaling)
- ⚠️ Always running (costs even when idle)
- ⚠️ Need to set up load balancer, auto-scaling manually

**Best for:** When you need full control or specific requirements

---

### 4. **Firebase Cloud Functions** ❌ (NOT RECOMMENDED)

**Why it's NOT ideal:**
- ❌ Request timeout: 9 minutes (max) - too short for your operations
- ❌ Memory limit: 8GB (might be okay)
- ❌ Cold starts can be slow
- ❌ File uploads are complex (need Cloud Storage)
- ❌ Not designed for long-running Express servers
- ❌ Better for individual HTTP functions, not full Express apps

**Verdict:** Don't use this for your Express server

---

## 📋 What Your Server Needs

Based on your `server.js`:

### Required Features:
1. ✅ **Express.js** - Supported by all GCP options
2. ✅ **File Uploads (Multer)** - Cloud Run & App Engine support
3. ✅ **File System (fs)** - Cloud Run (ephemeral), App Engine (Cloud Storage)
4. ✅ **Firebase Admin SDK** - Works on all GCP services
5. ✅ **OpenAI API** - External API, works from anywhere
6. ✅ **PDF Parsing** - Works on all platforms
7. ✅ **Long-running processes** - Cloud Run (60 min), App Engine Flexible (60 min)

### Environment Variables Needed:
- `OPENAI_API_KEY`
- `PORT` (auto-set by Cloud Run)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `SERVICE_ACCOUNT_PATH` (or use default service account)

---

## 🚀 Recommended Deployment Process (Cloud Run)

### Step 1: Prepare Your Code

**Changes needed:**
1. **File Storage**: Move from local filesystem to **Cloud Storage**
   - Currently: `server/uploads/` (local)
   - Change to: Google Cloud Storage bucket
   - Update multer to use Cloud Storage

2. **Environment Variables**: Use Cloud Run environment variables
   - Remove `.env.local` dependency
   - Set variables in Cloud Run console

3. **Service Account**: Use default service account or upload JSON
   - Cloud Run can use default service account
   - Or store service account JSON in Cloud Storage/Secret Manager

### Step 2: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY server/package*.json ./
RUN npm install --production

# Copy server code
COPY server/ ./

# Expose port (Cloud Run sets PORT env var)
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

### Step 3: Build & Deploy

```bash
# Install Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Build container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/medora-server

# Deploy to Cloud Run
gcloud run deploy medora-server \
  --image gcr.io/YOUR_PROJECT_ID/medora-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_key \
  --set-env-vars VITE_FIREBASE_API_KEY=your_key \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

### Step 4: Update Frontend

Change API base URL:
```javascript
// From: http://localhost:3001
// To: https://medora-server-xxxxx.run.app
const API_BASE_URL = process.env.VITE_API_URL || 'https://your-cloud-run-url.run.app';
```

---

## 💰 Cost Estimates

### Cloud Run (Recommended)
- **Free Tier**: 2 million requests/month, 360,000 GiB-seconds, 180,000 vCPU-seconds
- **After Free Tier**: 
  - $0.00002400 per vCPU-second
  - $0.00000250 per GiB-second
  - Example: 1M requests/month with 2GB RAM, 2 vCPU = ~$50-100/month

### App Engine
- **Free Tier**: 28 hours/day of F1 instances
- **After Free Tier**: ~$50-150/month (depending on traffic)

### Compute Engine
- **Smallest (e2-micro)**: ~$7/month (always running)
- **Recommended (e2-small)**: ~$15/month

---

## ⚠️ Important Considerations

### 1. File Storage
**Current:** Local filesystem (`server/uploads/`)
**Cloud Solution:** Google Cloud Storage bucket

**Why:** Cloud Run has ephemeral storage (files deleted after request). You need persistent storage.

**Solution:** Use `@google-cloud/storage` package:
```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');
```

### 2. Service Account
**Current:** Local JSON file (`medora admin service.json`)
**Cloud Solution:** 
- Option A: Use default service account (easiest)
- Option B: Store JSON in Secret Manager
- Option C: Store in Cloud Storage

### 3. Data Files
**Current:** `data/plumb_embeddings.json` (44MB)
**Cloud Solution:** 
- Already in Firebase (good!)
- Or store in Cloud Storage if needed

### 4. Environment Variables
**Current:** `.env.local` file
**Cloud Solution:** Cloud Run environment variables or Secret Manager

---

## 📊 Comparison Table

| Feature | Cloud Run | App Engine | Compute Engine | Firebase Functions |
|---------|-----------|------------|----------------|-------------------|
| **Express.js** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Complex |
| **File Uploads** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Complex |
| **Auto-scaling** | ✅ Yes | ✅ Yes | ❌ Manual | ✅ Yes |
| **Cost (low traffic)** | 💰 Low | 💰 Medium | 💰 Medium | 💰 Low |
| **Setup Complexity** | ⭐⭐ Easy | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Hard | ⭐⭐⭐ Medium |
| **Request Timeout** | 60 min | 60 min | Unlimited | 9 min ❌ |
| **File Storage** | Cloud Storage | Cloud Storage | Local/Cloud | Cloud Storage |
| **Best For** | ⭐ Recommended | Enterprise | Full Control | Simple Functions |

---

## 🎯 My Recommendation

**Use Google Cloud Run** because:
1. ✅ Easiest to deploy
2. ✅ Auto-scales to zero (saves money)
3. ✅ Handles your Express server perfectly
4. ✅ Supports all your requirements
5. ✅ Good free tier
6. ✅ Built-in HTTPS
7. ✅ Easy environment variable management

**What you need to change:**
1. Move file uploads to Cloud Storage (1-2 hours work)
2. Update environment variable loading (30 min)
3. Create Dockerfile (30 min)
4. Deploy (15 min)

**Total setup time:** ~2-3 hours

---

## 📝 Next Steps (When Ready)

1. ✅ Create Google Cloud Project
2. ✅ Enable Cloud Run API
3. ✅ Create Cloud Storage bucket
4. ✅ Update server.js to use Cloud Storage
5. ✅ Create Dockerfile
6. ✅ Build and deploy
7. ✅ Test endpoints
8. ✅ Update frontend API URL

---

## ❓ Questions to Consider

1. **Traffic Volume?** 
   - Low (< 10K requests/month): Cloud Run free tier
   - Medium (10K-1M): Cloud Run paid
   - High (> 1M): Consider App Engine or multiple Cloud Run services

2. **File Storage Size?**
   - Small (< 1GB): Cloud Storage is fine
   - Large (> 10GB): Consider Cloud Storage lifecycle policies

3. **Budget?**
   - Tight: Cloud Run (pay per use)
   - Flexible: App Engine or Compute Engine

4. **Team Size?**
   - Solo/Small: Cloud Run (easier)
   - Large: App Engine (more features)

---

## 🔗 Useful Links

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud Storage Node.js Client](https://cloud.google.com/nodejs/docs/reference/storage/latest)
- [Deploying Express to Cloud Run](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)

---

**Last Updated:** December 6, 2024
**Status:** ✅ Feasible - Cloud Run is the best option

