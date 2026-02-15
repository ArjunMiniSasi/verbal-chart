import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DoctorHome from "./pages/DoctorHome";
import AllPatients from "./pages/AllPatients";
import PatientTemplate from "./pages/PatientTemplate";
import Index from "./pages/Index";
import Search from "./pages/Search";
import { Visit } from "./pages/Visit";
import NewSOAP from "./pages/NewSOAP";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DoctorHome /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><AllPatients /></ProtectedRoute>} />
          <Route path="/patient/:patientId" element={<ProtectedRoute><PatientTemplate /></ProtectedRoute>} />
          <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
          <Route path="/demo" element={<Index />} />
          <Route path="/visit/:patientId" element={<ProtectedRoute><Visit /></ProtectedRoute>} />
          <Route path="/new-soap" element={<ProtectedRoute><NewSOAP /></ProtectedRoute>} />
          <Route path="/test" element={<TestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
