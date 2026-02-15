import { useState, useEffect } from 'react'
import { DoctorHeader } from "@/components/DoctorHeader"
import { SearchBar } from "@/components/SearchBar"
import { AddPatientModal } from "@/components/AddPatientModal"
import { NewPatientConsultationButton } from "@/components/NewPatientConsultationModal"
import { PatientCard } from "@/components/PatientCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  FileText, 
  Clock, 
  Plus,
  Calendar,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMedoraStore } from "@/stores/medoraStore"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useFirebase"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockPatients } from "@/mocks/seeds"

const DoctorHome = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const { clearSOAPNote, clearTranscript } = useMedoraStore()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleReason, setScheduleReason] = useState('')
  const [doctorName, setDoctorName] = useState('Dr. Smith')

  // Fetch doctor name from Firestore
  useEffect(() => {
    const fetchDoctorName = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'doctors', user.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            const data = userDoc.data()
            setDoctorName(data.displayName || user.displayName || 'Dr. Smith')
          } else {
            setDoctorName(user.displayName || user.email?.split('@')[0] || 'Dr. Smith')
          }
        } catch (error) {
          console.error('Error fetching doctor name:', error)
          setDoctorName(user.displayName || user.email?.split('@')[0] || 'Dr. Smith')
        }
      }
    }

    fetchDoctorName()
  }, [user])

  // Use the mock patients from seeds
  const allPatients = mockPatients

  // Filter patients - for now, just use all patients for both tabs
  const pendingPatients = allPatients.slice(0, 3) // First 3 patients as "pending"
  const donePatients = allPatients.slice(3) // Rest as "done"
  
  // Categorize upcoming patients into New case and Follow up
  // New case: Patients with no previous visits or first visit
  // Follow up: Patients with previous visits
  const newCasePatients = pendingPatients.filter((patient, index) => index % 2 === 0) // Simulate: every other patient is new case
  const followUpPatients = pendingPatients.filter((patient, index) => index % 2 === 1) // Simulate: others are follow-ups

  const analyticsData = {
    totalPatients: 1247,
    patientsThisWeek: 23,
    totalSOAPNotes: 3421,
    pendingCases: pendingPatients.length,
    averageResponseTime: '2.3 hours',
    weeklyGrowth: 12.5
  }


  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome, Search and Quick Actions - Aligned */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Welcome + Search Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {doctorName}
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your patients today.
              </p>
            </div>

            {/* Search Section */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Search Patient Records
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Find patients, SOAP notes, and case sheets quickly
                </p>
              </div>
              <div className="w-full">
                <SearchBar />
              </div>
            </div>
          </div>

          {/* Right: Quick Actions Card - Aligned with Welcome/Search */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Plus className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <NewPatientConsultationButton />
                <AddPatientModal />
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full"
                    onClick={() => {
                      clearSOAPNote()
                      clearTranscript()
                      navigate('/new-soap')
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    New SOAP
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2 w-full"
                    onClick={() => setShowScheduleModal(true)}
                  >
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid - Today's Patients and Week Stats Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Today's Patients */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Today's Patients</h2>
            </div>
            
            {/* Patient Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Upcoming ({pendingPatients.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed ({donePatients.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-6">
                <Tabs defaultValue="new-case" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="new-case" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New case ({newCasePatients.length})
                    </TabsTrigger>
                    <TabsTrigger value="follow-up" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Follow up ({followUpPatients.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="new-case" className="space-y-4">
                    {newCasePatients.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No New Cases</h3>
                          <p className="text-muted-foreground">No new patients scheduled for today.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      newCasePatients.map((patient) => (
                        <PatientCard 
                          key={patient.id} 
                          patient={patient} 
                          variant="default" 
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="follow-up" className="space-y-4">
                    {followUpPatients.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-8">
                          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Follow-up Appointments</h3>
                          <p className="text-muted-foreground">No follow-up patients scheduled for today.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      followUpPatients.map((patient) => (
                        <PatientCard 
                          key={patient.id} 
                          patient={patient} 
                          variant="default" 
                        />
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4 mt-6">
                {donePatients.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Completed Appointments</h3>
                      <p className="text-muted-foreground">No patients have been seen today yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  donePatients.map((patient) => (
                    <PatientCard 
                      key={patient.id} 
                      patient={patient} 
                      variant="default" 
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Week Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Patients</span>
                  <span className="font-semibold text-green-600">+{analyticsData.patientsThisWeek}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">SOAP Notes</span>
                  <span className="font-semibold">+47</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed Cases</span>
                  <span className="font-semibold">+23</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>+{analyticsData.weeklyGrowth}% growth this week</span>
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}

export default DoctorHome
