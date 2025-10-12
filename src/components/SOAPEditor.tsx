import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
// Removed import - now using server API directly

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
    console.log('🚀 Starting plan generation with Firebase vector search...');

    try {
      const transcriptText = transcript.map(chunk => chunk.text).join(' ');
      console.log('🚀 Transcript text:', transcriptText);
      console.log('🚀 Transcript length:', transcript.length);
      console.log('🚀 Assessment text:', soapNote.assessment);
      console.log('🚀 Assessment length:', soapNote.assessment.length);
      
      // Create a comprehensive query for vector search
      const searchQuery = `${soapNote.assessment} ${transcriptText}`.trim();
      console.log('🔍 Vector search query:', searchQuery);
      console.log('🔍 Query length:', searchQuery.length);
      
      // Call the server API for vector search with LLM processing
      const response = await fetch(`${API_BASE_URL}/api/vector-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5
        }),
      });

      console.log('📡 Vector search response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Vector search response data:', data);
      console.log('📋 Has llmResponse:', !!data.llmResponse);
      console.log('📋 Results count:', data.results ? data.results.length : 0);
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Use the LLM response if available, otherwise use the raw results
      let generatedPlan;
      if (data.llmResponse) {
        generatedPlan = data.llmResponse;
        console.log('🤖 Using LLM processed response');
        console.log('🤖 LLM response length:', generatedPlan.length);
        console.log('🤖 LLM response preview:', generatedPlan.substring(0, 200) + '...');
        
        // Clean up the formatting for better UI display
        console.log('🧹 Before cleanup:', generatedPlan.substring(0, 100) + '...');
        generatedPlan = cleanPlanFormatting(generatedPlan);
        console.log('🧹 After cleanup:', generatedPlan.substring(0, 100) + '...');
      } else if (data.results && data.results.length > 0) {
        // Fallback: format the raw results
        generatedPlan = data.results.map((result, index) => 
          `${index + 1}. ${result.drugName || result.id} (Similarity: ${result.similarity.toFixed(3)})\n   ${result.content}`
        ).join('\n\n');
        console.log('📋 Using raw results as fallback');
        console.log('📋 Fallback plan length:', generatedPlan.length);
      } else {
        throw new Error('No relevant drug information found for the assessment');
      }
      
      console.log('🔍 Generated plan with Firebase vector search:', generatedPlan);
      console.log('🔍 Plan length:', generatedPlan.length);
      
      // Update the SOAP note with the generated plan
      updateSOAPNote('plan', generatedPlan);
      
      // Debug: Check if the plan was updated
      console.log('✅ Plan updated in store');
      console.log('✅ Current soapNote.plan after update:', soapNote.plan);
      
      toast({
        title: "Plan Generated Successfully",
        description: "Treatment plan has been generated using Firebase vector search of veterinary drug index.",
        variant: "default"
      });

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

  // Calculate dynamic height for textarea based on content
  const calculateTextareaHeight = (text: string) => {
    if (!text || text.trim().length === 0) {
      return '120px'; // Collapsed state when empty
    }
    
    // Count lines in the text
    const lines = text.split('\n').length;
    const minHeight = 120; // Minimum height
    const lineHeight = 24; // Approximate line height
    const padding = 32; // Padding for the textarea
    
    // Calculate height based on content
    const calculatedHeight = Math.max(minHeight, (lines * lineHeight) + padding);
    const maxHeight = 500; // Maximum height to prevent excessive expansion
    
    return `${Math.min(calculatedHeight, maxHeight)}px`;
  };

  // Clean up plan formatting for better UI display
  const cleanPlanFormatting = (plan: string) => {
    if (!plan) return plan;
    
    console.log('🧹 cleanPlanFormatting called with:', plan.substring(0, 100) + '...');
    
    // Remove ALL markdown formatting for clean display in textarea
    let cleaned = plan
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove **bold** formatting
      .replace(/\*([^*]+)\*/g, '$1') // Remove *italic* formatting
      .replace(/###+/g, '') // Remove multiple # headers
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines to double
      .replace(/\*\*Treatment Plan for.*?:\*\*/g, '') // Remove verbose headers
      .replace(/\*\*Diagnosis:\*\*.*?\n/g, '') // Remove diagnosis sections
      .replace(/\*\*Administration:\*\*.*?\n/g, '') // Remove administration details
      .trim();
    
    // Ensure proper spacing around bullet points
    cleaned = cleaned
      .replace(/\n-\s/g, '\n- ') // Standardize bullet points
      .replace(/\n\*\s/g, '\n- ') // Convert * to - for consistency
      .replace(/\n\d+\.\s/g, '\n- '); // Convert numbered lists to bullets
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');
    
    console.log('🧹 cleanPlanFormatting returning:', cleaned.substring(0, 100) + '...');
    return cleaned;
  };

  // Format plan text with bold headings and medication names
  const formatPlanText = (plan: string) => {
    if (!plan) return plan;
    
    // First clean the text
    let formatted = cleanPlanFormatting(plan);
    
    // Make section headings bold and larger
    formatted = formatted
      .replace(/^(Plan:)$/gm, '<strong style="font-size: 16px; font-weight: 700;">$1</strong>')
      .replace(/^(Follow-up:)$/gm, '<strong style="font-size: 16px; font-weight: 700;">$1</strong>')
      .replace(/^(Follow up:)$/gm, '<strong style="font-size: 16px; font-weight: 700;">$1</strong>');
    
    // Make medication names bold and larger
    formatted = formatted
      .replace(/^- (Metoclopramide):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:')
      .replace(/^- (Famotidine):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:')
      .replace(/^- (Maropitant):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:')
      .replace(/^- (Fluid therapy):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:')
      .replace(/^- (Diet):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:')
      .replace(/^- ([A-Z][a-zA-Z\s]+):/gm, '- <strong style="font-size: 14px; font-weight: 600;">$1</strong>:');
    
    // Convert line breaks to HTML
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  };

  // Removed complex plan parsing functions - now using single text field


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

        {/* Plan Section - Single Dynamic Text Field */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-green-200">
            <Target className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Treatment Plan</h2>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Firebase Vector Search
            </Badge>
          </div>
          
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-green-300"></div>
            
            <div className="relative flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center z-10">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 text-lg">Plan</h3>
                  {wordCount(soapNote.plan) > 0 && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      {wordCount(soapNote.plan)} words
                    </Badge>
                  )}
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div 
                    className="resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ 
                      height: calculateTextareaHeight(soapNote.plan),
                      minHeight: '120px',
                      maxHeight: '500px',
                      overflow: soapNote.plan && soapNote.plan.split('\n').length > 20 ? 'auto' : 'hidden',
                      fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    onInput={(e) => updateSOAPNote('plan', e.currentTarget.textContent || '')}
                    dangerouslySetInnerHTML={{
                      __html: formatPlanText(soapNote.plan)
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-md border border-green-200 mt-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-green-600" />
                    <span>
                      <strong>Firebase Vector Search Treatment Plan:</strong> This section will be populated using Firebase vector search 
                      of our veterinary drug index to ensure accurate dosages and medication recommendations based on the assessment above.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
