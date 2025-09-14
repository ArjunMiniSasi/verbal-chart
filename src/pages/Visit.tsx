import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMedoraStore } from "@/stores/medoraStore";
import { mockPatients } from "@/mocks/seeds";
import { Header } from "@/components/Header";
import { VoiceButton } from "@/components/VoiceButton";
import { Transcript } from "@/components/Transcript";
import { HistoryMatches } from "@/components/HistoryMatches";
import { Suggestions } from "@/components/Suggestions";
import { SOAPEditor } from "@/components/SOAPEditor";
import { PreviewModal } from "@/components/PreviewModal";

export const Visit = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { currentPatient, setCurrentPatient } = useMedoraStore();

  console.log('🏥 Visit page loaded, patientId:', patientId);
  console.log('🏥 Current patient:', currentPatient);

  useEffect(() => {
    if (!patientId) {
      navigate('/');
      return;
    }

    // Find patient by ID
    const patient = mockPatients.find(p => p.id === patientId);
    if (!patient) {
      navigate('/');
      return;
    }

    // Set current patient if not already set
    if (!currentPatient || currentPatient.id !== patientId) {
      setCurrentPatient(patient);
    }
  }, [patientId, currentPatient, setCurrentPatient, navigate]);

  if (!currentPatient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading patient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6">
        {/* Voice Recording Section */}
        <div className="mb-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Voice Recording Section</p>
          <VoiceButton />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Transcript and Voice */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <Transcript />
          </div>

          {/* Middle Column - History and Suggestions */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="h-[400px]">
              <HistoryMatches />
            </div>
            <div className="h-[400px]">
              <Suggestions />
            </div>
          </div>

          {/* Right Column - SOAP Editor */}
          <div className="col-span-12 lg:col-span-4">
            <SOAPEditor />
          </div>
        </div>
      </div>

      <PreviewModal />
    </div>
  );
};