// Check if specific medicines exist in inventory
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

async function checkMedicines() {
    const medicinesToCheck = [
        { name: 'Carprofen', composition: 'carprofen' },
        { name: 'Acepromazine', composition: 'acepromazine' },
        { name: 'Cefazolin', composition: 'cefazolin' }
    ];

    console.log('🔍 Checking for medicines in inventory...\n');

    for (const med of medicinesToCheck) {
        const normalized = med.composition.toLowerCase().trim();

        // Search by composition_normalized
        const snapshot = await db.collection('hospital_inventory')
            .where('composition_normalized', '==', normalized)
            .get();

        // Also search by medicine_name
        const nameSnapshot = await db.collection('hospital_inventory')
            .where('medicine_name', '==', med.name)
            .get();

        const allMatches = new Set();
        snapshot.forEach(doc => allMatches.add(doc.id));
        nameSnapshot.forEach(doc => allMatches.add(doc.id));

        if (allMatches.size > 0) {
            console.log(`✅ ${med.name} - FOUND (${allMatches.size} match(es))`);
            allMatches.forEach(id => {
                db.collection('hospital_inventory').doc(id).get().then(doc => {
                    const data = doc.data();
                    console.log(`   - ${data.brand_name} (${data.strength} ${data.form}) - Stock: ${data.stock_quantity} ${data.unit}`);
                });
            });
        } else {
            console.log(`❌ ${med.name} - NOT FOUND`);
        }
        console.log('');
    }

    process.exit(0);
}

checkMedicines().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

