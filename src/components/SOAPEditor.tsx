import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2 } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Use the same API base URL as other components
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const SOAPEditor = () => {
  const { 
    soapNote, 
    updateSOAPNote, 
    setShowPreview, 
    transcript,
    currentPatient 
  } = useMedoraStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSOAP = async () => {
    if (transcript.length === 0) {
      toast({
        title: "No transcript available",
        description: "Please transcribe audio first.",
        variant: "destructive"
      });
      return;
    }

    if (!currentPatient) {
      toast({
        title: "No patient selected",
        description: "Please select a patient first.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      
      // Simplified and more direct veterinary SOAP prompt
      const systemPrompt = `You are a veterinary AI assistant. Generate SOAP notes in JSON format.

Return ONLY a valid JSON object with these exact keys:
{
  "subjective": "string content here",
  "objective": "string content here", 
  "assessment": "string content here",
  "plan": "string content here"
}

Rules:
- Use veterinary medical terminology
- Be concise but complete
- Return ONLY the JSON object, no other text
- Ensure valid JSON syntax`;

      const userPrompt = `Patient: ${currentPatient.pet.name} (${currentPatient.pet.species}, ${currentPatient.pet.breed})
Age: ${currentPatient.pet.age} years, Weight: ${currentPatient.pet.weight} lbs, Gender: ${currentPatient.pet.gender}
Owner: ${currentPatient.owner.name}

Clinical Transcript:
${transcriptText}

Generate a SOAP note for this veterinary consultation.`;

      console.log('🌐 Calling SOAP API:', `${API_BASE_URL}/api/generate-soap`);

      const response = await fetch(`${API_BASE_URL}/api/generate-soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        }),
      });

      console.log('📡 SOAP Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 SOAP Response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Handle the response - data.soapNote should already be an object
      let soapData;
      if (typeof data.soapNote === 'string') {
        // If it's a string, try to parse it
        try {
          soapData = JSON.parse(data.soapNote);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // If parsing fails, try to extract JSON from the response
          const jsonMatch = data.soapNote.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            soapData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Invalid JSON response from API');
          }
        }
      } else if (typeof data.soapNote === 'object' && data.soapNote !== null) {
        // Use object response directly
        soapData = data.soapNote;
      } else {
        throw new Error('Unexpected response format from API');
      }

      console.log('📝 Parsed SOAP data:', soapData);

      // Update SOAP notes with the parsed data
      updateSOAPNote('subjective', soapData.subjective || '');
      updateSOAPNote('objective', soapData.objective || '');
      updateSOAPNote('assessment', soapData.assessment || '');
      updateSOAPNote('plan', soapData.plan || '');

      toast({
        title: "SOAP Generated Successfully",
        description: "AI-generated SOAP note from transcript using veterinary standards.",
      });

    } catch (error) {
      console.error('SOAP generation error:', error);
      toast({
        title: "SOAP Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate SOAP notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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
              onClick={generateSOAP}
              disabled={transcript.length === 0 || isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate SOAP'}
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
