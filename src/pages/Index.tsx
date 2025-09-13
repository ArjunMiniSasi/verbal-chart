import { Header } from "@/components/Header";
import { PatientPicker } from "@/components/PatientPicker";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        <PatientPicker />
      </div>
    </div>
  );
};

export default Index;
