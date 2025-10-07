import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator, ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ManualSOAEditor } from "./ManualSOAEditor";

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

  // Debug: Log current soapNote state
  console.log('🔍 Current soapNote state:', soapNote);
  console.log('🔍 Plan content:', soapNote.plan);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);

  const generateSOA = async () => {
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
      const response = await fetch(`${API_BASE_URL}/api/generate-soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript,
          patientId: currentPatient.id,
          previousNotes: [] // TODO: Get previous notes for this patient
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📝 Generated SOAP data:', data);

      // Update the SOAP note with the generated data
      // The backend returns { soapNote: { subjective, objective, assessment, plan } }
      const soapData = data.soapNote || data;
      updateSOAPNote('subjective', soapData.subjective || '');
      updateSOAPNote('objective', soapData.objective || '');
      updateSOAPNote('assessment', soapData.assessment || '');
      updateSOAPNote('plan', soapData.plan || '');

      toast({
        title: "SOAP note generated successfully",
        description: "The SOAP note has been generated from the transcript.",
      });
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      toast({
        title: "Error generating SOAP note",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlan = async () => {
    if (!soapNote.subjective || !soapNote.objective || !soapNote.assessment || 
        soapNote.subjective.trim().length === 0 || soapNote.objective.trim().length === 0 || soapNote.assessment.trim().length === 0) {
      toast({
        title: "SOA sections required",
        description: "Please complete all SOA sections (Subjective, Objective, Assessment) first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: soapNote.subjective,
          objective: soapNote.objective,
          assessment: soapNote.assessment,
          previousNotes: [] // TODO: Get previous notes for this patient
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Generated plan data:', data);

      // Update the plan section
      updateSOAPNote('plan', data.plan || '');

      toast({
        title: "Treatment plan generated successfully",
        description: "The treatment plan has been generated using PlumbRAG.",
      });
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error generating plan",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const exportSOAP = () => {
    const soapContent = `
SOAP Note - ${currentPatient?.name || 'Unknown Patient'}
Generated: ${new Date().toLocaleString()}

SUBJECTIVE:
${soapNote.subjective}

OBJECTIVE:
${soapNote.objective}

ASSESSMENT:
${soapNote.assessment}

PLAN:
${soapNote.plan}
    `.trim();

    const blob = new Blob([soapContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_${currentPatient?.name || 'Patient'}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "SOAP note exported",
      description: "The SOAP note has been downloaded as a text file.",
    });
  };

  const wordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const parsePlanSections = (planText: string) => {
    if (!planText) return [];
    
    console.log('🔍 Parsing plan text:', planText);
    
    const sections = [];
    const lines = planText.split('\n');
    let currentSection = { title: '', content: '' };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      console.log('🔍 Processing line:', trimmedLine);
      
      // Match format: "1. **Diagnostics:**" or "1. **Medications:**" etc.
      if (trimmedLine.match(/^\d+\.\s*\*\*.*\*\*:?\s*$/)) {
        if (currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(/^\d+\.\s*\*\*(.*)\*\*:?\s*$/, '$1').trim(),
          content: ''
        };
        console.log('🔍 Found section:', currentSection.title);
      } else if (trimmedLine && currentSection.title) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection.title) {
      sections.push(currentSection);
    }
    
    console.log('🔍 Parsed sections:', sections);
    return sections;
  };

  const getSectionIcon = (title: string) => {
    switch (title.toLowerCase()) {
      case 'diagnostics':
        return <ClipboardList className="h-4 w-4 text-white" />;
      case 'medications':
        return <Pill className="h-4 w-4 text-white" />;
      case 'follow-up':
        return <Target className="h-4 w-4 text-white" />;
      default:
        return <Target className="h-4 w-4 text-white" />;
    }
  };

  const totalWords = wordCount(soapNote.subjective) + wordCount(soapNote.objective) + wordCount(soapNote.assessment) + wordCount(soapNote.plan);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            SOAP Note Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {totalWords} words total
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsManualMode(!isManualMode)}
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              {isManualMode ? 'Auto Mode' : 'Manual Mode'}
            </Button>
            {!isManualMode && (
              <Button 
                variant="outline" 
                onClick={generateSOA}
                disabled={transcript.length === 0 || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isGenerating ? 'Generating SOA...' : 'Generate SOA'}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={generatePlan}
              disabled={!soapNote.assessment || isGeneratingPlan}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              {isGeneratingPlan ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pill className="h-4 w-4" />
              )}
              {isGeneratingPlan ? 'Generating Plan...' : 'Generate Plan'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              onClick={exportSOAP}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isManualMode ? (
          <ManualSOAEditor />
        ) : (
          <>
            {/* Medical Record Section - Timeline Style */}
            <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-200">
            <Stethoscope className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Medical Record</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              SOA Generated
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {/* Timeline container */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-300"></div>
              
              {/* Subjective */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Subjective</h3>
                    {wordCount(soapNote.subjective) > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {wordCount(soapNote.subjective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Patient history, symptoms, and owner concerns..."
                      value={soapNote.subjective}
                      onChange={(e) => updateSOAPNote('subjective', e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Objective</h3>
                    {wordCount(soapNote.objective) > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {wordCount(soapNote.objective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Physical examination findings, vital signs, and test results..."
                      value={soapNote.objective}
                      onChange={(e) => updateSOAPNote('objective', e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Assessment</h3>
                    {wordCount(soapNote.assessment) > 0 && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {wordCount(soapNote.assessment)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Clinical assessment, diagnosis, and differential diagnoses..."
                      value={soapNote.assessment}
                      onChange={(e) => updateSOAPNote('assessment', e.target.value)}
                      className="min-h-[60px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Section - Timeline Style with Individual Sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-green-200">
            <Target className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Treatment Plan</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              PlumbRAG Enhanced
            </Badge>
          </div>
          
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300"></div>
            
            {soapNote.plan ? (
              <div className="space-y-6">
                {parsePlanSections(soapNote.plan).map((section, index) => (
                  <div key={index} className="relative flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center z-10">
                      {getSectionIcon(section.title)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{section.title}</h3>
                        {wordCount(section.content) > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {wordCount(section.content)} words
                          </Badge>
                        )}
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {section.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="relative flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center z-10">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Plan</h3>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Textarea
                      placeholder="Treatment plan will be generated using PlumbRAG veterinary drug database. Click 'Generate Plan' after SOA is complete..."
                      value={soapNote.plan}
                      onChange={(e) => updateSOAPNote('plan', e.target.value)}
                      className="min-h-[120px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                  <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border border-green-200 mt-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-green-600" />
                      <span>
                        <strong>PlumbRAG Treatment Plan:</strong> This section will be populated using our veterinary drug database 
                        to ensure accurate dosages and medication recommendations based on the assessment above.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};