// Script to add liver cirrhosis and gastritis medicines to hospital_inventory
// Run this script to add new medicines: node scripts/add_liver_gastritis_medicines.js

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

// Normalize composition for matching (lowercase, remove special chars)
function normalizeComposition(composition) {
  return composition
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// New medicines to add
const newMedicines = [
  // ========== GASTROINTESTINAL (GASTRITIS) - Additional ==========
  {
    medicine_name: "Metoclopramide",
    brand_name: "Reglan-Vet",
    composition: "metoclopramide hydrochloride",
    composition_normalized: normalizeComposition("metoclopramide hydrochloride"),
    strength: "5mg/ml",
    form: "injection",
    unit: "vials",
    stock_quantity: 50,
    min_stock_level: 10,
    expiry_date: "2026-02-15",
    batch_number: "BATCH-2024-REG-029",
    supplier: "Animal Health Solutions",
    cost_per_unit: 12.50,
    category: "gastrointestinal",
    indications: ["vomiting", "gastric stasis", "gastroesophageal reflux", "nausea", "gastritis"],
    contraindications: ["gastrointestinal obstruction", "epilepsy", "pheochromocytoma"]
  },
  {
    medicine_name: "Simethicone",
    brand_name: "Gas-X Vet",
    composition: "simethicone",
    composition_normalized: normalizeComposition("simethicone"),
    strength: "40mg/ml",
    form: "oral suspension",
    unit: "bottles",
    stock_quantity: 80,
    min_stock_level: 15,
    expiry_date: "2026-05-30",
    batch_number: "BATCH-2024-GAS-030",
    supplier: "VetPharma Inc",
    cost_per_unit: 8.90,
    category: "gastrointestinal",
    indications: ["gas relief", "flatulence", "bloating", "gastritis"],
    contraindications: ["intestinal obstruction"]
  },
  {
    medicine_name: "Simethicone",
    brand_name: "Gas-X Vet",
    composition: "simethicone",
    composition_normalized: normalizeComposition("simethicone"),
    strength: "80mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2026-05-30",
    batch_number: "BATCH-2024-GAS-031",
    supplier: "VetPharma Inc",
    cost_per_unit: 4.20,
    category: "gastrointestinal",
    indications: ["gas relief", "flatulence", "bloating", "gastritis"],
    contraindications: ["intestinal obstruction"]
  },
  {
    medicine_name: "Maropitant",
    brand_name: "Cerenia",
    composition: "maropitant citrate",
    composition_normalized: normalizeComposition("maropitant citrate"),
    strength: "10mg/ml",
    form: "injection",
    unit: "vials",
    stock_quantity: 40,
    min_stock_level: 8,
    expiry_date: "2026-03-20",
    batch_number: "BATCH-2024-CER-032",
    supplier: "Zoetis Animal Health",
    cost_per_unit: 45.00,
    category: "anti-emetic",
    indications: ["nausea", "vomiting", "motion sickness", "gastritis"],
    contraindications: ["intestinal obstruction", "gastrointestinal perforation"]
  },
  {
    medicine_name: "Maropitant",
    brand_name: "Cerenia",
    composition: "maropitant citrate",
    composition_normalized: normalizeComposition("maropitant citrate"),
    strength: "16mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 150,
    min_stock_level: 25,
    expiry_date: "2026-03-20",
    batch_number: "BATCH-2024-CER-033",
    supplier: "Zoetis Animal Health",
    cost_per_unit: 18.50,
    category: "anti-emetic",
    indications: ["nausea", "vomiting", "motion sickness", "gastritis"],
    contraindications: ["intestinal obstruction", "gastrointestinal perforation"]
  },
  {
    medicine_name: "Probiotic",
    brand_name: "FortiFlora",
    composition: "enterococcus faecium",
    composition_normalized: normalizeComposition("enterococcus faecium"),
    strength: "2g",
    form: "powder",
    unit: "packets",
    stock_quantity: 500,
    min_stock_level: 75,
    expiry_date: "2026-08-15",
    batch_number: "BATCH-2024-FOR-034",
    supplier: "Purina Pro Plan Veterinary",
    cost_per_unit: 3.50,
    category: "probiotic",
    indications: ["gut health", "diarrhea", "gastrointestinal health", "digestive support", "gastritis"],
    contraindications: ["immunosuppression"]
  },
  {
    medicine_name: "Probiotic",
    brand_name: "Proviable-DC",
    composition: "probiotic blend",
    composition_normalized: normalizeComposition("probiotic blend"),
    strength: "5 billion CFU",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 300,
    min_stock_level: 50,
    expiry_date: "2026-07-20",
    batch_number: "BATCH-2024-PRO-035",
    supplier: "Nutramax Laboratories",
    cost_per_unit: 2.80,
    category: "probiotic",
    indications: ["gut health", "diarrhea", "gastrointestinal health", "digestive support", "gastritis"],
    contraindications: ["immunosuppression"]
  },

  // ========== HEPATOPROTECTIVE (LIVER CIRRHOSIS) ==========
  {
    medicine_name: "Ursodeoxycholic Acid",
    brand_name: "Ursodiol-Vet",
    composition: "ursodeoxycholic acid",
    composition_normalized: normalizeComposition("ursodeoxycholic acid"),
    strength: "250mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 120,
    min_stock_level: 20,
    expiry_date: "2026-04-10",
    batch_number: "BATCH-2024-URS-036",
    supplier: "VetPharma Inc",
    cost_per_unit: 15.80,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "cholestasis", "gallbladder disease", "liver support"],
    contraindications: ["acute cholecystitis", "biliary obstruction"]
  },
  {
    medicine_name: "S-Adenosylmethionine",
    brand_name: "Denosyl",
    composition: "s-adenosylmethionine",
    composition_normalized: normalizeComposition("s-adenosylmethionine"),
    strength: "90mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2026-06-30",
    batch_number: "BATCH-2024-DEN-037",
    supplier: "Nutramax Laboratories",
    cost_per_unit: 12.40,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "liver support", "hepatotoxicity", "liver disease"],
    contraindications: ["bipolar disorder"]
  },
  {
    medicine_name: "S-Adenosylmethionine",
    brand_name: "Denosyl",
    composition: "s-adenosylmethionine",
    composition_normalized: normalizeComposition("s-adenosylmethionine"),
    strength: "225mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 150,
    min_stock_level: 25,
    expiry_date: "2026-06-30",
    batch_number: "BATCH-2024-DEN-038",
    supplier: "Nutramax Laboratories",
    cost_per_unit: 18.90,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "liver support", "hepatotoxicity", "liver disease"],
    contraindications: ["bipolar disorder"]
  },
  {
    medicine_name: "Silymarin",
    brand_name: "Milk Thistle-Vet",
    composition: "silymarin",
    composition_normalized: normalizeComposition("silymarin"),
    strength: "150mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 250,
    min_stock_level: 40,
    expiry_date: "2026-05-15",
    batch_number: "BATCH-2024-MIL-039",
    supplier: "VetMed Supplies",
    cost_per_unit: 6.50,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "liver support", "hepatotoxicity", "liver disease"],
    contraindications: ["allergy to ragweed"]
  },
  {
    medicine_name: "Silymarin",
    brand_name: "Milk Thistle-Vet",
    composition: "silymarin",
    composition_normalized: normalizeComposition("silymarin"),
    strength: "250mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 180,
    min_stock_level: 30,
    expiry_date: "2026-05-15",
    batch_number: "BATCH-2024-MIL-040",
    supplier: "VetMed Supplies",
    cost_per_unit: 8.90,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "liver support", "hepatotoxicity", "liver disease"],
    contraindications: ["allergy to ragweed"]
  },
  {
    medicine_name: "Lactulose",
    brand_name: "Lactulose-Vet",
    composition: "lactulose",
    composition_normalized: normalizeComposition("lactulose"),
    strength: "10g/15ml",
    form: "oral solution",
    unit: "bottles",
    stock_quantity: 60,
    min_stock_level: 10,
    expiry_date: "2026-03-25",
    batch_number: "BATCH-2024-LAC-041",
    supplier: "Animal Health Solutions",
    cost_per_unit: 22.50,
    category: "hepatoprotective",
    indications: ["hepatic encephalopathy", "liver cirrhosis", "constipation", "liver support"],
    contraindications: ["galactosemia", "intestinal obstruction"]
  },
  {
    medicine_name: "Spironolactone",
    brand_name: "Aldactone-Vet",
    composition: "spironolactone",
    composition_normalized: normalizeComposition("spironolactone"),
    strength: "25mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2026-02-20",
    batch_number: "BATCH-2024-ALD-042",
    supplier: "VetPharma Inc",
    cost_per_unit: 4.60,
    category: "hepatoprotective",
    indications: ["ascites", "liver cirrhosis", "portal hypertension", "edema"],
    contraindications: ["anuria", "hyperkalemia", "acute renal failure"]
  },
  {
    medicine_name: "Vitamin E",
    brand_name: "E-Vet",
    composition: "alpha-tocopherol",
    composition_normalized: normalizeComposition("alpha-tocopherol"),
    strength: "400 IU",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 400,
    min_stock_level: 60,
    expiry_date: "2026-09-10",
    batch_number: "BATCH-2024-EVT-043",
    supplier: "VetMed Supplies",
    cost_per_unit: 1.80,
    category: "hepatoprotective",
    indications: ["liver cirrhosis", "hepatitis", "liver support", "antioxidant support"],
    contraindications: ["vitamin K deficiency", "bleeding disorders"]
  }
];

// Add timestamps to each record
const medicinesWithTimestamps = newMedicines.map(item => ({
  ...item,
  created_at: admin.firestore.FieldValue.serverTimestamp(),
  updated_at: admin.firestore.FieldValue.serverTimestamp()
}));

// Add medicines function
async function addNewMedicines() {
  console.log('🌱 Adding liver cirrhosis and gastritis medicines to hospital inventory...');
  console.log(`📦 Preparing to add ${medicinesWithTimestamps.length} new medicine records...`);

  const batch = db.batch();
  const collectionRef = db.collection('hospital_inventory');

  medicinesWithTimestamps.forEach((item, index) => {
    const docRef = collectionRef.doc(); // Auto-generate ID
    batch.set(docRef, item);
    console.log(`✅ Prepared: ${item.brand_name} (${item.medicine_name} ${item.strength})`);
  });

  try {
    await batch.commit();
    console.log(`\n🎉 Successfully added ${medicinesWithTimestamps.length} new medicine records!`);
    console.log('📊 Collection: hospital_inventory');
    console.log('✅ All records added with timestamps');
    
    // Summary
    const gastritisCount = newMedicines.filter(m => m.category === 'gastrointestinal' || m.category === 'anti-emetic' || m.category === 'probiotic').length;
    const liverCount = newMedicines.filter(m => m.category === 'hepatoprotective').length;
    console.log(`\n📋 Summary:`);
    console.log(`   - Gastritis medicines: ${gastritisCount}`);
    console.log(`   - Liver cirrhosis medicines: ${liverCount}`);
  } catch (error) {
    console.error('❌ Error adding medicines:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  addNewMedicines()
    .then(() => {
      console.log('\n✨ Medicines added successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to add medicines:', error);
      process.exit(1);
    });
}

module.exports = { addNewMedicines, newMedicines };





