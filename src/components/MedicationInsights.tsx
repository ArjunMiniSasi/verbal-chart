import { useMemo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pill, TrendingUp, AlertCircle, Info } from "lucide-react"
import { mockHistoryRecords } from "@/mocks/seeds"

interface MedicationInsightsProps {
  planText: string
}

export const MedicationInsights = ({ planText }: MedicationInsightsProps) => {
  // Common medication names (simplified - in production, this would use a comprehensive medication database)
  const medicationKeywords = [
    'amoxicillin', 'penicillin', 'metronidazole', 'doxycycline', 'enrofloxacin',
    'prednisone', 'prednisolone', 'dexamethasone', 'steroid',
    'meloxicam', 'carprofen', 'gabapentin', 'tramadol',
    'furosemide', 'spironolactone', 'atenolol', 'metoprolol',
    'insulin', 'glipizide', 'metformin',
    'omeprazole', 'famotidine', 'sucralfate',
    'diphenhydramine', 'cetirizine', 'loratadine'
  ]

  // Extract medications from plan text
  const detectedMedications = useMemo(() => {
    const planLower = planText.toLowerCase()
    const found: string[] = []
    
    medicationKeywords.forEach(med => {
      if (planLower.includes(med)) {
        found.push(med)
      }
    })
    
    return found
  }, [planText])

  // Find historical usage of medications
  const medicationInsights = useMemo(() => {
    if (detectedMedications.length === 0) return []

    return detectedMedications.map(medication => {
      // Search through history records for this medication
      const relevantRecords = mockHistoryRecords.filter(record => {
        const planText = record.soapNotes.plan.toLowerCase()
        const assessmentText = record.soapNotes.assessment.toLowerCase()
        return planText.includes(medication) || assessmentText.includes(medication)
      })

      // Extract diseases/conditions from assessments
      const diseases = new Set<string>()
      relevantRecords.forEach(record => {
        const assessment = record.soapNotes.assessment.toLowerCase()
        // Common disease patterns
        if (assessment.includes('infection')) diseases.add('Infection')
        if (assessment.includes('inflammation')) diseases.add('Inflammation')
        if (assessment.includes('pain')) diseases.add('Pain Management')
        if (assessment.includes('fever')) diseases.add('Fever')
        if (assessment.includes('diarrhea')) diseases.add('Diarrhea')
        if (assessment.includes('vomiting')) diseases.add('Vomiting')
        if (assessment.includes('allergy')) diseases.add('Allergy')
        if (assessment.includes('arthritis')) diseases.add('Arthritis')
        if (assessment.includes('diabetes')) diseases.add('Diabetes')
        if (assessment.includes('hypertension')) diseases.add('Hypertension')
      })

      return {
        medication,
        caseCount: relevantRecords.length,
        diseases: Array.from(diseases).slice(0, 5) // Limit to 5 most common
      }
    }).filter(insight => insight.caseCount > 0)
  }, [detectedMedications])

  if (medicationInsights.length === 0) {
    return null
  }

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Info className="h-4 w-4 text-blue-600" />
        Medication Insights
      </div>
      {medicationInsights.map((insight, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Pill className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm capitalize">{insight.medication}</span>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Used in {insight.caseCount} case{insight.caseCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {insight.diseases.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Commonly prescribed for:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {insight.diseases.map((disease, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {disease}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
