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

    const prompt = `You are a medical AI assistant. Generate a concise 5-bullet summary of the following patient transcript.

Patient Information: ${patientInfo ? JSON.stringify(patientInfo) : 'Not provided'}

Transcript: ${transcript}

Please generate a 5-bullet summary that captures:
1. Chief complaint or main concern
2. Key symptoms or findings
3. Relevant medical history or context
4. Assessment or diagnosis
5. Treatment plan or recommendations

Format as a simple text with 5 bullet points.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant specializing in creating concise, accurate case summaries. Always maintain medical accuracy and professional standards.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const summary = completion.choices[0]?.message?.content
    if (!summary) {
      throw new Error('No summary generated')
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
