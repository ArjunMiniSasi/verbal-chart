import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json()

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json({ error: 'System prompt and user prompt are required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
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

  // Enhanced text parsing to extract sections
  const lines = text.split('\n')
  let currentSection = ''

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim()
    
    if (lowerLine.includes('subjective') || lowerLine.includes('s —') || lowerLine.includes('chief complaint')) {
      currentSection = 'subjective'
    } else if (lowerLine.includes('objective') || lowerLine.includes('o —') || lowerLine.includes('physical exam')) {
      currentSection = 'objective'
    } else if (lowerLine.includes('assessment') || lowerLine.includes('a —') || lowerLine.includes('impression')) {
      currentSection = 'assessment'
    } else if (lowerLine.includes('plan') || lowerLine.includes('p —') || lowerLine.includes('treatment')) {
      currentSection = 'plan'
    } else if (currentSection && line.trim()) {
      sections[currentSection as keyof typeof sections] += line.trim() + ' '
    }
  }

  // Clean up the sections
  Object.keys(sections).forEach(key => {
    sections[key as keyof typeof sections] = sections[key as keyof typeof sections].trim()
  })

  return sections
}
