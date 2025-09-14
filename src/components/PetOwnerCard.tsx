import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Heart, 
  Calendar, 
  Weight, 
  Palette,
  Shield,
  AlertTriangle,
  Stethoscope,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Eye,
  X
} from "lucide-react"
import { Pet, Owner } from "@/mocks/seeds"

interface PetOwnerCardProps {
  pet: Pet
  owner: Owner
  lastVisit: string
}

const PetOwnerCard = ({ pet, owner, lastVisit }: PetOwnerCardProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getSpeciesIcon = (species: string) => {
    switch (species) {
      case 'Dog':
        return '🐕'
      case 'Cat':
        return '🐱'
      case 'Bird':
        return '🐦'
      case 'Rabbit':
        return '🐰'
      case 'Reptile':
        return '🦎'
      default:
        return '🐾'
    }
  }

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case 'Current':
        return 'bg-green-100 text-green-800'
      case 'Overdue':
        return 'bg-red-100 text-red-800'
      case 'Upcoming':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const overdueVaccinations = pet.vaccinations.filter(v => v.status === 'Overdue').length
  const upcomingVaccinations = pet.vaccinations.filter(v => v.status === 'Upcoming').length

  return (
    <>
      {/* Compact Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                {pet.imageUrl ? (
                  <img 
                    src={pet.imageUrl} 
                    alt={pet.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-2xl">
                    {getSpeciesIcon(pet.species)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <Heart className="h-4 w-4 text-red-500" />
              </div>
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl text-gray-900">{pet.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {pet.species}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {pet.breed}
                </Badge>
                <Badge variant={pet.gender === 'Male' ? 'default' : 'secondary'} className="text-xs">
                  {pet.gender}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Essential Pet Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{pet.age} years</p>
                <p className="text-xs text-gray-500">Age</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{pet.weight} lbs</p>
                <p className="text-xs text-gray-500">Weight</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{pet.color}</p>
                <p className="text-xs text-gray-500">Color</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">{pet.microchipId ? 'Yes' : 'No'}</p>
                <p className="text-xs text-gray-500">Microchipped</p>
              </div>
            </div>
          </div>

          {/* Vaccination Status Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Vaccinations</span>
              </div>
              <div className="flex gap-1">
                {overdueVaccinations > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {overdueVaccinations} Overdue
                  </Badge>
                )}
                {upcomingVaccinations > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {upcomingVaccinations} Due Soon
                  </Badge>
                )}
                {overdueVaccinations === 0 && upcomingVaccinations === 0 && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    All Current
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Owner Summary */}
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">{owner.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{owner.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{owner.email}</span>
            </div>
          </div>

          {/* Allergies Summary */}
          {pet.allergies.length > 0 && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Allergies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {pet.allergies.slice(0, 2).map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {allergy}
                  </Badge>
                ))}
                {pet.allergies.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{pet.allergies.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* View Details Button */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full gap-2">
                <Eye className="h-4 w-4" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    {pet.imageUrl ? (
                      <img 
                        src={pet.imageUrl} 
                        alt={pet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-lg">
                        {getSpeciesIcon(pet.species)}
                      </div>
                    )}
                  </div>
                  {pet.name} - Complete Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pet Details */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pet Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pet.age} years old</p>
                            <p className="text-xs text-gray-500">Age</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Weight className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pet.weight} lbs</p>
                            <p className="text-xs text-gray-500">Weight</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pet.color}</p>
                            <p className="text-xs text-gray-500">Color</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{pet.microchipId ? 'Yes' : 'No'}</p>
                            <p className="text-xs text-gray-500">Microchipped</p>
                          </div>
                        </div>
                      </div>

                      {/* Vaccinations */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          Vaccinations
                        </h4>
                        <div className="space-y-2">
                          {pet.vaccinations.map((vaccination, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{vaccination.name}</p>
                                <p className="text-sm text-gray-500">Last: {vaccination.date}</p>
                                <p className="text-sm text-gray-500">Next: {vaccination.nextDue}</p>
                              </div>
                              <Badge className={getVaccinationStatusColor(vaccination.status)}>
                                {vaccination.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Medical History */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-blue-600" />
                          Medical History
                        </h4>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                          {pet.medicalHistory}
                        </p>
                      </div>

                      {/* Allergies */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Allergies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {pet.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive" className="text-sm">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Temperament & Diet */}
                      {pet.temperament && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Temperament</h4>
                          <p className="text-sm text-gray-700">{pet.temperament}</p>
                        </div>
                      )}

                      {pet.dietaryNeeds && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Dietary Needs</h4>
                          <p className="text-sm text-gray-700">{pet.dietaryNeeds}</p>
                        </div>
                      )}

                      {/* Last Doctor */}
                      {pet.lastConsultedDoctor && (
                        <div className="border-t pt-4">
                          <p className="text-sm text-gray-500">Last consulted with</p>
                          <p className="font-medium text-gray-900">{pet.lastConsultedDoctor}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Owner Details */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Owner Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{owner.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <Briefcase className="h-3 w-3" />
                          {owner.occupation}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-gray-700">{owner.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{owner.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                          <div className="text-sm text-gray-700">
                            <p>{owner.address.street}</p>
                            <p>{owner.address.city}, {owner.address.state} {owner.address.zipCode}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Emergency Contact
                        </h4>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{owner.emergencyContact.name}</p>
                          <p className="text-sm text-gray-600">{owner.emergencyContact.relationship}</p>
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {owner.emergencyContact.phone}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-500">Last visit</p>
                        <p className="font-medium text-gray-900">{lastVisit}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  )
}

export default PetOwnerCard
