import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Upload, 
  Mic, 
  MicOff,
  FileText,
  Loader2,
  Play,
  Pause,
  Square
} from "lucide-react"
import { AudioUpload } from "@/components/AudioUpload"
import { Transcript } from "@/components/Transcript"
import { SOAPEditor } from "@/components/SOAPEditor"
import { CaseSummary } from "@/components/CaseSummary"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"

const PatientTemplate = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentPatient, setCurrentPatient, transcript, soapNote } = useMedoraStore()
  
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [patientData, setPatientData] = useState<any>(null)

  // Fetch patient data based on patientId - in real app, this would be an API call
  useEffect(() => {
    // Check if we have new patient data from the form
    const storedPatientData = sessionStorage.getItem('newPatientData')
    
    if (storedPatientData) {
      // Use the data from the form
      const formData = JSON.parse(storedPatientData)
      const newPatient = {
        id: patientId,
        name: formData.name || 'New Patient',
        age: parseInt(formData.age) || 0,
        gender: formData.gender || 'Unknown',
        patientId: patientId,
        phone: formData.phone || 'Not provided',
        email: formData.email || 'Not provided',
        lastVisit: new Date().toISOString().split('T')[0], // Today's date
        status: 'active',
        medicalHistory: formData.medicalHistory || 'No previous medical history recorded',
        allergies: formData.allergies || 'None known'
      }
      
      setPatientData(newPatient)
      setCurrentPatient(newPatient)
      
      // Clear the stored data after using it
      sessionStorage.removeItem('newPatientData')
    } else {
      // Fallback for direct navigation (demo purposes)
      const defaultPatient = {
        id: patientId,
        name: 'New Patient',
        age: 0,
        gender: 'Unknown',
        patientId: patientId,
        phone: 'Not provided',
        email: 'Not provided',
        lastVisit: new Date().toISOString().split('T')[0],
        status: 'active',
        medicalHistory: 'No previous medical history recorded',
        allergies: 'None known'
      }
      
      setPatientData(defaultPatient)
      setCurrentPatient(defaultPatient)
    }
  }, [patientId, setCurrentPatient])

  const handleStartRecording = () => {
    setIsRecording(true)
    toast({
      title: "Recording Started",
      description: "Voice input is being captured. Speak clearly into your microphone.",
    })
    
    // Simulate recording process
    setTimeout(() => {
      setIsRecording(false)
      setIsProcessing(true)
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false)
        toast({
          title: "Recording Complete",
          description: "Audio has been processed and transcribed.",
        })
      }, 3000)
    }, 5000)
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setIsProcessing(true)
    
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Recording Stopped",
        description: "Audio is being processed...",
      })
    }, 2000)
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Patient Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-medical-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-medical-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{patientData.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{patientData.patientId}</span>
                  <span>•</span>
                  <span>{patientData.age > 0 ? `${patientData.age} years old` : 'Age not specified'}</span>
                  <span>•</span>
                  <span className="capitalize">{patientData.gender}</span>
                  <Badge variant="outline" className="ml-2">
                    {patientData.status}
                  </Badge>
                  <Badge variant="secondary" className="ml-2">
                    New Patient
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patientData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patientData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last visit: {patientData.lastVisit}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Medical History</h4>
                  <p className="text-sm text-muted-foreground">{patientData.medicalHistory}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-2">Allergies</h4>
                  <p className="text-sm text-muted-foreground">{patientData.allergies}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Audio Input</h4>
                  <AudioUpload />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Other Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      New SOAP
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Recording Section - Center Focus */}
            <Card className="border-2 border-medical-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Mic className="h-6 w-6 text-medical-primary" />
                  Live Voice Recording
                </CardTitle>
                <p className="text-muted-foreground">
                  Start recording to capture patient consultation in real-time
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {/* Recording Button */}
                <div className="flex justify-center">
                  {!isRecording ? (
                    <Button 
                      size="lg"
                      className="h-20 w-20 rounded-full bg-medical-primary hover:bg-medical-primary/90 gap-2"
                      onClick={handleStartRecording}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <Loader2 className="h-8 w-8 animate-spin" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Button 
                        size="lg"
                        className="h-20 w-20 rounded-full bg-red-600 hover:bg-red-700 gap-2 animate-pulse"
                        onClick={handleStopRecording}
                      >
                        <Square className="h-8 w-8" />
                      </Button>
                      <div className="text-center">
                        <p className="text-lg font-medium text-red-600">Recording...</p>
                        <p className="text-sm text-muted-foreground">Click to stop recording</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recording Status */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live Recording Active</span>
                  </div>
                )}

                {isProcessing && (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Processing audio...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Results */}
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
                <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-medical-primary" />
                      Live Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Transcript />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="soap" className="space-y-6">
                <SOAPEditor />
                {transcript.length > 0 && <CaseSummary />}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientTemplate
