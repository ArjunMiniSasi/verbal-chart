import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Calendar, FileText } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { motion, AnimatePresence } from "framer-motion";

export const HistoryMatches = () => {
  const { historyMatches } = useMedoraStore();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-medical-secondary" />
          Related History
          {historyMatches.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {historyMatches.length} match{historyMatches.length !== 1 ? 'es' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <AnimatePresence>
            {historyMatches.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No matching past episodes found.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Related history will appear as entities are detected in the transcript.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {historyMatches.map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-medical-secondary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {record.date}
                            </span>
                          </div>
                          <div className="flex gap-1 flex-wrap">
                            {record.entities.slice(0, 3).map((entity, idx) => (
                              <Badge 
                                key={idx}
                                variant="outline" 
                                className="text-xs"
                              >
                                {entity}
                              </Badge>
                            ))}
                            {record.entities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.entities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-2 text-foreground">
                          {record.chiefComplaint}
                        </h4>
                        
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-medical-secondary">
                              Diagnosis:
                            </span>
                            <p className="text-sm text-foreground">
                              {record.diagnosis}
                            </p>
                          </div>
                          
                          <div>
                            <span className="text-xs font-medium text-medical-secondary">
                              Summary:
                            </span>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {record.summary}
                            </p>
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