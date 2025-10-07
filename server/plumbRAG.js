const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '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',
});

// Global variables for PlumbRAG
let plumbData = null;

/**
 * Extract pet information from transcript
 */
async function extractPetInfo(transcript) {
  try {
    console.log('🐕 Extracting pet information from transcript...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a veterinary assistant. Extract pet information from the consultation transcript.
          
          Return ONLY a JSON object with these fields:
          - species: "dog", "cat", "bird", "rabbit", etc. (or "unknown" if not mentioned)
          - breed: specific breed if mentioned (or "unknown" if not mentioned)
          - age: age in years if mentioned (or "unknown" if not mentioned)
          - weight: weight in kg if mentioned (or "unknown" if not mentioned)
          - sex: "male", "female", or "unknown" if not mentioned
          
          If any information is not clearly mentioned, use "unknown" for that field.
          Be conservative - only extract information that is explicitly stated.`
        },
        {
          role: "user",
          content: `Extract pet information from this transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.1,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.warn('⚠️ No response for pet info extraction');
      return { species: 'unknown', breed: 'unknown', age: 'unknown', weight: 'unknown', sex: 'unknown' };
    }

    let petInfo;
    try {
      let cleanedResponse = content.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
      }
      
      petInfo = JSON.parse(cleanedResponse);
      console.log('🐕 Extracted pet info:', petInfo);
    } catch (parseError) {
      console.error('❌ Failed to parse pet info JSON:', parseError);
      petInfo = { species: 'unknown', breed: 'unknown', age: 'unknown', weight: 'unknown', sex: 'unknown' };
    }

    return petInfo;
  } catch (error) {
    console.error('❌ Error extracting pet info:', error);
    return { species: 'unknown', breed: 'unknown', age: 'unknown', weight: 'unknown', sex: 'unknown' };
  }
}

/**
 * Initialize the PlumbRAG system by loading embeddings data
 */
async function initializePlumbRAG() {
  try {
    console.log('🔧 Initializing PlumbRAG system...');
    
    // Load the preprocessed embeddings from the parent directory
    const embeddingsPath = path.join(__dirname, '..', 'data', 'plumb_embeddings.json');
    
    if (!fs.existsSync(embeddingsPath)) {
      console.log('⚠️ Plumb embeddings file not found, skipping PlumbRAG initialization');
      return;
    }
    
    // Add timeout and error handling for large file reading
    const fileContent = fs.readFileSync(embeddingsPath, 'utf8');
    if (!fileContent || fileContent.trim().length === 0) {
      console.log('⚠️ Plumb embeddings file is empty, skipping PlumbRAG initialization');
      return;
    }
    
    plumbData = JSON.parse(fileContent);
    
    if (!plumbData || !plumbData.chunks || !Array.isArray(plumbData.chunks)) {
      console.log('⚠️ Invalid Plumb embeddings data structure, skipping PlumbRAG initialization');
      return;
    }
    
    console.log(`📚 Loaded ${plumbData.chunks.length} chunks from plumb embeddings`);
    console.log('✅ PlumbRAG system initialized successfully');
    
  } catch (error) {
    console.error('❌ Error initializing PlumbRAG system:', error.message);
    console.log('⚠️ Continuing without PlumbRAG - plan generation will use basic templates');
    // Don't throw error, just log it so the server can continue without PlumbRAG
  }
}

/**
 * Search the Plumb drug handbook for relevant information using enhanced keyword matching
 * @param {string} query - The search query
 * @param {number} k - Number of results to return (default: 3)
 * @returns {Promise<string[]>} - Array of relevant chunk texts
 */
async function searchPlumb(query, k = 3) {
  try {
    console.log(`🔍 Searching Plumb for: "${query}" (k=${k})`);
    
    if (!plumbData) {
      console.warn('⚠️ PlumbRAG not initialized, initializing now...');
      await initializePlumbRAG();
    }
    
    if (!plumbData || !plumbData.chunks) {
      console.warn('⚠️ PlumbRAG still not available, returning empty results');
      return [];
    }
    
    // Enhanced keyword-based search with drug-specific prioritization
    const queryWords = query.toLowerCase().split(/\s+/);
    const scoredChunks = plumbData.chunks.map((chunk, index) => {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      
      // Extract potential drug names and medical terms from query
      const drugNames = queryWords.filter(word => 
        word.length > 3 && 
        !['treatment', 'options', 'for', 'bronchitis', 'pneumonia', 'infection', 'respiratory', 'mg/kg', 'dosage', 'weight', 'years', 'old', 'dogs', 'cats', 'dog', 'cat', 'anti-emetic', 'anti-nausea', 'anti-diarrheal', 'anti-inflammatory', 'antibiotic', 'bacterial', 'analgesic', 'antihistamine', 'anticonvulsant', 'cardiac', 'renal', 'diabetes', 'thyroid', 'anxiety', 'behavioral'].includes(word)
      );
      
      // Also extract specific drug names that might be in the query
      const specificDrugs = queryWords.filter(word => 
        ['ondansetron', 'metoclopramide', 'maropitant', 'metronidazole', 'kaolin', 'pectin', 'amoxicillin', 'doxycycline', 'cephalexin', 'clindamycin', 'trimethoprim', 'gentamicin', 'mometasone', 'carprofen', 'meloxicam', 'tramadol', 'prednisolone', 'diphenhydramine', 'cetirizine', 'phenobarbital', 'levetiracetam', 'diazepam', 'pimobendan', 'furosemide', 'enalapril', 'levothyroxine', 'methimazole', 'fluoxetine', 'trazodone', 'alprazolam', 'gabapentin', 'mupirocin'].includes(word)
      );
      
      // Also look for specific medical condition keywords
      const conditionKeywords = queryWords.filter(word => 
        ['vomiting', 'nausea', 'gastritis', 'emesis', 'diarrhea', 'gastroenteritis', 'enteritis', 'anti-emetic', 'anti-nausea', 'anti-diarrheal', 'antibiotic', 'bacterial', 'pain', 'analgesic', 'inflammation', 'anti-inflammatory', 'allergy', 'allergic', 'antihistamine', 'respiratory', 'bronchitis', 'pneumonia', 'cough', 'skin', 'dermatitis', 'pyoderma', 'urinary', 'uti', 'cystitis', 'ear', 'otitis', 'arthritic', 'lameness', 'pruritus', 'itching', 'seizure', 'epilepsy', 'convulsion', 'heart', 'cardiac', 'cardiomyopathy', 'kidney', 'renal', 'azotemia', 'diabetes', 'diabetic', 'hyperglycemia', 'thyroid', 'hypothyroid', 'hyperthyroid', 'anxiety', 'behavioral', 'stress', 'septic'].includes(word)
      );
      
      // Highest score for specific drug name matches
      specificDrugs.forEach(drug => {
        if (chunkLower.includes(drug)) {
          score += 8; // Highest weight for specific drug matches
        }
      });
      
      // Higher score for drug name matches
      drugNames.forEach(drug => {
        if (chunkLower.includes(drug)) {
          score += 5; // Higher weight for drug name matches
        }
      });
      
      // High score for condition-specific keywords
      conditionKeywords.forEach(condition => {
        if (chunkLower.includes(condition)) {
          score += 4; // High weight for condition matches
        }
      });
      
      // Score based on other keyword matches
      queryWords.forEach(word => {
        if (chunkLower.includes(word)) {
          score += 1;
        }
      });
      
      // Bonus points for dosage information
      if (chunkLower.includes('mg/kg') || chunkLower.includes('dosage') || chunkLower.includes('doses')) {
        score += 3;
      }
      
      // Bonus points for specific drug sections
      if (chunkLower.includes('doses dogs') || chunkLower.includes('doses cats') || chunkLower.includes('doses dogs/cats')) {
        score += 4;
      }
      
      // Bonus points for weight-specific information
      if (chunkLower.includes('kg') || chunkLower.includes('weight') || chunkLower.includes('body weight')) {
        score += 2;
      }
      
      // Bonus points for age-specific information
      if (chunkLower.includes('puppy') || chunkLower.includes('kitten') || chunkLower.includes('adult') || chunkLower.includes('senior') || chunkLower.includes('young') || chunkLower.includes('old')) {
        score += 2;
      }
      
      // Bonus points for species-specific information
      if (chunkLower.includes('dog') || chunkLower.includes('cat') || chunkLower.includes('canine') || chunkLower.includes('feline')) {
        score += 1;
      }
      
      // Bonus points for administration instructions
      if (chunkLower.includes('po') || chunkLower.includes('orally') || chunkLower.includes('subcutaneous') || chunkLower.includes('intramuscular')) {
        score += 2;
      }
      
      return { chunk, score, index };
    });
    
    // Sort by score and return top k results
    const results = scoredChunks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map(item => item.chunk);
    
    console.log(`📖 Found ${results.length} relevant chunks`);
    
    // Log the actual content being returned for debugging
    results.forEach((result, index) => {
      console.log(`📖 Result ${index + 1}: ${result.substring(0, 200)}...`);
    });
    
    return results;
    
  } catch (error) {
    console.error('❌ Error searching Plumb:', error);
    // Return empty array on error to allow graceful degradation
    return [];
  }
}

/**
 * Enhanced SOAP generation with PlumbRAG integration
 * @param {string} transcript - The transcript text
 * @param {Array} previousNotes - Previous SOAP notes
 * @returns {Promise<Object>} - Enhanced SOAP note with PlumbRAG context
 */
async function generateEnhancedSOAP(transcript, previousNotes = [], generatePlan = true) {
  try {
    console.log('🤖 Generating enhanced SOAP with PlumbRAG...');
    
    // First, generate S, O, A sections
    const systemPrompt = `You are a medical scribe specialized in veterinary care.

Your task is to extract and summarize clinically relevant information 
from the given transcript into a structured SOAP note for a pet patient.

Follow these rules:
1. Do NOT copy dialogue verbatim.
2. Omit greetings, filler, or non-clinical details.
3. Capture all clinical information accurately — including symptoms, owner observations, 
   duration, appetite, vomiting, stool changes, hydration, medications, and any suspected causes 
   (e.g., ingestion, infection, obstruction, etc.).
4. Reflect physical exam findings and the veterinarian's medical judgment.
5. In the Assessment, include a differential diagnosis list ranked by likelihood.
6. The Plan should summarize the veterinarian's immediate recommendations 
   (diet, medication, diagnostics, monitoring, or follow-up).
7. Maintain continuity with prior SOAP notes if available, referencing ongoing treatments or prior findings.

Format output strictly as valid JSON with keys:
{
  "subjective": "",
  "objective": "",
  "assessment": "${generatePlan ? '", "plan": ""' : ''}"
}

Ensure each value is a single descriptive paragraph (no bullet points, no nested objects).
${generatePlan ? '' : 'Do not include a plan section - only generate subjective, objective, and assessment.'}`;

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

    const userPrompt = `Please create a SOAP note from this consultation transcript, considering the patient's medical history:

CURRENT CONSULTATION TRANSCRIPT:
${transcript}

PATIENT'S MEDICAL HISTORY:
${historyContext}

Generate a new SOAP note that builds upon the historical context while focusing on today's visit.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
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
    let soapNote;
    try {
      // Clean the response to extract JSON from markdown code blocks
      let cleanedResponse = content.trim();
      
      // Remove markdown code block markers
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '');
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '');
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/\s*```$/, '');
      }
      
      soapNote = JSON.parse(cleanedResponse);
      
      // Validate that all required fields are present
      const requiredFields = ['subjective', 'objective', 'assessment'];
      if (generatePlan) requiredFields.push('plan');
      
      for (const field of requiredFields) {
        if (!soapNote[field]) {
          throw new Error(`Invalid SOAP note structure - missing required field: ${field}`);
        }
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

    // Now enhance the Plan section using PlumbRAG (only if generatePlan is true)
    if (generatePlan) {
      try {
        console.log('🔍 Enhancing Plan section with PlumbRAG...');
      
      // Extract pet information from transcript
      const petInfo = await extractPetInfo(transcript);
      
      // Initialize PlumbRAG if not already done
      await initializePlumbRAG();
      
      // Build more specific query based on assessment and pet info
      let assessmentQuery = '';
      
      // Extract key medical terms from assessment for better drug matching
      const assessment = soapNote.assessment || '';
      const assessmentLower = assessment.toLowerCase();
      
      // Identify common conditions and symptoms for better drug matching
      if (assessmentLower.includes('vomiting') || assessmentLower.includes('nausea') || assessmentLower.includes('gastritis') || assessmentLower.includes('emesis')) {
        assessmentQuery = 'anti-emetic anti-nausea vomiting gastritis ondansetron metoclopramide maropitant';
      } else if (assessmentLower.includes('diarrhea') || assessmentLower.includes('gastroenteritis') || assessmentLower.includes('loose stool') || assessmentLower.includes('enteritis')) {
        assessmentQuery = 'anti-diarrheal gastroenteritis diarrhea treatment metronidazole kaolin pectin';
      } else if (assessmentLower.includes('respiratory') || assessmentLower.includes('bronchitis') || assessmentLower.includes('pneumonia') || assessmentLower.includes('cough') || assessmentLower.includes('upper respiratory')) {
        assessmentQuery = 'antibiotic respiratory infection bronchitis pneumonia amoxicillin doxycycline';
      } else if (assessmentLower.includes('skin') || assessmentLower.includes('dermatitis') || assessmentLower.includes('pyoderma') || assessmentLower.includes('hot spot')) {
        assessmentQuery = 'antibiotic skin infection dermatitis pyoderma cephalexin clindamycin';
      } else if (assessmentLower.includes('urinary') || assessmentLower.includes('uti') || assessmentLower.includes('cystitis') || assessmentLower.includes('bladder')) {
        assessmentQuery = 'antibiotic urinary tract infection cystitis amoxicillin trimethoprim';
      } else if (assessmentLower.includes('ear') || assessmentLower.includes('otitis') || assessmentLower.includes('aural')) {
        assessmentQuery = 'antibiotic ear infection otitis topical gentamicin mometasone';
      } else if (assessmentLower.includes('pain') || assessmentLower.includes('analgesic') || assessmentLower.includes('arthritic') || assessmentLower.includes('lameness')) {
        assessmentQuery = 'analgesic pain management NSAID carprofen meloxicam tramadol';
      } else if (assessmentLower.includes('inflammation') || assessmentLower.includes('inflammatory') || assessmentLower.includes('arthritis')) {
        assessmentQuery = 'anti-inflammatory treatment NSAID carprofen meloxicam prednisolone';
      } else if (assessmentLower.includes('allergy') || assessmentLower.includes('allergic') || assessmentLower.includes('pruritus') || assessmentLower.includes('itching')) {
        assessmentQuery = 'antihistamine allergy treatment diphenhydramine cetirizine prednisolone';
      } else if (assessmentLower.includes('seizure') || assessmentLower.includes('epilepsy') || assessmentLower.includes('convulsion')) {
        assessmentQuery = 'anticonvulsant seizure treatment phenobarbital levetiracetam diazepam';
      } else if (assessmentLower.includes('heart') || assessmentLower.includes('cardiac') || assessmentLower.includes('cardiomyopathy')) {
        assessmentQuery = 'cardiac heart treatment pimobendan furosemide enalapril';
      } else if (assessmentLower.includes('kidney') || assessmentLower.includes('renal') || assessmentLower.includes('azotemia')) {
        assessmentQuery = 'renal kidney treatment fluid therapy phosphate binder';
      } else if (assessmentLower.includes('diabetes') || assessmentLower.includes('diabetic') || assessmentLower.includes('hyperglycemia')) {
        assessmentQuery = 'diabetes insulin treatment glucose monitoring';
      } else if (assessmentLower.includes('thyroid') || assessmentLower.includes('hypothyroid') || assessmentLower.includes('hyperthyroid')) {
        assessmentQuery = 'thyroid treatment levothyroxine methimazole';
      } else if (assessmentLower.includes('anxiety') || assessmentLower.includes('behavioral') || assessmentLower.includes('stress')) {
        assessmentQuery = 'anxiety behavioral treatment fluoxetine trazodone alprazolam';
      } else if (assessmentLower.includes('infection') || assessmentLower.includes('bacterial') || assessmentLower.includes('septic')) {
        assessmentQuery = 'antibiotic bacterial infection treatment amoxicillin cephalexin doxycycline';
      } else {
        // Fallback: use the assessment text itself with common medical terms
        assessmentQuery = assessment.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim() + ' treatment medication dosage';
      }
      
      // Add species-specific information to query
      if (petInfo.species !== 'unknown') {
        assessmentQuery += ` ${petInfo.species}`;
      } else {
        assessmentQuery += ` dogs cats`;
      }
      
      // Add weight and age considerations
      if (petInfo.weight !== 'unknown') {
        assessmentQuery += ` ${petInfo.weight}kg weight`;
      }
      if (petInfo.age !== 'unknown') {
        assessmentQuery += ` ${petInfo.age} years old`;
      }
      
      assessmentQuery += ` dosage mg/kg`;
      
      console.log('🔍 PlumbRAG query:', assessmentQuery);
      console.log('🐕 Pet info used:', petInfo);
      
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
              content: `You are a veterinary AI scribe specializing in treatment plans following Plumb's Veterinary Drug Handbook standards.
Generate only the Plan section of a SOAP note.
Base your response on:
1. The current transcript
2. The patient's medical history
3. The following drug handbook context: ${plumbContext.join('\n\n')}

PATIENT INFORMATION:
- Species: ${petInfo.species}
- Breed: ${petInfo.breed}
- Age: ${petInfo.age} years
- Weight: ${petInfo.weight} kg
- Sex: ${petInfo.sex}

PLUMB PRESCRIPTION STANDARDS:
- Use ONLY drugs found in the Plumb handbook context provided that are appropriate for the specific condition
- For vomiting/nausea/gastritis: prioritize anti-emetics like ondansetron, metoclopramide, maropitant
- For diarrhea/gastroenteritis: consider anti-diarrheals like metronidazole, kaolin/pectin, or probiotics
- For respiratory infections: use appropriate antibiotics like amoxicillin, doxycycline, or cephalexin
- For skin infections: consider topical or systemic antibiotics like cephalexin, clindamycin, or mupirocin
- For urinary tract infections: use appropriate antibiotics like amoxicillin, trimethoprim-sulfa, or cephalexin
- For ear infections: consider topical treatments with gentamicin, mometasone, or systemic antibiotics
- For pain/arthritis: use appropriate analgesics like carprofen, meloxicam, tramadol, or gabapentin
- For inflammation: consider NSAIDs like carprofen, meloxicam, or corticosteroids like prednisolone
- For allergies/pruritus: use antihistamines like diphenhydramine, cetirizine, or corticosteroids
- For seizures: consider anticonvulsants like phenobarbital, levetiracetam, or diazepam
- For cardiac conditions: use appropriate cardiac medications like pimobendan, furosemide, or enalapril
- For renal conditions: consider fluid therapy, phosphate binders, or renal support medications
- For diabetes: use insulin therapy and glucose monitoring protocols
- For thyroid conditions: use levothyroxine for hypothyroidism or methimazole for hyperthyroidism
- For anxiety/behavioral: consider fluoxetine, trazodone, or alprazolam
- For general bacterial infections: use appropriate antibiotics based on the specific infection type
- Include Plumb drug codes when available in the context
- Follow Plumb's dosage ranges and administration schedules exactly
- Use species-specific dosing (dogs vs cats) as specified in Plumb
- Consider age-related adjustments (puppy/kitten vs adult vs senior)
- Include contraindications and warnings from Plumb handbook
- Specify exact administration routes (PO, SC, IM, IV) as per Plumb
- Include duration of treatment as specified in Plumb
- Calculate precise dosages based on patient weight when weight is known

DOSAGE CALCULATION RULES:
- If patient weight is known: Calculate exact dose (e.g., 10 mg/kg × ${petInfo.weight} kg = ${petInfo.weight !== 'unknown' ? (10 * parseFloat(petInfo.weight)).toFixed(1) : 'X'} mg)
- If weight unknown: Use mg/kg dosing with note to calculate based on actual weight
- Always include the mg/kg dose AND calculated total dose when weight is known
- Use Plumb's exact dosing intervals (q8h, q12h, etc.)

PRESCRIPTION FORMAT:
For each medication, include:
- Drug name (generic and brand if available)
- Plumb code (if mentioned in context)
- Exact dosage calculation
- Administration route and frequency
- Duration of treatment
- Contraindications/warnings
- Monitoring requirements

Format the plan as:
**Plan:**

1. **Diagnostics:** [specific diagnostic tests based on clinical signs]
2. **Medications:** 
   - [Drug Name] (Plumb Code: [if available])
     - Dosage: [calculated dose] mg/kg PO q[X]h for [duration]
     - Total dose: [calculated total] mg [route] q[X]h
     - Duration: [X] days
     - Contraindications: [if any]
3. **Follow-Up:** [monitoring schedule and recheck timing]

IMPORTANT: Only include these 3 sections. Do not include Client Education or Environmental Management. Use exact Plumb dosages and include Plumb codes when available.`
            },
            {
              role: "user",
              content: `Generate a treatment plan based on:

PATIENT INFORMATION:
- Species: ${petInfo.species}
- Breed: ${petInfo.breed}
- Age: ${petInfo.age} years
- Weight: ${petInfo.weight} kg
- Sex: ${petInfo.sex}

TRANSCRIPT:
${transcript}

MEDICAL HISTORY:
${historyContext}

ASSESSMENT:
${soapNote.assessment}

DRUG HANDBOOK CONTEXT:
${plumbContext.join('\n\n')}

IMPORTANT: 
- Extract the exact dosages from the drug handbook context above
- Calculate the actual dose based on the patient's weight (${petInfo.weight} kg)
- Use species-specific dosing when available (${petInfo.species})
- Consider age-related adjustments if needed (${petInfo.age} years old)
- Use the specific mg/kg dosing and administration schedules provided in the handbook
- Do not modify or estimate dosages - calculate them precisely based on patient weight`
            }
          ],
          temperature: 0.2,
          max_tokens: 800,
        });

        const planContent = planResponse.choices[0]?.message?.content;
        if (planContent) {
          soapNote.plan = planContent.trim();
          console.log('✅ Plan section enhanced with PlumbRAG context');
          console.log('📋 Generated plan content:', planContent);
        } else {
          console.warn('⚠️ No response for enhanced plan, keeping original');
        }
      } else {
        console.warn('⚠️ No PlumbRAG context found, generating basic plan template');
        // Generate a basic plan template when PlumbRAG is not available
        soapNote.plan = `**Plan:**

1. **Diagnostics:**
   - Perform diagnostic tests as indicated by clinical signs.

2. **Medications:**
   - Prescribe appropriate medications based on assessment and clinical judgment.
   - Consider patient-specific factors: ${petInfo.species !== 'unknown' ? `Species: ${petInfo.species}` : 'Species: Unknown'}, ${petInfo.weight !== 'unknown' ? `Weight: ${petInfo.weight} kg` : 'Weight: Unknown'}, ${petInfo.age !== 'unknown' ? `Age: ${petInfo.age} years` : 'Age: Unknown'}

3. **Follow-Up:**
   - Schedule follow-up appointment to monitor response to treatment.`;
      }
      
      } catch (plumbError) {
        console.error('❌ Error enhancing plan with PlumbRAG:', plumbError);
        console.log('📝 Continuing with original plan due to PlumbRAG error');
      }
    } else {
      console.log('✅ SOAP note generated successfully (plan generation skipped)');
    }
    
    return soapNote;

  } catch (error) {
    console.error('❌ Error generating enhanced SOAP:', error);
    throw error;
  }
}

/**
 * Fallback method to extract SOAP sections from text using regex patterns
 * @param {string} text - The text response from OpenAI
 * @returns {Object|null} - Extracted SOAP note or null if extraction fails
 */
function extractSoapFromText(text) {
  try {
    const patterns = {
      subjective: /(?:subjective|s:)\s*:?\s*(.*?)(?=(?:objective|o:)|$)/is,
      objective: /(?:objective|o:)\s*:?\s*(.*?)(?=(?:assessment|a:)|$)/is,
      assessment: /(?:assessment|a:)\s*:?\s*(.*?)(?=(?:plan|p:)|$)/is,
      plan: /(?:plan|p:)\s*:?\s*(.*?)$/is
    };

    const result = {
      subjective: '',
      objective: '',
      assessment: '',
      plan: ''
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result[key] = match[1].trim();
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

module.exports = {
  initializePlumbRAG,
  searchPlumb,
  generateEnhancedSOAP
};
