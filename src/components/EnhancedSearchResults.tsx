import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Pill, 
  FlaskConical, 
  Stethoscope, 
  FileText, 
  Calendar, 
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { mockHistoryRecords, mockPatients, HistoryRecord } from "@/mocks/seeds"

interface EnhancedSearchResult {
  id: string
  type: 'medicine' | 'lab_test' | 'disease' | 'diagnosis' | 'patient' | 'soap' | 'history'
  title: string
  summary: string
  icon: React.ElementType
  iconColor: string
  soapNotes: Array<{
    id: string
    patientName: string
    patientId: string
    date: string
    doctorName: string
    soapNote: HistoryRecord['soapNotes']
    context: string
  }>
  metadata?: {
    firstConsulted?: string
    lastConsulted?: string
    totalCases?: number
    commonDiseases?: string[]
  }
}

export const EnhancedSearchResults = ({ query }: { query: string }) => {
  const navigate = useNavigate()
  const queryLower = query.toLowerCase()

  // Common medicine names (simplified - in production, this would come from a database)
  const medicineKeywords = ['antibiotic', 'amoxicillin', 'penicillin', 'metronidazole', 'doxycycline', 
    'prednisone', 'steroid', 'painkiller', 'analgesic', 'antihistamine', 'vaccine', 'injection']
  
  // Common lab test names
  const labTestKeywords = ['blood test', 'cbc', 'complete blood count', 'urine test', 'x-ray', 
    'ultrasound', 'biopsy', 'culture', 'sensitivity', 'lab', 'test', 'diagnostic']
  
  // Common disease names
  const diseaseKeywords = ['fever', 'infection', 'diabetes', 'hypertension', 'arthritis', 
    'allergy', 'asthma', 'pneumonia', 'diarrhea', 'vomiting']
  
  // Detect search type
  const isMedicineSearch = medicineKeywords.some(keyword => queryLower.includes(keyword))
  const isLabTestSearch = labTestKeywords.some(keyword => queryLower.includes(keyword))
  const isDiseaseSearch = diseaseKeywords.some(keyword => queryLower.includes(keyword))

  // Extract medicine/lab test name from query
  const extractKeyword = (keywords: string[], query: string): string | null => {
    for (const keyword of keywords) {
      if (query.toLowerCase().includes(keyword)) {
        return keyword
      }
    }
    return null
  }

  const medicineName = isMedicineSearch ? extractKeyword(medicineKeywords, query) : null
  const labTestName = isLabTestSearch ? extractKeyword(labTestKeywords, query) : null
  const diseaseName = isDiseaseSearch ? extractKeyword(diseaseKeywords, query) : null

  // Find SOAP notes containing the search term
  const findRelevantSOAPNotes = (searchTerm: string): EnhancedSearchResult['soapNotes'] => {
    const results: EnhancedSearchResult['soapNotes'] = []
    
    mockHistoryRecords.forEach(record => {
      const patient = mockPatients.find(p => p.id === record.patientId)
      const patientName = patient?.pet?.name || patient?.name || 'Unknown'
      const patientMRN = patient?.mrn || record.patientId
      
      // Search in plan section (where medicines are typically mentioned)
      const planText = record.soapNotes.plan.toLowerCase()
      const assessmentText = record.soapNotes.assessment.toLowerCase()
      const objectiveText = record.soapNotes.objective.toLowerCase()
      
      if (planText.includes(searchTerm) || assessmentText.includes(searchTerm) || objectiveText.includes(searchTerm)) {
        // Extract context around the search term
        const context = planText.includes(searchTerm) 
          ? record.soapNotes.plan.substring(0, 150)
          : assessmentText.includes(searchTerm)
          ? record.soapNotes.assessment.substring(0, 150)
          : record.soapNotes.objective.substring(0, 150)
        
        results.push({
          id: record.id,
          patientName,
          patientId: patientMRN,
          date: record.date,
          doctorName: record.treatedBy || 'Unknown',
          soapNote: record.soapNotes,
          context: context + '...'
        })
      }
    })
    
    // Sort by date (most recent first)
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Generate results based on search type
  const generateResults = (): EnhancedSearchResult[] => {
    const results: EnhancedSearchResult[] = []

    if (isMedicineSearch && medicineName) {
      const soapNotes = findRelevantSOAPNotes(medicineName)
      const dates = soapNotes.map(n => n.date).sort()
      
      results.push({
        id: `medicine-${medicineName}`,
        type: 'medicine',
        title: `Medicine: ${medicineName.charAt(0).toUpperCase() + medicineName.slice(1)}`,
        summary: `This medicine has been used in ${soapNotes.length} cases. ${soapNotes.length > 0 ? `First consulted on ${dates[dates.length - 1]}, last used on ${dates[0]}.` : ''} Commonly prescribed for treating infections, inflammation, and related conditions.`,
        icon: Pill,
        iconColor: 'text-blue-600',
        soapNotes: soapNotes.slice(0, 10), // Limit to 10 most recent
        metadata: {
          firstConsulted: dates[dates.length - 1],
          lastConsulted: dates[0],
          totalCases: soapNotes.length
        }
      })
    }

    if (isLabTestSearch && labTestName) {
      const soapNotes = findRelevantSOAPNotes(labTestName)
      const dates = soapNotes.map(n => n.date).sort()
      
      results.push({
        id: `lab-${labTestName}`,
        type: 'lab_test',
        title: `Lab Test: ${labTestName.charAt(0).toUpperCase() + labTestName.slice(1)}`,
        summary: `This lab test has been ordered in ${soapNotes.length} cases. ${soapNotes.length > 0 ? `First ordered on ${dates[dates.length - 1]}, last ordered on ${dates[0]}.` : ''} Used for diagnostic purposes to assess patient condition and guide treatment decisions.`,
        icon: FlaskConical,
        iconColor: 'text-purple-600',
        soapNotes: soapNotes.slice(0, 10),
        metadata: {
          firstConsulted: dates[dates.length - 1],
          lastConsulted: dates[0],
          totalCases: soapNotes.length
        }
      })
    }

    if (isDiseaseSearch && diseaseName) {
      const soapNotes = findRelevantSOAPNotes(diseaseName)
      
      results.push({
        id: `disease-${diseaseName}`,
        type: 'disease',
        title: `Disease: ${diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1)}`,
        summary: `Found in ${soapNotes.length} cases. Common condition treated in the hospital.`,
        icon: AlertCircle,
        iconColor: 'text-red-600',
        soapNotes: soapNotes.slice(0, 10),
        metadata: {
          totalCases: soapNotes.length
        }
      })
    }

    return results
  }

  const results = generateResults()

  if (results.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      {results.map((result) => {
        const Icon = result.icon
        return (
          <Card key={result.id} className="border-l-4" style={{ borderLeftColor: result.iconColor.replace('text-', '').split('-')[1] === 'blue' ? '#2563eb' : result.iconColor.replace('text-', '').split('-')[1] === 'purple' ? '#9333ea' : '#dc2626' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-opacity-10 ${result.iconColor.replace('text-', 'bg-')}`}>
                    <Icon className={`h-5 w-5 ${result.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    {result.metadata?.totalCases && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.metadata.totalCases} case{result.metadata.totalCases !== 1 ? 's' : ''} found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Summary
                </h4>
                <p className="text-sm text-muted-foreground">{result.summary}</p>
                {result.metadata && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {result.metadata.firstConsulted && (
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        First: {result.metadata.firstConsulted}
                      </Badge>
                    )}
                    {result.metadata.lastConsulted && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Last: {result.metadata.lastConsulted}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* SOAP Notes */}
              {result.soapNotes.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    SOAP Notes (Ordered by Recency)
                  </h4>
                  <div className="space-y-3">
                    {result.soapNotes.map((soap) => (
                      <Card key={soap.id} className="border">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{soap.patientName}</span>
                              <Badge variant="outline" className="text-xs">{soap.patientId}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {soap.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Stethoscope className="h-3 w-3" />
                                {soap.doctorName}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <Badge variant="outline" className="mb-1 text-xs">Plan</Badge>
                              <p className="text-muted-foreground line-clamp-2">{soap.soapNote.plan}</p>
                            </div>
                            <div>
                              <Badge variant="outline" className="mb-1 text-xs">Assessment</Badge>
                              <p className="text-muted-foreground line-clamp-2">{soap.soapNote.assessment}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/patient/${soap.patientId}`)}
                            className="w-full text-xs"
                          >
                            View Full SOAP Note
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
