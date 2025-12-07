# Firebase Cloud Functions Migration Guide

## ⚠️ Important Considerations

### Limitations of Firebase Cloud Functions:

1. **Request Timeout: 9 minutes (max)**
   - Your transcription/PDF processing might take longer
   - Need to optimize or use background functions

2. **Express.js Support: Limited**
   - Can use Express, but not ideal for full server
   - Better for individual HTTP functions

3. **File Uploads: Complex**
   - Need Cloud Storage for file handling
   - Multer needs special configuration

4. **Cold Starts: Can be slow**
   - First request after inactivity can be slow
   - Keep functions warm or use min instances

5. **Memory: Up to 8GB** ✅ (Should be enough)

---

## 📋 What Needs to Change

### 1. Project Structure

**Current:**
```
verbal-chart/
├── server/
│   ├── server.js (Express app)
│   └── package.json
```

**New Structure:**
```
verbal-chart/
├── functions/
│   ├── index.js (Cloud Functions)
│   ├── package.json
│   └── src/
│       ├── transcription.js
│       ├── generate-soap.js
│       ├── generate-plan.js
│       └── utils/
│           ├── storage.js
│           └── firebase.js
```

---

### 2. Code Restructuring

#### Current: Express App
```javascript
// server/server.js
const app = express();
app.post('/api/transcribe', ...);
app.post('/api/generate-soap', ...);
app.post('/api/generate-plan', ...);
app.listen(PORT);
```

#### New: Cloud Functions
```javascript
// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const app = express();

app.post('/api/transcribe', ...);
app.post('/api/generate-soap', ...);
app.post('/api/generate-plan', ...);

exports.api = functions.https.onRequest(app);
// Or individual functions:
exports.transcribe = functions.https.onCall(...);
exports.generateSoap = functions.https.onCall(...);
```

---

### 3. File Storage Changes

#### Current: Local Filesystem
```javascript
const uploadDir = path.resolve(__dirname, 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir)
});
```

#### New: Cloud Storage
```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('your-bucket-name');

// Use memory storage, then upload to Cloud Storage
const multerStorage = multer.memoryStorage();
const upload = multer({ storage: multerStorage });

// After multer, upload to Cloud Storage
const file = bucket.file(`uploads/${filename}`);
await file.save(buffer, { metadata: { contentType: mimetype } });
```

**Files to Update:**
- All multer configurations
- File reading (transcription, PDF processing)
- File cleanup (delete from Cloud Storage)

---

### 4. Environment Variables

#### Current: .env.local file
```javascript
require('dotenv').config({ path: '../.env.local' });
```

#### New: Firebase Functions Config
```bash
# Set using Firebase CLI
firebase functions:config:set \
  openai.api_key="your-key" \
  firebase.project_id="your-project"
```

**Or use Secret Manager (Recommended):**
```javascript
const functions = require('firebase-functions');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/OPENAI_API_KEY/versions/latest'
});
const apiKey = version.payload.data.toString();
```

---

### 5. Service Account

#### Current: Local JSON file
```javascript
const serviceAccount = require('./medora admin service.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

#### New: Default Service Account
```javascript
// Cloud Functions automatically use default service account
// Just initialize without credentials
admin.initializeApp();
```

**Or use Secret Manager:**
```javascript
// Store service account JSON in Secret Manager
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/FIREBASE_SERVICE_ACCOUNT/versions/latest'
});
const serviceAccount = JSON.parse(version.payload.data.toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

---

### 6. Request Timeout Handling

#### Current: No timeout (runs until complete)
```javascript
app.post('/api/transcribe', async (req, res) => {
  // Can take as long as needed
});
```

#### New: 9-minute timeout limit
```javascript
// Option 1: Optimize to finish within 9 minutes
exports.transcribe = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    // Must complete within 9 minutes
  });

// Option 2: Use background function for long operations
exports.processTranscription = functions
  .runWith({ timeoutSeconds: 540 })
  .tasks.taskQueue('transcription-queue')
  .onDispatch(async (data) => {
    // Can be triggered asynchronously
  });
```

**Operations that might exceed 9 minutes:**
- Large PDF processing
- Multiple transcriptions
- Batch embeddings generation

**Solutions:**
- Split into smaller chunks
- Use Cloud Tasks for background processing
- Use Cloud Run for long operations

---

### 7. CORS Configuration

#### Current: Express CORS middleware
```javascript
app.use(cors());
```

#### New: Cloud Functions CORS
```javascript
const cors = require('cors')({ origin: true });

exports.api = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Your Express app
  });
});
```

---

### 8. Package.json Changes

#### Current: server/package.json
```json
{
  "name": "medora-server",
  "main": "server.js",
  "dependencies": {
    "express": "^5.2.1",
    "multer": "^2.0.2",
    ...
  }
}
```

#### New: functions/package.json
```json
{
  "name": "functions",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^13.6.0",
    "firebase-functions": "^5.0.0",
    "express": "^5.2.1",
    "@google-cloud/storage": "^7.0.0",
    "multer": "^2.0.2",
    ...
  }
}
```

---

### 9. Deployment Process

#### Current: Run locally
```bash
cd server && node server.js
```

#### New: Deploy to Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init functions

# Deploy
firebase deploy --only functions
```

---

## 🔄 Migration Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Functions
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
firebase init functions
```

**Options:**
- Language: JavaScript
- ESLint: Yes
- Install dependencies: Yes

### Step 3: Create Functions Structure
```bash
mkdir -p functions/src/utils
```

### Step 4: Move Code to Functions
- Convert Express routes to Cloud Functions
- Update file storage to Cloud Storage
- Update environment variables
- Update service account initialization

### Step 5: Update Dependencies
```bash
cd functions
npm install @google-cloud/storage @google-cloud/secret-manager
```

### Step 6: Test Locally
```bash
firebase emulators:start --only functions
```

### Step 7: Deploy
```bash
firebase deploy --only functions
```

---

## 📝 Code Conversion Examples

### Example 1: Health Check

**Current:**
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Medora Backend running' });
});
```

**New:**
```javascript
exports.health = functions.https.onRequest((req, res) => {
  res.json({ status: 'OK', message: 'Medora Backend running' });
});
```

### Example 2: Transcription Endpoint

**Current:**
```javascript
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  // Handle transcription
});
```

**New:**
```javascript
const cors = require('cors')({ origin: true });

exports.transcribe = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      // Handle file upload from Cloud Storage
      // Process transcription
    });
  });
```

### Example 3: Generate Plan

**Current:**
```javascript
app.post('/api/generate-plan', async (req, res) => {
  // Generate plan
});
```

**New:**
```javascript
exports.generatePlan = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      // Generate plan
    });
  });
```

---

## ⚠️ Challenges & Solutions

### Challenge 1: 9-Minute Timeout

**Problem:** Long operations might exceed timeout

**Solutions:**
1. Optimize code to finish faster
2. Split into smaller functions
3. Use Cloud Tasks for background processing
4. Use Cloud Run for specific long operations

### Challenge 2: File Uploads

**Problem:** Multer with local storage doesn't work

**Solution:**
- Use multer memory storage
- Upload to Cloud Storage immediately
- Process from Cloud Storage

### Challenge 3: Cold Starts

**Problem:** First request can be slow

**Solutions:**
1. Keep functions warm (min instances)
2. Use Cloud Run for critical paths
3. Optimize function size

### Challenge 4: Express App Structure

**Problem:** Express app needs restructuring

**Solution:**
- Option A: Convert to individual functions
- Option B: Use Express app as single function
- Option C: Hybrid approach

---

## 🎯 Recommended Approach

### Option 1: Single Express Function (Easiest)
```javascript
// functions/index.js
const functions = require('firebase-functions');
const express = require('express');
const app = express();

// All your routes
app.post('/api/transcribe', ...);
app.post('/api/generate-soap', ...);
app.post('/api/generate-plan', ...);

exports.api = functions.https.onRequest(app);
```

**Pros:**
- Minimal code changes
- Keep existing structure
- Easy migration

**Cons:**
- All routes in one function
- Larger function size

### Option 2: Individual Functions (Better)
```javascript
// functions/index.js
exports.transcribe = functions.https.onRequest(...);
exports.generateSoap = functions.https.onRequest(...);
exports.generatePlan = functions.https.onRequest(...);
```

**Pros:**
- Better isolation
- Independent scaling
- Smaller function sizes

**Cons:**
- More code restructuring
- More functions to manage

### Option 3: Hybrid (Recommended)
- Keep Express app for most endpoints
- Separate functions for long operations
- Use Cloud Tasks for background jobs

---

## 📊 Comparison: Cloud Functions vs Cloud Run

| Feature | Cloud Functions | Cloud Run |
|---------|----------------|----------|
| **Timeout** | 9 minutes | 60 minutes |
| **Express Support** | Limited | Full |
| **File Storage** | Cloud Storage only | Cloud Storage |
| **Cold Starts** | Yes | Minimal |
| **Cost** | Pay per invocation | Pay per request |
| **Setup** | Medium | Easy |
| **Best For** | Simple APIs | Full servers |

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

## ✅ Migration Checklist

- [ ] Install Firebase CLI
- [ ] Initialize Firebase Functions
- [ ] Create functions directory structure
- [ ] Convert Express routes to Cloud Functions
- [ ] Update file storage to Cloud Storage
- [ ] Update environment variables
- [ ] Update service account initialization
- [ ] Test locally with emulator
- [ ] Deploy to Firebase
- [ ] Update frontend API URLs
- [ ] Test deployed functions

---

## 🚀 Quick Start Commands

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize (in project root)
firebase init functions

# 4. Test locally
firebase emulators:start --only functions

# 5. Deploy
firebase deploy --only functions
```

---

## 📝 Summary of Changes

### Files to Create:
1. `functions/index.js` - Main functions file
2. `functions/package.json` - Dependencies
3. `firebase.json` - Firebase configuration
4. `.firebaserc` - Project configuration

### Files to Modify:
1. `server/server.js` → `functions/index.js` (restructure)
2. File upload handling (Cloud Storage)
3. Environment variables (Firebase config)
4. Service account (default or Secret Manager)

### Files to Keep:
- All utility functions
- Firebase/Firestore code (mostly unchanged)
- OpenAI integration (unchanged)

---

**Last Updated:** December 6, 2024  
**Status:** Ready for implementation (pending your approval)

