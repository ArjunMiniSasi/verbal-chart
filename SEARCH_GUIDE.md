# Medical Records Search Guide

## Overview
The `extracted_data_summary.json` file contains all 500 medical records structured for easy searching and filtering.

## File Structure

```json
{
  "metadata": {
    "total_records": 500,
    "extraction_date": "...",
    "search_indexes": {...}
  },
  "records": [...],  // All 500 records
  "search_indexes": {
    "by_disease": {...},
    "by_species": {...},
    "by_breed": {...},
    "by_lab_test": {...},
    "by_diagnosis_keyword": {...},
    "by_medication": {...},
    "by_vaccine": {...},
    "by_pet_id": {...}
  },
  "statistics": {...}
}
```

## Record Structure

Each record in the `records` array contains:

```json
{
  "caseNo": "unique_case_id",
  "petName": "PET_NAME",
  "patientId": "PATIENT_ID",
  "petId": "PET_ID",
  "breed": "Breed Name",
  "species": "Dog|Cat|Unknown",
  "age": 3.5,
  "gender": "Male|Female",
  "ownerName": "Owner Name",
  "visitDate": "2025-05-15T14:25:13.336",
  "caseType": "general",
  "status": "status",
  "doctor": "Doctor Name",
  "diagnosis": {
    "diseaseDiagnosis": "disease name",
    "observation": "observation text",
    "chiefComplaints": "complaints",
    "tentative": "tentative diagnosis",
    "allText": "combined diagnosis text"
  },
  "labTests": [
    {
      "name": "Test Name",
      "date": "date",
      "status": "status",
      "report": "report_url",
      "full_data": {...}
    }
  ],
  "vaccinations": [
    {
      "name": "Vaccine Name",
      "date": "date",
      "nextDate": "next_date",
      "price": 700,
      "full_data": {...}
    }
  ],
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "dosage",
      "timing": "1-0-0",
      "route": "Oral Administration",
      "quantity": 1,
      "full_data": {...}
    }
  ],
  "services": [
    {
      "name": "Service Name",
      "full_data": {...}
    }
  ],
  "treatment": "treatment text",
  "doctorAdvice": "advice text"
}
```

## How to Search

### 1. Search by Disease

```javascript
// Load the data
const data = require('./extracted_data_summary.json');

// Search for records with a specific disease (case-insensitive)
const disease = "fpv".toLowerCase();
const recordIndices = data.search_indexes.by_disease[disease] || [];

// Get the actual records
const records = recordIndices.map(idx => data.records[idx]);
```

### 2. Search by Species

```javascript
// Find all records for Dogs
const dogIndices = data.search_indexes.by_species["dog"] || [];
const dogRecords = dogIndices.map(idx => data.records[idx]);

// Find all records for Cats
const catIndices = data.search_indexes.by_species["cat"] || [];
const catRecords = catIndices.map(idx => data.records[idx]);
```

### 3. Search by Breed

```javascript
// Find all records for a specific breed (case-insensitive)
const breed = "labrador retriever".toLowerCase();
const breedIndices = data.search_indexes.by_breed[breed] || [];
const breedRecords = breedIndices.map(idx => data.records[idx]);
```

### 4. Search by Lab Test

```javascript
// Find all records that had a specific lab test
const testName = "cbc - complete blood test".toLowerCase();
const testIndices = data.search_indexes.by_lab_test[testName] || [];
const testRecords = testIndices.map(idx => data.records[idx]);
```

### 5. Search by Diagnosis Keywords

```javascript
// Find records containing specific keywords in diagnosis
const keyword = "weakness".toLowerCase();
const keywordIndices = data.search_indexes.by_diagnosis_keyword[keyword] || [];
const keywordRecords = keywordIndices.map(idx => data.records[idx]);
```

### 6. Search by Medication

```javascript
// Find all records with a specific medication
const medication = "vanguard dhpp + rabies".toLowerCase();
const medIndices = data.search_indexes.by_medication[medication] || [];
const medRecords = medIndices.map(idx => data.records[idx]);
```

### 7. Search by Vaccine

```javascript
// Find all records with a specific vaccine
const vaccine = "rabies + feligen".toLowerCase();
const vaccineIndices = data.search_indexes.by_vaccine[vaccine] || [];
const vaccineRecords = vaccineIndices.map(idx => data.records[idx]);
```

### 8. Find All Records for a Specific Pet

```javascript
// Find all medical records for a specific pet (by petId)
const petId = "FVH08047-25_1";
const petIndices = data.search_indexes.by_pet_id[petId] || [];
const petRecords = petIndices.map(idx => data.records[idx]);
```

## Advanced Search Examples

### Combine Multiple Criteria

```javascript
// Find all Dog records with CBC tests
const dogIndices = data.search_indexes.by_species["dog"] || [];
const cbcIndices = data.search_indexes.by_lab_test["cbc - complete blood test"] || [];

// Find intersection
const combinedIndices = dogIndices.filter(idx => cbcIndices.includes(idx));
const combinedRecords = combinedIndices.map(idx => data.records[idx]);
```

### Search by Multiple Keywords

```javascript
// Find records with both "weakness" and "anorexia"
const weaknessIndices = data.search_indexes.by_diagnosis_keyword["weakness"] || [];
const anorexiaIndices = data.search_indexes.by_diagnosis_keyword["anorexia"] || [];

const bothIndices = weaknessIndices.filter(idx => anorexiaIndices.includes(idx));
const bothRecords = bothIndices.map(idx => data.records[idx]);
```

### Filter Records Directly

```javascript
// Filter records directly without using indexes
const filteredRecords = data.records.filter(record => {
  return record.species === "Dog" && 
         record.age > 5 && 
         record.labTests.length > 0;
});
```

## Python Search Examples

```python
import json

# Load data
with open('extracted_data_summary.json', 'r') as f:
    data = json.load(f)

# Search by disease
disease = "fpv".lower()
record_indices = data['search_indexes']['by_disease'].get(disease, [])
records = [data['records'][idx] for idx in record_indices]

# Search by species
dog_indices = data['search_indexes']['by_species'].get('dog', [])
dog_records = [data['records'][idx] for idx in dog_indices]

# Search by breed
breed = "labrador retriever".lower()
breed_indices = data['search_indexes']['by_breed'].get(breed, [])
breed_records = [data['records'][idx] for idx in breed_indices]

# Combine criteria
dog_indices = set(data['search_indexes']['by_species'].get('dog', []))
cbc_indices = set(data['search_indexes']['by_lab_test'].get('cbc - complete blood test', []))
combined_indices = list(dog_indices & cbc_indices)
combined_records = [data['records'][idx] for idx in combined_indices]
```

## Statistics Available

The `statistics` object contains:

```json
{
  "unique_diseases": 5,
  "unique_species": 3,
  "unique_breeds": 55,
  "unique_lab_tests": 9,
  "unique_medications": 9,
  "unique_vaccines": 6,
  "unique_pets": 482,
  "species_distribution": {
    "Dog": 93,
    "Cat": 62,
    "Unknown": 345
  },
  "breed_distribution": {
    "unknown": 79,
    "native": 45,
    ...
  }
}
```

## Notes

1. **Case Insensitive**: All search indexes use lowercase keys for case-insensitive searching
2. **Multiple Records per Pet**: Some pets have multiple records (500 records for 482 unique pets)
3. **Empty Fields**: Some fields may be empty strings or empty arrays
4. **Full Data**: Each lab test, medication, vaccine, and service includes a `full_data` field with the complete original data
5. **Species Inference**: Species is inferred from breed name, so some may be "Unknown" if breed doesn't clearly indicate species

## Performance Tips

1. **Use Indexes**: Always use the search indexes for fast lookups instead of filtering all records
2. **Combine Indexes**: For multiple criteria, find intersections of index arrays
3. **Cache Results**: If searching repeatedly, cache the loaded JSON data
4. **Lazy Loading**: For very large datasets, consider loading only the indexes first, then loading specific records as needed
