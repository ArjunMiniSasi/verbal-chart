import { useState } from 'react'
import { DoctorHeader } from "@/components/DoctorHeader"
import { SearchBar } from "@/components/SearchBar"
import { AddPatientModal } from "@/components/AddPatientModal"
import { PatientCard } from "@/components/PatientCard"
import { AnalyticsWidget } from "@/components/AnalyticsWidget"
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
import { mockPatients } from "@/mocks/seeds"

const DoctorHome = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { clearSOAPNote, clearTranscript } = useMedoraStore()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleReason, setScheduleReason] = useState('')

  // Use the mock patients from seeds
  const allPatients = mockPatients

  // Filter patients - for now, just use all patients for both tabs
  const pendingPatients = allPatients.slice(0, 3) // First 3 patients as "pending"
  const donePatients = allPatients.slice(3) // Rest as "done"

  const analyticsData = {
    totalPatients: 1247,
    patientsThisWeek: 23,
    totalSOAPNotes: 3421,
    pendingCases: pendingPatients.length,
    averageResponseTime: '2.3 hours',
    weeklyGrowth: 12.5
  }

  const handleViewAllPatients = () => {
    navigate('/patients')
  }

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section with Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, Dr. Smith
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your patients today.
              </p>
            </div>
            {/* Quick Actions - Top Right */}
            <Card className="w-full lg:w-80">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="h-5 w-5 text-medical-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddPatientModal />
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2"
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
                    className="gap-2"
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

        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Search Patient Records</h2>
            <p className="text-muted-foreground">
              Find patients, SOAP notes, and case sheets quickly
            </p>
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <SearchBar />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <AnalyticsWidget data={analyticsData} variant="overview" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Patient Management */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Today's Patients</h2>
              <Button variant="outline" onClick={handleViewAllPatients}>
                View All
              </Button>
            </div>
            
            {/* Patient Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All ({allPatients.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pending ({pendingPatients.length})
                </TabsTrigger>
                <TabsTrigger value="done" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Done ({donePatients.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {allPatients.map((patient) => (
                  <PatientCard 
                    key={patient.id} 
                    patient={patient} 
                    variant="default" 
                  />
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-6">
                {pendingPatients.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Pending Appointments</h3>
                      <p className="text-muted-foreground">All patients for today have been seen.</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingPatients.map((patient) => (
                    <PatientCard 
                      key={patient.id} 
                      patient={patient} 
                      variant="default" 
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="done" className="space-y-4 mt-6">
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

          {/* Right Column - Weekly Overview */}
          <div className="space-y-6">
            {/* Weekly Overview */}
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
