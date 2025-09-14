import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMedoraStore } from "@/stores/medoraStore";
import { useToast } from "@/hooks/use-toast";
import { transcribeAudio } from "@/lib/api";
import { useState, useRef, useEffect } from "react";

export const VoiceButton = () => {
  const { 
    isRecording, 
    setRecording, 
    addTranscriptChunk, 
    currentPatient
  } = useMedoraStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('🎤 Microphone access granted');
      
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log('🎤 Data available:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
          console.log('🎤 Total chunks:', chunksRef.current.length);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing...');
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        console.log('🎤 Audio blob created:', audioBlob.size, 'bytes');
        
        if (audioBlob.size > 0) {
          await processRecording(audioBlob);
        } else {
          console.error('🎤 No audio data recorded');
          toast({
            title: "Recording Error",
            description: "No audio data was captured. Please try again.",
            variant: "destructive"
          });
          setIsProcessing(false);
        }
      };

      mediaRecorderRef.current.start(); // Don't pass timeslice
      setRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('🎤 Recording started successfully');
      toast({
        title: "🎤 Recording Started",
        description: "Voice recording is now active. Click the red button to stop.",
      });

    } catch (error) {
      console.error('🎤 Error starting recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions and try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      console.log('🛑 MediaRecorder stopped');
    }
    
    setRecording(false);
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop all audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Audio track stopped');
      });
      streamRef.current = null;
    }
    
    console.log('🛑 Recording cleanup completed');
    
    toast({
      title: "🛑 Recording Stopped",
      description: "Recording stopped. Processing your audio...",
      duration: 3000,
    });
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    console.log('🔄 Processing recording...', audioBlob.size, 'bytes');
    
    try {
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
      
      console.log('🔄 Created audio file:', audioFile.name, 'Size:', audioFile.size);
      
      // Show processing message
      toast({
        title: "Processing Recording",
        description: `Transcribing ${recordingTime}s of audio...`,
      });
      
      const result = await transcribeAudio(audioFile);
      console.log('✅ Transcription result:', result);
      
      const transcriptChunk = {
        id: `chunk_${Date.now()}`,
        text: result.text,
        entities: [],
        timestamp: Date.now(),
        language: result.language,
        duration: result.duration
      };

      addTranscriptChunk(transcriptChunk);
      setTranscript(result.text);

      toast({
        title: "Transcription Complete",
        description: `Successfully transcribed ${recordingTime}s of audio (${result.language})`,
      });

    } catch (error) {
      console.error('❌ Error processing recording:', error);
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "Failed to transcribe recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setRecordingTime(0);
      console.log('🔄 Processing completed');
    }
  };

  const handleToggleRecording = () => {
    console.log('🎤 Button clicked! Current state:', { isRecording, isProcessing });
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);
  
  return (
    <div className="text-center">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          size="lg"
          className={`
            relative h-20 w-20 rounded-full p-0 transition-all duration-300
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
              : isProcessing
              ? 'bg-muted hover:bg-muted'
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
            {isProcessing ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : isRecording ? (
              <Square className="h-8 w-8 text-white" />
            ) : (
              <Mic className="h-8 w-8 text-primary-foreground" />
            )}
          </motion.div>
          
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-red-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 0.3, 0.8]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </Button>
      </motion.div>
      
      <div className="mt-4">
        <p className="text-lg font-semibold text-foreground">
          {isProcessing 
            ? "Processing..." 
            : isRecording 
            ? `Recording... ${formatTime(recordingTime)}` 
            : "Start Recording"
          }
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isProcessing
            ? "Transcribing your recording with Whisper AI"
            : isRecording 
            ? "Click the RED button to STOP recording" 
            : "Click the microphone to START recording"
          }
        </p>
        
        {/* Recording status indicator */}
        {isRecording && (
          <div className="mt-4 flex items-center justify-center gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-700 font-bold">🔴 LIVE RECORDING</span>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        )}
        
        {/* Processing status indicator */}
        {isProcessing && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">PROCESSING WITH AI</span>
          </div>
        )}
      </div>
    </div>
  );
};