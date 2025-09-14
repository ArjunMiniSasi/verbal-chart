import jsPDF from 'jspdf'

export interface SOAPNote {
  subjective: string
  objective: string
  assessment: string
  plan: string
}

export interface Patient {
  id: string
  name: string
  age: number
  mrn: string
}

export const exportSOAPToPDF = (
  soapNote: SOAPNote,
  patient: Patient,
  transcript?: string,
  summary?: string
) => {
  const doc = new jsPDF()
  
  // Set up fonts and colors
  doc.setFont('helvetica')
  
  // Header
  doc.setFontSize(20)
  doc.setTextColor(0, 0, 0)
  doc.text('SOAP Notes', 20, 30)
  
  // Patient Information
  doc.setFontSize(12)
  doc.setTextColor(100, 100, 100)
  doc.text('Patient Information:', 20, 50)
  
  doc.setFontSize(10)
  doc.text(`Name: ${patient.name}`, 20, 60)
  doc.text(`Age: ${patient.age}`, 20, 70)
  doc.text(`MRN: ${patient.mrn}`, 20, 80)
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90)
  
  // Add line separator
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 100, 190, 100)
  
  let yPosition = 120
  
  // SOAP Sections
  const sections = [
    { title: 'SUBJECTIVE', content: soapNote.subjective },
    { title: 'OBJECTIVE', content: soapNote.objective },
    { title: 'ASSESSMENT', content: soapNote.assessment },
    { title: 'PLAN', content: soapNote.plan }
  ]
  
  sections.forEach((section, index) => {
    // Section title
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, 20, yPosition)
    
    // Section content
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    
    // Split content into lines that fit the page width
    const lines = doc.splitTextToSize(section.content, 170)
    doc.text(lines, 20, yPosition + 10)
    
    yPosition += 10 + (lines.length * 5) + 15
    
    // Add space between sections
    if (index < sections.length - 1) {
      yPosition += 10
    }
    
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 30
    }
  })
  
  // Add transcript if provided
  if (transcript) {
    doc.addPage()
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Transcript', 20, 30)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    
    const transcriptLines = doc.splitTextToSize(transcript, 170)
    doc.text(transcriptLines, 20, 50)
  }
  
  // Add summary if provided
  if (summary) {
    if (!transcript) {
      doc.addPage()
    }
    
    const summaryY = transcript ? 30 : 30
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'bold')
    doc.text('Case Summary', 20, summaryY)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    
    const summaryLines = doc.splitTextToSize(summary, 170)
    doc.text(summaryLines, 20, summaryY + 20)
  }
  
  // Save the PDF
  const fileName = `SOAP_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}
