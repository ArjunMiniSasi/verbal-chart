# Veterinary Terminology Review

## Issues Found: Text/Context Not Reflecting Veterinary Industry

### 🔴 **Critical Issues - Needs Immediate Change**

#### 1. **"Patient Care" → Should be "Pet Care" or "Animal Care"**
- **Location**: `src/pages/LandingPage.tsx:234`
- **Current**: "Streamline your workflow for faster patient care"
- **Should be**: "Streamline your workflow for faster pet care" or "Streamline your workflow for faster animal care"
- **Reason**: In veterinary context, we care for pets/animals, not "patients" in the human sense

#### 2. **"Medical Terminology" → Should be "Veterinary Terminology"**
- **Location**: `src/pages/LandingPage.tsx:55`
- **Current**: "Advanced speech recognition with 99.8% accuracy for medical terminology"
- **Should be**: "Advanced speech recognition with 99.8% accuracy for veterinary terminology"
- **Reason**: More specific to veterinary practice

#### 3. **"Medical Records" → Should be "Veterinary Records" or "Pet Records"**
- **Location**: `src/pages/LandingPage.tsx:62`
- **Current**: "Perfect medical records without the typing stress"
- **Should be**: "Perfect veterinary records without the typing stress" or "Perfect pet records without the typing stress"
- **Reason**: More accurate for veterinary context

#### 4. **"Medical Accuracy" → Should be "Veterinary Accuracy"**
- **Location**: `src/pages/LandingPage.tsx:333`
- **Current**: "Advanced AI converts speech to structured SOAP format with medical accuracy"
- **Should be**: "Advanced AI converts speech to structured SOAP format with veterinary accuracy"
- **Reason**: More specific to veterinary practice

#### 5. **"Medical-Grade AI" → Should be "Veterinary-Grade AI"**
- **Location**: `src/pages/LandingPage.tsx:458`
- **Current**: "Medical-Grade AI"
- **Should be**: "Veterinary-Grade AI"
- **Reason**: More specific branding for veterinary industry

#### 6. **"Medical Actions" → Should be "Clinical Actions" or "Veterinary Actions"**
- **Location**: `src/pages/PatientTemplate.tsx:222`
- **Current**: "Medical Actions"
- **Should be**: "Clinical Actions" or "Veterinary Actions"
- **Reason**: More appropriate for veterinary context

#### 7. **"Medical History" → Could be "Veterinary History" or "Clinical History"**
- **Location**: `src/pages/PatientTemplate.tsx:298, 321`
- **Current**: "Medical History"
- **Should be**: "Clinical History" or "Veterinary History"
- **Reason**: More appropriate terminology, though "Medical History" is acceptable in veterinary context

#### 8. **"Medical documentation" → Should be "Veterinary documentation"**
- **Location**: `src/pages/LandingPage.tsx:133`
- **Current**: "Transform consultations into complete medical documentation in seconds"
- **Should be**: "Transform consultations into complete veterinary documentation in seconds"
- **Reason**: More specific to veterinary practice

### 🟡 **Moderate Issues - Consider Changing**

#### 9. **"patients" in Testimonials → Should be "pets" or "animals"**
- **Location**: `src/pages/LandingPage.tsx:385`
- **Current**: "I can see 3 more patients per day without working longer hours"
- **Should be**: "I can see 3 more pets per day without working longer hours" or "I can see 3 more animals per day"
- **Reason**: In veterinary context, we typically say "pets" or "animals" rather than "patients"

#### 10. **"Medical History" Component Name**
- **Location**: `src/components/MedicalHistory.tsx`
- **Current**: Component named "MedicalHistory"
- **Consider**: Renaming to "ClinicalHistory" or "VeterinaryHistory"
- **Note**: This is acceptable but could be more specific

### ✅ **Acceptable Terms (No Change Needed)**

These terms are commonly used in veterinary practice and are acceptable:
- "SOAP notes" - Standard in veterinary practice
- "Consultation" - Used in veterinary context
- "Diagnosis" - Standard veterinary term
- "Prescription" - Standard veterinary term
- "Vaccination" - Standard veterinary term
- "Examination" - Standard veterinary term
- "Owner" - Standard veterinary term for pet owners

### 📋 **Summary of Required Changes**

1. **LandingPage.tsx**:
   - Line 55: "medical terminology" → "veterinary terminology"
   - Line 62: "medical records" → "veterinary records"
   - Line 133: "medical documentation" → "veterinary documentation"
   - Line 234: "patient care" → "pet care"
   - Line 333: "medical accuracy" → "veterinary accuracy"
   - Line 385: "patients" → "pets"
   - Line 458: "Medical-Grade AI" → "Veterinary-Grade AI"

2. **PatientTemplate.tsx**:
   - Line 222: "Medical Actions" → "Clinical Actions"
   - Line 298, 321: Consider "Medical History" → "Clinical History" (optional)

3. **Component Files**:
   - Consider renaming `MedicalHistory.tsx` to `ClinicalHistory.tsx` (optional)

### 🎯 **Recommended Priority**

**High Priority** (Change immediately):
- "patient care" → "pet care"
- "Medical-Grade AI" → "Veterinary-Grade AI"
- "patients" in testimonials → "pets"

**Medium Priority** (Change for better clarity):
- "medical terminology" → "veterinary terminology"
- "medical records" → "veterinary records"
- "medical accuracy" → "veterinary accuracy"
- "Medical Actions" → "Clinical Actions"

**Low Priority** (Optional improvements):
- "Medical History" → "Clinical History"
- Component renaming

