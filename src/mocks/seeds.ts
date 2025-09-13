export interface Patient {
  id: string;
  name: string;
  age: number;
  mrn: string;
  lastVisit?: string;
}

export interface HistoryRecord {
  id: string;
  patientId: string;
  date: string;
  chiefComplaint: string;
  diagnosis: string;
  entities: string[];
  summary: string;
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

// Mock patients
export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 34,
    mrn: 'MRN001',
    lastVisit: '2024-01-15'
  },
  {
    id: '2', 
    name: 'Michael Chen',
    age: 67,
    mrn: 'MRN002',
    lastVisit: '2024-01-10'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    age: 29,
    mrn: 'MRN003',
    lastVisit: '2024-01-08'
  }
];

// Mock history records
export const mockHistoryRecords: HistoryRecord[] = [
  {
    id: 'h1',
    patientId: '1',
    date: '2024-01-15',
    chiefComplaint: 'Persistent headaches and fatigue',
    diagnosis: 'Tension headache, possible migraine',
    entities: ['headache', 'fatigue', 'tension', 'migraine'],
    summary: 'Patient presented with bilateral headaches lasting 3 days, associated with fatigue. Physical exam normal. Started on sumatriptan.'
  },
  {
    id: 'h2',
    patientId: '2',
    date: '2024-01-10',
    chiefComplaint: 'Chest pain and shortness of breath',
    diagnosis: 'Stable angina',
    entities: ['chest pain', 'shortness of breath', 'angina', 'hypertension'],
    summary: 'Patient with known CAD presented with exertional chest pain. EKG stable. Increased metoprolol dose.'
  }
];

// Mock treatment suggestions
export const mockSuggestions: Suggestion[] = [
  {
    id: 's1',
    type: 'medication',
    title: 'Sumatriptan 50mg',
    description: 'For acute migraine treatment',
    category: 'Neurology'
  },
  {
    id: 's2',
    type: 'protocol',
    title: 'Migraine Protocol',
    description: 'Standard migraine assessment and treatment pathway',
    category: 'Neurology'
  },
  {
    id: 's3',
    type: 'diagnostic',
    title: 'CT Head',
    description: 'Consider for new onset severe headache',
    category: 'Imaging'
  },
  {
    id: 's4',
    type: 'medication',
    title: 'Metoprolol 50mg BID',
    description: 'Beta blocker for hypertension and angina',
    category: 'Cardiology'
  }
];

// Mock transcript chunks for demo
export const mockTranscriptChunks: TranscriptChunk[] = [
  {
    id: 't1',
    text: "Patient reports having severe headaches for the past three days.",
    entities: [
      { text: "severe headaches", type: "symptom", confidence: 0.95 },
    ],
    timestamp: 1000
  },
  {
    id: 't2', 
    text: "The pain is bilateral and throbbing in nature, worse in the morning.",
    entities: [
      { text: "bilateral", type: "symptom", confidence: 0.85 },
      { text: "throbbing", type: "symptom", confidence: 0.90 }
    ],
    timestamp: 2000
  },
  {
    id: 't3',
    text: "Patient also mentions feeling fatigued and having trouble concentrating.",
    entities: [
      { text: "fatigued", type: "symptom", confidence: 0.88 },
      { text: "trouble concentrating", type: "symptom", confidence: 0.82 }
    ],
    timestamp: 3000
  },
  {
    id: 't4',
    text: "No recent changes in medications. History of migraine.",
    entities: [
      { text: "migraine", type: "condition", confidence: 0.95 }
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
          (entityLower.includes('headache') && suggestion.category === 'Neurology') ||
          (entityLower.includes('chest') && suggestion.category === 'Cardiology')
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