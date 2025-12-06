#!/bin/bash
# Quick script to test the ingestion endpoint

echo "🚀 Testing Plumb data ingestion to Firebase..."
echo ""
echo "Make sure your server is running on port 3001!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo ""
echo "📡 Calling ingestion endpoint..."
curl -X POST http://localhost:3001/api/ingest-plumb-to-firestore \
  -H "Content-Type: application/json" \
  -w "\n\nStatus: %{http_code}\n"

echo ""
echo "✅ Done! Check Firebase Console to verify data was ingested."
