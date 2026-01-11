const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../server/medora admin service.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'vetqure-pms'
});

const db = admin.firestore();

// Past medical records data for each pet
const medicalRecords = [
  // Max - Golden Retriever (MRN001)
  {
    id: 'max_record_1',
    patientId: '1',
    petName: 'Max',
    mrn: 'MRN001',
    date: '2024-01-15',
    chiefComplaint: 'Minor paw pad injury with mild inflammation',
    diagnosis: 'Minor paw pad injury with mild inflammation',
    entities: ['paw injury', 'inflammation', 'pain'],
    summary: 'Max presented with mild lameness on left front paw. Owner noticed decreased appetite over past 2 days. Physical examination revealed small cut on paw pad with mild swelling and redness.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Max presented with mild lameness on left front paw. Owner noticed decreased appetite over past 2 days. Owner reports Max has been limping for 2 days after playing in the park.',
      objective: 'Physical examination revealed small cut on left front paw pad (approximately 1cm) with mild swelling and redness. Temperature: 101.8°F (normal). Heart rate: 110 bpm. Respiratory rate: 22 breaths/min. No signs of infection.',
      assessment: 'Minor paw pad laceration with mild inflammation. No signs of deep tissue involvement or foreign body.',
      plan: 'Clean wound with chlorhexidine solution. Apply antibiotic ointment (Neosporin) twice daily. Prescribe Carprofen 75mg PO BID for 5 days for pain and inflammation. E-collar to prevent licking. Recheck in 5 days.'
    },
    medications: ['Carprofen 75mg BID x 5 days', 'Neosporin topical BID'],
    followUpRequired: true,
    followUpDate: '2024-01-20'
  },
  {
    id: 'max_record_2',
    patientId: '1',
    petName: 'Max',
    mrn: 'MRN001',
    date: '2023-12-10',
    chiefComplaint: 'Otitis externa - bacterial ear infection',
    diagnosis: 'Otitis externa - bacterial ear infection',
    entities: ['ear infection', 'bacteria', 'inflammation'],
    summary: 'Max presented with signs of ear discomfort including head shaking, scratching at ears. Examination revealed inflamed ear canal with discharge.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Max has been shaking his head frequently and scratching at his right ear for the past 3 days. Decreased appetite noted.',
      objective: 'Right ear canal examination reveals moderate inflammation with brown, malodorous discharge. Left ear appears normal. Temperature: 102.1°F. No evidence of ear mites on otoscopic examination.',
      assessment: 'Bacterial otitis externa, right ear. Likely secondary to environmental allergens.',
      plan: 'Ear cleaning with veterinary ear cleanser. Prescribe Mometamax otic suspension 4 drops in right ear BID for 7 days. Oral Cephalexin 500mg PO BID for 10 days. Recheck in 7-10 days.'
    },
    medications: ['Mometamax otic BID x 7 days', 'Cephalexin 500mg BID x 10 days'],
    followUpRequired: true,
    followUpDate: '2023-12-17'
  },
  {
    id: 'max_record_3',
    patientId: '1',
    petName: 'Max',
    mrn: 'MRN001',
    date: '2023-11-05',
    chiefComplaint: 'Annual wellness exam and vaccination',
    diagnosis: 'Routine wellness exam - healthy',
    entities: ['wellness', 'vaccination', 'preventive care'],
    summary: 'Annual wellness examination. Max is in excellent health with no concerns. All vaccinations updated.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Max is doing well with excellent appetite and energy level. Regular exercise with daily walks. No concerns.',
      objective: 'Physical examination within normal limits. Weight: 65 lbs (stable). BCS: 5/9 (ideal). Teeth: mild tartar accumulation. Eyes, ears, nose clear. Cardiovascular and respiratory systems normal. Abdomen soft, non-painful. Musculoskeletal examination normal.',
      assessment: 'Healthy adult dog. Mild dental tartar noted.',
      plan: 'Administered DHPP and Lyme disease vaccines. Recommend dental cleaning in next 6-12 months. Continue current diet and exercise routine. Heartworm test performed - negative. Prescribed heartworm prevention.'
    },
    medications: ['Heartgard Plus monthly preventive'],
    followUpRequired: false,
    followUpDate: null
  },

  // Luna - Maine Coon (MRN002)
  {
    id: 'luna_record_1',
    patientId: '2',
    petName: 'Luna',
    mrn: 'MRN002',
    date: '2024-01-12',
    chiefComplaint: 'Hairball obstruction symptoms',
    diagnosis: 'Gastric hairball causing vomiting',
    entities: ['hairball', 'vomiting', 'gastrointestinal'],
    summary: 'Luna presented with intermittent vomiting over 48 hours. Owner reports decreased appetite and lethargy. Examination suggests hairball accumulation.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Luna has vomited 4 times in the past 2 days, mostly producing foam and hair. Decreased interest in food. More lethargic than usual. Long-haired breed with history of hairballs.',
      objective: 'Temperature: 101.5°F. Mild dehydration (6% estimated). Abdominal palpation reveals slightly enlarged stomach with no signs of obstruction. No evidence of foreign body. Good gut sounds present.',
      assessment: 'Gastric hairball causing mild gastritis and intermittent vomiting. Mild dehydration secondary to vomiting.',
      plan: 'Administer subcutaneous fluids (150ml LRS). Prescribe hairball lubricant (Laxatone) 1/2 tsp PO daily. Maropitant 1mg/kg SQ once for nausea. Start hairball control diet. Increase grooming frequency. Recheck in 3 days if symptoms persist.'
    },
    medications: ['Laxatone hairball remedy daily', 'Maropitant 8mg SQ once'],
    followUpRequired: true,
    followUpDate: '2024-01-15'
  },
  {
    id: 'luna_record_2',
    patientId: '2',
    petName: 'Luna',
    mrn: 'MRN002',
    date: '2023-10-20',
    chiefComplaint: 'Upper respiratory infection',
    diagnosis: 'Feline upper respiratory infection (URI)',
    entities: ['URI', 'sneezing', 'nasal discharge'],
    summary: 'Luna presented with sneezing, nasal discharge, and decreased appetite for 3 days. Diagnosed with viral upper respiratory infection.',
    treatedBy: 'Dr. Emily Parker',
    soapNotes: {
      subjective: 'Owner reports Luna has been sneezing frequently for 3 days with clear nasal discharge. Mild decrease in appetite. No coughing. Still drinking water. Indoor cat with no recent exposure to other cats.',
      objective: 'Temperature: 103.2°F (elevated). Mild serous nasal discharge bilateral. Eyes clear, no discharge. Respiratory rate: 32 breaths/min. Lungs clear on auscultation. Oropharynx slightly red.',
      assessment: 'Feline viral upper respiratory infection, likely herpesvirus or calicivirus. Mild fever present.',
      plan: 'Supportive care. Prescribe L-lysine 250mg PO BID. Antibiotic coverage with Clavamox 62.5mg PO BID for 10 days to prevent secondary bacterial infection. Humidifier use recommended. Monitor appetite and hydration. Recheck if symptoms worsen or persist beyond 7 days.'
    },
    medications: ['L-lysine 250mg BID', 'Clavamox 62.5mg BID x 10 days'],
    followUpRequired: true,
    followUpDate: '2023-10-27'
  },

  // Buddy - German Shepherd (MRN003)
  {
    id: 'buddy_record_1',
    patientId: '3',
    petName: 'Buddy',
    mrn: 'MRN003',
    date: '2024-01-08',
    chiefComplaint: 'Mild hip dysplasia screening follow-up',
    diagnosis: 'Mild degenerative joint disease (DJD) in hips',
    entities: ['hip dysplasia', 'arthritis', 'joint pain'],
    summary: 'Buddy presented for follow-up on hip radiographs. Mild bilateral hip dysplasia noted. Owner reports occasional stiffness after exercise.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Buddy occasionally shows stiffness in hind legs after intense training sessions. Takes a few minutes to warm up. Working dog in search and rescue training. No signs of pain during regular activity.',
      objective: 'Orthopedic examination: mild discomfort on hip extension bilateral. Good range of motion. Gait normal at walk and trot. Muscle condition excellent. Radiographs show mild hip laxity with early degenerative changes. Weight: 75 lbs (ideal).',
      assessment: 'Mild bilateral hip dysplasia with early degenerative joint disease. Currently well-compensated due to excellent muscle condition.',
      plan: 'Start glucosamine/chondroitin supplement (Dasuquin) daily. Prescribe Carprofen 100mg PO BID PRN for post-exercise soreness. Continue current exercise routine with adequate warm-up. Monitor for progression. Recheck in 6 months. Consider Adequan injections if symptoms progress.'
    },
    medications: ['Dasuquin joint supplement daily', 'Carprofen 100mg PRN'],
    followUpRequired: true,
    followUpDate: '2024-07-08'
  },
  {
    id: 'buddy_record_2',
    patientId: '3',
    petName: 'Buddy',
    mrn: 'MRN003',
    date: '2023-09-15',
    chiefComplaint: 'Laceration on right forelimb',
    diagnosis: 'Traumatic laceration requiring sutures',
    entities: ['laceration', 'wound', 'trauma'],
    summary: 'Buddy sustained a 3cm laceration on right forelimb during training exercise. Wound cleaned and sutured.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Buddy cut his leg on a sharp object during search and rescue training exercise. Bleeding controlled with pressure. Occurred 2 hours ago.',
      objective: 'Right forelimb: 3cm laceration on lateral aspect, full thickness through dermis. Wound edges clean. No foreign material visible. Neurovascular function intact distal to wound. No evidence of tendon or ligament damage.',
      assessment: 'Traumatic laceration, right forelimb, requiring primary closure.',
      plan: 'Sedation with butorphanol and dexmedetomidine. Local anesthetic block. Wound lavage with sterile saline. Primary closure with 3-0 PDS subcutaneous and 3-0 nylon skin sutures. E-collar. Prescribe Cephalexin 500mg PO BID x 10 days. Carprofen 100mg PO BID x 5 days. Suture removal in 10-14 days.'
    },
    medications: ['Cephalexin 500mg BID x 10 days', 'Carprofen 100mg BID x 5 days'],
    followUpRequired: true,
    followUpDate: '2023-09-25'
  },
  {
    id: 'buddy_record_3',
    patientId: '3',
    petName: 'Buddy',
    mrn: 'MRN003',
    date: '2023-06-20',
    chiefComplaint: 'Gastroenteritis - acute vomiting and diarrhea',
    diagnosis: 'Acute gastroenteritis, likely dietary indiscretion',
    entities: ['vomiting', 'diarrhea', 'GI upset'],
    summary: 'Buddy presented with acute onset vomiting and diarrhea. Suspected dietary indiscretion after getting into garbage.',
    treatedBy: 'Dr. Emily Parker',
    soapNotes: {
      subjective: 'Owner reports Buddy vomited 5 times yesterday and has had diarrhea for 24 hours. Owner suspects Buddy got into garbage can. Still has appetite and drinking water. No blood in vomit or stool.',
      objective: 'Temperature: 101.9°F. Mild dehydration (5%). Abdominal palpation reveals mild discomfort, no masses or obstructions. Good gut sounds. No evidence of foreign body on palpation.',
      assessment: 'Acute gastroenteritis, likely secondary to dietary indiscretion. Mild dehydration.',
      plan: 'Administer 500ml subcutaneous fluids. Prescribe Metronidazole 500mg PO BID x 5 days and Cerenia 60mg PO SID x 3 days. Bland diet (boiled chicken and rice) for 3 days, then gradual transition back to regular food. Monitor for worsening symptoms. Recheck if no improvement in 48 hours.'
    },
    medications: ['Metronidazole 500mg BID x 5 days', 'Cerenia 60mg SID x 3 days'],
    followUpRequired: false,
    followUpDate: null
  },

  // Bella - Labrador (MRN004)
  {
    id: 'bella_record_1',
    patientId: '4',
    petName: 'Bella',
    mrn: 'MRN004',
    date: '2024-01-05',
    chiefComplaint: 'Dental cleaning and tooth extraction',
    diagnosis: 'Periodontal disease with tooth extraction',
    entities: ['dental', 'periodontal disease', 'extraction'],
    summary: 'Bella underwent routine dental prophylaxis. Severe periodontal disease of left upper 4th premolar required extraction.',
    treatedBy: 'Dr. Robert Thompson',
    soapNotes: {
      subjective: 'Owner reports Bella has had bad breath and was reluctant to eat hard food recently. Scheduled for routine dental cleaning.',
      objective: 'Pre-anesthetic physical examination within normal limits. Oral examination under anesthesia revealed moderate tartar and gingivitis. Left upper 4th premolar (tooth 208) showed stage 3 periodontal disease with mobility and gingival pocket depth >5mm. Pre-anesthetic bloodwork normal.',
      assessment: 'Generalized periodontal disease with stage 3 disease of tooth 208 requiring extraction.',
      plan: 'Performed dental prophylaxis with ultrasonic scaling and polishing. Extracted tooth 208 using closed technique. Administered local anesthetic block. Post-operative pain management with Gabapentin 100mg PO TID x 5 days and Carprofen 75mg PO BID x 7 days. Soft food for 7 days. Recheck in 10 days.'
    },
    medications: ['Gabapentin 100mg TID x 5 days', 'Carprofen 75mg BID x 7 days'],
    followUpRequired: true,
    followUpDate: '2024-01-15'
  },
  {
    id: 'bella_record_2',
    patientId: '4',
    petName: 'Bella',
    mrn: 'MRN004',
    date: '2023-08-22',
    chiefComplaint: 'Hot spot (acute moist dermatitis)',
    diagnosis: 'Acute moist dermatitis (hot spot)',
    entities: ['hot spot', 'dermatitis', 'skin infection'],
    summary: 'Bella developed a hot spot on left hip area. Lesion cleaned, clipped, and treated with topical and systemic medications.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Bella has been licking and scratching at her left hip area excessively for 2 days. Noticed a red, moist area this morning. Swimming in lake 3 days ago.',
      objective: 'Left hip: 4cm diameter area of acute moist dermatitis with erythema, exudate, and partial hair loss. Surrounding skin appears normal. No signs of fleas or other parasites. No evidence of foreign body.',
      assessment: 'Acute moist dermatitis (hot spot), likely secondary to moisture retention and self-trauma.',
      plan: 'Clip hair around lesion. Clean with chlorhexidine solution. Apply topical antibiotic spray (Vetericyn). E-collar to prevent licking. Prescribe Cephalexin 500mg PO BID x 10 days. Short course prednisone 20mg PO SID x 3 days to reduce inflammation. Keep area dry. Recheck in 5-7 days.'
    },
    medications: ['Cephalexin 500mg BID x 10 days', 'Prednisone 20mg SID x 3 days', 'Vetericyn topical spray'],
    followUpRequired: true,
    followUpDate: '2023-08-29'
  },

  // Whiskers - Cat (MRN005)
  {
    id: 'whiskers_record_1',
    patientId: '5',
    petName: 'Whiskers',
    mrn: 'MRN005',
    date: '2024-01-03',
    chiefComplaint: 'Urinary tract infection (UTI)',
    diagnosis: 'Bacterial cystitis (UTI)',
    entities: ['UTI', 'cystitis', 'urinary'],
    summary: 'Whiskers presented with straining to urinate and frequent trips to litter box. Urinalysis confirmed bacterial UTI.',
    treatedBy: 'Dr. Emily Parker',
    soapNotes: {
      subjective: 'Owner reports Whiskers has been making frequent trips to litter box with small amounts of urine. Occasional straining noted. No blood visible in urine. Eating and drinking normally.',
      objective: 'Physical examination normal. Bladder small on palpation, slightly thickened wall. No pain on abdominal palpation. Urinalysis: pH 8.0, WBC 20-30/hpf, bacteria present, no crystals. Specific gravity 1.035.',
      assessment: 'Bacterial cystitis (lower urinary tract infection). No evidence of urinary obstruction or crystals.',
      plan: 'Prescribe Clavamox 62.5mg PO BID x 14 days. Encourage water intake. Monitor litter box for normal urination. Recheck urinalysis 3-5 days after completion of antibiotics. Consider dietary management if recurrent.'
    },
    medications: ['Clavamox 62.5mg BID x 14 days'],
    followUpRequired: true,
    followUpDate: '2024-01-17'
  },
  {
    id: 'whiskers_record_2',
    patientId: '5',
    petName: 'Whiskers',
    mrn: 'MRN005',
    date: '2023-11-10',
    chiefComplaint: 'Annual senior wellness exam',
    diagnosis: 'Senior wellness - early stage CKD monitoring',
    entities: ['wellness', 'senior', 'kidney function'],
    summary: 'Annual senior wellness examination for 6-year-old cat. Bloodwork shows early indicators of kidney function changes requiring monitoring.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Whiskers is doing well overall. Maybe drinking slightly more water than usual. Good appetite. No vomiting or diarrhea. Indoor cat.',
      objective: 'Physical examination: Weight 10 lbs (down 0.5 lbs from last year). BCS 4/9. Dental: moderate tartar. Heart and lungs normal. Kidneys palpable, normal size. Senior bloodwork: BUN 32 (high normal), Creatinine 2.1 (mildly elevated), USG 1.025. Thyroid (T4) normal.',
      assessment: 'Senior cat with early indicators of declining kidney function (IRIS stage 1-2 CKD). Requires monitoring. Dental disease present.',
      plan: 'Recommend transitioning to kidney-support diet gradually. Ensure adequate hydration. Recheck bloodwork and urinalysis in 3 months. Recommend dental cleaning in next 3-6 months. Discuss subcutaneous fluid therapy if kidney values progress.'
    },
    medications: ['Joint supplement (optional)', 'Kidney diet recommended'],
    followUpRequired: true,
    followUpDate: '2024-02-10'
  },

  // Lakshmi - Holstein Friesian Cattle (MRN006)
  {
    id: 'bella_cattle_record_1',
    patientId: '6',
    petName: 'Lakshmi',
    mrn: 'MRN006',
    date: '2024-01-20',
    chiefComplaint: 'Severe mastitis - acute clinical mastitis in multiple quarters',
    diagnosis: 'Acute clinical mastitis - bacterial infection (Staphylococcus aureus)',
    entities: ['mastitis', 'bacterial infection', 'decreased milk production', 'udder inflammation', 'staphylococcus aureus'],
    summary: 'Lakshmi presented with acute clinical mastitis affecting left front and right rear quarters. Owner noticed significant drop in milk production, abnormal milk appearance (clots and flakes), and udder swelling. Cow appears uncomfortable and reluctant to be milked.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Lakshmi has been producing significantly less milk for 2 days. Milk appears abnormal with clots and flakes. Cow is uncomfortable, restless, and reluctant to be milked. Appetite decreased. No recent changes in feed or milking routine.',
      objective: 'Left front quarter: Severely swollen, hot, and painful on palpation. Milk sample shows thick, clotted discharge with foul odor. Right rear quarter: Moderate swelling and warmth. Milk appears watery with flakes. Temperature: 103.5°F (elevated). Heart rate: 85 bpm (elevated). Respiratory rate: 30 breaths/min. California Mastitis Test (CMT) positive (+++) in both affected quarters. Somatic cell count: 850,000 cells/mL (severely elevated). Bacterial culture: Staphylococcus aureus isolated.',
      assessment: 'Acute clinical mastitis caused by Staphylococcus aureus infection in left front and right rear quarters. Severe inflammation and bacterial contamination present. Risk of systemic involvement if not treated promptly.',
      plan: '1. Intramammary antibiotic therapy: Ceftiofur hydrochloride (500mg) into each affected quarter, twice daily for 5 days. 2. Systemic antibiotic: Penicillin G (22,000 IU/kg IM) twice daily for 5 days. 3. Anti-inflammatory: Flunixin meglumine (2.2mg/kg IV) once daily for 3 days. 4. Supportive care: Frequent milking of affected quarters (every 4-6 hours), warm compresses, udder massage. 5. Isolation from herd to prevent spread. 6. Milk discard period: 72 hours after last antibiotic treatment. 7. Recheck in 3 days to assess response. 8. Advise owner on strict milking hygiene, proper teat dipping, and environmental sanitation.'
    },
    medications: ['Ceftiofur hydrochloride 500mg (intramammary) BID x 5 days', 'Penicillin G 22,000 IU/kg IM BID x 5 days', 'Flunixin meglumine 2.2mg/kg IV SID x 3 days', 'Udder cream (topical)', 'Teat dip (iodine-based)'],
    followUpRequired: true,
    followUpDate: '2024-01-23'
  },
  {
    id: 'bella_cattle_record_2',
    patientId: '6',
    petName: 'Lakshmi',
    mrn: 'MRN006',
    date: '2023-12-15',
    chiefComplaint: 'Routine vaccination and health check',
    diagnosis: 'Healthy dairy cow - routine care',
    entities: ['vaccination', 'health check', 'routine care'],
    summary: 'Lakshmi presented for routine annual vaccinations and health check. Overall health excellent with good body condition score.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Lakshmi is doing well. Good milk production maintained. No health concerns.',
      objective: 'Physical examination unremarkable. Body condition score: 3.5/5 (good). Heart and lungs clear. Rumen sounds normal. Udder healthy. Milk production within normal range.',
      assessment: 'Healthy dairy cow with no abnormalities detected.',
      plan: 'Administered annual vaccinations (FMD, Brucellosis, Blackleg). Continue current feeding and management practices. Next health check in 6 months.'
    },
    medications: ['FMD vaccine', 'Brucellosis vaccine', 'Blackleg vaccine'],
    followUpRequired: false,
    followUpDate: null
  },
  {
    id: 'bella_cattle_record_3',
    patientId: '6',
    petName: 'Lakshmi',
    mrn: 'MRN006',
    date: '2023-10-05',
    chiefComplaint: 'Mild lameness in left hind leg',
    diagnosis: 'Mild lameness with secondary mastitis - early stage',
    entities: ['lameness', 'mastitis', 'hind leg', 'decreased milk production'],
    summary: 'Lakshmi presented with mild lameness on left hind leg and decreased milk production. Physical examination revealed early signs of mastitis in left rear quarter.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Lakshmi has been producing less milk for 3 days. Noticed she is favoring left hind leg. Appetite slightly decreased. No changes in feed or environment.',
      objective: 'Left hind leg shows mild lameness. Left rear quarter shows slight swelling and warmth. Milk sample shows increased somatic cell count. Temperature: 102.8°F (slightly elevated). Heart rate: 72 bpm. Respiratory rate: 28 breaths/min. Udder examination reveals mild inflammation in left rear quarter.',
      assessment: 'Mild lameness in left hind leg with early-stage mastitis in left rear quarter. Secondary to possible injury or environmental factors.',
      plan: 'Intramammary antibiotic treatment for left rear quarter. Anti-inflammatory medication (Meloxicam 15mg IM) for 3 days. Rest and isolation from herd. Monitor milk production daily. Recheck in 5 days. Advise owner on proper milking hygiene and udder care.'
    },
    medications: ['Intramammary antibiotic (Ceftiofur)', 'Meloxicam 15mg IM x 3 days', 'Udder cream'],
    followUpRequired: true,
    followUpDate: '2023-10-10'
  },

  // Raja - Sahiwal Cattle (MRN007)
  {
    id: 'raja_cattle_record_1',
    patientId: '7',
    petName: 'Raja',
    mrn: 'MRN007',
    date: '2024-01-18',
    chiefComplaint: 'Foot and Mouth Disease (FMD) - suspected outbreak',
    diagnosis: 'Foot and Mouth Disease (FMD) - confirmed by clinical signs and herd history',
    entities: ['foot and mouth disease', 'fmd', 'vesicles', 'lameness', 'fever', 'salivation', 'viral disease'],
    summary: 'Raja presented with clinical signs consistent with Foot and Mouth Disease. Owner reports other cattle in herd showing similar symptoms. Multiple vesicles observed on mouth, tongue, and feet. Severe lameness and excessive salivation present.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Raja developed fever 2 days ago, followed by excessive salivation and drooling. Cow is reluctant to eat and shows severe lameness. Other cattle in the herd (3 animals) showing similar symptoms. No recent introduction of new animals, but neighboring farm reported FMD outbreak last week.',
      objective: 'Temperature: 104.5°F (high fever). Heart rate: 95 bpm (elevated). Respiratory rate: 35 breaths/min. Multiple vesicles (2-3cm) observed on: tongue, hard palate, dental pad, and lips. Interdigital space of all four feet shows vesicles and erosions. Coronary band of front hooves affected. Severe lameness - cow reluctant to bear weight on front feet. Excessive salivation with stringy drool. Milk production significantly decreased. Vesicular fluid sample collected for laboratory confirmation. No vesicles on teats or udder.',
      assessment: 'Clinical diagnosis: Foot and Mouth Disease (FMD) - highly contagious viral disease. Confirmed by characteristic vesicular lesions on mouth and feet, fever, lameness, and herd history. Immediate isolation and reporting required.',
      plan: '1. IMMEDIATE ISOLATION: Separate from all other animals. Strict biosecurity measures implemented. 2. REPORTING: Notified state veterinary authorities and district animal husbandry department (FMD is notifiable disease). 3. Supportive treatment: Antipyretics (Paracetamol 10mg/kg PO BID) for fever. 4. Topical treatment: Apply antiseptic solution (Potassium permanganate 1%) to foot lesions twice daily. 5. Soft, palatable feed: Provide soft hay and fresh water. 6. Pain management: Meloxicam 0.5mg/kg IM once daily for 3 days. 7. Antibiotic cover: Oxytetracycline 10mg/kg IM once daily for 5 days to prevent secondary bacterial infections. 8. Rest and comfort: Provide soft bedding, minimize movement. 9. Quarantine: Entire herd under quarantine for minimum 21 days. 10. Disinfection: All equipment, vehicles, and personnel must be disinfected. 11. Vaccination: Rest of herd to be vaccinated immediately with FMD vaccine. 12. Monitoring: Daily temperature and clinical signs monitoring. 13. Follow-up: Recheck in 3 days. Report any new cases immediately.'
    },
    medications: ['Paracetamol 10mg/kg PO BID (fever management)', 'Meloxicam 0.5mg/kg IM SID x 3 days (pain relief)', 'Oxytetracycline 10mg/kg IM SID x 5 days (secondary infection prevention)', 'Potassium permanganate 1% solution (topical foot treatment)', 'FMD vaccine (for rest of herd)'],
    followUpRequired: true,
    followUpDate: '2024-01-21'
  },
  {
    id: 'raja_cattle_record_2',
    patientId: '7',
    petName: 'Raja',
    mrn: 'MRN007',
    date: '2023-11-20',
    chiefComplaint: 'Hoof overgrowth and routine health check',
    diagnosis: 'Hoof overgrowth requiring trimming',
    entities: ['hoof overgrowth', 'hoof trimming', 'routine check'],
    summary: 'Raja presented for routine health check. Hoof overgrowth noted requiring professional trimming.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Raja is active and breeding well. No lameness noted. Regular feeding and exercise maintained.',
      objective: 'Physical examination shows significant hoof overgrowth, particularly in front hooves. No signs of lameness or hoof disease. Body condition good. Heart and lungs clear. Testicular examination normal.',
      assessment: 'Hoof overgrowth requiring professional trimming. Otherwise healthy breeding bull.',
      plan: 'Hoof trimming performed on all four hooves. Regular hoof maintenance schedule recommended every 3-4 months. Continue current management practices. Monitor for any signs of lameness.'
    },
    medications: ['Hoof trimming', 'Hoof antiseptic'],
    followUpRequired: false,
    followUpDate: null
  },
  {
    id: 'raja_cattle_record_3',
    patientId: '7',
    petName: 'Raja',
    mrn: 'MRN007',
    date: '2023-09-10',
    chiefComplaint: 'Routine vaccination and breeding health check',
    diagnosis: 'Healthy breeding bull - routine care',
    entities: ['vaccination', 'health check', 'routine care', 'breeding'],
    summary: 'Raja presented for routine annual vaccinations and breeding health assessment. Overall health excellent with good body condition.',
    treatedBy: 'Dr. Rajesh Kumar',
    soapNotes: {
      subjective: 'Owner reports Raja is performing well in breeding. Good appetite maintained. No health concerns.',
      objective: 'Physical examination unremarkable. Body condition score: 4/5 (excellent). Heart and lungs clear. Testicular examination normal. Hooves in good condition. Strong and active.',
      assessment: 'Healthy breeding bull with excellent body condition. No abnormalities detected.',
      plan: 'Administered annual vaccinations (FMD, Anthrax). Continue current management and feeding practices. Regular health monitoring. Next health check in 6 months.'
    },
    medications: ['FMD vaccine', 'Anthrax vaccine'],
    followUpRequired: false,
    followUpDate: null
  }
];

async function populateMedicalHistory() {
  console.log('🚀 Starting medical history population...');

  const collection = db.collection('past_medical_records');
  let successCount = 0;
  let errorCount = 0;

  for (const record of medicalRecords) {
    try {
      await collection.doc(record.id).set(record);
      console.log(`✅ Added record: ${record.id} - ${record.petName} - ${record.diagnosis}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error adding record ${record.id}:`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully added: ${successCount} records`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\n🎉 Medical history population complete!`);
}

// Run the population
populateMedicalHistory()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
