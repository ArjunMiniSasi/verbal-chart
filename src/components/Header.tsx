import { Button } from "@/components/ui/button";
import { Activity, RefreshCw } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();
  const { currentPatient, resetSession } = useMedoraStore();

  const handleReset = () => {
    resetSession();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-medical-primary" />
            <h1 className="text-xl font-semibold text-foreground">Medora</h1>
          </div>
          <span className="text-sm text-muted-foreground">
            Voice-enabled SOAP notes with instant history
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {currentPatient && (
            <div className="text-sm">
              <span className="text-muted-foreground">Patient:</span>{' '}
              <span className="font-medium text-foreground">{currentPatient.name}</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Demo
          </Button>
        </div>
      </div>
    </header>
  );
};