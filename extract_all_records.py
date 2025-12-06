#!/usr/bin/env python3
"""
Extract all medical records and structure them for easy searching
"""

import json
from collections import defaultdict
from datetime import datetime

def infer_species(breed):
    """Infer species from breed name"""
    if not breed:
        return "Unknown"
    
    breed_lower = breed.lower()
    
    # Cat indicators
    cat_keywords = ['cat', 'feline', 'persian', 'siamese', 'maine', 'british', 'scottish', 
                   'ragdoll', 'bengal', 'sphynx', 'nadancat', 'nadan']
    if any(keyword in breed_lower for keyword in cat_keywords):
        return "Cat"
    
    # Dog indicators
    dog_keywords = ['dog', 'canine', 'labrador', 'retriever', 'golden', 'poodle', 'german', 
                   'shepherd', 'beagle', 'pug', 'pomeranian', 'shih', 'tzu', 'lhasa', 
                   'apso', 'rottweiler', 'dobermann', 'boxer', 'bulldog', 'husky', 'chihuahua',
                   'dalmatian', 'cocker', 'spaniel', 'bichon', 'maltese', 'yorkie', 'terrier']
    if any(keyword in breed_lower for keyword in dog_keywords):
        return "Dog"
    
    # Bird indicators
    if any(keyword in breed_lower for keyword in ['bird', 'parrot', 'canary', 'cockatiel']):
        return "Bird"
    
    # Rabbit indicators
    if any(keyword in breed_lower for keyword in ['rabbit', 'bunny']):
        return "Rabbit"
    
    return "Unknown"

def extract_lab_test_name(lab_test):
    """Extract lab test name from various formats"""
    if isinstance(lab_test, dict):
        return lab_test.get('name', '') or lab_test.get('testName', '') or ''
    elif isinstance(lab_test, str):
        return lab_test
    return ''

def extract_medication_name(med):
    """Extract medication name from various formats"""
    if isinstance(med, dict):
        return med.get('name', '') or med.get('medicineName', '') or med.get('medicine', '') or ''
    elif isinstance(med, str):
        return med
    return ''

def extract_vaccine_name(vaccine):
    """Extract vaccine name from various formats"""
    if isinstance(vaccine, dict):
        return vaccine.get('name', '') or vaccine.get('vaccineName', '') or ''
    elif isinstance(vaccine, str):
        return vaccine
    return ''

def extract_service_name(service):
    """Extract service name from various formats"""
    if isinstance(service, dict):
        return service.get('name', '') or service.get('serviceName', '') or service.get('service', '') or ''
    elif isinstance(service, str):
        return service
    return ''

def normalize_text(text):
    """Normalize text for searching"""
    if not text:
        return ""
    return str(text).strip().lower()

def extract_all_records(json_file_path, output_file_path):
    """Extract all records and structure for searching"""
    
    print("Loading medical records...")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    records = data.get('data', {})
    total_records = len(records)
    print(f"Processing {total_records} records...")
    
    # Structured data storage
    all_records = []
    
    # Indexes for quick searching
    records_by_disease = defaultdict(list)
    records_by_species = defaultdict(list)
    records_by_breed = defaultdict(list)
    records_by_lab_test = defaultdict(list)
    records_by_diagnosis_keyword = defaultdict(list)
    records_by_medication = defaultdict(list)
    records_by_vaccine = defaultdict(list)
    records_by_pet_id = defaultdict(list)
    
    # Process each record
    for idx, (case_no, record) in enumerate(records.items()):
        if idx % 100 == 0:
            print(f"Processed {idx}/{total_records} records...")
        
        # Extract client details
        client_details = record.get('clientDetails', {})
        breed = client_details.get('breed', '') or 'Unknown'
        age = client_details.get('age', '')
        pet_name = client_details.get('petName', '')
        patient_id = client_details.get('patientId', '')
        pet_id = client_details.get('petId', '')
        gender = client_details.get('gender', '')
        owner_name = client_details.get('ownerName', '')
        
        # Infer species
        species = infer_species(breed)
        
        # Extract diagnosis information
        diagnosis = record.get('diagnosis', {})
        disease_diagnosis = diagnosis.get('diseaseDiagnosis', '') or ''
        observation = diagnosis.get('observation', '') or ''
        chief_complaints = diagnosis.get('chiefComplaints', '') or ''
        tentative = diagnosis.get('tentative', '') or ''
        
        # Combine all diagnosis text for searching
        all_diagnosis_text = ' '.join([
            disease_diagnosis,
            observation,
            chief_complaints,
            tentative
        ]).strip()
        
        # Extract lab tests
        lab_tests_raw = diagnosis.get('labTests', [])
        lab_tests = []
        for lt in lab_tests_raw:
            test_name = extract_lab_test_name(lt)
            if test_name:
                lab_tests.append({
                    'name': test_name,
                    'date': lt.get('date', '') if isinstance(lt, dict) else '',
                    'status': lt.get('status', '') if isinstance(lt, dict) else '',
                    'report': lt.get('report', '') if isinstance(lt, dict) else '',
                    'full_data': lt
                })
        
        # Extract vaccinations
        vaccinations_raw = diagnosis.get('vaccinations', [])
        vaccinations = []
        for v in vaccinations_raw:
            vaccine_name = extract_vaccine_name(v)
            if vaccine_name:
                vaccinations.append({
                    'name': vaccine_name,
                    'date': v.get('vaccinatedDate', '') if isinstance(v, dict) else '',
                    'nextDate': v.get('nextDate', '') if isinstance(v, dict) else '',
                    'price': v.get('price', '') if isinstance(v, dict) else '',
                    'full_data': v
                })
        
        # Extract medications
        medication = record.get('medication', {})
        medications_raw = medication.get('medical', [])
        medications = []
        for m in medications_raw:
            med_name = extract_medication_name(m)
            if med_name:
                medications.append({
                    'name': med_name,
                    'dosage': m.get('dosage', '') if isinstance(m, dict) else '',
                    'timing': m.get('timing', '') if isinstance(m, dict) else '',
                    'route': m.get('route', '') if isinstance(m, dict) else '',
                    'quantity': m.get('quantity', '') if isinstance(m, dict) else '',
                    'full_data': m
                })
        
        # Extract services
        services_raw = medication.get('nonMedical', [])
        services = []
        for s in services_raw:
            service_name = extract_service_name(s)
            if service_name:
                services.append({
                    'name': service_name,
                    'full_data': s
                })
        
        treatment = medication.get('treatment', '') or ''
        doctor_advice = record.get('doctorAdvice', '') or ''
        
        # Build structured record
        structured_record = {
            'caseNo': case_no,
            'petName': pet_name,
            'patientId': patient_id,
            'petId': pet_id,
            'breed': breed,
            'species': species,
            'age': age,
            'gender': gender,
            'ownerName': owner_name,
            'visitDate': record.get('visitedDate', ''),
            'caseType': record.get('caseType', ''),
            'status': record.get('status', ''),
            'doctor': record.get('doctor', ''),
            'diagnosis': {
                'diseaseDiagnosis': disease_diagnosis,
                'observation': observation,
                'chiefComplaints': chief_complaints,
                'tentative': tentative,
                'allText': all_diagnosis_text
            },
            'labTests': lab_tests,
            'vaccinations': vaccinations,
            'medications': medications,
            'services': services,
            'treatment': treatment,
            'doctorAdvice': doctor_advice
        }
        
        all_records.append(structured_record)
        
        # Build indexes for searching
        record_index = len(all_records) - 1
        
        # Index by disease
        if disease_diagnosis:
            disease_normalized = normalize_text(disease_diagnosis)
            records_by_disease[disease_normalized].append(record_index)
        
        # Index by species
        records_by_species[species].append(record_index)
        
        # Index by breed
        breed_normalized = normalize_text(breed)
        records_by_breed[breed_normalized].append(record_index)
        
        # Index by lab tests
        for lab_test in lab_tests:
            test_normalized = normalize_text(lab_test['name'])
            if test_normalized:
                records_by_lab_test[test_normalized].append(record_index)
        
        # Index by diagnosis keywords (split by words)
        if all_diagnosis_text:
            words = normalize_text(all_diagnosis_text).split()
            for word in words:
                if len(word) > 2:  # Only index words longer than 2 characters
                    records_by_diagnosis_keyword[word].append(record_index)
        
        # Index by medications
        for med in medications:
            med_normalized = normalize_text(med['name'])
            if med_normalized:
                records_by_medication[med_normalized].append(record_index)
        
        # Index by vaccines
        for vaccine in vaccinations:
            vaccine_normalized = normalize_text(vaccine['name'])
            if vaccine_normalized:
                records_by_vaccine[vaccine_normalized].append(record_index)
        
        # Index by pet ID (for finding all records of same pet)
        if pet_id:
            records_by_pet_id[pet_id].append(record_index)
    
    print(f"Completed processing {total_records} records")
    print("Building final structure...")
    
    # Build final structured output
    output = {
        'metadata': {
            'total_records': total_records,
            'extraction_date': datetime.now().isoformat(),
            'search_indexes': {
                'by_disease': len(records_by_disease),
                'by_species': len(records_by_species),
                'by_breed': len(records_by_breed),
                'by_lab_test': len(records_by_lab_test),
                'by_diagnosis_keyword': len(records_by_diagnosis_keyword),
                'by_medication': len(records_by_medication),
                'by_vaccine': len(records_by_vaccine),
                'by_pet_id': len(records_by_pet_id)
            }
        },
        'records': all_records,
        'search_indexes': {
            'by_disease': {k: list(set(v)) for k, v in records_by_disease.items()},
            'by_species': {k: list(set(v)) for k, v in records_by_species.items()},
            'by_breed': {k: list(set(v)) for k, v in records_by_breed.items()},
            'by_lab_test': {k: list(set(v)) for k, v in records_by_lab_test.items()},
            'by_diagnosis_keyword': {k: list(set(v)) for k, v in records_by_diagnosis_keyword.items()},
            'by_medication': {k: list(set(v)) for k, v in records_by_medication.items()},
            'by_vaccine': {k: list(set(v)) for k, v in records_by_vaccine.items()},
            'by_pet_id': {k: list(set(v)) for k, v in records_by_pet_id.items()}
        },
        'statistics': {
            'unique_diseases': len(records_by_disease),
            'unique_species': len(records_by_species),
            'unique_breeds': len(records_by_breed),
            'unique_lab_tests': len(records_by_lab_test),
            'unique_medications': len(records_by_medication),
            'unique_vaccines': len(records_by_vaccine),
            'unique_pets': len(records_by_pet_id),
            'species_distribution': {k: len(v) for k, v in records_by_species.items()},
            'breed_distribution': {k: len(v) for k, v in sorted(records_by_breed.items(), key=lambda x: len(x[1]), reverse=True)[:20]}
        }
    }
    
    print("Writing output file...")
    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Successfully extracted {total_records} records to {output_file_path}")
    print(f"\nStatistics:")
    print(f"  - Unique diseases: {len(records_by_disease)}")
    print(f"  - Unique species: {len(records_by_species)}")
    print(f"  - Unique breeds: {len(records_by_breed)}")
    print(f"  - Unique lab tests: {len(records_by_lab_test)}")
    print(f"  - Unique medications: {len(records_by_medication)}")
    print(f"  - Unique vaccines: {len(records_by_vaccine)}")
    print(f"  - Unique pets: {len(records_by_pet_id)}")
    
    return output

if __name__ == '__main__':
    input_file = 'uploads/Hackathon Medical Records.json'
    output_file = 'extracted_data_summary.json'
    extract_all_records(input_file, output_file)
