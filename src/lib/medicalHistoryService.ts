import { db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { HistoryRecord } from '@/mocks/seeds';

export interface FirestoreMedicalRecord {
  id: string;
  patientId: string;
  petName: string;
  mrn: string;
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
  followUpDate?: string | null;
}

/**
 * Fetch past medical records for a specific pet from Firestore
 * @param petName - Name of the pet
 * @param patientId - Patient ID (optional, for additional filtering)
 * @returns Array of HistoryRecord objects
 */
export async function fetchMedicalHistory(
  petName: string,
  patientId?: string
): Promise<HistoryRecord[]> {
  try {
    console.log(`📋 Fetching medical history for pet: ${petName}`);
    
    const medicalRecordsRef = collection(db, 'past_medical_records');
    
    // Create query to filter by pet name
    const q = query(
      medicalRecordsRef,
      where('petName', '==', petName),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`ℹ️ No medical history found for ${petName}`);
      return [];
    }

    const records: HistoryRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreMedicalRecord;
      
      // Convert Firestore document to HistoryRecord format
      const record: HistoryRecord = {
        id: doc.id,
        patientId: data.patientId,
        date: data.date,
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        entities: data.entities || [],
        summary: data.summary,
        treatedBy: data.treatedBy,
        soapNotes: data.soapNotes,
        medications: data.medications || [],
        followUpRequired: data.followUpRequired || false,
        followUpDate: data.followUpDate || undefined
      };
      
      records.push(record);
    });

    console.log(`✅ Found ${records.length} medical records for ${petName}`);
    return records;
    
  } catch (error) {
    console.error('❌ Error fetching medical history from Firestore:', error);
    throw error;
  }
}

/**
 * Fetch all medical records (for administrative purposes)
 * @returns Array of all medical records
 */
export async function fetchAllMedicalRecords(): Promise<HistoryRecord[]> {
  try {
    const medicalRecordsRef = collection(db, 'past_medical_records');
    const q = query(medicalRecordsRef, orderBy('date', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const records: HistoryRecord[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreMedicalRecord;
      records.push({
        id: doc.id,
        patientId: data.patientId,
        date: data.date,
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        entities: data.entities || [],
        summary: data.summary,
        treatedBy: data.treatedBy,
        soapNotes: data.soapNotes,
        medications: data.medications || [],
        followUpRequired: data.followUpRequired || false,
        followUpDate: data.followUpDate || undefined
      });
    });

    return records;
  } catch (error) {
    console.error('Error fetching all medical records:', error);
    throw error;
  }
}
