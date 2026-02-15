import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronUp,
  User,
  Calendar,
  Weight,
  Palette,
  Microscope,
  Shield,
  AlertTriangle,
  FileText
} from "lucide-react"
import { Pet } from "@/mocks/seeds"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface PetProfileSidebarProps {
  pet: Pet
}

export const PetProfileSidebar = ({ pet }: PetProfileSidebarProps) => {
  const [basicDetailsOpen, setBasicDetailsOpen] = useState(true)
  const [allergiesOpen, setAllergiesOpen] = useState(false)
  const [vaccinationOpen, setVaccinationOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Basic Details */}
      <Collapsible open={basicDetailsOpen} onOpenChange={setBasicDetailsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Details
                </CardTitle>
                {basicDetailsOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Species:</span>
                  <p className="font-medium">{pet.species}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Breed:</span>
                  <p className="font-medium">{pet.breed || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Age:</span>
                  <p className="font-medium">{pet.age > 0 ? `${pet.age} years` : 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <p className="font-medium">{pet.gender}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Weight:</span>
                  <p className="font-medium">{pet.weight > 0 ? `${pet.weight} kg` : 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Color:</span>
                  <p className="font-medium">{pet.color || 'Not specified'}</p>
                </div>
              </div>
              {pet.microchipId && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Microchip ID:</span>
                  <p className="font-mono text-sm">{pet.microchipId}</p>
                </div>
              )}
              {pet.temperament && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Temperament:</span>
                  <p className="text-sm">{pet.temperament}</p>
                </div>
              )}
              {pet.dietaryNeeds && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground text-sm">Dietary Needs:</span>
                  <p className="text-sm">{pet.dietaryNeeds}</p>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Allergies */}
      <Collapsible open={allergiesOpen} onOpenChange={setAllergiesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Allergies
                </CardTitle>
                {allergiesOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {pet.allergies && pet.allergies.length > 0 && pet.allergies[0] !== 'None known' ? (
                <div className="flex flex-wrap gap-2">
                  {pet.allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No known allergies</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Vaccination Profile */}
      <Collapsible open={vaccinationOpen} onOpenChange={setVaccinationOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Vaccination Profile
                </CardTitle>
                {vaccinationOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {pet.vaccinations && pet.vaccinations.length > 0 ? (
                <div className="space-y-3">
                  {pet.vaccinations.map((vaccination, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{vaccination.name}</span>
                        <Badge 
                          variant={
                            vaccination.status === 'Current' ? 'default' :
                            vaccination.status === 'Overdue' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {vaccination.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div>
                          <span>Date: </span>
                          <span className="font-medium">{vaccination.date}</span>
                        </div>
                        <div>
                          <span>Next Due: </span>
                          <span className="font-medium">{vaccination.nextDue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No vaccination records</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Medical History Summary */}
      {pet.medicalHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-4">
              {pet.medicalHistory}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
