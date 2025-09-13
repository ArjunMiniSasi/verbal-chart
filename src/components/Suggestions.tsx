import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lightbulb, Plus, Pill, FileText, Stethoscope } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { Suggestion } from "@/mocks/seeds";
import { motion, AnimatePresence } from "framer-motion";

export const Suggestions = () => {
  const { suggestions, updateSOAPNote, soapNote } = useMedoraStore();

  const getIconForType = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'diagnostic': return <Stethoscope className="h-4 w-4" />;
      case 'protocol': return <FileText className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'medication': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'diagnostic': return 'bg-green-50 text-green-700 border-green-200';  
      case 'protocol': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    // Add to plan section of SOAP note
    const currentPlan = soapNote.plan;
    const newPlanItem = `• ${suggestion.title}: ${suggestion.description}`;
    const updatedPlan = currentPlan 
      ? `${currentPlan}\n${newPlanItem}`
      : newPlanItem;
    
    updateSOAPNote('plan', updatedPlan);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-medical-warning" />
          Smart Suggestions
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {suggestions.length} available
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <AnimatePresence>
            {suggestions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No suggestions available yet.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Context-aware suggestions will appear as the consultation progresses.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-medical-warning">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getIconForType(suggestion.type)}
                              <h4 className="font-semibold text-sm text-foreground">
                                {suggestion.title}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getColorForType(suggestion.type)}`}
                              >
                                {suggestion.type}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {suggestion.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.category}
                              </Badge>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySuggestion(suggestion)}
                                className="gap-1 h-7 text-xs"
                              >
                                <Plus className="h-3 w-3" />
                                Add to Plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};