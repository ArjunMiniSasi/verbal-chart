// Add missing medicines to hospital inventory
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, '../server/medora admin service.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Normalize composition for matching
function normalizeComposition(composition) {
  if (!composition || typeof composition !== 'string') return '';
  return composition
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Missing medicines to add
const missingMedicines = [
  {
    medicine_name: "Acepromazine",
    brand_name: "Aceprom-Vet",
    composition: "acepromazine maleate",
    composition_normalized: normalizeComposition("acepromazine maleate"),
    strength: "10mg/ml",
    form: "injection",
    unit: "vials",
    stock_quantity: 50,
    min_stock_level: 10,
    expiry_date: "2026-06-30",
    batch_number: "BATCH-2024-ACE-029",
    supplier: "VetPharma Inc",
    cost_per_unit: 12.50,
    category: "sedative",
    indications: ["sedation", "anxiety", "pre-anesthetic", "motion sickness"],
    contraindications: ["hepatic disease", "cardiovascular disease", "seizure disorders"]
  },
  {
    medicine_name: "Acepromazine",
    brand_name: "PromAce",
    composition: "acepromazine",
    composition_normalized: normalizeComposition("acepromazine"),
    strength: "10mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 100,
    min_stock_level: 20,
    expiry_date: "2025-12-15",
    batch_number: "BATCH-2024-PAC-030",
    supplier: "Animal Health Solutions",
    cost_per_unit: 3.50,
    category: "sedative",
    indications: ["sedation", "anxiety", "pre-anesthetic"],
    contraindications: ["hepatic disease", "cardiovascular disease"]
  },
  {
    medicine_name: "Cefazolin",
    brand_name: "Cefaz-Vet",
    composition: "cefazolin sodium",
    composition_normalized: normalizeComposition("cefazolin sodium"),
    strength: "1g",
    form: "injection",
    unit: "vials",
    stock_quantity: 75,
    min_stock_level: 15,
    expiry_date: "2026-03-20",
    batch_number: "BATCH-2024-CEF-031",
    supplier: "VetMed Supplies",
    cost_per_unit: 15.80,
    category: "antibiotic",
    indications: ["bacterial infections", "surgical prophylaxis", "skin infections", "respiratory infections"],
    contraindications: ["penicillin allergy", "cephalosporin allergy"]
  },
  {
    medicine_name: "Cefazolin",
    brand_name: "Kefzol-Vet",
    composition: "cefazolin",
    composition_normalized: normalizeComposition("cefazolin"),
    strength: "500mg",
    form: "injection",
    unit: "vials",
    stock_quantity: 60,
    min_stock_level: 12,
    expiry_date: "2025-11-30",
    batch_number: "BATCH-2024-KEF-032",
    supplier: "Bayer Animal Health",
    cost_per_unit: 12.40,
    category: "antibiotic",
    indications: ["bacterial infections", "surgical prophylaxis"],
    contraindications: ["penicillin allergy", "cephalosporin allergy"]
  }
];

async function addMissingMedicines() {
  console.log('🌱 Adding missing medicines to hospital inventory...\n');

  const batch = db.batch();
  const collectionRef = db.collection('hospital_inventory');

  missingMedicines.forEach((item, index) => {
    const docRef = collectionRef.doc(); // Auto-generate ID
    const itemWithTimestamps = {
      ...item,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    batch.set(docRef, itemWithTimestamps);
    console.log(`✅ Prepared: ${item.brand_name} (${item.medicine_name} ${item.strength})`);
  });

  try {
    await batch.commit();
    console.log(`\n🎉 Successfully added ${missingMedicines.length} medicine records!`);
    console.log('📊 Collection: hospital_inventory');
    console.log('✅ All records added with timestamps');
  } catch (error) {
    console.error('❌ Error adding medicines:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addMissingMedicines()
    .then(() => {
      console.log('\n✨ Addition completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Addition failed:', error);
      process.exit(1);
    });
}

module.exports = { addMissingMedicines, missingMedicines };

