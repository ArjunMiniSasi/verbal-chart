import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // Check if data already exists
    const existingCases = await prisma.caseSheet.count()
    if (existingCases > 0) {
      return NextResponse.json({ 
        message: 'Demo data already exists',
        count: existingCases 
      })
    }

    // Create sample patients
    const patient1 = await prisma.patient.create({
      data: {
        name: 'Sarah Johnson',
        age: 34,
        mrn: 'MRN001',
        lastVisit: new Date('2024-01-15')
      }
    })

    const patient2 = await prisma.patient.create({
      data: {
        name: 'Michael Chen',
        age: 67,
        mrn: 'MRN002',
        lastVisit: new Date('2024-01-10')
      }
    })

    const patient3 = await prisma.patient.create({
      data: {
        name: 'Emma Rodriguez',
        age: 29,
        mrn: 'MRN003',
        lastVisit: new Date('2024-01-08')
      }
    })

    // Create sample case sheets
    await prisma.caseSheet.create({
      data: {
        patientId: patient1.id,
        transcript: 'Patient reports having severe headaches for the past three days. The pain is bilateral and throbbing in nature, worse in the morning. Patient also mentions feeling fatigued and having trouble concentrating. No recent changes in medications. History of migraine.',
        soapNotes: JSON.stringify({
          subjective: 'Patient reports severe bilateral throbbing headaches for 3 days, worse in morning. Associated with fatigue and difficulty concentrating. No recent medication changes. History of migraine.',
          objective: 'Vital signs stable. No focal neurological deficits. Head and neck examination normal. No signs of meningeal irritation.',
          assessment: 'Migraine headache, likely tension-type component. Rule out secondary causes.',
          plan: 'Start sumatriptan 50mg PRN for acute episodes. Consider prophylactic treatment if frequency increases. Follow up in 2 weeks. Advise stress management and regular sleep schedule.'
        }),
        summary: '• Severe bilateral headaches for 3 days\n• Throbbing pain worse in morning\n• Associated fatigue and concentration issues\n• History of migraine\n• Started on sumatriptan PRN',
        embedding: JSON.stringify([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) // Mock embedding
      }
    })

    await prisma.caseSheet.create({
      data: {
        patientId: patient2.id,
        transcript: 'Patient presents with chest pain and shortness of breath. Pain is substernal, pressure-like, occurring with exertion. Patient has known coronary artery disease and hypertension. Pain relieved with rest. No radiation to arms or jaw.',
        soapNotes: JSON.stringify({
          subjective: 'Chest pain and shortness of breath. Substernal pressure-like pain with exertion. Known CAD and HTN. Pain relieved with rest. No radiation.',
          objective: 'BP 150/90, HR 88, RR 18, O2 sat 96% RA. Heart regular rate and rhythm. No murmurs. Lungs clear bilaterally. No peripheral edema.',
          assessment: 'Stable angina. Hypertension. Known CAD.',
          plan: 'Increase metoprolol to 50mg BID. Continue aspirin 81mg daily. Cardiology follow up in 1 month. Consider stress test if symptoms worsen.'
        }),
        summary: '• Chest pain and SOB with exertion\n• Substernal pressure-like pain\n• Known CAD and hypertension\n• Pain relieved with rest\n• Increased metoprolol dose',
        embedding: JSON.stringify([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1]) // Mock embedding
      }
    })

    await prisma.caseSheet.create({
      data: {
        patientId: patient3.id,
        transcript: 'Patient complains of persistent cough and fever for 5 days. Productive cough with yellow sputum. Fever up to 101.5F. Patient reports feeling generally unwell and decreased appetite. No chest pain or shortness of breath.',
        soapNotes: JSON.stringify({
          subjective: 'Persistent cough and fever for 5 days. Productive cough with yellow sputum. Fever up to 101.5F. General malaise and decreased appetite. No chest pain or SOB.',
          objective: 'Temp 101.2F, BP 120/80, HR 95, RR 20. Lungs with scattered rales bilaterally. No wheezing. Heart regular. Abdomen soft, non-tender.',
          assessment: 'Community-acquired pneumonia, likely bacterial. Rule out COVID-19.',
          plan: 'Chest X-ray. CBC with diff. COVID-19 PCR. Start amoxicillin 875mg BID for 7 days. Follow up in 3 days or if symptoms worsen.'
        }),
        summary: '• Persistent cough and fever for 5 days\n• Productive cough with yellow sputum\n• Fever up to 101.5F\n• General malaise and decreased appetite\n• Started on amoxicillin for pneumonia',
        embedding: JSON.stringify([0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.1, 0.2]) // Mock embedding
      }
    })

    return NextResponse.json({ 
      message: 'Demo data loaded successfully',
      patients: 3,
      cases: 3
    })
  } catch (error) {
    console.error('Demo data loading error:', error)
    return NextResponse.json(
      { error: 'Failed to load demo data' },
      { status: 500 }
    )
  }
}
