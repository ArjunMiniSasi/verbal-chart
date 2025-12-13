#!/bin/bash

# Script to deploy Firestore indexes
# This script deploys the firestore.indexes.json file to Firebase

echo "🚀 Deploying Firestore Indexes..."
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "   Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase login:list &> /dev/null; then
    echo "⚠️  Not logged in to Firebase"
    echo "   Run: firebase login"
    exit 1
fi

# Check if firestore.indexes.json exists
if [ ! -f "firestore.indexes.json" ]; then
    echo "❌ firestore.indexes.json not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

echo "📋 Indexes to deploy:"
echo "   1. hospital_inventory: composition_normalized + stock_quantity"
echo "   2. hospital_inventory: medicine_name + stock_quantity"
echo ""

# Deploy indexes
echo "📤 Deploying indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Indexes deployed successfully!"
    echo ""
    echo "⏱️  Index building status:"
    echo "   - Check status at: https://console.firebase.google.com/project/vetqure-pms/firestore/indexes"
    echo "   - Indexes typically take 5-10 minutes to build"
    echo "   - You'll receive an email when they're ready"
    echo ""
    echo "💡 Note: The application works without these indexes"
    echo "   (uses in-memory filtering), but indexes improve performance."
else
    echo ""
    echo "❌ Deployment failed"
    echo "   Check the error message above"
    exit 1
fi

