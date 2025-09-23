import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"
import { transcribeAudio, checkServerHealth, generateSoapNote, SoapNote } from "@/lib/api"

export const AudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTranscriptChunk, clearTranscript, setCurrentPatient, currentPatient, setSOAPNote } = useMedoraStore()
  const { toast } = useToast()

  // Check server health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkServerHealth()
      setServerStatus(isHealthy ? 'online' : 'offline')
    }
    checkHealth()
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/mp4']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP3 or WAV audio file.",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 25MB for OpenAI Whisper)
      const maxSize = 25 * 1024 * 1024 // 25MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 25MB.",
          variant: "destructive"
        })
        return
      }

      setUploadedFile(file)
    }
  }

  const handleTranscribe = async () => {
    if (!uploadedFile) return

    setIsTranscribing(true)
    clearTranscript()

    try {
      // Step 1: Call the Whisper API
      console.log('🎤 Starting audio transcription...');
      const result = await transcribeAudio(uploadedFile)
      console.log('✅ Transcription result:', result);
      
      // Convert Whisper response to our transcript format
      const transcriptChunk = {
        id: `chunk_${Date.now()}`,
        text: result.text,
        entities: [], // Whisper doesn't provide entity extraction
        timestamp: Date.now(),
        language: result.language,
        duration: result.duration
      }

      addTranscriptChunk(transcriptChunk)

      // Set a mock patient for demo purposes if not already set
      if (!currentPatient) {
        setCurrentPatient({
          id: 'demo-patient',
          name: 'Demo Patient',
          age: 45,
          mrn: 'DEMO001'
        })
      }

      toast({
        title: "Transcription Complete",
        description: `Successfully transcribed audio (${result.language}, ${result.duration?.toFixed(1)}s)`,
      })

      // Step 2: Generate SOAP note via backend API
      if (result.text && result.text.trim().length > 0) {
        console.log('🤖 Generating SOAP note via backend API...');
        setIsGeneratingSoap(true);
        
        toast({
          title: "Generating SOAP Note",
          description: "Creating structured SOAP notes with patient history...",
        });

        try {
          // Get previous SOAP notes for this patient (mock data for now)
          const previousNotes: SoapNote[] = getPreviousSoapNotes(currentPatient?.id || 'demo-patient');
          
          const soapNote = await generateSoapNote(result.text, previousNotes);
          console.log('✅ SOAP note with history generated:', soapNote);
          
          // Store the SOAP note in the application state
          console.log('💾 Storing SOAP note in application state...');
          setSOAPNote(soapNote);
          console.log('✅ SOAP note stored in application state');
          
          console.log('📝 Generated SOAP Note with History:');
          console.log('Subjective:', soapNote.subjective);
          console.log('Objective:', soapNote.objective);
          console.log('Assessment:', soapNote.assessment);
          console.log('Plan:', soapNote.plan);

          toast({
            title: "SOAP Note Generated",
            description: "Successfully created structured SOAP notes with patient history.",
          });

        } catch (soapError) {
          console.error('❌ Error generating SOAP note:', soapError);
          toast({
            title: "SOAP Generation Failed",
            description: "Transcription successful, but SOAP note generation failed.",
            variant: "destructive"
          });
        } finally {
          setIsGeneratingSoap(false);
        }
      }

    } catch (error) {
      console.error('Transcription error:', error)
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "Failed to transcribe the audio file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsTranscribing(false)
    }
  }

  // Mock function to get previous SOAP notes for a patient
  const getPreviousSoapNotes = (patientId: string): SoapNote[] => {
    // In a real app, this would fetch from a database
    // For now, return mock historical data
    const mockHistory: Record<string, SoapNote[]> = {
      'demo-patient': [
        {
          subjective: "Owner reports 2-week history of intermittent coughing, especially after exercise. Dog otherwise active and eating normally.",
          objective: "Temp 101.5°F, HR 95 bpm, RR 28/min. Lungs clear on auscultation. No nasal discharge. Weight stable.",
          assessment: "Mild upper respiratory irritation, possible environmental allergies",
          plan: "Monitor symptoms, consider antihistamines if coughing persists. Return in 2 weeks if no improvement."
        }
      ],
      'MRN508532597': [
        {
          subjective: "Initial visit - owner concerned about recent lethargy and decreased appetite over past 3 days.",
          objective: "Temp 102.8°F, HR 110 bpm, RR 32/min. Slightly dehydrated. Abdomen soft, no masses palpated.",
          assessment: "Possible gastrointestinal upset, rule out foreign body ingestion",
          plan: "Withhold food for 12 hours, then bland diet. Monitor closely. Return if vomiting or lethargy worsens."
        }
      ]
    };

    return mockHistory[patientId] || [];
  };

  const handleClear = () => {
    setUploadedFile(null)
    clearTranscript()
    setCurrentPatient(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-medical-primary" />
              <h3 className="text-lg font-semibold">Audio Upload & Transcription</h3>
            </div>
            <div className="flex items-center gap-2">
              {serverStatus === 'checking' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Checking server...
                </div>
              )}
              {serverStatus === 'online' && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Server online
                </div>
              )}
              {serverStatus === 'offline' && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Server offline
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="audio-file">Select Audio File</Label>
              <Input
                id="audio-file"
                type="file"
                accept=".mp3,.wav,.mpeg,.mp4"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: MP3, WAV (Max 25MB)
              </p>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleTranscribe}
                disabled={!uploadedFile || isTranscribing || isGeneratingSoap}
                className="flex-1"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : isGeneratingSoap ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating SOAP...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Transcribe & Generate SOAP
                  </>
                )}
              </Button>

              {uploadedFile && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isTranscribing || isGeneratingSoap}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Status indicators */}
            {(isTranscribing || isGeneratingSoap) && (
              <div className="space-y-2">
                {isTranscribing && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Transcribing audio with Whisper AI...</span>
                  </div>
                )}
                {isGeneratingSoap && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Generating SOAP note...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}