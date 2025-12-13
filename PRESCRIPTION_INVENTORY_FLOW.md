# Prescription Inventory Matching System - Structure & Flow

## 🎯 **Objective**
Transform the generated treatment plan into a hospital-friendly prescription format where:
- Medications from the LLM-generated plan are matched against hospital inventory
- Doctors can select from available brands/medicines in inventory
- Stock availability and details are displayed
- Final prescription is created in a structured table format

---

## 📊 **Current Flow (Before Enhancement)**

```
1. User clicks "Generate Plan" button
   ↓
2. Frontend calls: POST /generatePlan
   Body: { subjective, objective, assessment, k: 5 }
   ↓
3. Backend (Cloud Function):
   - Searches Plumb data from Firebase
   - Generates plan text using LLM (gpt-4o-mini)
   - Returns: { plan: "text", plumb_references: [...], plumb_available: true }
   ↓
4. Frontend displays plan as formatted text in SOAPEditor
   - Parses into: Diagnosis, Medication, Follow-up sections
   - Shows as editable textareas
```

---

## 🚀 **Proposed Enhanced Flow**

```
1. User clicks "Generate Plan" button
   ↓
2. Frontend calls: POST /generatePlan
   Body: { subjective, objective, assessment, k: 5 }
   ↓
3. Backend (Cloud Function):
   a) Generate plan text (existing logic)
   b) Extract medications from plan text using LLM
   c) Match medications against hospital_inventory collection
   d) Return enhanced response:
      {
        plan: "text",
        plumb_references: [...],
        plumb_available: true,
        extracted_medications: [
          {
            medication_name: "Amoxicillin",
            dosage: "10-20 mg/kg",
            frequency: "BID",
            suggested_composition: "amoxicillin",
            inventory_matches: [
              {
                inventory_id: "inv_123",
                brand_name: "Amoxi-Vet",
                composition: "amoxicillin trihydrate",
                strength: "250mg",
                form: "tablet",
                stock_quantity: 150,
                unit: "tablets",
                expiry_date: "2025-12-31",
                match_score: 0.95
              },
              {
                inventory_id: "inv_456",
                brand_name: "VetAmox",
                composition: "amoxicillin",
                strength: "500mg",
                form: "capsule",
                stock_quantity: 75,
                unit: "capsules",
                expiry_date: "2025-06-30",
                match_score: 0.88
              }
            ]
          }
        ]
      }
   ↓
4. Frontend displays:
   a) Original plan text (read-only or editable)
   b) NEW: Prescription Table with:
      - Each medication as a row
      - Dropdown to select from inventory_matches
      - Display: brand name, strength, form, stock, expiry
      - Input fields: quantity, instructions
      - Final prescription preview
   ↓
5. User selects medicines from dropdowns
   ↓
6. Final prescription is generated and saved
```

---

## 🗂️ **Firebase Collection Structure**

### **Collection: `hospital_inventory`**

```javascript
{
  id: "inv_123",
  medicine_name: "Amoxicillin",           // Generic name
  brand_name: "Amoxi-Vet",                // Brand name
  composition: "amoxicillin trihydrate",  // Active ingredient(s)
  composition_normalized: "amoxicillin",  // Normalized for matching
  strength: "250mg",                      // Dosage strength
  form: "tablet",                         // tablet, capsule, liquid, injection, etc.
  unit: "tablets",                        // Unit of measurement
  stock_quantity: 150,                    // Current stock
  min_stock_level: 20,                   // Alert threshold
  expiry_date: "2025-12-31",             // Expiry date
  batch_number: "BATCH-2024-001",        // Batch number
  supplier: "VetPharma Inc",              // Supplier name
  cost_per_unit: 2.50,                   // Cost per unit
  category: "antibiotic",                 // Medicine category
  indications: ["bacterial infections", "respiratory infections"], // Use cases
  contraindications: ["penicillin allergy"], // Warnings
  created_at: Timestamp,
  updated_at: Timestamp
}
```

**Indexes needed:**
- `composition_normalized` (for matching)
- `medicine_name` (for search)
- `stock_quantity` (for filtering low stock)

---

## 🔑 **Key Components & Parameters**

### **1. Backend: Medication Extraction**

**Function:** `extractMedicationsFromPlan(planText)`

**Input:**
- `planText`: String - The generated plan text

**Process:**
- Use LLM (gpt-4o-mini) to extract structured medication data
- Parse medication names, dosages, frequencies from plan text

**Output:**
```javascript
[
  {
    medication_name: "Amoxicillin",
    dosage: "10-20 mg/kg",
    frequency: "BID",
    duration: "7-10 days",
    route: "oral",
    suggested_composition: "amoxicillin"  // Normalized for matching
  }
]
```

**LLM Prompt:**
```
Extract all medications from this treatment plan and return JSON array:
[{
  "medication_name": "generic name",
  "dosage": "dosage with units",
  "frequency": "frequency (e.g., BID, TID)",
  "duration": "duration if mentioned",
  "route": "oral/injection/topical",
  "suggested_composition": "normalized active ingredient"
}]

Plan text: {planText}
```

---

### **2. Backend: Inventory Matching**

**Function:** `matchMedicationsWithInventory(extractedMedications)`

**Input:**
- `extractedMedications`: Array from step 1

**Process:**
1. For each medication:
   - Normalize composition name (lowercase, remove special chars)
   - Query `hospital_inventory` collection:
     ```javascript
     // Fuzzy matching on composition_normalized
     const matches = await adminDb.collection('hospital_inventory')
       .where('composition_normalized', '>=', normalizedComposition)
       .where('composition_normalized', '<=', normalizedComposition + '\uf8ff')
       .where('stock_quantity', '>', 0)  // Only in-stock items
       .get();
     ```
   - Calculate match score (cosine similarity on composition embeddings or string similarity)
   - Sort by match_score and stock_quantity
   - Return top 5 matches per medication

**Output:**
- Enhanced `extracted_medications` array with `inventory_matches` populated

**Match Score Calculation:**
```javascript
function calculateMatchScore(suggested, inventory) {
  // 1. Exact composition match: 1.0
  // 2. Contains match: 0.8-0.9
  // 3. Similarity match (Levenshtein): 0.5-0.8
  // 4. Bonus for high stock: +0.1
  // 5. Penalty for near expiry: -0.1
}
```

---

### **3. Backend: Enhanced generatePlan Response**

**Modified Response Structure:**
```javascript
{
  // Existing fields
  plan: "Diagnosis: ...\n\nMedication: ...\n\nFollow-up: ...",
  plumb_references: [...],
  plumb_available: true,
  
  // NEW: Extracted medications with inventory matches
  extracted_medications: [
    {
      medication_name: "Amoxicillin",
      dosage: "10-20 mg/kg",
      frequency: "BID",
      duration: "7-10 days",
      route: "oral",
      suggested_composition: "amoxicillin",
      inventory_matches: [
        {
          inventory_id: "inv_123",
          brand_name: "Amoxi-Vet",
          composition: "amoxicillin trihydrate",
          strength: "250mg",
          form: "tablet",
          stock_quantity: 150,
          unit: "tablets",
          expiry_date: "2025-12-31",
          match_score: 0.95,
          cost_per_unit: 2.50,
          in_stock: true,
          low_stock_warning: false
        }
      ],
      no_match_found: false  // true if no inventory matches
    }
  ],
  
  // Metadata
  inventory_matching_enabled: true,
  total_medications_extracted: 3,
  medications_with_matches: 2,
  medications_without_matches: 1
}
```

---

### **4. Frontend: Prescription Table Component**

**New Component:** `PrescriptionTable.tsx`

**Props:**
```typescript
interface PrescriptionTableProps {
  extractedMedications: ExtractedMedication[];
  onPrescriptionChange: (prescription: FinalPrescription) => void;
  patientId?: string;
}

interface ExtractedMedication {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  route: string;
  suggested_composition: string;
  inventory_matches: InventoryMatch[];
  no_match_found?: boolean;
}

interface InventoryMatch {
  inventory_id: string;
  brand_name: string;
  composition: string;
  strength: string;
  form: string;
  stock_quantity: number;
  unit: string;
  expiry_date: string;
  match_score: number;
  cost_per_unit?: number;
  in_stock: boolean;
  low_stock_warning: boolean;
}

interface FinalPrescription {
  medications: PrescribedMedication[];
  total_cost?: number;
}

interface PrescribedMedication {
  inventory_id: string;
  brand_name: string;
  strength: string;
  form: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  stock_quantity: number;
  expiry_date: string;
}
```

**UI Structure:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Prescription Table                                              │
├─────────────────────────────────────────────────────────────────┤
│ Medication 1: Amoxicillin                                       │
│ ├─ Suggested: 10-20 mg/kg, BID, 7-10 days                      │
│ ├─ Select Brand: [Dropdown ▼]                                  │
│ │   └─ Amoxi-Vet 250mg tablets (150 in stock) ✓               │
│ │   └─ VetAmox 500mg capsules (75 in stock)                    │
│ ├─ Quantity: [____] tablets                                    │
│ ├─ Instructions: [________________________]                    │
│ └─ Status: ✓ In Stock | ⚠️ Low Stock | ✗ Out of Stock         │
├─────────────────────────────────────────────────────────────────┤
│ Medication 2: Metronidazole                                    │
│ ├─ Suggested: 15 mg/kg, TID, 5 days                           │
│ ├─ Select Brand: [No matches found - Manual entry]             │
│ └─ [Manual Entry Fields]                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**
- Dropdown shows: `Brand Name | Strength | Form | Stock | Expiry`
- Color coding: Green (in stock), Yellow (low stock), Red (out of stock)
- Auto-calculate quantity based on dosage and patient weight (if available)
- Validation: Check stock availability before finalizing
- Final prescription preview

---

### **5. Frontend: Integration with SOAPEditor**

**Modifications to `SOAPEditor.tsx`:**

1. **State Management:**
   ```typescript
   const [extractedMedications, setExtractedMedications] = useState([]);
   const [showPrescriptionTable, setShowPrescriptionTable] = useState(false);
   const [finalPrescription, setFinalPrescription] = useState(null);
   ```

2. **After generatePlan() success:**
   ```typescript
   if (data.extracted_medications) {
     setExtractedMedications(data.extracted_medications);
     setShowPrescriptionTable(true);
   }
   ```

3. **UI Changes:**
   - Add toggle: "View as Prescription Table" button
   - Show `PrescriptionTable` component when `showPrescriptionTable === true`
   - Keep original plan text view as fallback

---

### **6. Backend: Save Final Prescription**

**New Endpoint:** `POST /savePrescription` (optional, for persistence)

**Request:**
```javascript
{
  patient_id: "patient_123",
  visit_id: "visit_456",
  prescription: {
    medications: [...],
    total_cost: 45.50,
    prescribed_by: "doctor_id",
    prescribed_at: Timestamp
  }
}
```

**Response:**
```javascript
{
  prescription_id: "presc_789",
  saved: true
}
```

---

## 📋 **Implementation Steps**

### **Phase 1: Backend Enhancement**
1. ✅ Create `hospital_inventory` collection structure
2. ✅ Implement `extractMedicationsFromPlan()` function
3. ✅ Implement `matchMedicationsWithInventory()` function
4. ✅ Modify `generatePlan` to include medication extraction and matching
5. ✅ Test with sample inventory data

### **Phase 2: Frontend Component**
1. ✅ Create `PrescriptionTable.tsx` component
2. ✅ Create medication selection dropdowns
3. ✅ Add stock display and warnings
4. ✅ Add quantity and instructions inputs
5. ✅ Add prescription preview

### **Phase 3: Integration**
1. ✅ Integrate `PrescriptionTable` into `SOAPEditor.tsx`
2. ✅ Update state management
3. ✅ Add toggle between plan text and prescription table views
4. ✅ Handle edge cases (no matches, out of stock, etc.)

### **Phase 4: Polish & Testing**
1. ✅ Add loading states
2. ✅ Add error handling
3. ✅ Add validation
4. ✅ Test with various scenarios
5. ✅ Add prescription saving functionality (optional)

---

## 🔍 **Key Parameters Being Parsed**

### **Input Parameters (to generatePlan):**
- `subjective`: String - Patient history
- `objective`: String - Clinical findings
- `assessment`: String - Diagnosis/assessment
- `k`: Number - Number of Plumb references (default: 5)

### **Intermediate Parameters (extraction):**
- `planText`: String - Generated plan text
- `extractedMedications`: Array - Structured medication data

### **Matching Parameters:**
- `suggested_composition`: String - Normalized active ingredient
- `inventory_composition_normalized`: String - Inventory item composition
- `match_score`: Number (0-1) - Similarity score
- `stock_quantity`: Number - Available stock
- `expiry_date`: String - Expiry date

### **Output Parameters (to frontend):**
- `extracted_medications`: Array - Medications with inventory matches
- `inventory_matches`: Array - Available inventory items per medication
- `final_prescription`: Object - Selected medications with quantities

---

## 🎨 **UI/UX Considerations**

1. **Visual Hierarchy:**
   - Generated plan text (read-only) at top
   - Prescription table below with clear separation
   - Final prescription preview at bottom

2. **User Flow:**
   - Generate plan → See text → Click "Convert to Prescription" → Select medicines → Review → Finalize

3. **Error States:**
   - No inventory matches: Show manual entry option
   - Out of stock: Show warning, suggest alternatives
   - Low stock: Show warning badge

4. **Accessibility:**
   - Clear labels for all inputs
   - Keyboard navigation
   - Screen reader support

---

## 🚨 **Edge Cases to Handle**

1. **No inventory matches found:**
   - Show manual entry fields
   - Allow doctor to enter custom medication

2. **Out of stock:**
   - Show warning
   - Suggest similar alternatives
   - Allow manual override with warning

3. **Multiple matches with same composition:**
   - Sort by: match_score → stock_quantity → expiry_date
   - Show all options in dropdown

4. **Expired or near-expiry items:**
   - Show expiry warning
   - Filter out expired items (or show with warning)

5. **Partial matches:**
   - Show match confidence score
   - Allow doctor to review and select

---

## 📊 **Data Flow Diagram**

```
┌─────────────┐
│   Frontend  │
│ SOAPEditor  │
└──────┬──────┘
       │ POST /generatePlan
       │ { subjective, objective, assessment }
       ↓
┌──────────────────────────────────────┐
│   Backend: generatePlan Function     │
├──────────────────────────────────────┤
│ 1. Search Plumb data                 │
│ 2. Generate plan text (LLM)          │
│ 3. Extract medications (LLM)         │
│ 4. Match with inventory              │
│ 5. Return enhanced response           │
└──────┬───────────────────────────────┘
       │ Response: { plan, extracted_medications }
       ↓
┌──────────────────────────────────────┐
│   Frontend: PrescriptionTable        │
├──────────────────────────────────────┤
│ 1. Display medications               │
│ 2. Show inventory matches dropdowns  │
│ 3. User selects medicines            │
│ 4. User enters quantities            │
│ 5. Generate final prescription       │
└──────┬───────────────────────────────┘
       │ Final Prescription
       ↓
┌──────────────────────────────────────┐
│   Save to Firestore (optional)       │
│   Collection: prescriptions           │
└──────────────────────────────────────┘
```

---

## ✅ **Success Criteria**

1. ✅ Medications are accurately extracted from generated plan
2. ✅ Inventory matching finds relevant medicines with high accuracy
3. ✅ Doctors can easily select from available brands
4. ✅ Stock information is clearly displayed
5. ✅ Final prescription is properly formatted
6. ✅ System handles edge cases gracefully
7. ✅ UI is intuitive and hospital-friendly

---

## 🔄 **Next Steps**

If you're convinced with this structure, we can start building:

1. **First:** Create the `hospital_inventory` collection structure and sample data
2. **Second:** Implement medication extraction in backend
3. **Third:** Implement inventory matching logic
4. **Fourth:** Create frontend `PrescriptionTable` component
5. **Fifth:** Integrate everything together

Let me know if you'd like any modifications to this structure before we begin implementation!

