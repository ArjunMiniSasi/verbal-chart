import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    // Generate embedding for the search query
    const queryEmbedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    // Get all case sheets with their embeddings
    const caseSheets = await prisma.caseSheet.findMany({
      include: {
        patient: true
      }
    })

    // Calculate cosine similarity for each case
    const results = caseSheets.map(caseSheet => {
      const caseEmbedding = JSON.parse(caseSheet.embedding)
      const similarity = cosineSimilarity(queryEmbedding.data[0].embedding, caseEmbedding)
      
      return {
        ...caseSheet,
        similarity,
        soapNotes: JSON.parse(caseSheet.soapNotes)
      }
    })

    // Sort by similarity and return top results
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .filter(result => result.similarity > 0.1) // Only return results with reasonable similarity

    return NextResponse.json({ results: topResults })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search cases' },
      { status: 500 }
    )
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
