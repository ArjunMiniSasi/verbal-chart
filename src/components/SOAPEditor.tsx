import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target } from "lucide-react";
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

  const SOAPSection = ({ 
    title, 
    icon: Icon, 
    value, 
    onChange, 
    placeholder, 
    wordCount: sectionWordCount 
  }: {
    title: string;
    icon: any;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    wordCount: number;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {sectionWordCount > 0 && (
          <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200">
            {sectionWordCount} words
          </Badge>
        )}
      </div>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl font-bold text-gray-900">SOAP Editor</CardTitle>
            {totalWords > 0 && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {totalWords} words total
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={generateSOAP}
              disabled={transcript.length === 0 || isGenerating}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
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
              className="gap-2 border-gray-300 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Subjective Section */}
        <SOAPSection
          title="Subjective"
          icon={Stethoscope}
          value={soapNote.subjective}
          onChange={(value) => updateSOAPNote('subjective', value)}
          placeholder="Patient's subjective symptoms, history, and owner observations..."
          wordCount={wordCount(soapNote.subjective)}
        />

        {/* Objective Section */}
        <SOAPSection
          title="Objective"
          icon={ClipboardList}
          value={soapNote.objective}
          onChange={(value) => updateSOAPNote('objective', value)}
          placeholder="Objective findings, vital signs, physical examination results..."
          wordCount={wordCount(soapNote.objective)}
        />

        {/* Assessment Section */}
        <SOAPSection
          title="Assessment"
          icon={Brain}
          value={soapNote.assessment}
          onChange={(value) => updateSOAPNote('assessment', value)}
          placeholder="Clinical assessment, diagnosis, and differential diagnoses..."
          wordCount={wordCount(soapNote.assessment)}
        />

        {/* Plan Section */}
        <SOAPSection
          title="Plan"
          icon={Target}
          value={soapNote.plan}
          onChange={(value) => updateSOAPNote('plan', value)}
          placeholder="Treatment plan, medications, follow-up recommendations..."
          wordCount={wordCount(soapNote.plan)}
        />
      </CardContent>
    </Card>
  );
};
