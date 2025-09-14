import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer()
    const audioFile = new File([buffer], file.name, { type: file.type })

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word']
    })

    // Process the transcription to extract entities and format chunks
    const chunks = processTranscription(transcription)

    return NextResponse.json({
      transcript: chunks,
      fullText: transcription.text
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}

function processTranscription(transcription: any) {
  const chunks = []
  let currentChunk = ''
  let chunkStartTime = 0
  let chunkId = 0

  // Simple chunking based on sentence boundaries
  const sentences = transcription.text.split(/[.!?]+/).filter(s => s.trim())
  
  sentences.forEach((sentence, index) => {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) return

    // Extract entities using simple keyword matching
    const entities = extractEntities(trimmedSentence)
    
    chunks.push({
      id: `chunk_${chunkId++}`,
      text: trimmedSentence,
      entities,
      timestamp: index * 2000 // Mock timestamp
    })
  })

  return chunks
}

function extractEntities(text: string) {
  const entities = []
  const lowerText = text.toLowerCase()

  // Medical symptoms
  const symptoms = ['pain', 'headache', 'fever', 'cough', 'nausea', 'fatigue', 'dizziness', 'shortness of breath']
  symptoms.forEach(symptom => {
    if (lowerText.includes(symptom)) {
      entities.push({
        text: symptom,
        type: 'symptom',
        confidence: 0.8
      })
    }
  })

  // Medical conditions
  const conditions = ['diabetes', 'hypertension', 'migraine', 'asthma', 'pneumonia', 'covid', 'flu']
  conditions.forEach(condition => {
    if (lowerText.includes(condition)) {
      entities.push({
        text: condition,
        type: 'condition',
        confidence: 0.9
      })
    }
  })

  // Medications
  const medications = ['aspirin', 'ibuprofen', 'metformin', 'insulin', 'penicillin', 'morphine']
  medications.forEach(medication => {
    if (lowerText.includes(medication)) {
      entities.push({
        text: medication,
        type: 'medication',
        confidence: 0.85
      })
    }
  })

  return entities
}
