import { create } from 'zustand';
import { Patient, TranscriptChunk, HistoryRecord, Suggestion, SOAPNote } from '@/mocks/seeds';

export interface MedoraState {
  // Current session
  currentPatient: Patient | null;
  isRecording: boolean;
  transcript: TranscriptChunk[];
  
  // Context and suggestions
  detectedEntities: string[];
  historyMatches: HistoryRecord[];
  suggestions: Suggestion[];
  
  // SOAP note
  soapNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  
  // UI state
  showPreview: boolean;
  
  // Actions
  setCurrentPatient: (patient: Patient | null) => void;
  setRecording: (recording: boolean) => void;
  addTranscriptChunk: (chunk: TranscriptChunk) => void;
  clearTranscript: () => void;
  setDetectedEntities: (entities: string[]) => void;
  setHistoryMatches: (matches: HistoryRecord[]) => void;
  setSuggestions: (suggestions: Suggestion[]) => void;
  updateSOAPNote: (section: keyof MedoraState['soapNote'], content: string) => void;
  setSOAPNote: (soapNote: MedoraState['soapNote']) => void;
  clearSOAPNote: () => void;
  setShowPreview: (show: boolean) => void;
  resetSession: () => void;
}

export const useMedoraStore = create<MedoraState>((set, get) => ({
  // Initial state
  currentPatient: null,
  isRecording: false,
  transcript: [],
  detectedEntities: [],
  historyMatches: [],
  suggestions: [],
  soapNote: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  },
  showPreview: false,
  
  // Actions
  setCurrentPatient: (patient) => set({ currentPatient: patient }),
  
  setRecording: (recording) => set({ isRecording: recording }),
  
  addTranscriptChunk: (chunk) => {
    const { transcript, detectedEntities } = get();
    const newTranscript = [...transcript, chunk];
    
    // Extract entities from the new chunk
    const newEntities = chunk.entities.map(e => e.text);
    const allEntities = [...detectedEntities, ...newEntities];
    const uniqueEntities = Array.from(new Set(allEntities));
    
    set({ 
      transcript: newTranscript,
      detectedEntities: uniqueEntities
    });
  },
  
  clearTranscript: () => set({ 
    transcript: [],
    detectedEntities: []
  }),
  
  setDetectedEntities: (entities) => set({ detectedEntities: entities }),
  
  setHistoryMatches: (matches) => set({ historyMatches: matches }),
  
  setSuggestions: (suggestions) => set({ suggestions }),
  
  updateSOAPNote: (section, content) => {
    const { soapNote } = get();
    set({
      soapNote: {
        ...soapNote,
        [section]: content
      }
    });
  },
  
  setSOAPNote: (soapNote) => set({ soapNote }),
  
  clearSOAPNote: () => set({
    soapNote: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    }
  }),
  
  setShowPreview: (show) => set({ showPreview: show }),
  
  resetSession: () => set({
    currentPatient: null,
    isRecording: false,
    transcript: [],
    detectedEntities: [],
    historyMatches: [],
    suggestions: [],
    soapNote: {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    },
    showPreview: false
  })
}));