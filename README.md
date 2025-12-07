# Medora - AI Medical Scribe

A comprehensive AI-powered medical transcription and SOAP note generation system designed for veterinary practices. Built with React, Node.js, and OpenAI's advanced AI models for real-time transcription, intelligent note generation, and evidence-based treatment recommendations.

## 🎯 Features

### 1. **Real-Time Voice Transcription**
   - **OpenAI Whisper AI** integration for high-accuracy speech-to-text
   - Support for multiple audio formats (MP3, WAV, MP4, WebM)
   - Live browser-based recording with MediaRecorder API
   - Word-level timestamps and language detection
   - Real-time transcript display with entity highlighting

### 2. **Intelligent SOAP Note Generation**
   - **AI-powered SOAP notes** using GPT-4o-mini
   - Structured format: Subjective, Objective, Assessment, Plan
   - Historical context integration from previous patient visits
   - Interactive editing interface with manual override capabilities
   - Automatic entity extraction and clinical reasoning

### 3. **Evidence-Based Treatment Plans (RAG)**
   - **Firebase Vector Search** for semantic drug database queries
   - **PlumbRAG** integration with Plumb's Veterinary Drug Handbook
   - Custom embeddings using OpenAI text-embedding-3-small
   - Cosine similarity matching for relevant drug recommendations
   - Evidence-backed treatment plans with specific dosages

### 4. **Case Management & Search**
   - Patient record management with MRN (Medical Record Number)
   - Case summaries with 5-bullet point format
   - Vector embeddings for semantic case search
   - Natural language search queries
   - SQLite database with Prisma ORM
   - Historical case matching and retrieval

### 5. **Export & Documentation**
   - PDF export of SOAP notes using jsPDF
   - Professional document formatting
   - Patient information integration

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **React Router** for navigation
- **TailwindCSS** for styling
- **Radix UI** components for accessible UI primitives
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **Node.js** with **Express.js** server
- **Multer** for file upload handling
- RESTful API architecture
- CORS-enabled for frontend integration

### AI & ML
- **OpenAI GPT-4o-mini** for SOAP note generation
- **OpenAI Whisper** for speech-to-text transcription
- **OpenAI Embeddings** (text-embedding-3-small) for vector search
- **Custom RAG pipeline** with Firebase and ChromaDB

### Database & Storage
- **SQLite** with Prisma ORM for patient and case data
- **Firebase Firestore** for vector search database
- **ChromaDB** for PlumbRAG embeddings storage

### Additional Tools
- **jsPDF** for PDF generation
- **date-fns** for date manipulation
- **Zod** for schema validation

## 📋 Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **OpenAI API Key** with access to:
  - Whisper API
  - GPT-4o-mini
  - Embeddings API
- **Firebase Project** (for vector search features)
- **Python 3.8+** (optional, for PDF processing scripts)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd verbal-chart
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Environment Configuration

#### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Backend API URL
VITE_API_URL=http://localhost:3001

# Firebase Configuration (for vector search)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Database
DATABASE_URL="file:./dev.db"
```

#### Backend Environment Variables

Create a `.env` file in the `server` directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001

# Firebase Admin (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
# Add Firebase Admin SDK credentials if needed
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data (optional)
npm run db:seed
```

### 5. Firebase Vector Search Setup

```bash
# Populate Firebase collection with veterinary drug data
npm run firebase:populate

# Test Firebase vector search (optional)
npm run firebase:test
```

## 🏃 Running the Application

### Development Mode

Start both frontend and backend concurrently:

```bash
npm run dev:full
```

This will start:
- **Frontend** on `http://localhost:5173`
- **Backend** on `http://localhost:3001`

### Individual Services

#### Frontend Only
```bash
npm run dev
```

#### Backend Only
```bash
npm run server
# or
cd server && npm run dev
```

### Production Build

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Start backend in production mode
npm run server:prod
```

## 📖 Usage Guide

### 1. Transcribe Audio

**Option A: Upload Audio File**
1. Navigate to the patient template page
2. Use the "Audio Upload" component
3. Select an audio file (MP3, WAV, MP4, max 25MB)
4. Click "Transcribe Audio"
5. Wait for Whisper AI to process the audio

**Option B: Live Recording**
1. Click the "Start Voice Recording" button
2. Grant microphone permissions when prompted
3. Speak your consultation notes
4. Click stop to end recording
5. Audio is automatically transcribed

### 2. Generate SOAP Notes

1. After transcription, click "Generate SOA" to create:
   - **Subjective**: Patient history and owner observations
   - **Objective**: Clinical findings and examination results
   - **Assessment**: Diagnosis and clinical reasoning

2. Click "Generate Plan" to create evidence-based treatment plan:
   - Uses Firebase Vector Search to find relevant drugs
   - Incorporates PlumbRAG veterinary drug handbook data
   - Provides specific dosages and administration guidelines

3. Edit any section manually if needed

### 3. Search Cases

1. Navigate to the Search page (`/search`)
2. Enter natural language queries (e.g., "diarrhea in dogs")
3. View semantically similar cases
4. Browse detailed case information and treatment history

### 4. Export Documentation

1. After generating SOAP notes, click "Export to PDF"
2. Professional PDF document is generated
3. Download and save for patient records

## 🔌 API Endpoints

### Backend Server (Port 3001)

- `GET /health` - Server health check
- `POST /api/transcribe` - Audio transcription using Whisper AI
- `POST /api/generate-soap` - SOAP note generation
- `POST /api/search` - Vector-based case search
- `POST /api/plumb-rag` - PlumbRAG drug handbook search

### Frontend API Routes (if using Next.js API routes)

- `POST /api/transcribe` - Audio transcription
- `POST /api/generate-soap` - SOAP note generation
- `POST /api/generate-summary` - Case summary generation
- `POST /api/embeddings` - Text embedding generation
- `POST /api/cases` - Store case data
- `GET /api/cases` - Retrieve cases
- `POST /api/search` - Semantic case search

## 🗄️ Database Schema

### Patient Model
```prisma
model Patient {
  id        String   @id @default(uuid())
  name      String
  age       Int?
  mrn       String   @unique
  lastVisit DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cases     CaseSheet[]
}
```

### CaseSheet Model
```prisma
model CaseSheet {
  id         String   @id @default(uuid())
  patientId  String
  transcript String?
  soapNotes  String?  // JSON string
  summary    String?
  embedding  String?  // JSON array of numbers
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  patient    Patient  @relation(fields: [patientId], references: [id])
}
```

## 📜 Available Scripts

### Frontend Scripts
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Database Scripts
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with sample data

### Firebase Scripts
- `npm run firebase:populate` - Populate Firebase vector index
- `npm run firebase:test` - Test Firebase vector search

### Server Scripts
- `npm run server` - Start backend server in dev mode
- `npm run server:prod` - Start backend server in production mode

### Combined Scripts
- `npm run dev:full` - Start both frontend and backend concurrently

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐
│   React Frontend │  (Port 5173)
│   (Vite + TS)    │
└────────┬─────────┘
         │
         │ HTTP/REST
         │
┌────────▼─────────┐
│  Express Backend  │  (Port 3001)
│   (Node.js)       │
└────────┬─────────┘
         │
    ┌────┴────┬──────────────┬─────────────┐
    │         │              │             │
┌───▼───┐ ┌──▼──────┐  ┌────▼────┐  ┌────▼────┐
│SQLite │ │Firebase │  │ OpenAI  │  │ChromaDB │
│Prisma │ │Firestore│  │   API   │  │PlumbRAG │
└───────┘ └─────────┘  └─────────┘  └─────────┘
```

### Data Flow

1. **Transcription Flow**
   ```
   Audio → Backend → OpenAI Whisper → Transcript → Frontend
   ```

2. **SOAP Generation Flow**
   ```
   Transcript → GPT-4o-mini → SOA Sections → Vector Search → Treatment Plan
   ```

3. **Vector Search Flow**
   ```
   Assessment → OpenAI Embedding → Firebase/ChromaDB → Similarity Match → Drug Recommendations
   ```

## 🔒 Security Considerations

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use `.env` files (already in `.gitignore`)
- **File Uploads**: Backend automatically cleans up uploaded files after processing
- **CORS**: Configured for development; update for production
- **Data Privacy**: Ensure HIPAA compliance for production use

## 📚 Additional Documentation

- [Whisper AI Setup Guide](./WHISPER_SETUP.md) - Detailed Whisper integration instructions
- [Firebase Vector Search Integration](./FIREBASE_INTEGRATION_SUMMARY.md) - Firebase setup and usage
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Current feature status
- [PlumbRAG Documentation](./src/lib/PLUMBRAG_README.md) - PlumbRAG integration details

## 🧪 Testing

```bash
# Test Firebase vector search
npm run firebase:test

# Test PlumbRAG integration
# (See src/lib/plumbRAG.ts for test functions)
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not connecting**
   - Ensure backend server is running on port 3001
   - Check `VITE_API_URL` in frontend `.env`
   - Verify CORS configuration in `server/server.js`

2. **Transcription fails**
   - Verify OpenAI API key is valid and has credits
   - Check audio file format and size (max 25MB)
   - Review backend console for error messages

3. **Firebase vector search returns empty results**
   - Run `npm run firebase:populate` to populate the collection
   - Verify Firebase configuration in `.env`
   - Check Firebase project permissions

4. **Database errors**
   - Run `npm run db:generate` to regenerate Prisma client
   - Run `npm run db:push` to sync schema
   - Check `DATABASE_URL` in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👥 Support

For issues and questions:
- Open a GitHub issue
- Contact the development team
- Check the documentation files in the repository

## 🙏 Acknowledgments

- **OpenAI** for Whisper, GPT-4o, and Embeddings APIs
- **Plumb's Veterinary Drug Handbook** for drug reference data
- **Firebase** for vector search infrastructure
- **Prisma** for database ORM
- **Vite** and **React** communities for excellent tooling

---

**Built with ❤️ for veterinary professionals**
