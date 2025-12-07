/**
 * Script to populate Firebase Firestore with veterinary drug index data
 * Run with: node scripts/populateFirebaseVectorIndex.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const OpenAI = require('openai');

// Load environment variables if dotenv is available
try {
    require('dotenv').config();
} catch (error) {
    console.log('ℹ️ dotenv not available, using environment variables or fallback values');
}

// Firebase configuration
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBZRM1I0Az3NAzCON0PGCKDSnKptRFSqSQ",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "vetqure-pms.firebaseapp.com",
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://vetqure-pms-default-rtdb.firebaseio.com",
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "vetqure-pms",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "vetqure-pms.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "896549033598",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:896549033598:web:281aa64b599184833b6a2f",
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E1YMQ5ETNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || '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',
});

// Sample veterinary drug data
const veterinaryDrugs = [
    {
        drug_name: "Metronidazole",
        content: "Metronidazole is an antibiotic and antiprotozoal medication used to treat various infections in small animals. Indications include: diarrhea caused by Giardia, Clostridium perfringens, and other anaerobic bacteria. Dosage: 10-15 mg/kg PO BID for 5-7 days in dogs and cats. Contraindications: pregnancy, liver disease. Side effects may include vomiting, diarrhea, and neurological signs with high doses.",
        category: "antibiotic",
        species: ["dog", "cat"],
        conditions: ["diarrhea", "giardia", "anaerobic_infection"]
    },
    {
        drug_name: "Amoxicillin",
        content: "Amoxicillin is a broad-spectrum penicillin antibiotic. Indications: skin infections, respiratory infections, urinary tract infections. Dosage: 10-20 mg/kg PO BID-TID for 7-14 days. Contraindications: penicillin allergy. Side effects: gastrointestinal upset, allergic reactions.",
        category: "antibiotic",
        species: ["dog", "cat"],
        conditions: ["skin_infection", "respiratory_infection", "uti"]
    },
    {
        drug_name: "Meloxicam",
        content: "Meloxicam is a non-steroidal anti-inflammatory drug (NSAID). Indications: pain management, inflammation, osteoarthritis. Dosage: 0.1 mg/kg PO SID for dogs, 0.05 mg/kg PO SID for cats. Contraindications: renal disease, gastrointestinal ulcers, bleeding disorders. Side effects: gastrointestinal upset, renal toxicity.",
        category: "anti_inflammatory",
        species: ["dog", "cat"],
        conditions: ["pain", "inflammation", "osteoarthritis"]
    },
    {
        drug_name: "Furosemide",
        content: "Furosemide is a loop diuretic used to treat congestive heart failure and fluid retention. Indications: heart failure, pulmonary edema, ascites. Dosage: 1-2 mg/kg PO BID-TID in dogs, 1-2 mg/kg PO BID in cats. Contraindications: dehydration, electrolyte imbalances. Side effects: dehydration, electrolyte imbalances, increased thirst and urination.",
        category: "diuretic",
        species: ["dog", "cat"],
        conditions: ["heart_failure", "pulmonary_edema", "ascites"]
    },
    {
        drug_name: "Prednisolone",
        content: "Prednisolone is a corticosteroid with anti-inflammatory and immunosuppressive properties. Indications: inflammatory conditions, immune-mediated diseases, allergies. Dosage: 0.5-2 mg/kg PO BID initially, then taper. Contraindications: systemic fungal infections, viral infections. Side effects: increased thirst, urination, appetite, panting, immunosuppression.",
        category: "corticosteroid",
        species: ["dog", "cat"],
        conditions: ["inflammation", "immune_disease", "allergies"]
    },
    {
        drug_name: "Cephalexin",
        content: "Cephalexin is a first-generation cephalosporin antibiotic. Indications: skin infections, soft tissue infections, bone infections. Dosage: 15-25 mg/kg PO BID-TID for 7-14 days. Contraindications: cephalosporin allergy. Side effects: gastrointestinal upset, allergic reactions, rarely blood dyscrasias.",
        category: "antibiotic",
        species: ["dog", "cat"],
        conditions: ["skin_infection", "soft_tissue_infection", "bone_infection"]
    },
    {
        drug_name: "Tramadol",
        content: "Tramadol is an opioid analgesic used for moderate to severe pain. Indications: post-surgical pain, chronic pain, cancer pain. Dosage: 3-5 mg/kg PO BID-TID in dogs, 1-2 mg/kg PO BID in cats. Contraindications: seizure disorders, concurrent MAO inhibitors. Side effects: sedation, gastrointestinal upset, rarely seizures.",
        category: "analgesic",
        species: ["dog", "cat"],
        conditions: ["pain", "post_surgical", "chronic_pain"]
    },
    {
        drug_name: "Ondansetron",
        content: "Ondansetron is a 5-HT3 receptor antagonist antiemetic. Indications: vomiting, nausea, chemotherapy-induced vomiting. Dosage: 0.1-0.2 mg/kg PO BID-TID or IV. Contraindications: hypersensitivity. Side effects: constipation, headache, rarely cardiac arrhythmias.",
        category: "antiemetic",
        species: ["dog", "cat"],
        conditions: ["vomiting", "nausea", "chemotherapy"]
    }
];

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

/**
 * Add a drug to the Firebase collection
 */
async function addDrugToIndex(drugData) {
    try {
        console.log(`📝 Processing ${drugData.drug_name}...`);

        // Generate embedding
        const embedding = await generateEmbedding(drugData.content);
        console.log(`✅ Generated embedding for ${drugData.drug_name} (${embedding.length} dimensions)`);

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'veterinary_drug_index'), {
            ...drugData,
            embedding
        });

        console.log(`✅ Added ${drugData.drug_name} to Firestore with ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error(`❌ Error adding ${drugData.drug_name}:`, error);
        throw error;
    }
}

/**
 * Main function to populate the collection
 */
async function populateVeterinaryDrugIndex() {
    try {
        console.log('🚀 Starting to populate veterinary drug index...');
        console.log(`📚 Processing ${veterinaryDrugs.length} drugs`);

        const results = [];

        for (let i = 0; i < veterinaryDrugs.length; i++) {
            const drug = veterinaryDrugs[i];
            try {
                const docId = await addDrugToIndex(drug);
                results.push({ drug: drug.drug_name, docId, success: true });

                // Add delay to avoid rate limiting
                if (i < veterinaryDrugs.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Failed to add ${drug.drug_name}:`, error);
                results.push({ drug: drug.drug_name, success: false, error: error.message });
            }
        }

        console.log('\n📊 Population Summary:');
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`✅ Successfully added: ${successful} drugs`);
        console.log(`❌ Failed to add: ${failed} drugs`);

        if (failed > 0) {
            console.log('\n❌ Failed drugs:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  - ${r.drug}: ${r.error}`);
            });
        }

        console.log('\n🎉 Veterinary drug index population completed!');

    } catch (error) {
        console.error('❌ Error populating veterinary drug index:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    populateVeterinaryDrugIndex()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { populateVeterinaryDrugIndex, addDrugToIndex, generateEmbedding };
