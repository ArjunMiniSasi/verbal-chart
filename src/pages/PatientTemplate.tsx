import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"
import { Patient, mockPatients, mockHistoryRecords } from "@/mocks/seeds"

const PatientTemplate = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentPatient, setCurrentPatient, transcript, soapNote } = useMedoraStore()
  
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [patientData, setPatientData] = useState<Patient | null>(null)

  // Fetch patient data based on patientId
  useEffect(() => {
    // Check if we have new patient data from the form
    const storedPatientData = sessionStorage.getItem('newPatientData')
    
    if (storedPatientData) {
      // Use the data from the form (enhanced with pet information)
      const formData = JSON.parse(storedPatientData)
      const newPatient: Patient = {
        id: patientId || 'new',
        name: formData.petName || 'New Pet',
        age: parseInt(formData.petAge) || 0,
        mrn: `MRN${patientId}`,
        lastVisit: new Date().toISOString().split('T')[0],
        pet: {
          name: formData.petName || 'New Pet',
          species: formData.species || 'Dog',
          breed: formData.breed || 'Mixed Breed',
          age: parseInt(formData.petAge) || 0,
          gender: (formData.petGender === 'Female' ? 'Female' : 'Male') as 'Male' | 'Female',
          weight: parseInt(formData.weight) || 0,
          color: formData.color || 'Unknown',
          microchipId: formData.microchipId || undefined,
          imageUrl: formData.imageUrl || undefined,
          vaccinations: formData.vaccinations || [],
          medicalHistory: formData.medicalHistory || 'No previous medical history recorded',
          allergies: formData.allergies || ['None known'],
          lastConsultedDoctor: formData.lastDoctor || undefined,
          temperament: formData.temperament || 'Friendly and social',
          dietaryNeeds: formData.dietaryNeeds || 'Standard diet'
        },
        owner: {
          name: formData.ownerName || 'Unknown Owner',
          phone: formData.ownerPhone || '(555) 000-0000',
          email: formData.ownerEmail || 'owner@email.com',
          address: {
            street: formData.address || '123 Main Street',
            city: formData.city || 'Springfield',
            state: formData.state || 'IL',
            zipCode: formData.zipCode || '62701'
          },
          occupation: formData.occupation || 'Professional',
          emergencyContact: {
            name: formData.emergencyContact || 'Emergency Contact',
            phone: formData.emergencyPhone || '(555) 000-0001',
            relationship: formData.emergencyRelationship || 'Family Member'
          }
        }
      }
      
      setPatientData(newPatient)
      setCurrentPatient(newPatient)
      
      // Clear the stored data after using it
      sessionStorage.removeItem('newPatientData')
    } else {
      // Use mock data based on patientId
      const patientIndex = parseInt(patientId || '1') % mockPatients.length
      const selectedPatient = mockPatients[patientIndex] || mockPatients[0]
      
      setPatientData(selectedPatient)
      setCurrentPatient(selectedPatient)
    }
  }, [patientId, setCurrentPatient])


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
                onClick={() => navigate('/')}
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
                      {patientData.pet.weight} lbs
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-sm text-muted-foreground">
                <div>Owner: {patientData.owner.name}</div>
                <div>MRN: {patientData.mrn}</div>
                <div>Last Visit: {patientData.lastVisit}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Compact Pet/Owner Card and Quick Actions */}
          <div className="space-y-6">
            {/* Compact Pet/Owner Card */}
            <PetOwnerCard 
              pet={patientData.pet} 
              owner={patientData.owner}
              lastVisit={patientData.lastVisit}
            />

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
                  <h4 className="text-sm font-medium text-muted-foreground">Medical Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      New SOAP
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Exam
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Scheduling</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Follow-up
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Alerts</h4>
                  <div className="space-y-1">
                    {patientData.pet.vaccinations.filter(v => v.status === 'Overdue').length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          {patientData.pet.vaccinations.filter(v => v.status === 'Overdue').length} vaccination(s) overdue
                        </span>
                      </div>
                    )}
                    {patientData.pet.vaccinations.filter(v => v.status === 'Upcoming').length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                        <Activity className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          {patientData.pet.vaccinations.filter(v => v.status === 'Upcoming').length} vaccination(s) due soon
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Live Recording and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Recording Section - Center Focus */}
            <Card className="border-2 border-medical-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Mic className="h-6 w-6 text-medical-primary" />
                  Live Voice Recording
                </CardTitle>
                <p className="text-muted-foreground">
                  Start recording to capture consultation for {patientData.pet.name}
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                {/* Voice Recording Component */}
                <VoiceButton />
              </CardContent>
            </Card>

            {/* Tabs for Results */}
            <Tabs defaultValue="transcript" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
                <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
                <TabsTrigger value="history">Medical History</TabsTrigger>
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

              <TabsContent value="history" className="space-y-6">
                <MedicalHistory 
                  patientId={patientData.id}
                  historyRecords={mockHistoryRecords}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientTemplate