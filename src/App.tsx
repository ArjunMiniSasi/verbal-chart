import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DoctorHome from "./pages/DoctorHome";
import PatientTemplate from "./pages/PatientTemplate";
import Index from "./pages/Index";
import Search from "./pages/Search";
import { Visit } from "./pages/Visit";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DoctorHome />} />
          <Route path="/patient/:patientId" element={<PatientTemplate />} />
          <Route path="/search" element={<Search />} />
          <Route path="/demo" element={<Index />} />
          <Route path="/visit/:patientId" element={<Visit />} />
          <Route path="/test" element={<TestPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
