// Verification script to check if hospital_inventory data was imported
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

async function verifyImport() {
  console.log('🔍 Verifying hospital_inventory import...\n');

  try {
    const snapshot = await db.collection('hospital_inventory').get();
    
    if (snapshot.empty) {
      console.log('❌ No documents found in hospital_inventory collection');
      return;
    }

    console.log(`✅ Found ${snapshot.size} medicine records in hospital_inventory collection\n`);
    console.log('📋 Sample records:\n');

    let count = 0;
    const categories = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      count++;
      
      // Count by category
      const category = data.category || 'unknown';
      categories[category] = (categories[category] || 0) + 1;

      // Show first 5 records as samples
      if (count <= 5) {
        console.log(`📦 Record ${count}:`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Medicine: ${data.medicine_name}`);
        console.log(`   Brand: ${data.brand_name}`);
        console.log(`   Strength: ${data.strength}`);
        console.log(`   Form: ${data.form}`);
        console.log(`   Stock: ${data.stock_quantity} ${data.unit}`);
        console.log(`   Category: ${data.category}`);
        console.log(`   Composition: ${data.composition}`);
        console.log('');
      }
    });

    console.log('\n📊 Summary by Category:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} medicines`);
    });

    console.log(`\n✅ Verification complete! Total records: ${snapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error verifying import:', error);
  } finally {
    process.exit(0);
  }
}

verifyImport();

