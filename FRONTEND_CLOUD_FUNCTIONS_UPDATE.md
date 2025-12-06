# Frontend Update for Cloud Functions

## ✅ Code Updated

The frontend code has been updated to automatically detect and use Cloud Functions URLs when deployed.

### How It Works

The code now checks if the `API_BASE_URL` contains `cloudfunctions.net` and uses the correct endpoint format:

- **Local Server:** `/api/transcribe`, `/api/generate-soap`, `/api/generate-plan`
- **Cloud Functions:** `/transcribe`, `/generateSoap`, `/generatePlan`

### Files Updated

1. **`src/lib/api.ts`**
   - `transcribeAudio()` - Updated to use `/transcribe` for Cloud Functions
   - `generateSoapNote()` - Updated to use `/generateSoap` for Cloud Functions

2. **`src/components/SOAPEditor.tsx`**
   - `generateSOA()` - Updated to use `/generateSoap` for Cloud Functions
   - `generatePlan()` - Updated to use `/generatePlan` for Cloud Functions

---

## 🔧 Environment Variable Setup

### For Local Development

Create or update `.env.local`:

```bash
VITE_API_URL=http://localhost:3001
```

### For Production (Cloud Functions)

Update `.env.local` or set in your deployment platform:

```bash
VITE_API_URL=https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net
```

**Replace `YOUR_PROJECT_ID` with your actual Firebase project ID.**

---

## 📋 Endpoint Mapping

| Feature | Local Server | Cloud Functions |
|---------|-------------|-----------------|
| Transcribe | `/api/transcribe` | `/transcribe` |
| Generate SOAP | `/api/generate-soap` | `/generateSoap` |
| Generate Plan | `/api/generate-plan` | `/generatePlan` |

---

## ✅ Status

- ✅ Code automatically detects Cloud Functions vs Local Server
- ✅ No code changes needed when switching between environments
- ✅ Just update `VITE_API_URL` environment variable

---

## 🚀 Next Steps

1. **Deploy Cloud Functions:**
   ```bash
   firebase deploy --only functions
   ```

2. **Get Your Function URLs:**
   After deployment, Firebase will show you the URLs like:
   ```
   https://us-central1-YOUR_PROJECT.cloudfunctions.net/transcribe
   https://us-central1-YOUR_PROJECT.cloudfunctions.net/generateSoap
   https://us-central1-YOUR_PROJECT.cloudfunctions.net/generatePlan
   ```

3. **Update Environment Variable:**
   Set `VITE_API_URL` to your Cloud Functions base URL (without the function name)

4. **Rebuild Frontend:**
   ```bash
   npm run build
   ```

5. **Deploy Frontend:**
   ```bash
   firebase deploy --only hosting
   ```

---

**The UI will now automatically call Cloud Functions when `VITE_API_URL` points to a Cloud Functions URL!** ✅

