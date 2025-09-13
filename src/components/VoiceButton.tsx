import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { motion } from "framer-motion";
import { useMedoraStore } from "@/stores/medoraStore";
import { mockASR, mockHistory, mockSuggest } from "@/mocks/seeds";
import { useEffect } from "react";

export const VoiceButton = () => {
  const { 
    isRecording, 
    setRecording, 
    addTranscriptChunk, 
    currentPatient,
    detectedEntities,
    setHistoryMatches,
    setSuggestions
  } = useMedoraStore();

  // Update context when entities change
  useEffect(() => {
    if (detectedEntities.length > 0 && currentPatient) {
      // Find matching history records
      const matches = mockHistory.find(currentPatient.id, detectedEntities);
      setHistoryMatches(matches);
      
      // Get relevant suggestions
      const suggestions = mockSuggest.forContext(detectedEntities);
      setSuggestions(suggestions);
    }
  }, [detectedEntities, currentPatient, setHistoryMatches, setSuggestions]);

  const handleToggleRecording = () => {
    if (!isRecording) {
      // Start recording
      setRecording(true);
      mockASR.start((chunk) => {
        addTranscriptChunk(chunk);
      });
    } else {
      // Stop recording
      setRecording(false);
      mockASR.stop();
    }
  };

  return (
    <div className="text-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleToggleRecording}
          size="lg"
          className={`
            relative h-16 w-16 rounded-full p-0 transition-all duration-300
            ${isRecording 
              ? 'bg-voice-recording hover:bg-voice-recording/90 shadow-voice' 
              : 'bg-primary hover:bg-primary/90'
            }
          `}
        >
          <motion.div
            className="flex items-center justify-center"
            animate={isRecording ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 360]
            } : {}}
            transition={{ 
              duration: 2,
              repeat: isRecording ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {isRecording ? (
              <Square className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Mic className="h-6 w-6 text-primary-foreground" />
            )}
          </motion.div>
          
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-voice-recording"
              animate={{
                scale: [1, 1.4],
                opacity: [0.8, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          )}
        </Button>
      </motion.div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-foreground">
          {isRecording ? "Recording..." : "Start Voice Recording"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {isRecording 
            ? "Click to stop recording" 
            : "Click to begin capturing consultation notes"
          }
        </p>
      </div>
    </div>
  );
};