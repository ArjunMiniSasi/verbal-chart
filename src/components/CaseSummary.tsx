'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Save, Loader2, Download } from "lucide-react"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"

export const CaseSummary = () => {
  const [summary, setSummary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { transcript, soapNote, currentPatient } = useMedoraStore()
  const { toast } = useToast()

  const generateSummary = async () => {
    if (!soapNote.subjective || !soapNote.objective || !soapNote.assessment) {
      toast({
        title: "Incomplete SOAP notes",
        description: "Please generate complete SOAP notes (Subjective, Objective, Assessment) first.",
        variant: "destructive"
      })
      return
    }

    if (!currentPatient) {
      toast({
        title: "No patient selected",
        description: "Please select a patient first.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate summary directly from SOAP data in the store
      const generatedSummary = generateSummaryFromSOAP();
      setSummary(generatedSummary);

      toast({
        title: "Summary Generated",
        description: "Case summary has been generated from SOAP notes successfully.",
      })

    } catch (error) {
      console.error('Summary generation error:', error)
      toast({
        title: "Summary Generation Failed",
        description: "Failed to generate case summary. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSummaryFromSOAP = () => {
    const summaryPoints = [];
    
    // 1. Chief complaint/presenting symptoms (from Subjective)
    if (soapNote.subjective) {
      const subjective = soapNote.subjective.toLowerCase();
      let chiefComplaint = '';
      
      if (subjective.includes('vomiting') || subjective.includes('vomit')) {
        chiefComplaint = 'Patient presented with vomiting';
      } else if (subjective.includes('diarrhea') || subjective.includes('diarrhoea')) {
        chiefComplaint = 'Patient reported diarrhea';
      } else if (subjective.includes('lethargic') || subjective.includes('lethargy')) {
        chiefComplaint = 'Patient showed signs of lethargy';
      } else if (subjective.includes('pain') || subjective.includes('ache')) {
        chiefComplaint = 'Patient reported pain/discomfort';
      } else {
        // Extract first sentence or key phrase
        const firstSentence = soapNote.subjective.split('.')[0];
        chiefComplaint = firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence;
      }
      
      if (chiefComplaint) {
        summaryPoints.push(`• ${chiefComplaint}`);
      }
    }
    
    // 2. Key physical exam findings (from Objective)
    if (soapNote.objective) {
      const objective = soapNote.objective.toLowerCase();
      let examFindings = '';
      
      if (objective.includes('dehydration') || objective.includes('dehydrated')) {
        examFindings = 'Physical exam revealed dehydration';
      } else if (objective.includes('tender') || objective.includes('tenderness')) {
        examFindings = 'Abdominal tenderness noted on examination';
      } else if (objective.includes('temperature') && objective.includes('normal')) {
        examFindings = 'Vital signs within normal limits';
      } else {
        // Extract key findings
        const firstSentence = soapNote.objective.split('.')[0];
        examFindings = firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence;
      }
      
      if (examFindings) {
        summaryPoints.push(`• ${examFindings}`);
      }
    }
    
    // 3. Primary diagnosis/assessment
    if (soapNote.assessment) {
      const assessment = soapNote.assessment.toLowerCase();
      let diagnosis = '';
      
      if (assessment.includes('gastritis')) {
        diagnosis = 'Diagnosis: Gastritis';
      } else if (assessment.includes('obstruction')) {
        diagnosis = 'Rule out obstruction if symptoms persist';
      } else {
        // Use the assessment as is, but truncate if too long
        diagnosis = soapNote.assessment.length > 80 ? soapNote.assessment.substring(0, 80) + '...' : soapNote.assessment;
      }
      
      if (diagnosis) {
        summaryPoints.push(`• ${diagnosis}`);
      }
    }
    
    // 4. Treatment plan highlights (from Plan)
    if (soapNote.plan) {
      const plan = soapNote.plan.toLowerCase();
      let treatment = '';
      
      if (plan.includes('metoclopramide') || plan.includes('cerenia') || plan.includes('maropitant')) {
        treatment = 'Anti-emetic medication prescribed';
      } else if (plan.includes('famotidine') || plan.includes('gastric')) {
        treatment = 'Gastric protection medication prescribed';
      } else if (plan.includes('fluid') || plan.includes('dehydration')) {
        treatment = 'Fluid therapy recommended';
      } else if (plan.includes('antibiotic') || plan.includes('medication')) {
        treatment = 'Medication therapy initiated';
      } else {
        // Extract first treatment item
        const firstLine = soapNote.plan.split('\n')[0];
        if (firstLine.includes('-')) {
          treatment = firstLine.replace(/^-\s*/, '').replace(/<[^>]*>/g, ''); // Remove bullet and HTML tags
          treatment = treatment.length > 60 ? treatment.substring(0, 60) + '...' : treatment;
        }
      }
      
      if (treatment) {
        summaryPoints.push(`• ${treatment}`);
      }
    }
    
    // 5. Follow-up recommendations
    if (soapNote.plan) {
      const plan = soapNote.plan.toLowerCase();
      if (plan.includes('follow') || plan.includes('recheck') || plan.includes('24') || plan.includes('48')) {
        summaryPoints.push('• Follow-up appointment scheduled');
      } else {
        summaryPoints.push('• Follow-up as needed based on response to treatment');
      }
    } else {
      summaryPoints.push('• Follow-up as needed based on response to treatment');
    }
    
    // If we don't have enough points, add patient info
    if (summaryPoints.length < 3) {
      summaryPoints.unshift(`• Patient: ${currentPatient?.pet?.name || 'Unknown'} (${currentPatient?.pet?.species || 'Unknown'})`);
    }
    
    return summaryPoints.join('\n');
  }

  const saveCase = async () => {
    if (!summary || !currentPatient || !soapNote.subjective) {
      toast({
        title: "Missing information",
        description: "Please generate SOAP notes and summary first.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Use the existing API route for saving cases
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientId: currentPatient.id,
          transcript: transcript.map(chunk => chunk.text).join(' '),
          soapNotes: JSON.stringify(soapNote),
          summary: summary,
          embedding: JSON.stringify([]) // Empty embedding for now
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Case Saved",
        description: "Case has been saved to the database successfully.",
      })

    } catch (error) {
      console.error('Case saving error:', error)
      toast({
        title: "Save Failed",
        description: "Failed to save case. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const downloadPDF = () => {
    if (!currentPatient || !soapNote.subjective) {
      toast({
        title: "Missing information",
        description: "Please generate SOAP notes first.",
        variant: "destructive"
      })
      return
    }

    try {
      // Create a simple text-based PDF export
      const transcriptText = transcript.map(chunk => chunk.text).join(' ')
      
      // Clean the plan text for export (remove HTML tags)
      const cleanPlan = soapNote.plan
        ? soapNote.plan.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
        : 'No treatment plan generated';
      
      const content = `
SOAP NOTES
==========

Patient: ${currentPatient.pet?.name || 'Unknown'}
Species: ${currentPatient.pet?.species || 'Unknown'}
Breed: ${currentPatient.pet?.breed || 'Unknown'}
Age: ${currentPatient.pet?.age || 'Unknown'} years
Weight: ${currentPatient.pet?.weight || 'Unknown'} lbs
Gender: ${currentPatient.pet?.gender || 'Unknown'}
Owner: ${currentPatient.owner?.name || 'Unknown'}
Date: ${new Date().toLocaleDateString()}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${cleanPlan}

TRANSCRIPT:
${transcriptText}

CASE SUMMARY:
${summary}
      `.trim()

      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `SOAP_${(currentPatient.pet?.name || 'Unknown').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Document Exported",
        description: "SOAP notes have been exported as a text file.",
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-medical-primary" />
          Case Summary & Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={generateSummary}
            disabled={isGenerating || !soapNote.subjective || !soapNote.objective || !soapNote.assessment}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>
        </div>

        {summary && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">5-Bullet Summary</label>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Case summary will appear here..."
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveCase}
                disabled={isSaving || !currentPatient}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Case
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={downloadPDF}
                disabled={!summary}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Document
              </Button>
            </div>

            {currentPatient && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Patient: {currentPatient.pet?.name || 'Unknown'}</Badge>
                <Badge variant="outline">Species: {currentPatient.pet?.species || 'Unknown'}</Badge>
                <Badge variant="outline">Owner: {currentPatient.owner?.name || 'Unknown'}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}