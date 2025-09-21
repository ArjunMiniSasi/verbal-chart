import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2 } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { generateSoapNote, SoapNote, testSoapGeneration } from "@/lib/api";
import { useState } from "react";

export const SOAPEditor = () => {
  const { 
    soapNote, 
    updateSOAPNote, 
    setSOAPNote,
    setShowPreview, 
    transcript,
    currentPatient 
  } = useMedoraStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Debug logging
  console.log('📝 SOAPEditor rendered with soapNote:', soapNote);
  
  // Check if SOAP note has content
  const hasSOAPContent = soapNote.subjective || soapNote.objective || soapNote.assessment || soapNote.plan;

  const generateSOAP = async () => {
    if (transcript.length === 0) {
      toast({
        title: "No transcript available",
        description: "Please transcribe audio first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      console.log('🤖 SOAPEditor: Generating SOAP note from transcript:', transcriptText.substring(0, 100) + '...');

      // Get previous SOAP notes for this patient (mock data for now)
      const previousNotes: SoapNote[] = getPreviousSoapNotes(currentPatient?.id || 'demo-patient');
      
      const soapNote = await generateSoapNote(transcriptText, previousNotes);
      console.log('✅ SOAPEditor: SOAP note generated:', soapNote);
      
      // Store the SOAP note in the application state
      setSOAPNote(soapNote);
      
      toast({
        title: "SOAP Notes Generated",
        description: "AI-generated SOAP notes have been created based on the transcript.",
      });

    } catch (error) {
      console.error('❌ SOAPEditor: Error generating SOAP notes:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate SOAP notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock function to get previous SOAP notes for a patient
  const getPreviousSoapNotes = (patientId: string): SoapNote[] => {
    // In a real app, this would fetch from a database
    // For now, return mock historical data
    const mockHistory: Record<string, SoapNote[]> = {
      'demo-patient': [
        {
          subjective: "Owner reports 2-week history of intermittent coughing, especially after exercise. Dog otherwise active and eating normally.",
          objective: "Temp 101.5°F, HR 95 bpm, RR 28/min. Lungs clear on auscultation. No nasal discharge. Weight stable.",
          assessment: "Mild upper respiratory irritation, possible environmental allergies",
          plan: "Monitor symptoms, consider antihistamines if coughing persists. Return in 2 weeks if no improvement."
        }
      ],
      'MRN508532597': [
        {
          subjective: "Initial visit - owner concerned about recent lethargy and decreased appetite over past 3 days.",
          objective: "Temp 102.8°F, HR 110 bpm, RR 32/min. Slightly dehydrated. Abdomen soft, no masses palpated.",
          assessment: "Possible gastrointestinal upset, rule out foreign body ingestion",
          plan: "Withhold food for 12 hours, then bland diet. Monitor closely. Return if vomiting or lethargy worsens."
        }
      ]
    };

    return mockHistory[patientId] || [];
  };

  const testBackend = async () => {
    setIsTesting(true);
    try {
      console.log('🧪 Testing backend SOAP generation...');
      const result = await testSoapGeneration();
      console.log('✅ Backend test successful:', result);
      
      toast({
        title: "Backend Test Successful",
        description: "Backend SOAP generation is working correctly.",
      });
    } catch (error) {
      console.error('❌ Backend test failed:', error);
      toast({
        title: "Backend Test Failed",
        description: error instanceof Error ? error.message : "Backend test failed",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const wordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const totalWords = Object.values(soapNote).reduce((total, section) => 
    total + wordCount(section), 0
  );

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-medical-primary" />
            <h3 className="text-lg font-semibold">SOAP Editor</h3>
            {hasSOAPContent && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                AI Generated
              </Badge>
            )}
            {totalWords > 0 && (
              <Badge variant="outline">
                {totalWords} words
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testBackend}
              disabled={isTesting}
              className="gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isTesting ? "Testing..." : "Test Backend"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSOAP}
              disabled={transcript.length === 0 || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate SOAP"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPreview(true)}
              disabled={totalWords === 0}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        <Tabs defaultValue="subjective" className="h-[500px]">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subjective" className="relative">
              Subjective
              {wordCount(soapNote.subjective) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {wordCount(soapNote.subjective)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="objective" className="relative">
              Objective
              {wordCount(soapNote.objective) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {wordCount(soapNote.objective)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assessment" className="relative">
              Assessment
              {wordCount(soapNote.assessment) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {wordCount(soapNote.assessment)}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="plan" className="relative">
              Plan
              {wordCount(soapNote.plan) > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {wordCount(soapNote.plan)}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjective" className="mt-4 h-[400px]">
            <Textarea
              placeholder="Patient's subjective symptoms and history..."
              value={soapNote.subjective}
              onChange={(e) => updateSOAPNote('subjective', e.target.value)}
              className="h-full resize-none"
            />
          </TabsContent>

          <TabsContent value="objective" className="mt-4 h-[400px]">
            <Textarea
              placeholder="Objective findings, vital signs, physical examination..."
              value={soapNote.objective}
              onChange={(e) => updateSOAPNote('objective', e.target.value)}
              className="h-full resize-none"
            />
          </TabsContent>

          <TabsContent value="assessment" className="mt-4 h-[400px]">
            <Textarea
              placeholder="Clinical assessment and diagnosis..."
              value={soapNote.assessment}
              onChange={(e) => updateSOAPNote('assessment', e.target.value)}
              className="h-full resize-none"
            />
          </TabsContent>

          <TabsContent value="plan" className="mt-4 h-[400px]">
            <Textarea
              placeholder="Treatment plan, follow-up, and recommendations..."
              value={soapNote.plan}
              onChange={(e) => updateSOAPNote('plan', e.target.value)}
              className="h-full resize-none"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};