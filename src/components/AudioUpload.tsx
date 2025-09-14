import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"
import { transcribeAudio, checkServerHealth } from "@/lib/api"

export const AudioUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addTranscriptChunk, clearTranscript, setCurrentPatient } = useMedoraStore()
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
      // Call the Whisper API
      const result = await transcribeAudio(uploadedFile)
      
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

      // Set a mock patient for demo purposes
      setCurrentPatient({
        id: 'demo-patient',
        name: 'Demo Patient',
        age: 45,
        mrn: 'DEMO001'
      })

      toast({
        title: "Transcription Complete",
        description: `Successfully transcribed audio (${result.language}, ${result.duration?.toFixed(1)}s)`,
      })

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
                disabled={!uploadedFile || isTranscribing}
                className="flex-1"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Transcribe Audio
                  </>
                )}
              </Button>

              {uploadedFile && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  disabled={isTranscribing}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}