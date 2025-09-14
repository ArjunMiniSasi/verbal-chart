# AI Medical Scribe

A complete end-to-end web application for AI-powered medical transcription and SOAP note generation using Next.js 14, TailwindCSS, and OpenAI SDK.

## Features

1. **Audio Upload & Transcription**
   - Upload audio files (.mp3 or .wav)
   - OpenAI Whisper transcription
   - Real-time transcript display with entity highlighting

2. **SOAP Notes Generation**
   - AI-generated SOAP notes using GPT-4o
   - Structured format: Subjective, Objective, Assessment, Plan
   - Interactive editing interface

3. **Case Summary & Storage**
   - 5-bullet case summaries
   - Vector embeddings for semantic search
   - SQLite database with Prisma ORM

4. **Search Case Sheets**
   - Natural language search queries
   - Semantic similarity matching
   - Highlighted search results

5. **Export Functionality**
   - PDF export of SOAP notes (jsPDF)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: TailwindCSS, Radix UI components
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **AI**: OpenAI GPT-4o, Whisper, Embeddings
- **PDF**: jsPDF for document export

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   ```

3. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Main Page (`/`)
1. Upload an audio file (MP3 or WAV, max 25MB)
2. Click "Transcribe Audio" to generate transcript
3. Use "Generate SOAP" to create AI-generated SOAP notes
4. Generate and save case summary
5. Export to PDF

### Search Page (`/search`)
1. Enter natural language queries
2. View semantically similar cases
3. Browse detailed case information

## API Endpoints

- `POST /api/transcribe` - Audio transcription
- `POST /api/generate-soap` - SOAP note generation
- `POST /api/generate-summary` - Case summary generation
- `POST /api/embeddings` - Text embedding generation
- `POST /api/cases` - Store case data
- `GET /api/cases` - Retrieve cases
- `POST /api/search` - Semantic case search

## Database Schema

### Patient
- id, name, age, mrn, lastVisit, createdAt, updatedAt

### CaseSheet
- id, patientId, transcript, soapNotes, summary, embedding, createdAt, updatedAt

## Development

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed
```

### Building for Production
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue or contact the development team.