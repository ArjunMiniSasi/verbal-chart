import { useState, useEffect } from 'react';
import { Mic, FileText, CheckCircle, Sparkles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationStep {
  id: number;
  stage: 'recording' | 'transcribing' | 'generating' | 'complete';
  title: string;
  description: string;
}

const VoiceToSoapAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps: AnimationStep[] = [
    {
      id: 1,
      stage: 'recording',
      title: 'Recording Voice',
      description: 'AI listens to your consultation in real-time'
    },
    {
      id: 2,
      stage: 'transcribing',
      title: 'Transcribing Speech',
      description: 'Converting voice to text with 99.8% accuracy'
    },
    {
      id: 3,
      stage: 'generating',
      title: 'Generating SOAP',
      description: 'Structuring notes into clinical format'
    },
    {
      id: 4,
      stage: 'complete',
      title: 'Ready to Review',
      description: 'Complete SOAP notes in seconds'
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isAnimating, steps.length]);

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'recording':
        return <Mic className="w-8 h-8" />;
      case 'transcribing':
        return <Volume2 className="w-8 h-8" />;
      case 'generating':
        return <Sparkles className="w-8 h-8" />;
      case 'complete':
        return <FileText className="w-8 h-8" />;
      default:
        return <Mic className="w-8 h-8" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'recording':
        return 'from-red-500 to-pink-500';
      case 'transcribing':
        return 'from-blue-500 to-cyan-500';
      case 'generating':
        return 'from-purple-500 to-indigo-500';
      case 'complete':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Animation Visual */}
        <div className="relative h-[500px] bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl overflow-hidden shadow-2xl">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${getStageColor(steps[currentStep].stage)} opacity-20`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          {/* Main Content */}
          <div className="relative h-full flex flex-col items-center justify-center p-8">
            {/* Central Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`w-32 h-32 bg-gradient-to-br ${getStageColor(steps[currentStep].stage)} rounded-full flex items-center justify-center text-white shadow-2xl mb-8`}
              >
                {getStageIcon(steps[currentStep].stage)}
              </motion.div>
            </AnimatePresence>

            {/* Stage Title */}
            <AnimatePresence mode="wait">
              <motion.h3
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-2xl font-bold text-white mb-3 text-center"
              >
                {steps[currentStep].title}
              </motion.h3>
            </AnimatePresence>

            {/* Stage Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-gray-300 text-center max-w-md"
              >
                {steps[currentStep].description}
              </motion.p>
            </AnimatePresence>

            {/* Animated Waveform (for recording stage) */}
            {steps[currentStep].stage === 'recording' && (
              <div className="flex gap-1 mt-8">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gradient-to-t from-red-500 to-pink-500 rounded-full"
                    animate={{
                      height: [20, Math.random() * 60 + 20, 20],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Typing Animation (for transcribing stage) */}
            {steps[currentStep].stage === 'transcribing' && (
              <div className="mt-8 w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                  <p className="text-white/80 text-sm mt-2">
                    "The patient presents with..."
                  </p>
                </div>
              </div>
            )}

            {/* Sparkles Animation (for generating stage) */}
            {steps[currentStep].stage === 'generating' && (
              <div className="mt-8 relative w-full h-20">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Checkmark Animation (for complete stage) */}
            {steps[currentStep].stage === 'complete' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="mt-8"
              >
                <CheckCircle className="w-16 h-16 text-green-400" />
              </motion.div>
            )}
          </div>

          {/* Progress Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentStep(index);
                  setIsAnimating(false);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-white w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => {
                setCurrentStep(index);
                setIsAnimating(false);
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    index === currentStep
                      ? `bg-gradient-to-br ${getStageColor(step.stage)} text-white`
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {getStageIcon(step.stage)}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-lg font-bold mb-1 ${
                      index === currentStep ? 'text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-sm ${
                      index === currentStep ? 'text-gray-700' : 'text-gray-500'
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                {index === currentStep && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceToSoapAnimation;
