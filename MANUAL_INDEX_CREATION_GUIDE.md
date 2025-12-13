# Manual Firestore Composite Index Creation Guide

## 📋 **Indexes Needed**

You need to create **2 composite indexes** for the `hospital_inventory` collection:

### **Index 1: composition_normalized + stock_quantity**
- Collection: `hospital_inventory`
- Field 1: `composition_normalized` (Ascending)
- Field 2: `stock_quantity` (Ascending)

### **Index 2: medicine_name + stock_quantity**
- Collection: `hospital_inventory`
- Field 1: `medicine_name` (Ascending)
- Field 2: `stock_quantity` (Ascending)

---

## 🚀 **Step-by-Step Instructions**

### **Step 1: Open Firebase Console**
1. Go to: https://console.firebase.google.com/
2. Select your project: **vetqure-pms**

### **Step 2: Navigate to Firestore Indexes**
1. In the left sidebar, click **"Firestore Database"**
2. Click on the **"Indexes"** tab (at the top)
3. You should see a list of existing indexes (if any)

### **Step 3: Create First Index (composition_normalized + stock_quantity)**

1. Click the **"Create Index"** button (usually at the top right)

2. **Collection ID:** Enter `hospital_inventory`

3. **Add Fields:**
   - Click **"Add field"**
   - **Field path:** `composition_normalized`
   - **Order:** Select **"Ascending"** (↑)
   - Click **"Add field"** again
   - **Field path:** `stock_quantity`
   - **Order:** Select **"Ascending"** (↑)

4. **Query scope:** Leave as **"Collection"** (default)

5. Click **"Create"** button

6. You'll see a message: "Index creation in progress"
   - Status will show as "Building" (yellow)
   - Wait 5-10 minutes for it to complete
   - Status will change to "Enabled" (green) when ready

### **Step 4: Create Second Index (medicine_name + stock_quantity)**

1. Click **"Create Index"** button again

2. **Collection ID:** Enter `hospital_inventory`

3. **Add Fields:**
   - Click **"Add field"**
   - **Field path:** `medicine_name`
   - **Order:** Select **"Ascending"** (↑)
   - Click **"Add field"** again
   - **Field path:** `stock_quantity`
   - **Order:** Select **"Ascending"** (↑)

4. **Query scope:** Leave as **"Collection"** (default)

5. Click **"Create"** button

6. Wait for it to build (5-10 minutes)

---

## ✅ **Verification**

After both indexes are created, you should see:

1. **Index 1:**
   - Collection: `hospital_inventory`
   - Fields: `composition_normalized` (Ascending), `stock_quantity` (Ascending)
   - Status: **Enabled** (green)

2. **Index 2:**
   - Collection: `hospital_inventory`
   - Fields: `medicine_name` (Ascending), `stock_quantity` (Ascending)
   - Status: **Enabled** (green)

---

## 📸 **Visual Guide**

### **What the Index Creation Form Looks Like:**

```
┌─────────────────────────────────────────┐
│ Create Index                            │
├─────────────────────────────────────────┤
│ Collection ID:                          │
│ [hospital_inventory            ]        │
│                                         │
│ Fields:                                 │
│ ┌───────────────────────────────────┐ │
│ │ Field path: composition_normalized │ │
│ │ Order: [Ascending ▼]              │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ Field path: stock_quantity        │ │
│ │ Order: [Ascending ▼]              │ │
│ └───────────────────────────────────┘ │
│                                         │
│ Query scope: [Collection ▼]            │
│                                         │
│              [Cancel]  [Create]         │
└─────────────────────────────────────────┘
```

---

## ⏱️ **Timeline**

- **Index Creation:** 5-10 minutes per index
- **Total Time:** ~10-20 minutes for both indexes
- **You'll receive an email** when indexes are ready

---

## 💡 **Important Notes**

1. **The application works WITHOUT these indexes** (uses in-memory filtering)
   - But indexes improve performance significantly
   - Recommended for production use

2. **Index Status:**
   - **Building** (yellow) = Still creating
   - **Enabled** (green) = Ready to use
   - **Error** (red) = Something went wrong

3. **You can use the app while indexes build:**
   - The code filters in memory as a fallback
   - Once indexes are ready, queries will be faster

---

## 🔗 **Direct Links**

- **Firestore Indexes Page:**
  https://console.firebase.google.com/project/vetqure-pms/firestore/indexes

- **Firestore Database:**
  https://console.firebase.google.com/project/vetqure-pms/firestore

---

## ✅ **Quick Checklist**

- [ ] Open Firebase Console
- [ ] Navigate to Firestore → Indexes
- [ ] Create Index 1: `composition_normalized` + `stock_quantity`
- [ ] Create Index 2: `medicine_name` + `stock_quantity`
- [ ] Wait for both to show "Enabled" status
- [ ] Verify both indexes are listed

---

**That's it!** Once both indexes are enabled, your queries will be faster and more efficient.

