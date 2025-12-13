// Seed script for hospital_inventory collection
// Run this script to populate Firebase Firestore with veterinary medicine inventory
// Usage: node scripts/seed_hospital_inventory.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin (adjust path to your service account)
// For Cloud Functions, admin is already initialized
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

// Veterinary Medicine Inventory Data
const inventoryData = [
  // ========== ANTIBIOTICS ==========
  {
    medicine_name: "Amoxicillin",
    brand_name: "Amoxi-Vet",
    composition: "amoxicillin trihydrate",
    composition_normalized: normalizeComposition("amoxicillin trihydrate"),
    strength: "250mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 150,
    min_stock_level: 20,
    expiry_date: "2025-12-31",
    batch_number: "BATCH-2024-AMX-001",
    supplier: "VetPharma Inc",
    cost_per_unit: 2.50,
    category: "antibiotic",
    indications: ["bacterial infections", "respiratory infections", "skin infections", "urinary tract infections"],
    contraindications: ["penicillin allergy", "allergy to beta-lactam antibiotics"]
  },
  {
    medicine_name: "Amoxicillin",
    brand_name: "VetAmox",
    composition: "amoxicillin",
    composition_normalized: normalizeComposition("amoxicillin"),
    strength: "500mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 75,
    min_stock_level: 15,
    expiry_date: "2025-06-30",
    batch_number: "BATCH-2024-VAM-002",
    supplier: "Animal Health Solutions",
    cost_per_unit: 3.75,
    category: "antibiotic",
    indications: ["bacterial infections", "respiratory infections", "gastrointestinal infections"],
    contraindications: ["penicillin allergy"]
  },
  {
    medicine_name: "Cephalexin",
    brand_name: "Cefalex-Vet",
    composition: "cephalexin monohydrate",
    composition_normalized: normalizeComposition("cephalexin monohydrate"),
    strength: "500mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 120,
    min_stock_level: 25,
    expiry_date: "2026-03-15",
    batch_number: "BATCH-2024-CEF-003",
    supplier: "VetMed Supplies",
    cost_per_unit: 4.20,
    category: "antibiotic",
    indications: ["skin infections", "urinary tract infections", "respiratory infections", "bone infections"],
    contraindications: ["cephalosporin allergy", "severe renal impairment"]
  },
  {
    medicine_name: "Enrofloxacin",
    brand_name: "Baytril",
    composition: "enrofloxacin",
    composition_normalized: normalizeComposition("enrofloxacin"),
    strength: "50mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2025-09-20",
    batch_number: "BATCH-2024-BAY-004",
    supplier: "Bayer Animal Health",
    cost_per_unit: 5.80,
    category: "antibiotic",
    indications: ["urinary tract infections", "respiratory infections", "skin infections", "gastrointestinal infections"],
    contraindications: ["growing animals", "pregnancy", "seizure disorders"]
  },
  {
    medicine_name: "Metronidazole",
    brand_name: "Flagyl-Vet",
    composition: "metronidazole",
    composition_normalized: normalizeComposition("metronidazole"),
    strength: "250mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 180,
    min_stock_level: 25,
    expiry_date: "2025-11-10",
    batch_number: "BATCH-2024-FLG-005",
    supplier: "VetPharma Inc",
    cost_per_unit: 3.40,
    category: "antibiotic",
    indications: ["anaerobic bacterial infections", "giardiasis", "trichomoniasis", "inflammatory bowel disease"],
    contraindications: ["pregnancy", "liver disease", "blood disorders"]
  },
  {
    medicine_name: "Doxycycline",
    brand_name: "Doxy-Vet",
    composition: "doxycycline hyclate",
    composition_normalized: normalizeComposition("doxycycline hyclate"),
    strength: "100mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 160,
    min_stock_level: 20,
    expiry_date: "2026-01-25",
    batch_number: "BATCH-2024-DOX-006",
    supplier: "Animal Health Solutions",
    cost_per_unit: 4.50,
    category: "antibiotic",
    indications: ["respiratory infections", "tick-borne diseases", "chlamydia", "mycoplasma infections"],
    contraindications: ["pregnancy", "growing animals", "liver disease"]
  },

  // ========== ANTI-INFLAMMATORY (NSAIDs) ==========
  {
    medicine_name: "Carprofen",
    brand_name: "Rimadyl",
    composition: "carprofen",
    composition_normalized: normalizeComposition("carprofen"),
    strength: "25mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 300,
    min_stock_level: 50,
    expiry_date: "2025-10-15",
    batch_number: "BATCH-2024-RIM-007",
    supplier: "Zoetis Animal Health",
    cost_per_unit: 6.20,
    category: "anti-inflammatory",
    indications: ["osteoarthritis", "post-surgical pain", "acute pain", "inflammation"],
    contraindications: ["gastrointestinal ulcers", "renal disease", "hepatic disease", "bleeding disorders"]
  },
  {
    medicine_name: "Carprofen",
    brand_name: "Rimadyl",
    composition: "carprofen",
    composition_normalized: normalizeComposition("carprofen"),
    strength: "75mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 250,
    min_stock_level: 40,
    expiry_date: "2025-10-15",
    batch_number: "BATCH-2024-RIM-008",
    supplier: "Zoetis Animal Health",
    cost_per_unit: 8.50,
    category: "anti-inflammatory",
    indications: ["osteoarthritis", "post-surgical pain", "acute pain"],
    contraindications: ["gastrointestinal ulcers", "renal disease", "hepatic disease"]
  },
  {
    medicine_name: "Meloxicam",
    brand_name: "Metacam",
    composition: "meloxicam",
    composition_normalized: normalizeComposition("meloxicam"),
    strength: "1.5mg/ml",
    form: "oral suspension",
    unit: "ml",
    stock_quantity: 500,
    min_stock_level: 100,
    expiry_date: "2025-08-30",
    batch_number: "BATCH-2024-MET-009",
    supplier: "Boehringer Ingelheim",
    cost_per_unit: 0.35,
    category: "anti-inflammatory",
    indications: ["osteoarthritis", "post-surgical pain", "acute pain", "inflammation"],
    contraindications: ["gastrointestinal ulcers", "renal disease", "dehydration"]
  },
  {
    medicine_name: "Meloxicam",
    brand_name: "Metacam",
    composition: "meloxicam",
    composition_normalized: normalizeComposition("meloxicam"),
    strength: "7.5mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 180,
    min_stock_level: 30,
    expiry_date: "2025-08-30",
    batch_number: "BATCH-2024-MET-010",
    supplier: "Boehringer Ingelheim",
    cost_per_unit: 7.80,
    category: "anti-inflammatory",
    indications: ["osteoarthritis", "post-surgical pain", "chronic pain"],
    contraindications: ["gastrointestinal ulcers", "renal disease"]
  },
  {
    medicine_name: "Firocoxib",
    brand_name: "Previcox",
    composition: "firocoxib",
    composition_normalized: normalizeComposition("firocoxib"),
    strength: "57mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 220,
    min_stock_level: 35,
    expiry_date: "2026-02-14",
    batch_number: "BATCH-2024-PRE-011",
    supplier: "Merial Animal Health",
    cost_per_unit: 9.20,
    category: "anti-inflammatory",
    indications: ["osteoarthritis", "post-surgical pain", "chronic pain management"],
    contraindications: ["gastrointestinal ulcers", "renal disease", "hepatic disease"]
  },
  {
    medicine_name: "Robenacoxib",
    brand_name: "Onsior",
    composition: "robenacoxib",
    composition_normalized: normalizeComposition("robenacoxib"),
    strength: "6mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 150,
    min_stock_level: 25,
    expiry_date: "2025-12-05",
    batch_number: "BATCH-2024-ONS-012",
    supplier: "Novartis Animal Health",
    cost_per_unit: 8.90,
    category: "anti-inflammatory",
    indications: ["post-surgical pain", "acute pain", "inflammation"],
    contraindications: ["gastrointestinal ulcers", "renal disease"]
  },

  // ========== ANTI-HISTAMINES (ANTI-ALLERGIC) ==========
  {
    medicine_name: "Diphenhydramine",
    brand_name: "Benadryl-Vet",
    composition: "diphenhydramine hydrochloride",
    composition_normalized: normalizeComposition("diphenhydramine hydrochloride"),
    strength: "25mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 400,
    min_stock_level: 60,
    expiry_date: "2026-04-20",
    batch_number: "BATCH-2024-BEN-013",
    supplier: "VetMed Supplies",
    cost_per_unit: 1.80,
    category: "antihistamine",
    indications: ["allergic reactions", "itching", "urticaria", "motion sickness", "anxiety"],
    contraindications: ["glaucoma", "prostatic hypertrophy", "urinary retention"]
  },
  {
    medicine_name: "Cetirizine",
    brand_name: "Zyrtec-Vet",
    composition: "cetirizine hydrochloride",
    composition_normalized: normalizeComposition("cetirizine hydrochloride"),
    strength: "10mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 350,
    min_stock_level: 50,
    expiry_date: "2025-11-30",
    batch_number: "BATCH-2024-ZYR-014",
    supplier: "Animal Health Solutions",
    cost_per_unit: 2.40,
    category: "antihistamine",
    indications: ["allergic dermatitis", "itching", "urticaria", "seasonal allergies"],
    contraindications: ["renal impairment", "pregnancy"]
  },
  {
    medicine_name: "Loratadine",
    brand_name: "Claritin-Vet",
    composition: "loratadine",
    composition_normalized: normalizeComposition("loratadine"),
    strength: "10mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 320,
    min_stock_level: 45,
    expiry_date: "2026-03-10",
    batch_number: "BATCH-2024-CLA-015",
    supplier: "VetPharma Inc",
    cost_per_unit: 2.60,
    category: "antihistamine",
    indications: ["allergic reactions", "itching", "seasonal allergies", "atopic dermatitis"],
    contraindications: ["liver disease", "pregnancy"]
  },
  {
    medicine_name: "Hydroxyzine",
    brand_name: "Atarax-Vet",
    composition: "hydroxyzine hydrochloride",
    composition_normalized: normalizeComposition("hydroxyzine hydrochloride"),
    strength: "25mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 280,
    min_stock_level: 40,
    expiry_date: "2025-09-25",
    batch_number: "BATCH-2024-ATA-016",
    supplier: "VetMed Supplies",
    cost_per_unit: 3.20,
    category: "antihistamine",
    indications: ["allergic dermatitis", "itching", "anxiety", "urticaria"],
    contraindications: ["glaucoma", "urinary retention", "pregnancy"]
  },

  // ========== ANTIPARASITIC ==========
  {
    medicine_name: "Fenbendazole",
    brand_name: "Panacur",
    composition: "fenbendazole",
    composition_normalized: normalizeComposition("fenbendazole"),
    strength: "222mg/g",
    form: "granules",
    unit: "packets",
    stock_quantity: 100,
    min_stock_level: 15,
    expiry_date: "2026-05-15",
    batch_number: "BATCH-2024-PAN-017",
    supplier: "Intervet",
    cost_per_unit: 12.50,
    category: "antiparasitic",
    indications: ["roundworms", "hookworms", "whipworms", "tapeworms", "giardia"],
    contraindications: ["pregnancy (early)", "liver disease"]
  },
  {
    medicine_name: "Praziquantel",
    brand_name: "Droncit",
    composition: "praziquantel",
    composition_normalized: normalizeComposition("praziquantel"),
    strength: "50mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2025-10-20",
    batch_number: "BATCH-2024-DRO-018",
    supplier: "Bayer Animal Health",
    cost_per_unit: 4.80,
    category: "antiparasitic",
    indications: ["tapeworms", "flukes", "cestode infections"],
    contraindications: ["liver disease", "pregnancy"]
  },
  {
    medicine_name: "Ivermectin",
    brand_name: "Heartgard",
    composition: "ivermectin",
    composition_normalized: normalizeComposition("ivermectin"),
    strength: "68mcg",
    form: "chewable tablet",
    unit: "tablets",
    stock_quantity: 500,
    min_stock_level: 75,
    expiry_date: "2026-06-30",
    batch_number: "BATCH-2024-HRT-019",
    supplier: "Merial Animal Health",
    cost_per_unit: 8.90,
    category: "antiparasitic",
    indications: ["heartworm prevention", "roundworms", "hookworms"],
    contraindications: ["collie breeds (MDR1 mutation)", "puppies under 6 weeks"]
  },

  // ========== GASTROINTESTINAL ==========
  {
    medicine_name: "Omeprazole",
    brand_name: "Gastrogard",
    composition: "omeprazole",
    composition_normalized: normalizeComposition("omeprazole"),
    strength: "20mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 180,
    min_stock_level: 25,
    expiry_date: "2025-11-15",
    batch_number: "BATCH-2024-GAS-020",
    supplier: "VetPharma Inc",
    cost_per_unit: 5.40,
    category: "gastrointestinal",
    indications: ["gastric ulcers", "gastroesophageal reflux", "esophagitis", "gastritis"],
    contraindications: ["severe liver disease"]
  },
  {
    medicine_name: "Metoclopramide",
    brand_name: "Reglan-Vet",
    composition: "metoclopramide hydrochloride",
    composition_normalized: normalizeComposition("metoclopramide hydrochloride"),
    strength: "5mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 250,
    min_stock_level: 35,
    expiry_date: "2026-01-20",
    batch_number: "BATCH-2024-REG-021",
    supplier: "Animal Health Solutions",
    cost_per_unit: 3.60,
    category: "gastrointestinal",
    indications: ["vomiting", "gastric stasis", "gastroesophageal reflux", "nausea"],
    contraindications: ["gastrointestinal obstruction", "epilepsy", "pheochromocytoma"]
  },
  {
    medicine_name: "Famotidine",
    brand_name: "Pepcid-Vet",
    composition: "famotidine",
    composition_normalized: normalizeComposition("famotidine"),
    strength: "10mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 300,
    min_stock_level: 40,
    expiry_date: "2025-12-10",
    batch_number: "BATCH-2024-PEP-022",
    supplier: "VetMed Supplies",
    cost_per_unit: 2.90,
    category: "gastrointestinal",
    indications: ["gastric ulcers", "gastritis", "gastroesophageal reflux", "esophagitis"],
    contraindications: ["severe renal impairment"]
  },

  // ========== CORTICOSTEROIDS ==========
  {
    medicine_name: "Prednisone",
    brand_name: "Predni-Vet",
    composition: "prednisone",
    composition_normalized: normalizeComposition("prednisone"),
    strength: "5mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 400,
    min_stock_level: 50,
    expiry_date: "2026-02-28",
    batch_number: "BATCH-2024-PRE-023",
    supplier: "VetPharma Inc",
    cost_per_unit: 1.20,
    category: "corticosteroid",
    indications: ["allergic reactions", "inflammatory conditions", "immune-mediated diseases", "shock"],
    contraindications: ["systemic fungal infections", "viral infections", "diabetes", "peptic ulcers"]
  },
  {
    medicine_name: "Prednisolone",
    brand_name: "Prednisol-Vet",
    composition: "prednisolone",
    composition_normalized: normalizeComposition("prednisolone"),
    strength: "5mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 380,
    min_stock_level: 45,
    expiry_date: "2026-02-28",
    batch_number: "BATCH-2024-PRL-024",
    supplier: "Animal Health Solutions",
    cost_per_unit: 1.40,
    category: "corticosteroid",
    indications: ["allergic reactions", "inflammatory conditions", "immune-mediated diseases"],
    contraindications: ["systemic fungal infections", "viral infections", "liver disease"]
  },

  // ========== ANTI-FUNGAL ==========
  {
    medicine_name: "Fluconazole",
    brand_name: "Diflucan-Vet",
    composition: "fluconazole",
    composition_normalized: normalizeComposition("fluconazole"),
    strength: "50mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 120,
    min_stock_level: 20,
    expiry_date: "2025-10-05",
    batch_number: "BATCH-2024-DIF-025",
    supplier: "VetMed Supplies",
    cost_per_unit: 6.80,
    category: "antifungal",
    indications: ["fungal infections", "yeast infections", "ringworm", "systemic mycoses"],
    contraindications: ["pregnancy", "liver disease"]
  },
  {
    medicine_name: "Itraconazole",
    brand_name: "Sporanox-Vet",
    composition: "itraconazole",
    composition_normalized: normalizeComposition("itraconazole"),
    strength: "100mg",
    form: "capsule",
    unit: "capsules",
    stock_quantity: 90,
    min_stock_level: 15,
    expiry_date: "2026-03-20",
    batch_number: "BATCH-2024-SPO-026",
    supplier: "Animal Health Solutions",
    cost_per_unit: 9.50,
    category: "antifungal",
    indications: ["fungal infections", "ringworm", "aspergillosis", "blastomycosis"],
    contraindications: ["pregnancy", "liver disease", "heart disease"]
  },

  // ========== ANTI-EMETIC ==========
  {
    medicine_name: "Ondansetron",
    brand_name: "Zofran-Vet",
    composition: "ondansetron hydrochloride",
    composition_normalized: normalizeComposition("ondansetron hydrochloride"),
    strength: "4mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 200,
    min_stock_level: 30,
    expiry_date: "2025-11-25",
    batch_number: "BATCH-2024-ZOF-027",
    supplier: "VetPharma Inc",
    cost_per_unit: 7.20,
    category: "anti-emetic",
    indications: ["vomiting", "nausea", "chemotherapy-induced nausea"],
    contraindications: ["intestinal obstruction", "hypersensitivity"]
  },

  // ========== DIURETIC ==========
  {
    medicine_name: "Furosemide",
    brand_name: "Lasix-Vet",
    composition: "furosemide",
    composition_normalized: normalizeComposition("furosemide"),
    strength: "20mg",
    form: "tablet",
    unit: "tablets",
    stock_quantity: 350,
    min_stock_level: 50,
    expiry_date: "2026-04-15",
    batch_number: "BATCH-2024-LAS-028",
    supplier: "VetMed Supplies",
    cost_per_unit: 2.10,
    category: "diuretic",
    indications: ["congestive heart failure", "pulmonary edema", "ascites", "renal failure"],
    contraindications: ["anuria", "severe electrolyte depletion", "dehydration"]
  }
];

// Add timestamps to each record
const inventoryWithTimestamps = inventoryData.map(item => ({
  ...item,
  created_at: admin.firestore.FieldValue.serverTimestamp(),
  updated_at: admin.firestore.FieldValue.serverTimestamp()
}));

// Seed function
async function seedInventory() {
  console.log('🌱 Starting hospital inventory seed...');
  console.log(`📦 Preparing to add ${inventoryWithTimestamps.length} medicine records...`);

  const batch = db.batch();
  const collectionRef = db.collection('hospital_inventory');

  inventoryWithTimestamps.forEach((item, index) => {
    const docRef = collectionRef.doc(); // Auto-generate ID
    batch.set(docRef, item);
    console.log(`✅ Prepared: ${item.brand_name} (${item.medicine_name} ${item.strength})`);
  });

  try {
    await batch.commit();
    console.log(`\n🎉 Successfully seeded ${inventoryWithTimestamps.length} medicine records!`);
    console.log('📊 Collection: hospital_inventory');
    console.log('✅ All records added with timestamps');
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedInventory()
    .then(() => {
      console.log('\n✨ Seed completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedInventory, inventoryData };

