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
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Transcript', 20, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    const transcriptLines = doc.splitTextToSize(transcript, 170);
    doc.text(transcriptLines, 20, 50);
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

// Prescription PDF Export Types
export interface PrescribedMedication {
  inventory_id: string;
  brand_name: string;
  strength: string;
  form: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  stock_quantity: number;
  expiry_date: string;
  cost_per_unit?: number;
}

export interface PrescriptionPatient {
  id?: string;
  name: string;
  mrn?: string;
  age?: number | string;
  gender?: string;
  pet?: {
    name?: string;
    species?: string;
    breed?: string;
    age?: number | string;
  };
}

export interface PrescriptionDoctor {
  name?: string;
  id?: string;
}

/**
 * Export prescription to PDF in hospital prescription format
 * Matches the format shown in the sample prescription PDF
 */
export const exportPrescriptionToPDF = (
  medications: PrescribedMedication[],
  patient: PrescriptionPatient,
  doctor?: PrescriptionDoctor,
  hospitalName: string = 'Veterinary Hospital'
) => {
  const doc = new jsPDF();
  
  // Page dimensions
  const pageWidth = 210; // A4 width in mm
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  // Colors
  const headerColor = [50, 50, 50];
  const textColor = [0, 0, 0];
  const lightGray = [200, 200, 200];
  
  // ========== HEADER SECTION ==========
  // Hospital/Clinic Name (centered, top)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...headerColor);
  const hospitalText = hospitalName.toUpperCase();
  const hospitalWidth = doc.getTextWidth(hospitalText);
  doc.text(hospitalText, (pageWidth - hospitalWidth) / 2, 25);
  
  // Prescription Form Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIPTION FORM', (pageWidth - doc.getTextWidth('PRESCRIPTION FORM')) / 2, 35);
  
  // ========== PATIENT & DOCTOR INFO SECTION ==========
  let yPos = 50;
  
  // Left Column - Patient Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  
  const patientMRN = patient.mrn || patient.id || 'N/A';
  const patientName = patient.name || 'N/A';
  const patientAge = patient.pet?.age || patient.age || 'N/A';
  const patientGender = patient.gender || patient.pet?.species || 'N/A';
  
  // EMR Indent No / MRN
  doc.text(`EMR Indent No : ${patientMRN}`, margin, yPos);
  yPos += 7;
  
  // Patient Name
  doc.text(`Patient Name : ${patientName}`, margin, yPos);
  yPos += 7;
  
  // MRNO
  doc.text(`MRNO : ${patientMRN}`, margin, yPos);
  yPos += 7;
  
  // Printed On
  const printedDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  doc.text(`Printed On : ${printedDate}`, margin, yPos);
  
  // Right Column - Doctor Information
  yPos = 50;
  const rightColumnX = pageWidth - margin - 80;
  
  const doctorName = doctor?.name || 'Dr. Veterinarian';
  const requestedDate = new Date().toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  
  doc.text(`Doctor Name : ${doctorName}`, rightColumnX, yPos);
  yPos += 7;
  
  doc.text(`Requested On : ${requestedDate}`, rightColumnX, yPos);
  yPos += 7;
  
  doc.text(`Age : ${patientAge}${typeof patientAge === 'number' ? 'y' : ''}`, rightColumnX, yPos);
  yPos += 7;
  
  doc.text(`Gender: ${patientGender}`, rightColumnX, yPos);
  
  // Horizontal line separator
  yPos = 75;
  doc.setDrawColor(...lightGray);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // ========== MEDICATION TABLE ==========
  yPos += 15;
  
  // Table Headers
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  
  const colWidths = [10, 50, 35, 25, 30, 30, 10]; // SlNo, Medicine, Dosage, Duration, Route, Remarks, P
  const colHeaders = ['SlNo', 'Medicine Name', 'Dosage', 'Duration', 'Route', 'Remarks', 'P'];
  let xPos = margin;
  
  // Draw header row background
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 6, contentWidth, 8, 'F');
  
  // Header text
  colHeaders.forEach((header, idx) => {
    doc.text(header, xPos + 2, yPos);
    xPos += colWidths[idx];
  });
  
  // Header underline
  doc.setDrawColor(...textColor);
  doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
  
  yPos += 10;
  
  // Medication Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  
  medications.forEach((med, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 30;
      
      // Redraw headers on new page
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      xPos = margin;
      colHeaders.forEach((header, idx) => {
        doc.text(header, xPos + 2, yPos);
        xPos += colWidths[idx];
      });
      doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
    }
    
    xPos = margin;
    
    // SlNo
    doc.text(String(index + 1), xPos + 2, yPos);
    xPos += colWidths[0];
    
    // Medicine Name (may need to wrap)
    const medName = `${med.brand_name} ${med.strength} ${med.form.toUpperCase()}`;
    const medNameLines = doc.splitTextToSize(medName, colWidths[1] - 4);
    doc.text(medNameLines, xPos + 2, yPos);
    xPos += colWidths[1];
    
    // Dosage (format: "1 Tablet.1-0-1" style)
    // Use quantity if > 0, otherwise use 1 as default for display
    const displayQuantity = med.quantity > 0 ? med.quantity : 1;
    const dosageText = formatDosageForPrescription(med.dosage, med.frequency, displayQuantity, med.form);
    const dosageLines = doc.splitTextToSize(dosageText, colWidths[2] - 4);
    doc.text(dosageLines, xPos + 2, yPos);
    xPos += colWidths[2];
    
    // Duration
    const durationText = med.duration || 'As directed';
    const durationLines = doc.splitTextToSize(durationText, colWidths[3] - 4);
    doc.text(durationLines, xPos + 2, yPos);
    xPos += colWidths[3];
    
    // Route
    const routeText = formatRouteForPrescription(med.form, med.instructions);
    const routeLines = doc.splitTextToSize(routeText, colWidths[4] - 4);
    doc.text(routeLines, xPos + 2, yPos);
    xPos += colWidths[4];
    
    // Remarks
    const remarksText = med.instructions || 'As directed';
    const remarksLines = doc.splitTextToSize(remarksText, colWidths[5] - 4);
    doc.text(remarksLines, xPos + 2, yPos);
    xPos += colWidths[5];
    
    // P (Prescribed indicator)
    doc.text('P', xPos + 2, yPos);
    
    // Row separator line
    yPos += Math.max(medNameLines.length, dosageLines.length, durationLines.length, routeLines.length, remarksLines.length) * 5 + 3;
    doc.setDrawColor(...lightGray);
    doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 3;
  });
  
  // ========== FOOTER ==========
  // Add signature line at bottom if space
  if (yPos < 250) {
    yPos = 260;
    doc.setDrawColor(...lightGray);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Doctor Signature: _________________________', margin, yPos);
  }
  
  // Save the PDF
  const fileName = `Prescription_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Format dosage for prescription (e.g., "1 Tablet.1-0-1")
 */
function formatDosageForPrescription(
  dosage: string,
  frequency: string,
  quantity: number,
  form: string
): string {
  // Extract numeric dosage if available
  const dosageMatch = dosage.match(/(\d+(?:\.\d+)?)/);
  const dosageNum = dosageMatch ? dosageMatch[1] : '1';
  
  // Format frequency to prescription style (1-0-1 = morning, none, evening)
  let freqCode = '';
  const freqUpper = frequency.toUpperCase();
  if (freqUpper.includes('BID') || freqUpper.includes('TWICE')) {
    freqCode = '1-0-1'; // Morning and Evening
  } else if (freqUpper.includes('TID') || freqUpper.includes('THREE')) {
    freqCode = '1-1-1'; // Three times
  } else if (freqUpper.includes('QID') || freqUpper.includes('FOUR')) {
    freqCode = '1-1-1-1'; // Four times
  } else if (freqUpper.includes('ONCE') || freqUpper.includes('QD')) {
    freqCode = '1-0-0'; // Once daily
  } else {
    freqCode = '1-0-1'; // Default
  }
  
  const formUnit = form === 'tablet' ? 'Tablet' : form === 'capsule' ? 'Capsule' : form;
  return `${dosageNum} ${formUnit}.${freqCode}`;
}

/**
 * Format route for prescription (e.g., "Oral - Tablet")
 */
function formatRouteForPrescription(form: string, instructions?: string): string {
  const formLower = form.toLowerCase();
  
  if (formLower.includes('injection') || formLower.includes('inj')) {
    return 'Intravenous - Injection';
  } else if (formLower.includes('tablet')) {
    return 'Oral - Tablet';
  } else if (formLower.includes('capsule')) {
    return 'Oral - Capsule';
  } else if (formLower.includes('liquid') || formLower.includes('suspension')) {
    return 'Oral - Liquid';
  } else if (formLower.includes('topical')) {
    return 'Topical';
  } else {
    return `Oral - ${form.charAt(0).toUpperCase() + form.slice(1)}`;
  }
}
