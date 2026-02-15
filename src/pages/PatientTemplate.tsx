import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Mic, 
  FileText,
  Loader2,
  Square,
  Calendar,
  Stethoscope,
  Activity,
  Clock,
  AlertCircle,
  History
} from "lucide-react"
import { AudioUpload } from "@/components/AudioUpload"
import { VoiceButton } from "@/components/VoiceButton"
import { Transcript } from "@/components/Transcript"
import { SOAPEditor } from "@/components/SOAPEditor"
import { CaseSummary } from "@/components/CaseSummary"
import MedicalHistory from "@/components/MedicalHistory"
import PetOwnerCard from "@/components/PetOwnerCard"
import { PetProfileSidebar } from "@/components/PetProfileSidebar"
import { PreviewModal } from "@/components/PreviewModal"
import { Phone, Mail } from "lucide-react"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"
import { Patient, mockPatients, mockHistoryRecords, HistoryRecord } from "@/mocks/seeds"
import { fetchMedicalHistory } from "@/lib/medicalHistoryService"

const PatientTemplate = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentPatient, setCurrentPatient, transcript, soapNote, clearSOAPNote, clearTranscript, updateSOAPNote } = useMedoraStore()
  
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [patientData, setPatientData] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<HistoryRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleReason, setScheduleReason] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpReason, setFollowUpReason] = useState('')

  // Fetch patient data based on patientId
  useEffect(() => {
    // Check if we have new patient data from the form
    const storedPatientData = sessionStorage.getItem('newPatientData')
    
    if (storedPatientData) {
      try {
        // The AddPatientModal now creates a properly structured Patient object
        const newPatient: Patient = JSON.parse(storedPatientData)
        
        // Ensure the patient ID matches the URL parameter
        if (patientId && newPatient.id !== patientId) {
          newPatient.id = patientId
        }
        
        // Ensure MRN is set if not provided
        if (!newPatient.mrn) {
          newPatient.mrn = newPatient.id.startsWith('MRN') ? newPatient.id : `MRN${newPatient.id}`
        }
        
        // Ensure lastVisit is set
        if (!newPatient.lastVisit) {
          newPatient.lastVisit = new Date().toISOString().split('T')[0]
        }
        
        // Ensure pet has required fields with defaults
        if (!newPatient.pet.vaccinations) {
          newPatient.pet.vaccinations = []
        }
        if (!newPatient.pet.allergies || newPatient.pet.allergies.length === 0) {
          newPatient.pet.allergies = ['None known']
        }
        if (!newPatient.pet.medicalHistory) {
          newPatient.pet.medicalHistory = 'No previous medical history recorded'
        }
        
        // Ensure owner address is complete
        if (!newPatient.owner.address) {
          newPatient.owner.address = {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        }
        
        // Ensure emergency contact is set
        if (!newPatient.owner.emergencyContact) {
          newPatient.owner.emergencyContact = {
            name: '',
            phone: '',
            relationship: ''
          }
        }
        
        console.log('✅ Loaded new patient data:', newPatient)
        setPatientData(newPatient)
        setCurrentPatient(newPatient)
        
        // Clear the stored data after using it
        sessionStorage.removeItem('newPatientData')
      } catch (error) {
        console.error('Error parsing patient data from sessionStorage:', error)
        // Fall through to mock data - find by ID
        const selectedPatient = mockPatients.find(p => p.id === patientId) || 
                               mockPatients.find(p => p.mrn === patientId) || 
                               mockPatients[0]
        setPatientData(selectedPatient)
        setCurrentPatient(selectedPatient)
      }
    } else {
      // Use mock data based on patientId - find by ID first, then MRN
      const selectedPatient = mockPatients.find(p => p.id === patientId) || 
                             mockPatients.find(p => p.mrn === patientId) || 
                             mockPatients[0]
      
      console.log('🔍 Loading patient:', selectedPatient.pet.name, 'for patientId:', patientId)
      setPatientData(selectedPatient)
      setCurrentPatient(selectedPatient)
    }
  }, [patientId, setCurrentPatient])

  // Fetch medical history from Firestore when patient data loads
  useEffect(() => {
    const loadMedicalHistory = async () => {
      if (!patientData?.pet?.name) return;
      
      setIsLoadingHistory(true);
      try {
        const records = await fetchMedicalHistory(patientData.pet.name, patientData.id);
        setMedicalHistory(records);
        console.log(`📚 Loaded ${records.length} medical records for ${patientData.pet.name}`);
      } catch (error) {
        console.error('Failed to load medical history:', error);
        toast({
          title: "Error Loading History",
          description: "Could not load medical history. Using cached data.",
          variant: "destructive"
        });
        // Fallback to mock data if Firebase fails
        setMedicalHistory(mockHistoryRecords.filter(r => r.patientId === patientData.id));
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMedicalHistory();
  }, [patientData, toast]);

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'Dog':
        return '🐕'
      case 'Cat':
        return '🐱'
      case 'Bird':
        return '🐦'
      case 'Rabbit':
        return '🐰'
      case 'Reptile':
        return '🦎'
      default:
        return '🐾'
    }
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
      {/* Enhanced Patient Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="h-px bg-border w-8"></div>
              
              {/* Pet Avatar and Info */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {patientData.pet.imageUrl ? (
                      <img 
                        src={patientData.pet.imageUrl} 
                        alt={patientData.pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                        {getSpeciesIcon(patientData.pet.species)}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{patientData.pet.name}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{patientData.pet.breed}</span>
                    <span>•</span>
                    <span>{patientData.pet.species}</span>
                    <span>•</span>
                    <span>{patientData.pet.age > 0 ? `${patientData.pet.age} years old` : 'Age not specified'}</span>
                    <Badge variant="outline" className="ml-2">
                      {patientData.pet.gender}
                    </Badge>
                    <Badge variant="secondary" className="ml-2">
                      {Math.round(patientData.pet.weight * 2.20462)} lbs
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right text-sm">
                <div className="font-semibold text-foreground">{patientData.pet.name}</div>
                <div className="text-muted-foreground">Owner: {patientData.owner.name}</div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span className="text-xs">{patientData.owner.phone}</span>
                  </div>
                  {patientData.owner.email && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="text-xs">{patientData.owner.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Pet Profile Sidebar */}
          <div className="space-y-6">
            <PetProfileSidebar pet={patientData.pet} />
            
            {/* Audio Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Audio Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AudioUpload />
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Clinical History and SOAP Notes */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tabs for Results - Clinical History is default */}
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history">Clinical History</TabsTrigger>
                <TabsTrigger value="transcript">Running Transcript</TabsTrigger>
                <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-6">
                {isLoadingHistory ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-medical-primary" />
                        <p className="text-muted-foreground">Loading medical history...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <MedicalHistory 
                    patientId={patientData.id}
                    historyRecords={medicalHistory}
                  />
                )}
              </TabsContent>

              <TabsContent value="transcript" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-medical-primary" />
                      Running Transcript
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Transcript is being recorded. This is for your awareness only.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Audio Recording UI */}
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted rounded-lg bg-muted/30">
                      <div className="mb-4">
                        <VoiceButton />
                      </div>
                      <p className="text-sm text-muted-foreground text-center">
                        Click the microphone to start recording
                      </p>
                    </div>
                    
                    {/* Transcript Display */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Transcript
                      </h3>
                      <Transcript />
                    </div>
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

      {/* Schedule Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-time">Time</Label>
              <Input
                id="schedule-time"
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-reason">Reason</Label>
              <Textarea
                id="schedule-reason"
                placeholder="Enter reason for appointment..."
                value={scheduleReason}
                onChange={(e) => setScheduleReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!scheduleDate || !scheduleTime) {
                  toast({
                    title: "Missing Information",
                    description: "Please provide both date and time.",
                    variant: "destructive"
                  })
                  return
                }
                toast({
                  title: "Appointment Scheduled",
                  description: `Appointment scheduled for ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}`,
                })
                setShowScheduleModal(false)
                setScheduleDate('')
                setScheduleTime('')
                setScheduleReason('')
              }}
            >
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Modal */}
      <Dialog open={showFollowUpModal} onOpenChange={setShowFollowUpModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Schedule Follow-up
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="followup-date">Follow-up Date</Label>
              <Input
                id="followup-date"
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="followup-reason">Reason / Instructions</Label>
              <Textarea
                id="followup-reason"
                placeholder="Enter follow-up instructions or reason..."
                value={followUpReason}
                onChange={(e) => setFollowUpReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowUpModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!followUpDate) {
                  toast({
                    title: "Missing Information",
                    description: "Please provide a follow-up date.",
                    variant: "destructive"
                  })
                  return
                }
                
                // Update the plan's follow-up section if there's a plan
                if (soapNote.plan) {
                  const planText = soapNote.plan
                  const followUpText = followUpReason || `Recheck on ${new Date(followUpDate).toLocaleDateString()}`
                  
                  // Try to update follow-up section in plan
                  if (planText.includes('Follow-up:')) {
                    const parts = planText.split(/Follow-up:\s*/i)
                    if (parts.length > 1) {
                      const newPlan = parts[0] + `Follow-up: ${followUpText}`
                      updateSOAPNote('plan', newPlan)
                    } else {
                      updateSOAPNote('plan', planText + `\n\nFollow-up: ${followUpText}`)
                    }
                  } else {
                    updateSOAPNote('plan', planText + `\n\nFollow-up: ${followUpText}`)
                  }
                } else {
                  // If no plan exists, create a basic one with follow-up
                  updateSOAPNote('plan', `Follow-up: ${followUpReason || `Recheck on ${new Date(followUpDate).toLocaleDateString()}`}`)
                }
                
                toast({
                  title: "Follow-up Scheduled",
                  description: `Follow-up scheduled for ${new Date(followUpDate).toLocaleDateString()}`,
                })
                setShowFollowUpModal(false)
                setFollowUpDate('')
                setFollowUpReason('')
              }}
            >
              Schedule Follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PreviewModal />
    </div>
  )
}

export default PatientTemplate