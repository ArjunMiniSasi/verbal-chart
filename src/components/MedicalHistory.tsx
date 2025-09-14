import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar,
  Stethoscope,
  FileText,
  User,
  Pill,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye
} from "lucide-react"
import { HistoryRecord } from "@/mocks/seeds"

interface MedicalHistoryProps {
  patientId: string
  historyRecords: HistoryRecord[]
}

const MedicalHistory = ({ patientId, historyRecords }: MedicalHistoryProps) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const patientRecords = historyRecords.filter(record => record.patientId === patientId)
  
  const getSeverityColor = (diagnosis: string) => {
    const lowerDiagnosis = diagnosis.toLowerCase()
    if (lowerDiagnosis.includes('emergency') || lowerDiagnosis.includes('severe') || lowerDiagnosis.includes('critical')) {
      return 'bg-red-100 text-red-800 border-red-200'
    }
    if (lowerDiagnosis.includes('infection') || lowerDiagnosis.includes('injury') || lowerDiagnosis.includes('inflammation')) {
      return 'bg-orange-100 text-orange-800 border-orange-200'
    }
    if (lowerDiagnosis.includes('routine') || lowerDiagnosis.includes('wellness') || lowerDiagnosis.includes('healthy')) {
      return 'bg-green-100 text-green-800 border-green-200'
    }
    return 'bg-blue-100 text-blue-800 border-blue-200'
  }

  const getFollowUpStatus = (record: HistoryRecord) => {
    if (!record.followUpRequired) {
      return { text: 'No Follow-up', color: 'bg-gray-100 text-gray-800' }
    }
    if (record.followUpDate) {
      const followUpDate = new Date(record.followUpDate)
      const today = new Date()
      if (followUpDate < today) {
        return { text: 'Overdue', color: 'bg-red-100 text-red-800' }
      }
      return { text: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' }
    }
    return { text: 'Required', color: 'bg-orange-100 text-orange-800' }
  }

  const handleRecordClick = (record: HistoryRecord) => {
    setSelectedRecord(record)
    setIsDetailsOpen(true)
  }

  if (patientRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-primary" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No medical history records found for this patient.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-primary" />
            Medical History ({patientRecords.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patientRecords
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((record) => {
              const followUpStatus = getFollowUpStatus(record)
              return (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRecordClick(record)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <Badge className={getSeverityColor(record.diagnosis)}>
                          {record.diagnosis}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{record.chiefComplaint}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{record.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Eye className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{record.treatedBy}</span>
                      </div>
                      {record.medications && record.medications.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          <span>{record.medications.length} medication(s)</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={followUpStatus.color}>
                        {followUpStatus.text}
                      </Badge>
                      {record.followUpDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(record.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
        </CardContent>
      </Card>

      {/* Medical Record Detail Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              Medical Record Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Visit Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span><strong>Date:</strong> {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <span><strong>Treated by:</strong> {selectedRecord.treatedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-purple-600" />
                        <span><strong>Chief Complaint:</strong> {selectedRecord.chiefComplaint}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Diagnosis & Status</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Diagnosis:</strong>
                        <Badge className={`ml-2 ${getSeverityColor(selectedRecord.diagnosis)}`}>
                          {selectedRecord.diagnosis}
                        </Badge>
                      </div>
                      <div>
                        <strong>Follow-up:</strong>
                        <Badge className={`ml-2 ${getFollowUpStatus(selectedRecord).color}`}>
                          {getFollowUpStatus(selectedRecord).text}
                        </Badge>
                      </div>
                      {selectedRecord.followUpDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span><strong>Follow-up Date:</strong> {new Date(selectedRecord.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SOAP Notes */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  SOAP Notes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Subjective</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.soapNotes.subjective}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Assessment</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.soapNotes.assessment}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Objective</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.soapNotes.objective}</p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 text-sm">Plan</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.soapNotes.plan}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medications */}
              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-green-600" />
                    Medications Prescribed
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedRecord.medications.map((medication, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <Pill className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-900">{medication}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Visit Summary
                </h3>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRecord.summary}</p>
                </div>
              </div>

              {/* Follow-up Information */}
              {selectedRecord.followUpRequired && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-gray-900">Follow-up Required</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    {selectedRecord.followUpDate 
                      ? `Follow-up scheduled for ${new Date(selectedRecord.followUpDate).toLocaleDateString()}`
                      : 'Follow-up required - please contact clinic to schedule'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MedicalHistory
