import OpenAI from 'openai';
import { searchPlumb, initializePlumbRAG } from './plumbRAG';

// Define the SOAP note structure
export interface SoapNote {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

/**
 * Generates a structured SOAP note from a veterinary consultation transcript
 * @param transcript - The transcript of the veterinary consultation
 * @returns Promise<SoapNote> - Structured SOAP note with subjective, objective, assessment, and plan
 */
export async function generateSoapNote(transcript: string): Promise<SoapNote> {
  try {
    console.log('🤖 Generating SOAP note from transcript...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical scribe specialized in veterinary care. 
Your job is to extract and summarize the relevant information 
from the transcript into a structured SOAP note. 
Do not copy raw dialogue. Do not include greetings or small talk. 
Focus on clinical details only. 

Format strictly as JSON with keys: subjective, objective, assessment, plan.`
        },
        {
          role: "user",
          content: `Please generate a SOAP note from this veterinary consultation transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    console.log('🤖 Raw OpenAI response:', content);

    // Try to parse the JSON response
    try {
      const soapNote = JSON.parse(content) as SoapNote;
      
      // Validate that all required fields are present
      if (!soapNote.subjective || !soapNote.objective || !soapNote.assessment || !soapNote.plan) {
        throw new Error('Invalid SOAP note structure - missing required fields');
      }

      console.log('✅ SOAP note generated successfully');
      return soapNote;
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // Try to extract SOAP sections using regex as fallback
      const fallbackSoap = extractSoapFromText(content);
      if (fallbackSoap) {
        console.log('✅ Extracted SOAP note using fallback method');
        return fallbackSoap;
      }
      
      throw new Error('Failed to parse SOAP note from OpenAI response');
    }

  } catch (error) {
    console.error('❌ Error generating SOAP note:', error);
    
    // Return fallback empty SOAP note
    return {
      subjective: "Unable to generate subjective notes from transcript.",
      objective: "Unable to generate objective findings from transcript.",
      assessment: "Unable to generate assessment from transcript.",
      plan: "Unable to generate treatment plan from transcript."
    };
  }
}

/**
 * Fallback method to extract SOAP sections from text using regex patterns
 * @param text - The text response from OpenAI
 * @returns SoapNote | null - Extracted SOAP note or null if extraction fails
 */
function extractSoapFromText(text: string): SoapNote | null {
  try {
    const patterns = {
      subjective: /(?:subjective|s:)\s*:?\s*(.*?)(?=(?:objective|o:)|$)/is,
      objective: /(?:objective|o:)\s*:?\s*(.*?)(?=(?:assessment|a:)|$)/is,
      assessment: /(?:assessment|a:)\s*:?\s*(.*?)(?=(?:plan|p:)|$)/is,
      plan: /(?:plan|p:)\s*:?\s*(.*?)$/is
    };

    const result: SoapNote = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result[key as keyof SoapNote] = match[1].trim();
      }
    }

    // Check if we extracted at least some content
    const hasContent = Object.values(result).some(value => value.length > 0);
    return hasContent ? result : null;
    
  } catch (error) {
    console.error('❌ Error in fallback SOAP extraction:', error);
    return null;
  }
}

/**
 * Creates a SOAP note with historical context from previous notes and PlumbRAG integration
 * @param transcript - The raw transcript from Whisper AI
 * @param previousNotes - Array of prior SOAP notes for this patient
 * @returns Promise<SoapNote> - New SOAP note with historical context and PlumbRAG-enhanced Plan
 */
export async function createSoapNoteWithHistory(
  transcript: string, 
  previousNotes: SoapNote[]
): Promise<SoapNote> {
  try {
    console.log('🤖 Creating SOAP note with historical context and PlumbRAG...');
    console.log('📝 Transcript length:', transcript.length);
    console.log('📚 Previous notes count:', previousNotes.length);
    
    // Prepare historical context
    const historyContext = previousNotes.length > 0 
      ? previousNotes.map((note, index) => 
          `Previous Note ${index + 1}:\n` +
          `Subjective: ${note.subjective}\n` +
          `Objective: ${note.objective}\n` +
          `Assessment: ${note.assessment}\n` +
          `Plan: ${note.plan}\n`
        ).join('\n---\n')
      : 'No previous medical history available.';

    // First, generate S, O, A sections
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a medical scribe specialized in veterinary care. 
Your job is to extract and summarize the relevant information 
from the transcript into a structured SOAP note. 
Do not copy raw dialogue. Do not include greetings or small talk. 
Focus on clinical details only. 

Format strictly as JSON with keys: subjective, objective, assessment, plan.

Additional context: Consider the patient's medical history from previous SOAP notes to ensure continuity and reference ongoing treatments or follow-up items where relevant.`
        },
        {
          role: "user",
          content: `Please create a SOAP note from this consultation transcript, considering the patient's medical history:

CURRENT CONSULTATION TRANSCRIPT:
${transcript}

PATIENT'S MEDICAL HISTORY:
${historyContext}

Generate a new SOAP note that builds upon the historical context while focusing on today's visit.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    console.log('🤖 Raw OpenAI response:', content);

    // Try to parse the JSON response
    let soapNote: SoapNote;
    try {
      soapNote = JSON.parse(content) as SoapNote;
      
      // Validate that all required fields are present
      if (!soapNote.subjective || !soapNote.objective || !soapNote.assessment || !soapNote.plan) {
        throw new Error('Invalid SOAP note structure - missing required fields');
      }

    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // Try to extract SOAP sections using regex as fallback
      const fallbackSoap = extractSoapFromText(content);
      if (fallbackSoap) {
        soapNote = fallbackSoap;
      } else {
        throw new Error('Failed to parse SOAP note from OpenAI response');
      }
    }

    // Now enhance the Plan section using PlumbRAG
    try {
      console.log('🔍 Enhancing Plan section with PlumbRAG...');
      
      // Initialize PlumbRAG if not already done
      await initializePlumbRAG();
      
      // Build query based on assessment
      const assessmentQuery = `Treatment options for ${soapNote.assessment}`;
      console.log('🔍 PlumbRAG query:', assessmentQuery);
      
      // Search for relevant drug handbook context
      const plumbContext = await searchPlumb(assessmentQuery, 3);
      
      if (plumbContext.length > 0) {
        console.log(`📖 Retrieved ${plumbContext.length} relevant drug handbook entries`);
        
        // Generate enhanced Plan using PlumbRAG context
        const planResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a veterinary AI scribe.
Generate only the Plan section of a SOAP note.
Base your response on:
1. The current transcript
2. The patient's medical history
3. The following drug handbook context: ${plumbContext.join('\n\n')}

Only suggest treatments found in the drug handbook context.
Do not invent drugs or dosages.
Be specific about dosages and administration when available in the context.
Format as a clear, actionable treatment plan.`
            },
            {
              role: "user",
              content: `Generate a treatment plan based on:

TRANSCRIPT:
${transcript}

MEDICAL HISTORY:
${historyContext}

ASSESSMENT:
${soapNote.assessment}

DRUG HANDBOOK CONTEXT:
${plumbContext.join('\n\n')}

Create a specific, actionable plan using only treatments mentioned in the drug handbook context.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        const planContent = planResponse.choices[0]?.message?.content;
        if (planContent) {
          soapNote.plan = planContent.trim();
          console.log('✅ Plan section enhanced with PlumbRAG context');
        } else {
          console.warn('⚠️ No response for enhanced plan, keeping original');
        }
      } else {
        console.warn('⚠️ No PlumbRAG context found, keeping original plan');
      }
      
    } catch (plumbError) {
      console.error('❌ Error enhancing plan with PlumbRAG:', plumbError);
      console.log('📝 Continuing with original plan due to PlumbRAG error');
    }

    console.log('✅ SOAP note with history and PlumbRAG generated successfully');
    return soapNote;

  } catch (error) {
    console.error('❌ Error creating SOAP note with history:', error);
    
    // Return fallback empty SOAP note
    return {
      subjective: "Unable to generate subjective notes from transcript with historical context.",
      objective: "Unable to generate objective findings from transcript with historical context.",
      assessment: "Unable to generate assessment from transcript with historical context.",
      plan: "Unable to generate treatment plan from transcript with historical context."
    };
  }
}

/**
 * Example usage function (for testing)
 */
export async function testSoapGeneration() {
  const sampleTranscript = `
    The pet owner brought in their 3-year-old Golden Retriever named Max. 
    The owner reports that Max has been coughing for the past 3 days, 
    especially at night. The cough is dry and hacking. Max has been 
    lethargic and not eating as much as usual. No vomiting or diarrhea. 
    On examination, the dog appears alert but slightly dehydrated. 
    Temperature is 102.5°F, heart rate is 120 bpm, respiratory rate is 35/min. 
    Lungs sound clear on auscultation. No nasal discharge. 
    The dog is up to date on vaccinations. I suspect kennel cough 
    and recommend rest, increased fluids, and monitoring. 
    If symptoms worsen, return for further evaluation.
  `;

  try {
    const soapNote = await generateSoapNote(sampleTranscript);
    console.log('Generated SOAP Note:', soapNote);
    return soapNote;
  } catch (error) {
    console.error('Test failed:', error);
    return null;
  }
}

/**
 * Test function for SOAP note with history
 */
export async function testSoapWithHistory() {
  const sampleTranscript = `
    Follow-up visit for Max. The owner reports that the coughing has improved 
    significantly since last week. Max is now eating normally and seems more 
    energetic. The cough is now only occasional, mostly in the morning. 
    On examination, temperature is normal at 101.2°F, heart rate is 90 bpm, 
    respiratory rate is 25/min. Lungs are clear. No nasal discharge. 
    Max appears much more comfortable and active.
  `;

  const previousNotes: SoapNote[] = [
    {
      subjective: "Owner reports 3-day history of dry, hacking cough, especially at night. Dog lethargic, decreased appetite.",
      objective: "Temp 102.5°F, HR 120 bpm, RR 35/min. Lungs clear on auscultation. No nasal discharge.",
      assessment: "Suspected kennel cough (infectious tracheobronchitis)",
      plan: "Rest, increased fluids, monitoring. Return if symptoms worsen. Consider cough suppressant if needed."
    }
  ];

  try {
    const soapNote = await createSoapNoteWithHistory(sampleTranscript, previousNotes);
    console.log('Generated SOAP Note with History:', soapNote);
    return soapNote;
  } catch (error) {
    console.error('Test with history failed:', error);
    return null;
  }
}

/**
 * Test function for SOAP note with PlumbRAG integration
 */
export async function testSoapWithPlumbRAG() {
  const sampleTranscript = `
    New patient visit for Buddy, a 5-year-old Golden Retriever. Owner reports 
    that Buddy has been scratching excessively for the past week, especially 
    around the ears and belly. The skin appears red and inflamed in these areas. 
    Owner also noticed some hair loss. No previous skin issues. 
    On examination, temperature is 101.8°F, heart rate is 95 bpm. 
    Skin examination reveals erythema and mild alopecia on the ventral abdomen 
    and around the ears. No visible parasites. Ears are clean. 
    Suspected allergic dermatitis or bacterial skin infection.
  `;

  const previousNotes: SoapNote[] = [];

  try {
    console.log('🧪 Testing SOAP generation with PlumbRAG integration...');
    const soapNote = await createSoapNoteWithHistory(sampleTranscript, previousNotes);
    console.log('✅ Generated SOAP Note with PlumbRAG:', soapNote);
    return soapNote;
  } catch (error) {
    console.error('❌ Test with PlumbRAG failed:', error);
    return null;
  }
}
