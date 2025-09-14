import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";

export const SOAPEditor = () => {
  const { 
    soapNote, 
    updateSOAPNote, 
    setShowPreview, 
    transcript,
    currentPatient 
  } = useMedoraStore();
  const { toast } = useToast();

  const generateSOAP = async () => {
    if (transcript.length === 0) {
      toast({
        title: "No transcript available",
        description: "Please transcribe audio first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate AI SOAP generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      const entities = transcript.flatMap(chunk => 
        chunk.entities.map(e => e.text)
      );

      // Generate mock SOAP notes based on transcript
      const subjective = `Patient reports: ${transcriptText.slice(0, 200)}...`;
      
      const objective = entities.length > 0 
        ? `Key findings: ${entities.slice(0, 5).join(', ')}`
        : 'Physical examination findings to be documented.';
      
      const assessment = entities.filter(e => 
        transcript.some(chunk => 
          chunk.entities.some(entity => entity.text === e && entity.type === 'condition')
        )
      ).length > 0 
        ? `Possible conditions: ${entities.filter(e => 
            transcript.some(chunk => 
              chunk.entities.some(entity => entity.text === e && entity.type === 'condition')
            )
          ).join(', ')}`
        : 'Assessment pending further evaluation.';

      const plan = 'Treatment plan to be determined based on assessment. Follow up as needed.';

      updateSOAPNote('subjective', subjective);
      updateSOAPNote('objective', objective);
      updateSOAPNote('assessment', assessment);
      updateSOAPNote('plan', plan);

      toast({
        title: "SOAP Generated",
        description: "AI-generated SOAP note from transcript.",
      });

    } catch (error) {
      console.error('SOAP generation error:', error);
      toast({
        title: "SOAP Generation Failed",
        description: "Failed to generate SOAP notes. Please try again.",
        variant: "destructive"
      });
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
              disabled={transcript.length === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Generate SOAP
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