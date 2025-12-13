# Deployment Instructions for Enhanced generatePlan Function

## 📋 Summary

**No new Cloud Function was created.** We enhanced the existing `generatePlan` function with medication extraction and inventory matching features.

## ✅ What Changed

- **File Modified:** `functions/index.js`
- **Function Enhanced:** `exports.generatePlan` (existing function)
- **New Helper Functions Added:**
  - `extractMedicationsFromPlan()` - Helper function (not a Cloud Function)
  - `matchMedicationsWithInventory()` - Helper function (not a Cloud Function)
  - `normalizeComposition()` - Helper function
  - `stringSimilarity()` - Helper function

## 🚀 Deployment Steps

### Step 1: Navigate to Project Directory
```bash
cd "/Users/vams/VAMS/VAMS WEB Applications/verbal-chart"
```

### Step 2: Install Dependencies (if needed)
```bash
cd functions
npm install
cd ..
```

### Step 3: Deploy the Updated Function

**Option A: Deploy Only generatePlan (Recommended)**
```bash
firebase deploy --only functions:generatePlan
```

**Option B: Deploy All Functions**
```bash
firebase deploy --only functions
```

### Step 4: Verify Deployment

After deployment, test the function:
```bash
curl -X POST https://us-central1-YOUR_PROJECT.cloudfunctions.net/generatePlan \
  -H "Content-Type: application/json" \
  -d '{
    "assessment": "Bacterial infection",
    "subjective": "Patient showing signs of infection",
    "objective": "Elevated temperature, lethargy"
  }'
```

## 🔍 What Gets Deployed

When you deploy, Firebase will:
1. ✅ Update the existing `generatePlan` function
2. ✅ Include all new helper functions
3. ✅ Preserve all existing functionality
4. ✅ Add new optional features (extraction & matching)

## ⚠️ Important Notes

1. **No Breaking Changes:** The function still works exactly as before
2. **Backward Compatible:** Old clients will continue to work
3. **Graceful Fallback:** If extraction/matching fails, plan text is still returned
4. **No New Endpoints:** Same URL, same function name

## 📊 Before vs After

### Before Deployment
- Function returns: `{ plan, plumb_references, plumb_available }`

### After Deployment
- Function returns: `{ plan, plumb_references, plumb_available, extracted_medications, ... }`
- New fields are **optional** - function still works if they're missing

## 🧪 Testing After Deployment

1. **Test Normal Flow:**
   - Generate a plan with medications
   - Check if `extracted_medications` field appears in response
   - Verify prescription table appears in frontend

2. **Test Fallback:**
   - If extraction fails, verify plan text is still returned
   - Verify frontend shows plan text view (not broken)

3. **Test Inventory Matching:**
   - Verify medications are matched with `hospital_inventory` collection
   - Check match scores and stock information

## 📝 Deployment Checklist

- [ ] Code reviewed and tested locally (if possible)
- [ ] Dependencies installed (`cd functions && npm install`)
- [ ] Firebase CLI logged in (`firebase login`)
- [ ] Project ID correct in `.firebaserc`
- [ ] Deploy command executed
- [ ] Function URL verified
- [ ] Test request sent
- [ ] Response verified (check for `extracted_medications` field)
- [ ] Frontend tested with new response

## 🔄 Rollback (If Needed)

If something goes wrong, you can:
1. Revert `functions/index.js` to previous version
2. Redeploy: `firebase deploy --only functions:generatePlan`

Or deploy a specific version:
```bash
firebase functions:config:get
# Then redeploy with previous code
```

## ✅ Success Indicators

After successful deployment, you should see:
- ✅ Function deployed successfully message
- ✅ Function URL displayed
- ✅ Response includes `extracted_medications` when medications are found
- ✅ Frontend shows "Prescription Table" tab when medications are available
- ✅ No errors in Firebase Functions logs

## 🐛 Troubleshooting

**If deployment fails:**
1. Check Firebase CLI is logged in: `firebase login`
2. Verify project ID: `firebase projects:list`
3. Check function syntax: `cd functions && node -c index.js`
4. Review logs: `firebase functions:log --only generatePlan`

**If function doesn't work:**
1. Check logs: `firebase functions:log --only generatePlan`
2. Verify environment variables: `firebase functions:config:get`
3. Test with curl (see Step 4 above)
4. Check Firestore permissions for `hospital_inventory` collection

---

**Ready to deploy?** Run:
```bash
firebase deploy --only functions:generatePlan
```

