import { useState, useEffect, useMemo } from 'react'
import { DoctorHeader } from "@/components/DoctorHeader"
import { PatientCard } from "@/components/PatientCard"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Users } from "lucide-react"
import { useAuth } from "@/hooks/useFirebase"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mockPatients, mockHistoryRecords, Patient } from "@/mocks/seeds"

const AllPatients = () => {
  const { user } = useAuth()
  const [doctorName, setDoctorName] = useState('Dr. Smith')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter patients to only show those consulted by current doctor
  const doctorPatients = useMemo(() => {
    // Get patient IDs from history records where this doctor treated them
    const consultedPatientIds = new Set(
      mockHistoryRecords
        .filter(record => record.treatedBy === doctorName)
        .map(record => record.patientId)
    )

    // Also include patients where lastConsultedDoctor matches
    const allConsultedPatients = mockPatients.filter(patient => 
      consultedPatientIds.has(patient.id) || 
      patient.pet.lastConsultedDoctor === doctorName
    )

    return allConsultedPatients
  }, [doctorName])

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery.trim()) {
      return doctorPatients
    }

    const queryLower = searchQuery.toLowerCase()
    return doctorPatients.filter(patient => {
      const matchesName = patient.pet?.name?.toLowerCase().includes(queryLower) || 
                         patient.name?.toLowerCase().includes(queryLower)
      const matchesMRN = patient.mrn?.toLowerCase().includes(queryLower)
      const matchesSpecies = patient.pet?.species?.toLowerCase().includes(queryLower)
      const matchesBreed = patient.pet?.breed?.toLowerCase().includes(queryLower)
      const matchesOwner = patient.owner?.name?.toLowerCase().includes(queryLower)
      
      return matchesName || matchesMRN || matchesSpecies || matchesBreed || matchesOwner
    })
  }, [doctorPatients, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <DoctorHeader />
      
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              All Patients
            </h1>
            <p className="text-muted-foreground">
              Patients who have consulted with {doctorName}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search patients by name, MRN, species, breed, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 text-base w-full"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'} found
              {searchQuery && ` for "${searchQuery}"`}
            </span>
          </div>

          {/* Patient List */}
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No patients found' : 'No patients yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No patients match your search "${searchQuery}"`
                    : `You haven't consulted with any patients yet.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  variant="default" 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllPatients
