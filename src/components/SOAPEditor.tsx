import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator } from "lucide-react";
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
        </>
      </CardContent>
    </Card>
  );
};