import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { transcript, patientInfo } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const prompt = `You are a medical AI assistant. Generate a SOAP note based on the following patient transcript.

Patient Information: ${patientInfo ? JSON.stringify(patientInfo) : 'Not provided'}

Transcript: ${transcript}

Please generate a comprehensive SOAP note with the following sections:

SUBJECTIVE: Patient's chief complaint, history of present illness, and relevant medical history
OBJECTIVE: Physical examination findings, vital signs, and objective observations
ASSESSMENT: Clinical impression, differential diagnosis, and assessment
PLAN: Treatment plan, medications, follow-up, and recommendations

Format the response as a JSON object with keys: subjective, objective, assessment, plan.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant specializing in generating accurate SOAP notes. Always maintain medical accuracy and professional standards.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Try to parse as JSON, fallback to text parsing
    let soapNote
    try {
      soapNote = JSON.parse(response)
    } catch {
      // Fallback: parse the text response
      soapNote = parseSOAPFromText(response)
    }

    return NextResponse.json({ soapNote })
  } catch (error) {
    console.error('SOAP generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate SOAP notes' },
      { status: 500 }
    )
  }
}

function parseSOAPFromText(text: string) {
  const sections = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  }

  // Simple text parsing to extract sections
  const lines = text.split('\n')
  let currentSection = ''

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim()
    
    if (lowerLine.includes('subjective') || lowerLine.includes('chief complaint')) {
      currentSection = 'subjective'
    } else if (lowerLine.includes('objective') || lowerLine.includes('physical exam')) {
      currentSection = 'objective'
    } else if (lowerLine.includes('assessment') || lowerLine.includes('impression')) {
      currentSection = 'assessment'
    } else if (lowerLine.includes('plan') || lowerLine.includes('treatment')) {
      currentSection = 'plan'
    } else if (currentSection && line.trim()) {
      sections[currentSection as keyof typeof sections] += line.trim() + ' '
    }
  }

  return sections
}
