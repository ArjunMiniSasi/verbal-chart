import { useState } from 'react'
import { DoctorHeader } from "@/components/DoctorHeader"
import { SearchBar } from "@/components/SearchBar"
import { AddPatientModal } from "@/components/AddPatientModal"
import { PatientCard } from "@/components/PatientCard"
import { AnalyticsWidget } from "@/components/AnalyticsWidget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const DoctorHome = () => {
  const navigate = useNavigate()

  // Mock data - all patients with different statuses
  const allPatients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 34,
      gender: 'Female',
      patientId: 'MRN001',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 123-4567',
      email: 'sarah.johnson@email.com',
      status: 'active' as const,
      appointmentStatus: 'done' as const,
      lastSOAP: 'Patient reports severe bilateral headaches for 3 days, worse in morning...',
      appointmentTime: '09:00 AM',
      priority: 'normal' as const
    },
    {
      id: '2',
      name: 'Michael Chen',
      age: 67,
      gender: 'Male',
      patientId: 'MRN002',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 234-5678',
      email: 'michael.chen@email.com',
      status: 'active' as const,
      appointmentStatus: 'pending' as const,
      lastSOAP: 'Chest pain and shortness of breath. Substernal pressure-like pain...',
      appointmentTime: '10:30 AM',
      priority: 'high' as const
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      age: 29,
      gender: 'Female',
      patientId: 'MRN003',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 345-6789',
      email: 'emma.rodriguez@email.com',
      status: 'active' as const,
      appointmentStatus: 'done' as const,
      lastSOAP: 'Persistent cough and fever for 5 days. Productive cough with yellow sputum...',
      appointmentTime: '11:15 AM',
      priority: 'normal' as const
    },
    {
      id: '4',
      name: 'David Wilson',
      age: 45,
      gender: 'Male',
      patientId: 'MRN004',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 456-7890',
      email: 'david.wilson@email.com',
      status: 'active' as const,
      appointmentStatus: 'pending' as const,
      lastSOAP: 'Follow-up visit for diabetes management. Blood glucose levels...',
      appointmentTime: '02:00 PM',
      priority: 'medium' as const
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      age: 52,
      gender: 'Female',
      patientId: 'MRN005',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 567-8901',
      email: 'lisa.anderson@email.com',
      status: 'active' as const,
      appointmentStatus: 'done' as const,
      lastSOAP: 'Annual checkup completed. Blood pressure well controlled...',
      appointmentTime: '08:30 AM',
      priority: 'normal' as const
    },
    {
      id: '6',
      name: 'Robert Brown',
      age: 38,
      gender: 'Male',
      patientId: 'MRN006',
      lastVisit: '2024-01-15',
      phone: '+1 (555) 678-9012',
      email: 'robert.brown@email.com',
      status: 'active' as const,
      appointmentStatus: 'pending' as const,
      lastSOAP: 'New patient consultation for back pain. Physical therapy referral...',
      appointmentTime: '03:30 PM',
      priority: 'high' as const
    }
  ]

  // Filter patients by appointment status
  const pendingPatients = allPatients.filter(patient => patient.appointmentStatus === 'pending')
  const donePatients = allPatients.filter(patient => patient.appointmentStatus === 'done')

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
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    New SOAP
                  </Button>
                  <Button variant="outline" className="gap-2">
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
    </div>
  )
}

export default DoctorHome
