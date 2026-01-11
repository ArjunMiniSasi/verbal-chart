// Enhanced Veterinary Patient Interface with comprehensive pet and owner information
export interface Vaccination {
  name: string;
  date: string;
  nextDue: string;
  status: 'Current' | 'Overdue' | 'Upcoming';
}

export interface Pet {
  name: string;
  species: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Reptile' | 'Cattle' | 'Goat' | 'Buffalo';
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  weight: number;
  color: string;
  microchipId?: string;
  imageUrl?: string;
  vaccinations: Vaccination[];
  medicalHistory: string;
  allergies: string[];
  lastConsultedDoctor?: string;
  temperament?: string;
  dietaryNeeds?: string;
}

export interface Owner {
  name: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  occupation: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  lastVisit: string;
  pet: Pet;
  owner: Owner;
}

export interface HistoryRecord {
  id: string;
  patientId: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  entities: string[];
  summary: string;
  treatedBy: string;
  soapNotes: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  medications?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface Suggestion {
  id: string;
  type: 'protocol' | 'medication' | 'diagnostic';
  title: string;
  description: string;
  category: string;
}

export interface SOAPNote {
  id: string;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface TranscriptChunk {
  id: string;
  text: string;
  entities: Array<{
    text: string;
    type: 'symptom' | 'condition' | 'medication';
    confidence: number;
  }>;
  timestamp: number;
}

// Mock patients with comprehensive pet and owner data
export const mockPatients: Patient[] = [
  // Cattle Profiles
  {
    id: '6',
    name: 'Lakshmi',
    age: 5,
    mrn: 'MRN006',
    lastVisit: '2024-01-20',
    pet: {
      name: 'Lakshmi',
      species: 'Cattle',
      breed: 'Holstein Friesian',
      age: 5,
      gender: 'Female',
      weight: 550,
      color: 'Black and White',
      imageUrl: 'https://cdn.pixabay.com/photo/2014/08/23/11/33/cow-425164_1280.jpg',
      vaccinations: [
        {
          name: 'FMD',
          date: '2023-12-15',
          nextDue: '2024-12-15',
          status: 'Current'
        },
        {
          name: 'Brucellosis',
          date: '2023-12-15',
          nextDue: '2024-12-15',
          status: 'Current'
        },
        {
          name: 'Blackleg',
          date: '2023-12-15',
          nextDue: '2024-12-15',
          status: 'Current'
        }
      ],
      medicalHistory: 'Dairy cow with good milk production. Recent mastitis episode in January 2024. Regular vaccinations maintained. Good body condition.',
      allergies: ['None known'],
      lastConsultedDoctor: 'Dr. Rajesh Kumar',
      temperament: 'Docile, good milking temperament',
      dietaryNeeds: 'High-quality dairy feed, fresh hay, mineral supplements'
    },
    owner: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@farm.com',
      address: {
        street: 'Dairy Farm Road',
        city: 'Karnal',
        state: 'Haryana',
        zipCode: '132001'
      },
      occupation: 'Dairy Farmer',
      emergencyContact: {
        name: 'Priya Kumar',
        phone: '+91 98765 43211',
        relationship: 'Wife'
      }
    }
  },
  {
    id: '7',
    name: 'Raja',
    age: 6,
    mrn: 'MRN007',
    lastVisit: '2024-01-18',
    pet: {
      name: 'Raja',
      species: 'Cattle',
      breed: 'Sahiwal',
      age: 6,
      gender: 'Male',
      weight: 650,
      color: 'Reddish Brown',
      imageUrl: 'https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400&h=400&fit=crop',
      vaccinations: [
        {
          name: 'FMD',
          date: '2023-09-10',
          nextDue: '2024-09-10',
          status: 'Current'
        },
        {
          name: 'Anthrax',
          date: '2023-09-10',
          nextDue: '2024-09-10',
          status: 'Current'
        }
      ],
      medicalHistory: 'Breeding bull with excellent health. Recent FMD outbreak in January 2024. Recovered well with treatment. Regular hoof maintenance.',
      allergies: ['None known'],
      lastConsultedDoctor: 'Dr. Rajesh Kumar',
      temperament: 'Strong, active breeding bull',
      dietaryNeeds: 'High-protein feed, mineral blocks, fresh water'
    },
    owner: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@farm.com',
      address: {
        street: 'Dairy Farm Road',
        city: 'Karnal',
        state: 'Haryana',
        zipCode: '132001'
      },
      occupation: 'Dairy Farmer',
      emergencyContact: {
        name: 'Priya Kumar',
        phone: '+91 98765 43211',
        relationship: 'Wife'
      }
    }
  },
  {
    id: '1',
    name: 'Max',
    age: 3,
    mrn: 'MRN001',
    lastVisit: '2024-01-15',
    pet: {
      name: 'Max',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      gender: 'Male',
      weight: 65,
      color: 'Golden',
      microchipId: '982000123456789',
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop&crop=face',
      vaccinations: [
        {
          name: 'Rabies',
          date: '2023-12-01',
          nextDue: '2024-12-01',
          status: 'Current'
        },
        {
          name: 'DHPP',
          date: '2023-11-15',
          nextDue: '2024-11-15',
          status: 'Current'
        },
        {
          name: 'Lyme Disease',
          date: '2023-10-20',
          nextDue: '2024-10-20',
          status: 'Current'
        }
      ],
      medicalHistory: 'Healthy young adult dog. Previous minor ear infection treated successfully in 2023. Regular exercise and excellent appetite.',
      allergies: ['Chicken', 'Grain-based foods'],
      lastConsultedDoctor: 'Dr. Sarah Johnson',
      temperament: 'Friendly, energetic, good with children',
      dietaryNeeds: 'Grain-free diet, high-quality protein'
    },
    owner: {
      name: 'Jennifer Martinez',
      phone: '(555) 234-5678',
      email: 'jennifer.martinez@email.com',
      address: {
        street: '456 Oak Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701'
      },
      occupation: 'Elementary School Teacher',
      emergencyContact: {
        name: 'Carlos Martinez',
        phone: '(555) 234-5679',
        relationship: 'Husband'
      }
    }
  },
  {
    id: '2',
    name: 'Luna',
    age: 2,
    mrn: 'MRN002',
    lastVisit: '2024-01-12',
    pet: {
      name: 'Luna',
      species: 'Cat',
      breed: 'Maine Coon',
      age: 2,
      gender: 'Female',
      weight: 12,
      color: 'Silver Tabby',
      microchipId: '982000987654321',
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&h=400&fit=crop&crop=face',
      vaccinations: [
        {
          name: 'Rabies',
          date: '2023-11-10',
          nextDue: '2024-11-10',
          status: 'Current'
        },
        {
          name: 'FVRCP',
          date: '2023-10-15',
          nextDue: '2024-10-15',
          status: 'Current'
        }
      ],
      medicalHistory: 'Indoor cat with excellent health. Regular grooming due to long coat. Very social and well-behaved.',
      allergies: ['Fish-based foods', 'Dust mites'],
      lastConsultedDoctor: 'Dr. Michael Chen',
      temperament: 'Calm, affectionate, enjoys being brushed',
      dietaryNeeds: 'High-protein diet, hairball control formula'
    },
    owner: {
      name: 'Emily Rodriguez',
      phone: '(555) 987-6543',
      email: 'emily.rodriguez@email.com',
      address: {
        street: '123 Pine Avenue',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62702'
      },
      occupation: 'Graphic Designer',
      emergencyContact: {
        name: 'Maria Rodriguez',
        phone: '(555) 987-6544',
        relationship: 'Mother'
      }
    }
  },
  {
    id: '3',
    name: 'Buddy',
    age: 5,
    mrn: 'MRN003',
    lastVisit: '2024-01-08',
    pet: {
      name: 'Buddy',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 5,
      gender: 'Male',
      weight: 75,
      color: 'Black and Tan',
      microchipId: '982000456789123',
      imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop&crop=face',
      vaccinations: [
        {
          name: 'Rabies',
          date: '2023-12-15',
          nextDue: '2024-12-15',
          status: 'Current'
        },
        {
          name: 'DHPP',
          date: '2023-11-20',
          nextDue: '2024-11-20',
          status: 'Current'
        },
        {
          name: 'Bordetella',
          date: '2023-09-10',
          nextDue: '2024-09-10',
          status: 'Upcoming'
        }
      ],
      medicalHistory: 'Working dog with excellent health. Training for search and rescue. Previous hip dysplasia screening normal.',
      allergies: ['None known'],
      lastConsultedDoctor: 'Dr. Sarah Johnson',
      temperament: 'Intelligent, loyal, protective, highly trainable',
      dietaryNeeds: 'High-energy working dog formula'
    },
    owner: {
      name: 'David Wilson',
      phone: '(555) 456-7890',
      email: 'david.wilson@email.com',
      address: {
        street: '789 Elm Drive',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62703'
      },
      occupation: 'Police Officer',
      emergencyContact: {
        name: 'Lisa Wilson',
        phone: '(555) 456-7891',
        relationship: 'Wife'
      }
    }
  },
  {
    id: '4',
    name: 'Bella',
    age: 4,
    mrn: 'MRN004',
    lastVisit: '2024-01-05',
    pet: {
      name: 'Bella',
      species: 'Dog',
      breed: 'Labrador Retriever',
      age: 4,
      gender: 'Female',
      weight: 55,
      color: 'Chocolate',
      microchipId: '982000789123456',
      imageUrl: 'https://images.unsplash.com/photo-1543466835-00a4907b8201?w=400&h=400&fit=crop&crop=face',
      vaccinations: [
        {
          name: 'Rabies',
          date: '2023-12-20',
          nextDue: '2024-12-20',
          status: 'Current'
        },
        {
          name: 'DHPP',
          date: '2023-12-01',
          nextDue: '2024-12-01',
          status: 'Current'
        }
      ],
      medicalHistory: 'Active family dog with great temperament. Previous dental cleaning in 2023. Loves swimming and retrieving.',
      allergies: ['Beef', 'Environmental allergens (seasonal)'],
      lastConsultedDoctor: 'Dr. Michael Chen',
      temperament: 'Gentle, playful, excellent with children',
      dietaryNeeds: 'Limited ingredient diet, fish-based protein'
    },
    owner: {
      name: 'Robert Thompson',
      phone: '(555) 345-6789',
      email: 'robert.thompson@email.com',
      address: {
        street: '567 Maple Street',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62704'
      },
      occupation: 'Software Engineer',
      emergencyContact: {
        name: 'Sarah Thompson',
        phone: '(555) 345-6790',
        relationship: 'Sister'
      }
    }
  },
  {
    id: '5',
    name: 'Whiskers',
    age: 6,
    mrn: 'MRN005',
    lastVisit: '2024-01-03',
    pet: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 6,
      gender: 'Female',
      weight: 8,
      color: 'White',
      microchipId: '982000321654987',
      imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop&crop=face',
      vaccinations: [
        {
          name: 'Rabies',
          date: '2023-10-15',
          nextDue: '2024-10-15',
          status: 'Current'
        },
        {
          name: 'FVRCP',
          date: '2023-09-20',
          nextDue: '2024-09-20',
          status: 'Current'
        }
      ],
      medicalHistory: 'Senior cat with previous dental issues. Regular grooming required due to long coat. Indoor cat with good health.',
      allergies: ['None known'],
      lastConsultedDoctor: 'Dr. Sarah Johnson',
      temperament: 'Quiet, dignified, enjoys being pampered',
      dietaryNeeds: 'Senior cat formula, dental health support'
    },
    owner: {
      name: 'Amanda Foster',
      phone: '(555) 678-9012',
      email: 'amanda.foster@email.com',
      address: {
        street: '890 Cedar Lane',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62705'
      },
      occupation: 'Veterinarian',
      emergencyContact: {
        name: 'James Foster',
        phone: '(555) 678-9013',
        relationship: 'Husband'
      }
    }
  }
];

// Comprehensive medical history records with full SOAP notes
export const mockHistoryRecords: HistoryRecord[] = [
  {
    id: 'h1',
    patientId: '1',
    date: '2024-01-15',
    chiefComplaint: 'Limping on left front paw, decreased appetite',
    diagnosis: 'Minor paw pad injury with mild inflammation',
    entities: ['limping', 'paw injury', 'decreased appetite', 'inflammation'],
    summary: 'Max presented with mild lameness on left front paw. Owner noticed decreased appetite over past 2 days. Physical examination revealed small cut on paw pad with mild swelling and redness.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Max has been limping on left front paw for 2 days. Decreased appetite noted. No recent trauma reported. Pet is otherwise active and alert.',
      objective: 'Vital signs normal. Left front paw shows small 0.5cm cut on pad with mild swelling and redness. No foreign objects present. Gait slightly altered due to discomfort. Appetite decreased but drinking normally.',
      assessment: 'Minor paw pad injury with secondary inflammation. No signs of infection. Pain level appears mild to moderate.',
      plan: 'Clean wound with saline solution. Apply topical antibiotic ointment twice daily. Monitor for signs of infection. Return in 3-5 days if no improvement. Owner advised to limit activity on rough surfaces.'
    },
    medications: ['Topical antibiotic ointment', 'Saline solution for cleaning'],
    followUpRequired: true,
    followUpDate: '2024-01-20'
  },
  {
    id: 'h2',
    patientId: '1',
    date: '2023-12-10',
    chiefComplaint: 'Ear infection, head shaking, scratching at ears',
    diagnosis: 'Otitis externa - bacterial ear infection',
    entities: ['ear infection', 'head shaking', 'scratching', 'otitis externa'],
    summary: 'Max presented with signs of ear discomfort including head shaking and excessive scratching. Examination revealed inflamed ear canal with discharge.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Max has been shaking head and scratching at ears for 3 days. Noticed dark discharge from left ear. Pet seems uncomfortable and irritable.',
      objective: 'Left ear canal inflamed with dark, malodorous discharge. Right ear appears normal. Temperature slightly elevated at 102.5°F. Ears sensitive to touch.',
      assessment: 'Otitis externa - bacterial ear infection in left ear. Secondary inflammation present.',
      plan: 'Clean ear canal thoroughly. Prescribe antibiotic ear drops for 7 days. Anti-inflammatory medication for 3 days. Recheck in 1 week. Owner instructed on proper ear cleaning technique.'
    },
    medications: ['Antibiotic ear drops', 'Anti-inflammatory medication', 'Ear cleaning solution'],
    followUpRequired: true,
    followUpDate: '2023-12-17'
  },
  {
    id: 'h3',
    patientId: '2',
    date: '2024-01-12',
    chiefComplaint: 'Excessive grooming and hair loss on back',
    diagnosis: 'Stress-related over-grooming with secondary dermatitis',
    entities: ['excessive grooming', 'hair loss', 'stress', 'dermatitis'],
    summary: 'Luna showing signs of stress-related over-grooming with significant hair loss on back. No parasites found. Environmental factors likely contributing.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Luna has been grooming excessively for 2 weeks, particularly on her back. Hair loss becoming noticeable. No changes in diet or environment recently.',
      objective: 'Significant hair loss on dorsal back area. Skin appears slightly red and irritated. No fleas or other parasites visible. Coat condition otherwise good. Weight stable.',
      assessment: 'Stress-related over-grooming with secondary dermatitis. No evidence of parasites or allergies. Behavioral component likely.',
      plan: 'Environmental enrichment recommendations provided. Feliway diffuser suggested. Topical anti-inflammatory cream for irritated skin. Monitor for improvement over 2 weeks. Consider anti-anxiety medication if no improvement.'
    },
    medications: ['Topical anti-inflammatory cream', 'Feliway diffuser'],
    followUpRequired: true,
    followUpDate: '2024-01-26'
  },
  {
    id: 'h4',
    patientId: '2',
    date: '2023-11-20',
    chiefComplaint: 'Annual wellness exam and vaccinations',
    diagnosis: 'Healthy adult cat - routine care',
    entities: ['wellness exam', 'vaccinations', 'routine care'],
    summary: 'Luna presented for annual wellness examination and routine vaccinations. Overall health excellent with no concerns noted.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Luna is doing well. No health concerns. Regular indoor cat with good appetite and activity level.',
      objective: 'Physical examination unremarkable. Weight appropriate for age and breed. Heart and lungs clear. Eyes, ears, and mouth healthy. Coat in excellent condition.',
      assessment: 'Healthy adult cat with no abnormalities detected.',
      plan: 'Administered annual vaccinations (Rabies, FVRCP). Next wellness exam in 12 months. Continue current diet and care routine.'
    },
    medications: ['Rabies vaccine', 'FVRCP vaccine'],
    followUpRequired: false
  },
  {
    id: 'h5',
    patientId: '3',
    date: '2024-01-08',
    chiefComplaint: 'Hip dysplasia screening and routine checkup',
    diagnosis: 'No evidence of hip dysplasia - healthy working dog',
    entities: ['hip dysplasia', 'screening', 'working dog', 'routine checkup'],
    summary: 'Buddy presented for routine hip dysplasia screening as part of working dog health assessment. No abnormalities detected.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Buddy is performing well in training. No lameness or stiffness noted. High energy level maintained.',
      objective: 'Physical examination normal. Hip range of motion excellent. No pain on manipulation. X-rays show normal hip joint conformation. Muscle tone excellent.',
      assessment: 'No evidence of hip dysplasia. Healthy working dog with excellent physical condition.',
      plan: 'Continue current exercise and training routine. Annual hip screening recommended. Maintain current diet and supplement regimen.'
    },
    medications: ['Joint supplement (continued)'],
    followUpRequired: false
  },
  {
    id: 'h6',
    patientId: '4',
    date: '2024-01-05',
    chiefComplaint: 'Dental cleaning and oral health assessment',
    diagnosis: 'Mild gingivitis - dental cleaning performed',
    entities: ['dental cleaning', 'gingivitis', 'oral health'],
    summary: 'Bella presented for routine dental cleaning. Mild gingivitis noted and addressed. Teeth cleaned and polished.',
    treatedBy: 'Dr. Michael Chen',
    soapNotes: {
      subjective: 'Owner reports Bella has been eating normally. No signs of oral discomfort. Regular dental care at home.',
      objective: 'Mild gingivitis noted on several teeth. No loose or damaged teeth. Dental cleaning and polishing performed under anesthesia. Recovery uneventful.',
      assessment: 'Mild gingivitis successfully treated with dental cleaning. No other oral health issues detected.',
      plan: 'Continue regular dental care at home. Dental chews recommended. Annual dental cleaning advised. Monitor for any changes in eating habits.'
    },
    medications: ['Dental chews', 'Oral rinse'],
    followUpRequired: false
  },
  {
    id: 'h7',
    patientId: '5',
    date: '2024-01-03',
    chiefComplaint: 'Senior wellness exam and blood work',
    diagnosis: 'Healthy senior cat with minor age-related changes',
    entities: ['senior wellness', 'blood work', 'age-related changes'],
    summary: 'Whiskers presented for annual senior wellness examination. Blood work shows minor age-related changes but overall health good.',
    treatedBy: 'Dr. Sarah Johnson',
    soapNotes: {
      subjective: 'Owner reports Whiskers is doing well for her age. Slightly less active but still playful. Good appetite maintained.',
      objective: 'Physical examination shows minor age-related changes. Blood work reveals slightly elevated kidney values but within normal range for age. Weight stable.',
      assessment: 'Healthy senior cat with minor age-related changes. No immediate health concerns.',
      plan: 'Continue current care routine. Monitor kidney function with blood work in 6 months. Senior diet recommended. Regular grooming to maintain coat condition.'
    },
    medications: ['Senior cat formula', 'Kidney support supplement'],
    followUpRequired: true,
    followUpDate: '2024-07-03'
  }
];

// Mock treatment suggestions for veterinary care
export const mockSuggestions: Suggestion[] = [
  {
    id: 's1',
    type: 'medication',
    title: 'Carprofen 75mg',
    description: 'NSAID for pain and inflammation in dogs',
    category: 'Pain Management'
  },
  {
    id: 's2',
    type: 'protocol',
    title: 'Dental Cleaning Protocol',
    description: 'Standard dental cleaning and oral health assessment',
    category: 'Dental'
  },
  {
    id: 's3',
    type: 'diagnostic',
    title: 'Hip X-rays',
    description: 'Radiographic evaluation for hip dysplasia',
    category: 'Imaging'
  },
  {
    id: 's4',
    type: 'medication',
    title: 'Gabapentin 100mg',
    description: 'For anxiety and neuropathic pain in cats',
    category: 'Behavioral/Pain'
  }
];

// Mock transcript chunks for veterinary consultation
export const mockTranscriptChunks: TranscriptChunk[] = [
  {
    id: 't1',
    text: "The owner reports that Max has been limping on his left front paw for two days.",
    entities: [
      { text: "limping", type: "symptom", confidence: 0.95 },
      { text: "left front paw", type: "symptom", confidence: 0.90 }
    ],
    timestamp: 1000
  },
  {
    id: 't2',
    text: "He's also been eating less than usual and seems less energetic during walks.",
    entities: [
      { text: "eating less", type: "symptom", confidence: 0.85 },
      { text: "less energetic", type: "symptom", confidence: 0.88 }
    ],
    timestamp: 2000
  },
  {
    id: 't3',
    text: "Physical examination reveals a small cut on the paw pad with mild swelling.",
    entities: [
      { text: "cut", type: "condition", confidence: 0.95 },
      { text: "paw pad", type: "symptom", confidence: 0.92 },
      { text: "swelling", type: "symptom", confidence: 0.90 }
    ],
    timestamp: 3000
  },
  {
    id: 't4',
    text: "No signs of infection present. Recommend topical antibiotic and monitoring.",
    entities: [
      { text: "topical antibiotic", type: "medication", confidence: 0.95 }
    ],
    timestamp: 4000
  }
];

// Mock ASR class
export class MockASR {
  private isRecording = false;
  private intervalId: NodeJS.Timeout | null = null;
  private chunkIndex = 0;
  
  start(onChunk: (chunk: TranscriptChunk) => void) {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.chunkIndex = 0;
    
    this.intervalId = setInterval(() => {
      if (this.chunkIndex < mockTranscriptChunks.length) {
        onChunk(mockTranscriptChunks[this.chunkIndex]);
        this.chunkIndex++;
      } else {
        this.stop();
      }
    }, 2000);
  }
  
  stop() {
    this.isRecording = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  get recording() {
    return this.isRecording;
  }
}

// Mock history finder
export class MockHistory {
  find(patientId: string, entities: string[]): HistoryRecord[] {
    return mockHistoryRecords.filter(record => 
      record.patientId === patientId &&
      entities.some(entity => 
        record.entities.some(recordEntity => 
          recordEntity.toLowerCase().includes(entity.toLowerCase()) ||
          entity.toLowerCase().includes(recordEntity.toLowerCase())
        )
      )
    );
  }
}

// Mock suggestion engine
export class MockSuggest {
  forContext(entities: string[]): Suggestion[] {
    return mockSuggestions.filter(suggestion => {
      const isRelevant = entities.some(entity => {
        const entityLower = entity.toLowerCase();
        return (
          suggestion.title.toLowerCase().includes(entityLower) ||
          suggestion.description.toLowerCase().includes(entityLower) ||
          (entityLower.includes('pain') && suggestion.category === 'Pain Management') ||
          (entityLower.includes('dental') && suggestion.category === 'Dental')
        );
      });
      return isRelevant;
    });
  }
}

// Mock records storage
export class MockRecords {
  private storage = new Map<string, SOAPNote[]>();
  
  save(patientId: string, soap: SOAPNote) {
    const existing = this.storage.get(patientId) || [];
    existing.push(soap);
    this.storage.set(patientId, existing);
  }
  
  get(patientId: string): SOAPNote[] {
    return this.storage.get(patientId) || [];
  }
  
  getLatest(patientId: string): SOAPNote | null {
    const records = this.get(patientId);
    return records.length > 0 ? records[records.length - 1] : null;
  }
}

// Initialize mock instances
export const mockASR = new MockASR();
export const mockHistory = new MockHistory();
export const mockSuggest = new MockSuggest();
export const mockRecords = new MockRecords();
