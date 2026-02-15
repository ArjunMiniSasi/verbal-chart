import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Info, Loader2, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { useMedoraStore } from "@/stores/medoraStore"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BasicPatientData {
  petName: string
  petSpecies: string
  petBreed: string
  petAge: string
  petGender: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  reasonForVisit: string
}

interface NewPatientConsultationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const NewPatientConsultationModal = ({ open, onOpenChange }: NewPatientConsultationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BasicPatientData>({
    petName: '',
    petSpecies: '',
    petBreed: '',
    petAge: '',
    petGender: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    reasonForVisit: ''
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { clearSOAPNote, clearTranscript } = useMedoraStore()

  const handleInputChange = (field: keyof BasicPatientData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.petName || !formData.petSpecies || !formData.ownerName || !formData.ownerPhone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in pet name, species, owner name, and owner phone.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Clear any existing SOAP note and transcript
      clearSOAPNote()
      clearTranscript()

      // Store basic patient data temporarily
      const tempPatientData = {
        ...formData,
        isNewPatient: true,
        timestamp: new Date().toISOString()
      }
      
      sessionStorage.setItem('newPatientConsultation', JSON.stringify(tempPatientData))

      toast({
        title: "Patient Details Saved",
        description: "You can now record the SOAP note. After recording, it will be sent to the hospital admin.",
      })

      onOpenChange(false)
      
      // Navigate to new SOAP page to record consultation
      navigate('/new-soap')

    } catch (error) {
      console.error('Error starting consultation:', error)
      toast({
        title: "Error",
        description: "Failed to start consultation. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Start Consultation with New Patient
            </DialogTitle>
          </DialogHeader>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                Add basic patient details and record the SOAP note. Once completed, the consultation will be sent to the hospital admin to create a new patient record or tag to an existing patient.
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pet Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Pet Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="petName">Pet Name *</Label>
                  <Input
                    id="petName"
                    value={formData.petName}
                    onChange={(e) => handleInputChange('petName', e.target.value)}
                    placeholder="Enter pet's name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="petSpecies">Species *</Label>
                  <Select 
                    value={formData.petSpecies} 
                    onValueChange={(value) => handleInputChange('petSpecies', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dog">Dog</SelectItem>
                      <SelectItem value="Cat">Cat</SelectItem>
                      <SelectItem value="Bird">Bird</SelectItem>
                      <SelectItem value="Rabbit">Rabbit</SelectItem>
                      <SelectItem value="Reptile">Reptile</SelectItem>
                      <SelectItem value="Cattle">Cattle</SelectItem>
                      <SelectItem value="Goat">Goat</SelectItem>
                      <SelectItem value="Buffalo">Buffalo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="petBreed">Breed</Label>
                  <Input
                    id="petBreed"
                    value={formData.petBreed}
                    onChange={(e) => handleInputChange('petBreed', e.target.value)}
                    placeholder="Enter breed"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="petAge">Age (years)</Label>
                  <Input
                    id="petAge"
                    type="number"
                    value={formData.petAge}
                    onChange={(e) => handleInputChange('petAge', e.target.value)}
                    placeholder="Enter age"
                    min="0"
                    step="0.1"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="petGender">Gender</Label>
                  <Select 
                    value={formData.petGender} 
                    onValueChange={(value) => handleInputChange('petGender', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Owner Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Enter owner's name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Phone Number *</Label>
                  <Input
                    id="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={(e) => handleInputChange('ownerPhone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="ownerEmail">Email Address</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                    placeholder="Enter email address"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Reason for Visit */}
            <div className="space-y-2">
              <Label htmlFor="reasonForVisit">Reason for Visit</Label>
              <Textarea
                id="reasonForVisit"
                value={formData.reasonForVisit}
                onChange={(e) => handleInputChange('reasonForVisit', e.target.value)}
                placeholder="Brief reason for consultation..."
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Consultation'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export const NewPatientConsultationButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={() => setOpen(true)}
            className="w-full gap-2"
            variant="default"
          >
            <FileText className="h-4 w-4" />
            Start Consultation with new patient
            <Info className="h-4 w-4 ml-auto" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            Add basic patient details, record SOAP note, and send to hospital admin for patient creation or tagging.
          </p>
        </TooltipContent>
      </Tooltip>
      <NewPatientConsultationModal open={open} onOpenChange={setOpen} />
    </TooltipProvider>
  )
}
