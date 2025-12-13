#!/usr/bin/env node

/**
 * Script to create Firestore composite indexes for hospital_inventory collection
 * 
 * This script creates the required composite indexes for efficient querying
 * of the hospital_inventory collection with multiple where clauses.
 * 
 * Usage:
 *   node scripts/create_firestore_indexes.js
 * 
 * Or deploy indexes using Firebase CLI:
 *   firebase deploy --only firestore:indexes
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = require(path.join(__dirname, '../server/medora admin service.json'));
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error.message);
        console.error('   Make sure the service account file exists at: server/medora admin service.json');
        process.exit(1);
    }
}

const db = admin.firestore();

/**
 * Note: Firestore indexes cannot be created programmatically via the Admin SDK.
 * They must be created either:
 * 1. Through Firebase Console (manual)
 * 2. Via firestore.indexes.json file (declarative, deployed with Firebase CLI)
 * 3. Automatically when Firestore detects a query that needs an index
 * 
 * This script provides instructions and validates the indexes exist.
 */

async function checkIndexStatus() {
    console.log('🔍 Checking Firestore index status...\n');

    // Test queries to see if indexes are needed
    const testQueries = [
        {
            name: 'composition_normalized + stock_quantity',
            query: async () => {
                try {
                    await db.collection('hospital_inventory')
                        .where('composition_normalized', '==', 'carprofen')
                        .where('stock_quantity', '>', 0)
                        .limit(1)
                        .get();
                    return { success: true, needsIndex: false };
                } catch (error) {
                    if (error.code === 9 || error.message.includes('index')) {
                        return { success: false, needsIndex: true, error: error.message };
                    }
                    return { success: false, needsIndex: false, error: error.message };
                }
            }
        },
        {
            name: 'medicine_name + stock_quantity',
            query: async () => {
                try {
                    await db.collection('hospital_inventory')
                        .where('medicine_name', '==', 'Carprofen')
                        .where('stock_quantity', '>', 0)
                        .limit(1)
                        .get();
                    return { success: true, needsIndex: false };
                } catch (error) {
                    if (error.code === 9 || error.message.includes('index')) {
                        return { success: false, needsIndex: true, error: error.message };
                    }
                    return { success: false, needsIndex: false, error: error.message };
                }
            }
        }
    ];

    console.log('📊 Testing queries that require composite indexes:\n');

    for (const test of testQueries) {
        console.log(`Testing: ${test.name}...`);
        const result = await test.query();

        if (result.success) {
            console.log(`   ✅ Index exists - query works!\n`);
        } else if (result.needsIndex) {
            console.log(`   ⚠️  Index needed - query requires composite index`);
            console.log(`   📝 Error: ${result.error.substring(0, 100)}...\n`);
        } else {
            console.log(`   ❌ Query failed: ${result.error}\n`);
        }
    }
}

async function displayInstructions() {
    console.log('\n📋 How to Create Firestore Indexes:\n');
    console.log('Method 1: Deploy indexes.json (Recommended)');
    console.log('─────────────────────────────────────────────');
    console.log('1. The firestore.indexes.json file has been created');
    console.log('2. Deploy it using Firebase CLI:');
    console.log('   firebase deploy --only firestore:indexes');
    console.log('');
    console.log('Method 2: Create via Firebase Console');
    console.log('─────────────────────────────────────');
    console.log('1. Go to: https://console.firebase.google.com/project/vetqure-pms/firestore/indexes');
    console.log('2. Click "Create Index"');
    console.log('3. Collection ID: hospital_inventory');
    console.log('4. Add fields:');
    console.log('   - composition_normalized (Ascending)');
    console.log('   - stock_quantity (Ascending)');
    console.log('5. Click "Create"');
    console.log('');
    console.log('Method 3: Automatic (When Query Runs)');
    console.log('────────────────────────────────────');
    console.log('1. When the query runs, Firestore will show an error');
    console.log('2. Click the link in the error message');
    console.log('3. Firestore will automatically create the index');
    console.log('4. Wait 5-10 minutes for index to build');
    console.log('');
    console.log('⏱️  Index Creation Time:');
    console.log('   - Small collections (< 1000 docs): 1-2 minutes');
    console.log('   - Medium collections (1000-10000 docs): 5-10 minutes');
    console.log('   - Large collections (> 10000 docs): 10-30 minutes');
    console.log('');
}

async function main() {
    console.log('🚀 Firestore Index Creation Script\n');
    console.log('═══════════════════════════════════════════════════════\n');

    await checkIndexStatus();
    await displayInstructions();

    console.log('✅ Script completed!\n');
    console.log('💡 Note: The code has been updated to work WITHOUT indexes');
    console.log('   (filters stock_quantity in memory), but indexes improve performance.\n');

    process.exit(0);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

module.exports = { checkIndexStatus, displayInstructions };

