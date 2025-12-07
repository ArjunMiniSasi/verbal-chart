import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, User, FileText, Calendar, Stethoscope, History } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { mockPatients, mockHistoryRecords } from "@/mocks/seeds"

interface SearchResult {
  id: string
  patientName: string
  patientId: string
  date: string
  preview: string
  type: 'patient' | 'soap' | 'history' | 'doctor'
  doctorName?: string
}

export const SearchBar = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const queryLower = searchQuery.toLowerCase()
    const results: SearchResult[] = []

    // Search Patients
    mockPatients.forEach(patient => {
      const matchesName = patient.pet?.name?.toLowerCase().includes(queryLower) || 
                         patient.name?.toLowerCase().includes(queryLower)
      const matchesMRN = patient.mrn?.toLowerCase().includes(queryLower)
      const matchesSpecies = patient.pet?.species?.toLowerCase().includes(queryLower)
      const matchesBreed = patient.pet?.breed?.toLowerCase().includes(queryLower)
      const matchesOwner = patient.owner?.name?.toLowerCase().includes(queryLower)
      
      if (matchesName || matchesMRN || matchesSpecies || matchesBreed || matchesOwner) {
        results.push({
          id: `patient-${patient.id}`,
          patientName: patient.pet?.name || patient.name || 'Unknown',
          patientId: patient.mrn || patient.id,
          date: patient.lastVisit || '',
          preview: `${patient.pet?.species || ''} • ${patient.pet?.breed || ''} • Owner: ${patient.owner?.name || ''}`,
          type: 'patient'
        })
      }
    })

    // Search SOAP Notes and Medical History
    mockHistoryRecords.forEach(record => {
      const patient = mockPatients.find(p => p.id === record.patientId)
      const patientName = patient?.pet?.name || patient?.name || 'Unknown'
      const patientMRN = patient?.mrn || record.patientId
      
      // Search in SOAP notes
      const soapText = `${record.soapNotes.subjective} ${record.soapNotes.objective} ${record.soapNotes.assessment} ${record.soapNotes.plan}`.toLowerCase()
      const matchesSOAP = soapText.includes(queryLower) ||
                         record.soapNotes.subjective.toLowerCase().includes(queryLower) ||
                         record.soapNotes.objective.toLowerCase().includes(queryLower) ||
                         record.soapNotes.assessment.toLowerCase().includes(queryLower) ||
                         record.soapNotes.plan.toLowerCase().includes(queryLower)
      
      // Search in medical history
      const historyText = `${record.chiefComplaint} ${record.diagnosis} ${record.summary}`.toLowerCase()
      const matchesHistory = historyText.includes(queryLower) ||
                           record.chiefComplaint.toLowerCase().includes(queryLower) ||
                           record.diagnosis.toLowerCase().includes(queryLower) ||
                           record.summary.toLowerCase().includes(queryLower) ||
                           record.entities.some(e => e.toLowerCase().includes(queryLower))
      
      // Search by doctor name
      const matchesDoctor = record.treatedBy?.toLowerCase().includes(queryLower)
      
      if (matchesSOAP) {
        const soapPreview = record.soapNotes.subjective.substring(0, 100) || 
                           record.soapNotes.objective.substring(0, 100) || 
                           record.soapNotes.assessment.substring(0, 100) || 
                           'SOAP note'
        results.push({
          id: `soap-${record.id}`,
          patientName,
          patientId: patientMRN,
          date: record.date,
          preview: soapPreview + (soapPreview.length >= 100 ? '...' : ''),
          type: 'soap',
          doctorName: record.treatedBy
        })
      }
      
      if (matchesHistory) {
        results.push({
          id: `history-${record.id}`,
          patientName,
          patientId: patientMRN,
          date: record.date,
          preview: record.summary.substring(0, 100) + (record.summary.length >= 100 ? '...' : ''),
          type: 'history',
          doctorName: record.treatedBy
        })
      }
      
      // Add doctor search results
      if (matchesDoctor && !results.some(r => r.type === 'doctor' && r.doctorName === record.treatedBy)) {
        results.push({
          id: `doctor-${record.treatedBy}`,
          patientName: record.treatedBy || 'Unknown Doctor',
          patientId: '',
          date: record.date,
          preview: `Treated ${patientName} on ${new Date(record.date).toLocaleDateString()}`,
          type: 'doctor',
          doctorName: record.treatedBy
        })
      }
    })
    
    // Remove duplicates and limit results
    const uniqueResults = results.filter((result, index, self) =>
      index === self.findIndex(r => r.id === result.id)
    ).slice(0, 10) // Limit to 10 results
    
    setResults(uniqueResults)
    setShowResults(true)
    setIsSearching(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    handleSearch(value)
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'doctor') {
      // For doctor results, navigate to search page with doctor filter
      navigate(`/search?q=${encodeURIComponent(result.doctorName || '')}&type=doctor`)
    } else if (result.patientId) {
      navigate(`/patient/${result.patientId}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
    setShowResults(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
      setShowResults(false)
    }
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search patients, SOAP notes, medical history, doctors..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-4 py-3 text-base w-full"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-medical-primary"></div>
          </div>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
          <CardContent className="p-0">
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {query ? 'No results found' : 'Start typing to search...'}
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="p-4 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        {result.type === 'soap' ? (
                          <FileText className="h-4 w-4 text-medical-primary mt-1" />
                        ) : result.type === 'history' ? (
                          <History className="h-4 w-4 text-purple-600 mt-1" />
                        ) : result.type === 'doctor' ? (
                          <Stethoscope className="h-4 w-4 text-green-600 mt-1" />
                        ) : (
                          <User className="h-4 w-4 text-blue-600 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-sm">{result.patientName}</span>
                          {result.patientId && (
                            <Badge variant="outline" className="text-xs">
                              {result.patientId}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {result.type === 'soap' ? 'SOAP Note' : 
                             result.type === 'history' ? 'Medical History' : 
                             result.type === 'doctor' ? 'Doctor' : 'Patient'}
                          </Badge>
                          {result.date && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {result.date}
                            </div>
                          )}
                          {result.doctorName && result.type !== 'doctor' && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Stethoscope className="h-3 w-3" />
                              {result.doctorName}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.preview}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="p-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    className="w-full text-xs"
                  >
                    View all results for "{query}"
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
