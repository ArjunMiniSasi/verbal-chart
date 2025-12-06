#!/usr/bin/env python3
"""
Script to analyze medical records JSON and extract:
1. Diagnosis
2. Lab tests
3. Breed, species, and age
4. Diseases
5. Medications/services
6. Vaccines
"""

import json
from collections import defaultdict, Counter
from datetime import datetime

def analyze_medical_records(json_file_path):
    """Analyze medical records and extract requested information."""
    
    with open(json_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    records = data.get('data', {})
    total_records = len(records)
    
    print(f"Total medical records: {total_records}\n")
    print("=" * 80)
    
    # Storage for all extracted data
    all_diagnoses = []
    all_lab_tests = []
    all_breeds = []
    all_species = []
    all_ages = []
    all_diseases = []
    all_medications = []
    all_services = []
    all_vaccines = []
    
    # Sample records with complete data
    sample_records = []
    
    # Process each record
    for case_no, record in records.items():
        # Extract breed, species, and age
        client_details = record.get('clientDetails', {})
        breed = client_details.get('breed', '')
        age = client_details.get('age', '')
        pet_name = client_details.get('petName', '')
        patient_id = client_details.get('patientId', '')
        pet_id = client_details.get('petId', '')
        
        # Try to infer species from breed or other fields
        species = ''
        if breed:
            # Common species indicators
            breed_lower = breed.lower()
            if any(x in breed_lower for x in ['cat', 'feline', 'persian', 'siamese', 'maine']):
                species = 'Cat'
            elif any(x in breed_lower for x in ['dog', 'canine', 'labrador', 'golden', 'poodle', 'german']):
                species = 'Dog'
            elif any(x in breed_lower for x in ['bird', 'parrot', 'canary']):
                species = 'Bird'
            elif any(x in breed_lower for x in ['rabbit', 'bunny']):
                species = 'Rabbit'
            else:
                species = 'Unknown'
        
        # Extract diagnosis information
        diagnosis = record.get('diagnosis', {})
        disease_diagnosis = diagnosis.get('diseaseDiagnosis', '')
        observation = diagnosis.get('observation', '')
        chief_complaints = diagnosis.get('chiefComplaints', '')
        tentative = diagnosis.get('tentative', '')
        
        # Extract lab tests
        lab_tests = diagnosis.get('labTests', [])
        
        # Extract vaccinations
        vaccinations = diagnosis.get('vaccinations', [])
        
        # Extract medications and services
        medication = record.get('medication', {})
        medical = medication.get('medical', [])
        non_medical = medication.get('nonMedical', [])
        treatment = medication.get('treatment', '')
        
        # Extract doctor advice (services)
        doctor_advice = record.get('doctorAdvice', '')
        
        # Store data
        if breed:
            all_breeds.append(breed)
        if species:
            all_species.append(species)
        if age:
            all_ages.append(age)
        if disease_diagnosis:
            all_diagnoses.append(disease_diagnosis)
            all_diseases.append(disease_diagnosis)
        if observation:
            all_diagnoses.append(f"Observation: {observation}")
        if chief_complaints:
            all_diagnoses.append(f"Chief Complaint: {chief_complaints}")
        if tentative:
            all_diagnoses.append(f"Tentative: {tentative}")
        
        for lab_test in lab_tests:
            if isinstance(lab_test, dict):
                test_name = lab_test.get('testName', '') or lab_test.get('name', '')
                if test_name:
                    all_lab_tests.append(test_name)
            elif isinstance(lab_test, str):
                all_lab_tests.append(lab_test)
        
        for vaccine in vaccinations:
            if isinstance(vaccine, dict):
                vaccine_name = vaccine.get('vaccineName', '') or vaccine.get('name', '')
                if vaccine_name:
                    all_vaccines.append(vaccine_name)
            elif isinstance(vaccine, str):
                all_vaccines.append(vaccine)
        
        for med in medical:
            if isinstance(med, dict):
                med_name = med.get('medicineName', '') or med.get('name', '') or med.get('medicine', '')
                if med_name:
                    all_medications.append(med_name)
            elif isinstance(med, str):
                all_medications.append(med)
        
        for service in non_medical:
            if isinstance(service, dict):
                service_name = service.get('serviceName', '') or service.get('name', '') or service.get('service', '')
                if service_name:
                    all_services.append(service_name)
            elif isinstance(service, str):
                all_services.append(service)
        
        if treatment:
            all_services.append(treatment)
        if doctor_advice:
            all_services.append(doctor_advice)
        
        # Collect sample records with meaningful data
        if (disease_diagnosis or lab_tests or vaccinations or medical or non_medical or 
            treatment or doctor_advice or observation):
            sample_records.append({
                'caseNo': case_no,
                'petName': pet_name,
                'patientId': patient_id,
                'petId': pet_id,
                'breed': breed,
                'species': species,
                'age': age,
                'diagnosis': disease_diagnosis,
                'observation': observation,
                'chiefComplaints': chief_complaints,
                'tentative': tentative,
                'labTests': lab_tests,
                'vaccinations': vaccinations,
                'medications': medical,
                'services': non_medical,
                'treatment': treatment,
                'doctorAdvice': doctor_advice,
                'visitedDate': record.get('visitedDate', '')
            })
    
    # Print summary statistics
    print("\n1. DIAGNOSIS SUMMARY")
    print("-" * 80)
    print(f"Total diagnoses found: {len(all_diagnoses)}")
    print(f"Unique diagnoses: {len(set(all_diagnoses))}")
    print("\nSample Diagnoses:")
    unique_diagnoses = list(set(all_diagnoses))
    for i, diag in enumerate(unique_diagnoses[:10], 1):
        if diag.strip():
            print(f"  {i}. {diag}")
    
    print("\n\n2. LAB TESTS SUMMARY")
    print("-" * 80)
    print(f"Total lab tests found: {len(all_lab_tests)}")
    print(f"Unique lab tests: {len(set(all_lab_tests))}")
    lab_test_counts = Counter(all_lab_tests)
    print("\nMost common lab tests:")
    for test, count in lab_test_counts.most_common(10):
        if test.strip():
            print(f"  - {test}: {count} times")
    
    print("\n\n3. BREED, SPECIES, AND AGE SUMMARY")
    print("-" * 80)
    print(f"Total records with breed: {len(all_breeds)}")
    print(f"Total records with age: {len(all_ages)}")
    print(f"Total records with species: {len(all_species)}")
    
    breed_counts = Counter(all_breeds)
    print(f"\nUnique breeds: {len(breed_counts)}")
    print("\nMost common breeds:")
    for breed, count in breed_counts.most_common(15):
        if breed.strip():
            print(f"  - {breed}: {count} times")
    
    species_counts = Counter(all_species)
    print(f"\nSpecies distribution:")
    for species, count in species_counts.most_common():
        if species.strip():
            print(f"  - {species}: {count} times")
    
    if all_ages:
        ages_numeric = [a for a in all_ages if isinstance(a, (int, float)) or (isinstance(a, str) and a.replace('.', '').isdigit())]
        if ages_numeric:
            numeric_ages = [float(a) if isinstance(a, str) else a for a in ages_numeric]
            print(f"\nAge statistics:")
            print(f"  - Average age: {sum(numeric_ages)/len(numeric_ages):.2f} years")
            print(f"  - Min age: {min(numeric_ages)} years")
            print(f"  - Max age: {max(numeric_ages)} years")
    
    print("\n\n4. DISEASES SUMMARY")
    print("-" * 80)
    print(f"Total diseases found: {len(all_diseases)}")
    disease_counts = Counter(all_diseases)
    print(f"Unique diseases: {len(disease_counts)}")
    print("\nMost common diseases:")
    for disease, count in disease_counts.most_common(15):
        if disease.strip():
            print(f"  - {disease}: {count} times")
    
    print("\n\n5. MEDICATIONS AND SERVICES SUMMARY")
    print("-" * 80)
    print(f"Total medications found: {len(all_medications)}")
    print(f"Total services found: {len(all_services)}")
    
    med_counts = Counter(all_medications)
    print(f"\nUnique medications: {len(med_counts)}")
    print("\nMost common medications:")
    for med, count in med_counts.most_common(15):
        if med.strip():
            print(f"  - {med}: {count} times")
    
    service_counts = Counter(all_services)
    print(f"\nUnique services: {len(service_counts)}")
    print("\nMost common services:")
    for service, count in service_counts.most_common(15):
        if service.strip():
            print(f"  - {service}: {count} times")
    
    print("\n\n6. VACCINES SUMMARY")
    print("-" * 80)
    print(f"Total vaccines found: {len(all_vaccines)}")
    vaccine_counts = Counter(all_vaccines)
    print(f"Unique vaccines: {len(vaccine_counts)}")
    print("\nMost common vaccines:")
    for vaccine, count in vaccine_counts.most_common(15):
        if vaccine.strip():
            print(f"  - {vaccine}: {count} times")
    
    # Print detailed sample records
    print("\n\n" + "=" * 80)
    print("DETAILED SAMPLE RECORDS (First 5 records with complete data)")
    print("=" * 80)
    
    for i, sample in enumerate(sample_records[:5], 1):
        print(f"\n--- Sample Record {i} ---")
        print(f"Case No: {sample['caseNo']}")
        print(f"Pet Name: {sample['petName']}")
        print(f"Patient ID: {sample['patientId']}")
        print(f"Pet ID: {sample['petId']}")
        print(f"Breed: {sample['breed']}")
        print(f"Species: {sample['species']}")
        print(f"Age: {sample['age']} years")
        print(f"Visit Date: {sample['visitedDate']}")
        
        if sample['diagnosis']:
            print(f"Diagnosis: {sample['diagnosis']}")
        if sample['observation']:
            print(f"Observation: {sample['observation']}")
        if sample['chiefComplaints']:
            print(f"Chief Complaints: {sample['chiefComplaints']}")
        if sample['tentative']:
            print(f"Tentative: {sample['tentative']}")
        
        if sample['labTests']:
            print(f"Lab Tests: {json.dumps(sample['labTests'], indent=2)}")
        
        if sample['vaccinations']:
            print(f"Vaccinations: {json.dumps(sample['vaccinations'], indent=2)}")
        
        if sample['medications']:
            print(f"Medications: {json.dumps(sample['medications'], indent=2)}")
        
        if sample['services']:
            print(f"Services: {json.dumps(sample['services'], indent=2)}")
        
        if sample['treatment']:
            print(f"Treatment: {sample['treatment']}")
        
        if sample['doctorAdvice']:
            print(f"Doctor Advice: {sample['doctorAdvice']}")
    
    return {
        'total_records': total_records,
        'diagnoses': all_diagnoses,
        'lab_tests': all_lab_tests,
        'breeds': all_breeds,
        'species': all_species,
        'ages': all_ages,
        'diseases': all_diseases,
        'medications': all_medications,
        'services': all_services,
        'vaccines': all_vaccines,
        'sample_records': sample_records
    }

if __name__ == '__main__':
    json_file = 'uploads/Hackathon Medical Records.json'
    results = analyze_medical_records(json_file)
