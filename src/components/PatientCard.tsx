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
import { Patient } from "@/mocks/seeds"

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
    navigate(`/patient/${patient.id}`)
  }

  if (variant === 'compact') {
    return (
      <div 
        className="p-4 border rounded bg-white hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleViewPatient}
      >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-medical-primary" />
              </div>
              <div>
                <h3 className="font-medium">{patient.pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {patient.mrn} • {patient.pet.age}y • {patient.pet.gender}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className="p-4 border rounded bg-white hover:shadow-md transition-shadow">
        <div className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-medical-primary/10 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-medical-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{patient.pet.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{patient.mrn}</span>
                  <span>•</span>
                  <span>{patient.pet.age} years old</span>
                  <span>•</span>
                  <span className="capitalize">{patient.pet.gender}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{patient.owner.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{patient.owner.email}</span>
            </div>
          </div>

          {/* Last Visit */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last visit:</span>
            <span>{patient.lastVisit}</span>
            {patient.pet.lastConsultedDoctor && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">Consulted: {patient.pet.lastConsultedDoctor}</span>
              </>
            )}
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
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div 
      className="p-4 border rounded bg-white hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleViewPatient}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-medical-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-medical-primary" />
          </div>
          <div>
            <h3 className="font-medium">{patient.pet.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{patient.mrn}</span>
              <span>•</span>
              <span>{patient.pet.age}y</span>
              <span>•</span>
              <span className="capitalize">{patient.pet.species}</span>
              <span>•</span>
              <span className="capitalize">{patient.pet.gender}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Owner: {patient.owner.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>Last visit: {patient.lastVisit}</span>
          {patient.pet.lastConsultedDoctor && (
            <>
              <span>•</span>
              <span>Consulted: {patient.pet.lastConsultedDoctor}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
