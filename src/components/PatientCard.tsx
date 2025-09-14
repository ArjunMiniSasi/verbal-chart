import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  MoreHorizontal,
  Phone,
  Mail
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  patientId: string
  lastVisit: string
  phone?: string
  email?: string
  status: 'active' | 'inactive' | 'pending'
  appointmentStatus?: 'pending' | 'done'
  appointmentTime?: string
  priority?: 'high' | 'medium' | 'normal'
  lastSOAP?: string
  pendingCases?: number
}

interface PatientCardProps {
  patient: Patient
  variant?: 'default' | 'compact' | 'detailed'
}

export const PatientCard = ({ patient, variant = 'default' }: PatientCardProps) => {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleViewPatient = () => {
    navigate(`/patient/${patient.patientId}`)
  }

  if (variant === 'compact') {
    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewPatient}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-medical-primary" />
              </div>
              <div>
                <h3 className="font-medium">{patient.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {patient.patientId} • {patient.age}y • {patient.gender}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-medical-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-medical-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{patient.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{patient.patientId}</span>
                  <span>•</span>
                  <span>{patient.age} years old</span>
                  <span>•</span>
                  <span className="capitalize">{patient.gender}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{patient.email}</span>
              </div>
            )}
          </div>

          {/* Last Visit */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last visit:</span>
            <span>{patient.lastVisit}</span>
          </div>

          {/* Last SOAP Preview */}
          {patient.lastSOAP && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last SOAP:</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {patient.lastSOAP}
              </p>
            </div>
          )}

          {/* Pending Cases */}
          {patient.pendingCases && patient.pendingCases > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-yellow-600">
                {patient.pendingCases} pending case{patient.pendingCases > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleViewPatient} className="flex-1">
              View Patient
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewPatient}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-medical-primary" />
            </div>
            <div>
              <h3 className="font-medium">{patient.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{patient.patientId}</span>
                <span>•</span>
                <span>{patient.age}y</span>
                <span>•</span>
                <span className="capitalize">{patient.gender}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {patient.priority && (
              <Badge className={getPriorityColor(patient.priority)}>
                {patient.priority}
              </Badge>
            )}
            {patient.pendingCases && patient.pendingCases > 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                {patient.pendingCases}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          {patient.appointmentTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{patient.appointmentTime}</span>
            </div>
          )}
          {patient.lastSOAP && (
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="line-clamp-1">{patient.lastSOAP}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
