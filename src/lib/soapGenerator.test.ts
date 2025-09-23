// Test file for SOAP generator (can be removed in production)
import { generateSoapNote, createSoapNoteWithHistory, testSoapGeneration, testSoapWithHistory } from './soapGenerator';

// Example usage as requested
export async function exampleUsage() {
  const transcript = "The pet has been coughing for 3 days, owner says it worsens at night. The dog is lethargic and not eating well. On examination, temperature is 102.5°F, heart rate elevated. Lungs sound clear. Suspect kennel cough, recommend rest and monitoring.";
  
  try {
    const soapNote = await generateSoapNote(transcript);
    console.log('Example SOAP Note:', soapNote);
    console.log('Assessment:', soapNote.assessment);
    return soapNote;
  } catch (error) {
    console.error('Example failed:', error);
    return null;
  }
}

// Example usage with historical context
export async function exampleUsageWithHistory() {
  const transcript = "Follow-up visit. The coughing has improved significantly. Dog is now eating normally and more energetic. Temperature normal, lungs clear.";
  
  const previousNotes = [
    {
      subjective: "3-day history of dry, hacking cough, especially at night. Dog lethargic, decreased appetite.",
      objective: "Temp 102.5°F, HR 120 bpm, RR 35/min. Lungs clear on auscultation.",
      assessment: "Suspected kennel cough (infectious tracheobronchitis)",
      plan: "Rest, increased fluids, monitoring. Return if symptoms worsen."
    }
  ];
  
  try {
    const soapNote = await createSoapNoteWithHistory(transcript, previousNotes);
    console.log('Example SOAP Note with History:', soapNote);
    console.log('Plan:', soapNote.plan);
    return soapNote;
  } catch (error) {
    console.error('Example with history failed:', error);
    return null;
  }
}

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - you can call this from console
  (window as any).testSoapGeneration = testSoapGeneration;
  (window as any).testSoapWithHistory = testSoapWithHistory;
  (window as any).exampleUsage = exampleUsage;
  (window as any).exampleUsageWithHistory = exampleUsageWithHistory;
  console.log('SOAP Generator test functions available:');
  console.log('- testSoapGeneration()');
  console.log('- testSoapWithHistory()');
  console.log('- exampleUsage()');
  console.log('- exampleUsageWithHistory()');
}
