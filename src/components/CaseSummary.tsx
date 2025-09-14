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
    if (transcript.length === 0) {
      toast({
        title: "No transcript available",
        description: "Please transcribe audio first.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate AI summary generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockSummary = `• Patient reports severe bilateral headaches for 3 days
• Throbbing pain worse in morning with associated fatigue
• History of migraine with no recent medication changes
• Physical examination shows no focal neurological deficits
• Started on sumatriptan PRN with follow-up in 2 weeks`

      setSummary(mockSummary)

      toast({
        title: "Summary Generated",
        description: "Case summary has been generated successfully.",
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

  const saveCase = async () => {
    if (!summary || !currentPatient) {
      toast({
        title: "Missing information",
        description: "Please generate a summary and ensure patient is selected.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000))

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
      
      const content = `
SOAP NOTES
==========

Patient: ${currentPatient.name}
Age: ${currentPatient.age}
MRN: ${currentPatient.mrn}
Date: ${new Date().toLocaleDateString()}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}

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
      a.download = `SOAP_${currentPatient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
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
            disabled={isGenerating || transcript.length === 0}
            className="flex-1"
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
                <Badge variant="outline">Patient: {currentPatient.name}</Badge>
                <Badge variant="outline">MRN: {currentPatient.mrn}</Badge>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}