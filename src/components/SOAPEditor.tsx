import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator, ChevronDown, ChevronUp } from "lucide-react";
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

  // Debug: Log current soapNote state
  console.log('🔍 Current soapNote state:', soapNote);
  console.log('🔍 Plan content:', soapNote.plan);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isPlanExpanded, setIsPlanExpanded] = useState(false);

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
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      
      // Modified prompt to generate only SOA (Subjective, Objective, Assessment)
      const systemPrompt = `You are a veterinary AI assistant. Generate SOAP notes in JSON format.

Return ONLY a valid JSON object with these exact keys:
{
  "subjective": "string content here",
  "objective": "string content here", 
  "assessment": "string content here",
  "plan": ""
}

Rules:
- Use veterinary medical terminology
- Be concise but complete for SOA sections
- Leave the "plan" field empty as it will be generated separately
- Return ONLY the JSON object, no other text
- Ensure valid JSON syntax`;

      const userPrompt = `Patient: ${currentPatient.pet.name} (${currentPatient.pet.species}, ${currentPatient.pet.breed})
Age: ${currentPatient.pet.age} years, Weight: ${currentPatient.pet.weight} lbs, Gender: ${currentPatient.pet.gender}
Owner: ${currentPatient.owner.name}

Clinical Transcript:
${transcriptText}

Generate SOA (Subjective, Objective, Assessment) notes for this veterinary consultation. Leave the plan section empty.`;

      console.log('🌐 Calling SOAP API for SOA:', `${API_BASE_URL}/api/generate-soap`);

      const response = await fetch(`${API_BASE_URL}/api/generate-soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          previousNotes: []
        }),
      });

      console.log('📡 SOAP Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 SOAP Response data:', data);
      console.log('📋 Response status:', response.status);
      console.log('📋 Response headers:', response.headers);
      
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

      // Update only SOA sections, leave plan empty
      updateSOAPNote('subjective', soapData.subjective || '');
      updateSOAPNote('objective', soapData.objective || '');
      updateSOAPNote('assessment', soapData.assessment || '');
      // Don't update plan - it will be generated separately

      toast({
        title: "SOA Generated Successfully",
        description: "AI-generated SOA notes from transcript. Plan will be generated separately.",
      });

    } catch (error) {
      console.error('SOA generation error:', error);
      toast({
        title: "SOA Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate SOA notes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlan = async () => {
    console.log('🚀 Generate Plan button clicked!');
    console.log('🚀 Current soapNote.assessment:', soapNote.assessment);
    
    if (!soapNote.assessment) {
      toast({
        title: "Assessment required",
        description: "Please generate SOA notes first before creating a treatment plan.",
        variant: "destructive"
      });
      return;
    }

    // Expand the plan section when generate plan is clicked
    setIsPlanExpanded(true);
    setIsGeneratingPlan(true);
    console.log('🚀 Starting plan generation...');

    try {
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      console.log('🚀 Transcript text:', transcriptText);
      console.log('🚀 API URL:', `${API_BASE_URL}/api/generate-soap`);
      
      // Call the backend API to generate enhanced SOAP with PlumbRAG
      const response = await fetch(`${API_BASE_URL}/api/generate-soap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          previousNotes: []
        }),
      });
      
      console.log('🚀 API Response received:', response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Enhanced SOAP Response data:', data);
      
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
            throw new Error('Invalid response format');
          }
        }
      } else {
        soapData = data.soapNote;
      }

      // Update the SOAP note with the enhanced plan
      if (soapData.plan) {
        console.log('🔍 Received plan data:', soapData.plan);
        updateSOAPNote('plan', soapData.plan);
        
        toast({
          title: "Plan Generated Successfully",
          description: "Treatment plan has been generated with PlumbRAG drug recommendations.",
          variant: "default"
        });
      } else {
        throw new Error('No plan data received');
      }

    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: "Plan Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate treatment plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const wordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Parse plan into individual sections
  const parsePlanSections = (planText: string) => {
    console.log('🔍 Parsing plan text:', planText);
    const sections = [];
    const lines = planText.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check if this is a section header (starts with number and **) - updated regex to handle content on same line
      const sectionMatch = trimmedLine.match(/^\d+\.\s*\*\*([^*]+)\*\*:?\s*(.*)$/);
      
      if (sectionMatch) {
        // Save previous section if exists
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // Start new section
        currentSection = sectionMatch[1];
        const sectionContent = sectionMatch[2].trim();
        currentContent = sectionContent ? [sectionContent] : [];
        console.log('📝 Found section:', currentSection, 'with content:', sectionContent);
      } else if (trimmedLine && currentSection) {
        // Add content to current section (remove leading dashes and clean up)
        const cleanLine = trimmedLine.replace(/^-\s*/, '').trim();
        if (cleanLine) {
          currentContent.push(cleanLine);
        }
      }
    }
    
    // Don't forget the last section
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }

    console.log('📋 Parsed sections:', sections);
    return sections;
  };

  // Get appropriate icon for each section
  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('diagnostic')) {
      return <ClipboardList className="h-4 w-4 text-white" />;
    } else if (lowerTitle.includes('medication')) {
      return <Pill className="h-4 w-4 text-white" />;
    } else if (lowerTitle.includes('follow')) {
      return <Target className="h-4 w-4 text-white" />;
    } else if (lowerTitle.includes('education') || lowerTitle.includes('client') || lowerTitle.includes('owner')) {
      return <FileText className="h-4 w-4 text-white" />;
    } else if (lowerTitle.includes('environmental')) {
      return <Calculator className="h-4 w-4 text-white" />;
    } else {
      return <Target className="h-4 w-4 text-white" />;
    }
  };

  // Update individual plan section
  const updatePlanSection = (sectionIndex: number, newContent: string) => {
    const sections = parsePlanSections(soapNote.plan);
    if (sections[sectionIndex]) {
      sections[sectionIndex].content = newContent;
      
      // Reconstruct the full plan
      const reconstructedPlan = sections.map((section, index) => {
        const contentLines = section.content.split('\n').map(line => 
          line.trim() ? `   - ${line.trim()}` : ''
        ).filter(line => line).join('\n');
        
        return `${index + 1}. **${section.title}:**\n${contentLines}`;
      }).join('\n\n');
      
      updateSOAPNote('plan', `**Plan:**\n\n${reconstructedPlan}`);
    }
  };


  const totalWords = Object.values(soapNote).reduce((total, section) => 
    total + wordCount(section), 0
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
              onClick={generateSOA}
              disabled={transcript.length === 0 || isGenerating}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isGenerating ? 'Generating SOA...' : 'Generate SOA'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                console.log('🚀 BUTTON CLICKED!');
                generatePlan();
              }}
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

      <CardContent className="space-y-6">
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
                      placeholder="Patient's subjective symptoms, history, and owner observations..."
                      value={soapNote.subjective}
                      onChange={(e) => updateSOAPNote('subjective', e.target.value)}
                      className="min-h-[60px] resize-none border-0 focus:ring-0 p-0 text-sm"
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
                      placeholder="Objective findings, vital signs, physical examination results..."
                      value={soapNote.objective}
                      onChange={(e) => updateSOAPNote('objective', e.target.value)}
                      className="min-h-[60px] resize-none border-0 focus:ring-0 p-0 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="relative flex items-start">
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
                        <Textarea
                          placeholder={`Enter ${section.title.toLowerCase()} details...`}
                          value={section.content}
                          onChange={(e) => updatePlanSection(index, e.target.value)}
                          className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm"
                        />
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
      </CardContent>
    </Card>
  );
};
