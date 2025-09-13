import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock } from "lucide-react";
import { useMedoraStore } from "@/stores/medoraStore";
import { motion, AnimatePresence } from "framer-motion";

export const Transcript = () => {
  const { transcript, isRecording } = useMedoraStore();

  const highlightEntities = (text: string, entities: Array<{ text: string; type: string; confidence: number }>) => {
    if (!entities.length) return text;
    
    let highlightedText = text;
    entities.forEach((entity) => {
      const regex = new RegExp(`(${entity.text})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<mark class="entity-highlight entity-${entity.type}">$1</mark>`
      );
    });
    
    return highlightedText;
  };

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor(timestamp / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-medical-primary" />
          Live Transcript
          {isRecording && (
            <Badge variant="secondary" className="ml-2 animate-pulse">
              Recording
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-6 pb-6">
          <AnimatePresence>
            {transcript.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center py-12">
                <div>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isRecording 
                      ? "Listening... speak clearly into your microphone" 
                      : "No transcript yet. Start recording to begin."
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {transcript.map((chunk, index) => (
                  <motion.div
                    key={chunk.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-l-2 border-medical-primary/20 pl-4 py-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(chunk.timestamp)}
                      </span>
                      {chunk.entities.length > 0 && (
                        <div className="flex gap-1">
                          {chunk.entities.map((entity, idx) => (
                            <Badge 
                              key={idx}
                              variant="outline" 
                              className={`text-xs entity-${entity.type}`}
                            >
                              {entity.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p 
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightEntities(chunk.text, chunk.entities) 
                      }}
                    />
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