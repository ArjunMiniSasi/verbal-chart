import { useEffect } from 'react'
import { Header } from "@/components/Header"
import { ManualSOAEditor } from "@/components/ManualSOAEditor"
import { PreviewModal } from "@/components/PreviewModal"
import { useMedoraStore } from "@/stores/medoraStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

const NewSOAP = () => {
  const { clearSOAPNote, clearTranscript } = useMedoraStore()

  // Clear SOAP note and transcript when component mounts
  useEffect(() => {
    clearSOAPNote()
    clearTranscript()
  }, [clearSOAPNote, clearTranscript])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileText className="h-7 w-7 text-blue-600" />
                Create New SOAP Note
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Manually create a SOAP note by filling in the Subjective, Objective, Assessment, and Plan sections.
              </p>
            </CardHeader>
          </Card>
          
          <ManualSOAEditor />
        </div>
      </div>
      <PreviewModal />
    </div>
  )
}

export default NewSOAP

