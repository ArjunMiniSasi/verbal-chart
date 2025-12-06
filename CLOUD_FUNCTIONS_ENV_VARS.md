# Cloud Functions Environment Variables

## ⚠️ Important: `.env.local` is NOT accessible to Cloud Functions

The `.env.local` file is **only for your frontend (Vite/React)**. Cloud Functions run in a separate environment and **cannot** access `.env.local`.

---

## ✅ How Cloud Functions Access Environment Variables

Cloud Functions use **Firebase Functions Config** or **Secret Manager** (recommended for production).

### Current Setup

Your Cloud Functions code reads the OpenAI API key like this:

```javascript
const openai = new OpenAI({
  apiKey: functions.config().openai?.api_key || process.env.OPENAI_API_KEY
});
```

This means it tries:
1. **First:** `functions.config().openai.api_key` (Firebase Functions Config)
2. **Fallback:** `process.env.OPENAI_API_KEY` (only works if set during deployment)

---

## 🔧 Setting Environment Variables for Cloud Functions

### Option 1: Firebase Functions Config (Current Method)

**Set the OpenAI API key:**
```bash
firebase functions:config:set openai.api_key="your-openai-api-key-here"
```

**View current config:**
```bash
firebase functions:config:get
```

**⚠️ Note:** This method is **deprecated** and will stop working in March 2026. Migrate to Secret Manager (Option 2).

---

### Option 2: Secret Manager (Recommended for Production)

**1. Create a secret:**
```bash
echo -n "your-openai-api-key-here" | gcloud secrets create openai-api-key --data-file=-
```

**2. Grant access to Cloud Functions:**
```bash
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**3. Update `functions/index.js` to use Secret Manager:**
```javascript
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

// Get secret
const [version] = await client.accessSecretVersion({
  name: 'projects/YOUR_PROJECT_ID/secrets/openai-api-key/versions/latest',
});
const apiKey = version.payload.data.toString();
```

---

## 📋 Current Status

**✅ OpenAI API Key:** Already set via `functions.config().openai.api_key`

You can verify it's working by checking the Cloud Functions logs. If you see:
- `ERROR: OPENAI_API_KEY is not set!` → The key is missing
- No error → The key is loaded correctly

---

## 🔍 How to Check if Environment Variables are Working

**1. Check Cloud Functions logs:**
```bash
firebase functions:log --only transcribe
```

Look for:
- `ERROR: OPENAI_API_KEY is not set!` → Key is missing
- No error message → Key is loaded

**2. Test the function:**
If transcription works, the API key is correctly configured.

---

## 🚀 Quick Fix: Update OpenAI API Key

If you need to update the OpenAI API key:

```bash
firebase functions:config:set openai.api_key="your-new-key-here"
firebase deploy --only functions
```

---

## 📝 Summary

| Variable | Frontend (.env.local) | Cloud Functions |
|----------|----------------------|-----------------|
| `VITE_API_URL` | ✅ Yes | ❌ No (not needed) |
| `VITE_FIREBASE_*` | ✅ Yes | ❌ No (not needed) |
| `OPENAI_API_KEY` | ❌ No | ✅ Yes (via `functions.config()`) |

**Key Points:**
- `.env.local` is **only** for frontend
- Cloud Functions use `functions.config()` or Secret Manager
- Your OpenAI API key is **already configured** ✅

---

**Last Updated:** December 6, 2024

