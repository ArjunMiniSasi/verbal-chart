import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { patientId, transcript, soapNotes, summary, embedding } = await request.json()

    if (!patientId || !transcript || !soapNotes || !summary || !embedding) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const caseSheet = await prisma.caseSheet.create({
      data: {
        patientId,
        transcript,
        soapNotes: JSON.stringify(soapNotes),
        summary,
        embedding: JSON.stringify(embedding)
      }
    })

    return NextResponse.json({ caseSheet })
  } catch (error) {
    console.error('Case storage error:', error)
    return NextResponse.json(
      { error: 'Failed to store case' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const cases = await prisma.caseSheet.findMany({
      where: patientId ? { patientId } : {},
      include: {
        patient: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error('Case retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve cases' },
      { status: 500 }
    )
  }
}
