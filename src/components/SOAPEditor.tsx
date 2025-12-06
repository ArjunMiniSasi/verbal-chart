import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Save, Loader2, Stethoscope, ClipboardList, Brain, Target, Pill, Calculator, FileSearch, Activity } from "lucide-react";
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
      // Cloud Functions: /generateSoap (no /api/ prefix, camelCase)
      const endpoint = API_BASE_URL.includes('cloudfunctions.net') ? '/generateSoap' : '/api/generate-soap';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

      // Update the SOAP note with the generated data (SOA only, NOT plan)
      // The backend returns { soapNote: { subjective, objective, assessment, plan } }
      const soapData = data.soapNote || data;
      updateSOAPNote('subjective', soapData.subjective || '');
      updateSOAPNote('objective', soapData.objective || '');
      updateSOAPNote('assessment', soapData.assessment || '');
      // DO NOT update plan here - plan should only be generated via Generate Plan button

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

  const generateGroundedNotes = async () => {
    // Validate transcript
    const transcriptText = typeof transcript === 'string' ? transcript : String(transcript || '');
    if (!transcriptText || transcriptText.trim().length === 0) {
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

    // Note: This function is kept for potential future use but the button has been removed
    try {
      // Prepare request body
      const requestBody = {
        transcript: transcriptText.trim(),
        meta: {
          patientId: currentPatient.id,
          species: currentPatient.pet?.species?.toLowerCase() || 'dog',
          weightKg: currentPatient.pet?.weight || 8
        }
      };

      console.log('📤 Sending grounded note request:', {
        transcriptLength: requestBody.transcript.length,
        transcriptPreview: requestBody.transcript.substring(0, 100) + '...',
        meta: requestBody.meta
      });

      // Step 1: Generate grounded SOAP note
      const groundedResponse = await fetch(`${API_BASE_URL}/api/grounded-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!groundedResponse.ok) {
        const errorData = await groundedResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${groundedResponse.status}`);
      }

      const groundedData = await groundedResponse.json();
      console.log('📋 Grounded SOAP response:', groundedData);

      // Check if review is required
      if (groundedData.status === 'review_required' || groundedData.status === 'med_review_required') {
        toast({
          title: "Review Required",
          description: groundedData.reason || "Some claims need review before generating plan.",
          variant: "default"
        });
        // Still update SOAP with what we have, but show warning
      }

      // Update SOAP note with grounded results
      if (groundedData.soap) {
        updateSOAPNote('subjective', groundedData.soap.subjective || '');
        updateSOAPNote('objective', groundedData.soap.objective || '');
        updateSOAPNote('assessment', groundedData.soap.assessment || '');
      }

      toast({
        title: "Grounded SOAP Generated",
        description: "SOAP note has been generated with evidence grounding. Generating plan...",
      });

      // Step 2: Generate grounded plan using the grounded SOA
      const planResponse = await fetch(`${API_BASE_URL}/api/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: groundedData.soap?.subjective || soapNote.subjective,
          objective: groundedData.soap?.objective || soapNote.objective,
          assessment: groundedData.soap?.assessment || soapNote.assessment,
          k: 5
        }),
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Plan generation failed: ${planResponse.status}`);
      }

      const planData = await planResponse.json();
      console.log('📋 Grounded plan response:', planData);

      if (planData.plan) {
        let generatedPlan = planData.plan;
        generatedPlan = cleanPlanFormatting(generatedPlan);
        updateSOAPNote('plan', generatedPlan);

        toast({
          title: "Grounded Plan Generated Successfully",
          description: planData.plumb_available 
            ? "Treatment plan generated using Plumb's Veterinary Drug Handbook with grounded evidence."
            : "Treatment plan generated (Plumb data not available).",
          variant: "default"
        });
      } else {
        throw new Error(planData.message || 'No plan generated');
      }

    } catch (error) {
      console.error('Error generating grounded notes:', error);
      toast({
        title: "Error generating grounded notes",
        description: error instanceof Error ? error.message : "Please try again or check your connection.",
        variant: "destructive"
      });
    }
  };

  const generatePlan = async () => {
    if (!soapNote.assessment || soapNote.assessment.trim().length === 0) {
      toast({
        title: "Assessment required",
        description: "Please complete the Assessment section first (use Generate SOA if needed).",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    console.log('🚀 Starting plan generation with Plumb RAG...');
    console.log('🚀 Assessment text:', soapNote.assessment);

    try {
      // Cloud Functions: /generatePlan (no /api/ prefix, camelCase)
      const endpoint = API_BASE_URL.includes('cloudfunctions.net') ? '/generatePlan' : '/api/generate-plan';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjective: soapNote.subjective,
          objective: soapNote.objective,
          assessment: soapNote.assessment,
          k: 5 // Number of Plumb references to use
        }),
      });

      console.log('📡 Generate plan response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Generate plan response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.plan) {
        throw new Error(data.message || 'No plan generated');
      }

      // Clean up the formatting for better UI display
      let generatedPlan = data.plan;
      console.log('🧹 Before cleanup:', generatedPlan.substring(0, 100) + '...');
      generatedPlan = cleanPlanFormatting(generatedPlan);
      console.log('🧹 After cleanup:', generatedPlan.substring(0, 100) + '...');
      
      // Update the SOAP note with the generated plan
      updateSOAPNote('plan', generatedPlan);
      
      console.log('✅ Plan updated in store');
      console.log('✅ Plan length:', generatedPlan.length);
      
      toast({
        title: "Plan Generated Successfully",
        description: data.plumb_available 
          ? "Treatment plan has been generated using Plumb's Veterinary Drug Handbook."
          : "Treatment plan generated (Plumb data not available, using general knowledge).",
        variant: "default"
      });

    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: "Error generating plan",
        description: error.message || "Please try again or check your connection.",
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



  const totalWords = wordCount(soapNote.subjective) + wordCount(soapNote.objective) + wordCount(soapNote.assessment) + wordCount(soapNote.plan);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-6">
        <div className="flex flex-col space-y-4">
          {/* Title and Word Count Row */}
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <FileText className="h-7 w-7 text-blue-600" />
              SOAP Note Editor
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              {totalWords} words total
            </Badge>
          </div>
          
          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={generateSOA}
              disabled={transcript.length === 0 || isGenerating}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 px-4 py-2"
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
              className="gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 px-4 py-2"
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
              className="gap-2 px-4 py-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button 
              variant="outline" 
              onClick={exportSOAP}
              className="gap-2 px-4 py-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 px-6">
        <>
            {/* Medical Record Section - Timeline Style */}
            <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-blue-200">
            <Stethoscope className="h-7 w-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Medical Record</h2>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
              SOA Generated
            </Badge>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
            {/* Timeline container */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-300"></div>
              
              {/* Subjective */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-800 text-xl">Subjective</h3>
                    {wordCount(soapNote.subjective) > 0 && (
                      <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-2 py-1">
                        {wordCount(soapNote.subjective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Textarea
                      placeholder="Patient history, symptoms, and owner concerns..."
                      value={soapNote.subjective}
                      onChange={(e) => updateSOAPNote('subjective', e.target.value)}
                      className="min-h-[100px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Objective */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <ClipboardList className="h-5 w-5 text-white" />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-800 text-xl">Objective</h3>
                    {wordCount(soapNote.objective) > 0 && (
                      <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-2 py-1">
                        {wordCount(soapNote.objective)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Textarea
                      placeholder="Physical examination findings, vital signs, and test results..."
                      value={soapNote.objective}
                      onChange={(e) => updateSOAPNote('objective', e.target.value)}
                      className="min-h-[100px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center z-10">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div className="ml-6 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-gray-800 text-xl">Assessment</h3>
                    {wordCount(soapNote.assessment) > 0 && (
                      <Badge variant="outline" className="text-sm bg-blue-50 text-blue-700 border-blue-200 px-2 py-1">
                        {wordCount(soapNote.assessment)} words
                      </Badge>
                    )}
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <Textarea
                      placeholder="Clinical assessment, diagnosis, and differential diagnoses..."
                      value={soapNote.assessment}
                      onChange={(e) => updateSOAPNote('assessment', e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Section - Only show when plan is generated */}
        {soapNote.plan && soapNote.plan.trim().length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-green-200">
              <Target className="h-7 w-7 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Treatment Plan</h2>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                Plumb RAG Generated
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
              {/* Timeline container */}
              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-green-300"></div>
                
                {/* Parse plan into sections */}
                {(() => {
                  const planText = soapNote.plan;
                  
                  // Improved parsing: look for sections with headers
                  const sections: { [key: string]: string } = {};
                  
                  // Split by common section headers
                  const diagnosisRegex = /(?:diagnosis|Diagnosis)[:\-]?\s*\n?([^\n]*(?:\n(?!\s*(?:medication|Medication|plan|Plan|follow-up|Follow-up|recheck|Recheck))[^\n]*)*)/i;
                  const medicationRegex = /(?:medication|Medication|plan|Plan|treatment|Treatment)[:\-]?\s*\n?([^\n]*(?:\n(?!\s*(?:follow-up|Follow-up|recheck|Recheck|diagnosis|Diagnosis))[^\n]*)*)/i;
                  const followUpRegex = /(?:follow-up|Follow-up|recheck|Recheck)[:\-]?\s*\n?([^\n]*(?:\n[^\n]*)*)/i;
                  
                  const diagnosisMatch = planText.match(diagnosisRegex);
                  const medicationMatch = planText.match(medicationRegex);
                  const followUpMatch = planText.match(followUpRegex);
                  
                  let diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : '';
                  let medication = medicationMatch ? medicationMatch[1].trim() : '';
                  let followUp = followUpMatch ? followUpMatch[1].trim() : '';
                  
                  // If no sections found, try to split by common patterns
                  if (!diagnosis && !medication && !followUp) {
                    // Try to find "Plan:" or "*Plan:*" section
                    const planSection = planText.match(/(?:plan|Plan)[:\-]?\s*\n?([^\n]*(?:\n(?!\s*(?:follow-up|Follow-up|recheck|Recheck))[^\n]*)*)/i);
                    if (planSection) {
                      medication = planSection[1].trim();
                    } else {
                      // If no clear sections, treat everything before "Follow-up" as medication
                      const parts = planText.split(/(?:follow-up|Follow-up|recheck|Recheck)/i);
                      if (parts.length > 0) {
                        medication = parts[0].replace(/(?:plan|Plan|medication|Medication)[:\-]?\s*/i, '').trim();
                      }
                    }
                    
                    // Extract follow-up
                    const followUpParts = planText.split(/(?:follow-up|Follow-up|recheck|Recheck)[:\-]?\s*/i);
                    if (followUpParts.length > 1) {
                      followUp = followUpParts.slice(1).join(' ').trim();
                    }
                  }
                  
                  // If still no medication found, use the whole plan (minus follow-up)
                  if (!medication && !followUp) {
                    medication = planText.trim();
                  } else if (!medication) {
                    medication = planText.split(/(?:follow-up|Follow-up|recheck|Recheck)/i)[0].trim();
                  }
                  
                  return (
                    <>
                      {/* Diagnosis - Always show */}
                      <div className="relative flex items-start mb-8">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center z-10">
                          <FileSearch className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-800 text-xl">Diagnosis</h3>
                            {wordCount(diagnosis) > 0 && (
                              <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200 px-2 py-1">
                                {wordCount(diagnosis)} words
                              </Badge>
                            )}
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Textarea
                              placeholder="Diagnosis..."
                              value={diagnosis}
                              onChange={(e) => {
                                // Update plan with new diagnosis
                                const newPlan = `Diagnosis: ${e.target.value}\n\n${medication ? `Medication: ${medication}\n\n` : 'Medication: \n\n'}${followUp ? `Follow-up: ${followUp}` : 'Follow-up: '}`;
                                updateSOAPNote('plan', newPlan);
                              }}
                              className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Medication - Always show */}
                      <div className="relative flex items-start mb-8">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center z-10">
                          <Pill className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-800 text-xl">Medication</h3>
                            {wordCount(medication) > 0 && (
                              <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200 px-2 py-1">
                                {wordCount(medication)} words
                              </Badge>
                            )}
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Textarea
                              placeholder="Medications with dosages and frequency..."
                              value={medication}
                              onChange={(e) => {
                                // Update plan with new medication
                                const newPlan = `${diagnosis ? `Diagnosis: ${diagnosis}\n\n` : 'Diagnosis: \n\n'}Medication: ${e.target.value}\n\n${followUp ? `Follow-up: ${followUp}` : 'Follow-up: '}`;
                                updateSOAPNote('plan', newPlan);
                              }}
                              className="min-h-[100px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Follow-up - Always show */}
                      <div className="relative flex items-start mb-8">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center z-10">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-6 flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-gray-800 text-xl">Follow-up</h3>
                            {wordCount(followUp) > 0 && (
                              <Badge variant="outline" className="text-sm bg-green-50 text-green-700 border-green-200 px-2 py-1">
                                {wordCount(followUp)} words
                              </Badge>
                            )}
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <Textarea
                              placeholder="Recheck timeframe and monitoring..."
                              value={followUp}
                              onChange={(e) => {
                                // Update plan with new follow-up
                                const newPlan = `${diagnosis ? `Diagnosis: ${diagnosis}\n\n` : 'Diagnosis: \n\n'}${medication ? `Medication: ${medication}\n\n` : 'Medication: \n\n'}Follow-up: ${e.target.value}`;
                                updateSOAPNote('plan', newPlan);
                              }}
                              className="min-h-[80px] resize-none border-0 focus:ring-0 p-0 text-sm leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
        </>
      </CardContent>
    </Card>
  );
};