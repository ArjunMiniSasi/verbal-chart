import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Use the same API base URL as other components
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const ManualSOAEditor = () => {
  const { 
    soapNote, 
    updateSOAPNote, 
    currentPatient 
  } = useMedoraStore();

  const { toast } = useToast();
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [manualSOA, setManualSOA] = useState({
    subjective: '',
    objective: '',
    assessment: ''
  });

  const updateManualSOA = (field: 'subjective' | 'objective' | 'assessment', value: string) => {
    setManualSOA(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePlanFromManualSOA = async () => {
    if (!manualSOA.subjective || !manualSOA.objective || !manualSOA.assessment) {
      toast({
        title: "All SOA sections required",
        description: "Please complete Subjective, Objective, and Assessment sections first.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-plan-from-soa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: manualSOA.subjective,
          objective: manualSOA.objective,
          assessment: manualSOA.assessment,
          patientId: currentPatient?.id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Generated plan from manual SOA:', data);

      // Update the plan section
      updateSOAPNote('plan', data.plan || '');

      toast({
        title: "Treatment plan generated successfully",
        description: "The treatment plan has been generated using PlumbRAG from your manual SOA.",
      });
    } catch (error) {
      console.error('Error generating plan from manual SOA:', error);
      toast({
        title: "Error generating plan",
        description: "Please try again or check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
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
      // Updated regex to match the actual format: "1. **Diagnostics:**" or "1. **Diagnostics:** "
      if (trimmedLine.match(/^\d+\.\s*\*\*.*\*\*:?\s*$/)) {
        if (currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmedLine.replace(/^\d+\.\s*\*\*(.*?)\*\*:?\s*$/, '$1').trim(),
          content: ''
        };
      } else if (trimmedLine && currentSection.title) {
        currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
      }
    }
    
    if (currentSection.title) {
      sections.push(currentSection);
    }
    
    console.log('📋 Parsed sections:', sections);
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

  const totalWords = wordCount(manualSOA.subjective) + wordCount(manualSOA.objective) + wordCount(manualSOA.assessment) + wordCount(soapNote.plan);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            Manual SOA Entry
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              {totalWords} words total
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={generatePlanFromManualSOA}
              disabled={!manualSOA.subjective || !manualSOA.objective || !manualSOA.assessment || isGeneratingPlan}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
            >
              {isGeneratingPlan ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Pill className="h-4 w-4" />
              )}
              {isGeneratingPlan ? 'Generating Plan...' : 'Generate Plan'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Manual SOA Entry Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-purple-200">
            <Stethoscope className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Manual SOA Entry</h2>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Manual Entry
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            {/* Timeline container */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-purple-300"></div>
              
              {/* Subjective */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center z-10">
                  <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Subjective</h3>
                    {wordCount(manualSOA.subjective) > 0 && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {wordCount(manualSOA.subjective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Enter patient history, symptoms, and owner concerns..."
                      value={manualSOA.subjective}
                      onChange={(e) => updateManualSOA('subjective', e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center z-10">
                  <ClipboardList className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Objective</h3>
                    {wordCount(manualSOA.objective) > 0 && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {wordCount(manualSOA.objective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Enter physical examination findings, vital signs, and test results..."
                      value={manualSOA.objective}
                      onChange={(e) => updateManualSOA('objective', e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="relative flex items-start mb-6">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center z-10">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">Assessment</h3>
                    {wordCount(manualSOA.assessment) > 0 && (
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {wordCount(manualSOA.assessment)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded border border-gray-200">
                    <Textarea
                      placeholder="Enter clinical assessment, diagnosis, and differential diagnoses..."
                      value={manualSOA.assessment}
                      onChange={(e) => updateManualSOA('assessment', e.target.value)}
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
                      placeholder="Treatment plan will be generated using PlumbRAG veterinary drug database. Complete the SOA sections above and click 'Generate Plan'..."
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
                        to ensure accurate dosages and medication recommendations based on your manual SOA above.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
