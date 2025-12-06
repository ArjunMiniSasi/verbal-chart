import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

interface PatientFormData {
  // Patient/Record Info
  patientId: string
  mrn: string
  
  // Pet Information
  petName: string
  petSpecies: string
  petBreed: string
  petAge: string
  petGender: string
  petWeight: string
  petColor: string
  petMicrochipId: string
  petMedicalHistory: string
  petAllergies: string
  petTemperament: string
  petDietaryNeeds: string
  
  // Pet Parent (Owner) Information
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  ownerStreet: string
  ownerCity: string
  ownerState: string
  ownerZipCode: string
  ownerOccupation: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
}

export const AddPatientModal = () => {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PatientFormData>({
    // Patient/Record Info
    patientId: '',
    mrn: '',
    
    // Pet Information
    petName: '',
    petSpecies: '',
    petBreed: '',
    petAge: '',
    petGender: '',
    petWeight: '',
    petColor: '',
    petMicrochipId: '',
    petMedicalHistory: '',
    petAllergies: '',
    petTemperament: '',
    petDietaryNeeds: '',
    
    // Pet Parent (Owner) Information
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    ownerStreet: '',
    ownerCity: '',
    ownerState: '',
    ownerZipCode: '',
    ownerOccupation: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: ''
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const generatePatientId = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MRN${timestamp}${random}`
  }

  const generateMRN = () => {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `MRN${timestamp}${random}`
  }

  const handleInputChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.petName || !formData.petSpecies || !formData.petBreed || !formData.ownerName || !formData.ownerPhone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in pet name, species, breed, owner name, and owner phone.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const patientId = formData.patientId || generatePatientId()
      const mrn = formData.mrn || generateMRN()
      
      // Build patient object matching the Patient interface
      const newPatient = {
        id: patientId,
        name: formData.petName, // Patient name is the pet name in veterinary context
        age: parseInt(formData.petAge) || 0,
        mrn: mrn,
        lastVisit: new Date().toISOString(),
        pet: {
          name: formData.petName,
          species: formData.petSpecies as 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Reptile',
          breed: formData.petBreed,
          age: parseInt(formData.petAge) || 0,
          gender: formData.petGender as 'Male' | 'Female',
          weight: parseFloat(formData.petWeight) || 0,
          color: formData.petColor,
          microchipId: formData.petMicrochipId || undefined,
          vaccinations: [],
          medicalHistory: formData.petMedicalHistory,
          allergies: formData.petAllergies ? formData.petAllergies.split(',').map(a => a.trim()) : [],
          temperament: formData.petTemperament || undefined,
          dietaryNeeds: formData.petDietaryNeeds || undefined
        },
        owner: {
          name: formData.ownerName,
          phone: formData.ownerPhone,
          email: formData.ownerEmail,
          address: {
            street: formData.ownerStreet,
            city: formData.ownerCity,
            state: formData.ownerState,
            zipCode: formData.ownerZipCode
          },
          occupation: formData.ownerOccupation,
          emergencyContact: {
            name: formData.emergencyContactName,
            phone: formData.emergencyContactPhone,
            relationship: formData.emergencyContactRelationship
          }
        }
      }
      
      console.log('New patient created:', newPatient)

      // Store patient data in sessionStorage to pass to the patient template
      sessionStorage.setItem('newPatientData', JSON.stringify(newPatient))

      toast({
        title: "Patient Added",
        description: `${formData.petName} (${formData.petSpecies}) has been added successfully.`,
      })

      setOpen(false)
      // Reset form
      setFormData({
        patientId: '',
        mrn: '',
        petName: '',
        petSpecies: '',
        petBreed: '',
        petAge: '',
        petGender: '',
        petWeight: '',
        petColor: '',
        petMicrochipId: '',
        petMedicalHistory: '',
        petAllergies: '',
        petTemperament: '',
        petDietaryNeeds: '',
        ownerName: '',
        ownerPhone: '',
        ownerEmail: '',
        ownerStreet: '',
        ownerCity: '',
        ownerState: '',
        ownerZipCode: '',
        ownerOccupation: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: ''
      })

      // Navigate to patient template page
      navigate(`/patient/${patientId}`)

    } catch (error) {
      console.error('Error adding patient:', error)
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Record Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Record Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  value={formData.patientId}
                  onChange={(e) => handleInputChange('patientId', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <Label htmlFor="mrn">MRN (Medical Record Number)</Label>
                <Input
                  id="mrn"
                  value={formData.mrn}
                  onChange={(e) => handleInputChange('mrn', e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>
          </div>

          {/* Pet Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pet Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petName">Pet Name *</Label>
                <Input
                  id="petName"
                  value={formData.petName}
                  onChange={(e) => handleInputChange('petName', e.target.value)}
                  placeholder="Enter pet's name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="petSpecies">Species *</Label>
                <Select value={formData.petSpecies} onValueChange={(value) => handleInputChange('petSpecies', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Reptile">Reptile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="petBreed">Breed *</Label>
                <Input
                  id="petBreed"
                  value={formData.petBreed}
                  onChange={(e) => handleInputChange('petBreed', e.target.value)}
                  placeholder="Enter breed"
                  required
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
                />
              </div>
              <div>
                <Label htmlFor="petGender">Gender</Label>
                <Select value={formData.petGender} onValueChange={(value) => handleInputChange('petGender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="petWeight">Weight (kg)</Label>
                <Input
                  id="petWeight"
                  type="number"
                  value={formData.petWeight}
                  onChange={(e) => handleInputChange('petWeight', e.target.value)}
                  placeholder="Enter weight in kg"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="petColor">Color/Markings</Label>
                <Input
                  id="petColor"
                  value={formData.petColor}
                  onChange={(e) => handleInputChange('petColor', e.target.value)}
                  placeholder="Enter color or markings"
                />
              </div>
              <div>
                <Label htmlFor="petMicrochipId">Microchip ID</Label>
                <Input
                  id="petMicrochipId"
                  value={formData.petMicrochipId}
                  onChange={(e) => handleInputChange('petMicrochipId', e.target.value)}
                  placeholder="Enter microchip ID if available"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="petMedicalHistory">Medical History</Label>
              <Textarea
                id="petMedicalHistory"
                value={formData.petMedicalHistory}
                onChange={(e) => handleInputChange('petMedicalHistory', e.target.value)}
                placeholder="Enter relevant medical history"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="petAllergies">Allergies (comma-separated)</Label>
              <Textarea
                id="petAllergies"
                value={formData.petAllergies}
                onChange={(e) => handleInputChange('petAllergies', e.target.value)}
                placeholder="Enter known allergies, separated by commas"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="petTemperament">Temperament</Label>
                <Input
                  id="petTemperament"
                  value={formData.petTemperament}
                  onChange={(e) => handleInputChange('petTemperament', e.target.value)}
                  placeholder="e.g., Friendly, Shy, Aggressive"
                />
              </div>
              <div>
                <Label htmlFor="petDietaryNeeds">Dietary Needs</Label>
                <Input
                  id="petDietaryNeeds"
                  value={formData.petDietaryNeeds}
                  onChange={(e) => handleInputChange('petDietaryNeeds', e.target.value)}
                  placeholder="e.g., Grain-free, Prescription diet"
                />
              </div>
            </div>
          </div>

          {/* Pet Parent (Owner) Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pet Parent (Owner) Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  placeholder="Enter owner's full name"
                  required
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
                />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Email Address</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="ownerOccupation">Occupation</Label>
                <Input
                  id="ownerOccupation"
                  value={formData.ownerOccupation}
                  onChange={(e) => handleInputChange('ownerOccupation', e.target.value)}
                  placeholder="Enter occupation"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ownerStreet">Street Address</Label>
              <Input
                id="ownerStreet"
                value={formData.ownerStreet}
                onChange={(e) => handleInputChange('ownerStreet', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ownerCity">City</Label>
                <Input
                  id="ownerCity"
                  value={formData.ownerCity}
                  onChange={(e) => handleInputChange('ownerCity', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div>
                <Label htmlFor="ownerState">State</Label>
                <Input
                  id="ownerState"
                  value={formData.ownerState}
                  onChange={(e) => handleInputChange('ownerState', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div>
                <Label htmlFor="ownerZipCode">Zip Code</Label>
                <Input
                  id="ownerZipCode"
                  value={formData.ownerZipCode}
                  onChange={(e) => handleInputChange('ownerZipCode', e.target.value)}
                  placeholder="Enter zip code"
                />
              </div>
            </div>
            
            {/* Emergency Contact */}
            <div className="pt-4 border-t">
              <h4 className="text-md font-semibold mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    placeholder="Enter emergency contact phone"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
                    placeholder="e.g., Spouse, Family, Friend"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Patient...
                </>
              ) : (
                'Add Patient'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
