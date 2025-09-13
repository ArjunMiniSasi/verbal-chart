import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, Calendar } from "lucide-react";
import { mockPatients, Patient } from "@/mocks/seeds";
import { useMedoraStore } from "@/stores/medoraStore";
import { useNavigate } from "react-router-dom";

export const PatientPicker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { setCurrentPatient } = useMedoraStore();
  const navigate = useNavigate();

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    navigate(`/visit/${patient.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Select Patient
        </h2>
        <p className="text-muted-foreground">
          Choose a patient to begin the voice-enabled consultation
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or MRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card 
            key={patient.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => handleSelectPatient(patient)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>MRN: {patient.mrn}</span>
                      <span>Age: {patient.age}</span>
                      {patient.lastVisit && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last visit: {patient.lastVisit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Start Visit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No patients found matching your search.</p>
        </div>
      )}
    </div>
  );
};