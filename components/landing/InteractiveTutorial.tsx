'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TutorialStep[] = [
  {
    title: 'Welcome to Lore!',
    description: 'Discover how to protect your creative work and earn from remixes using blockchain.',
  },
  {
    title: 'AI-Powered Features',
    description: 'Use our AI tools to generate titles, enhance descriptions, and optimize your content.',
  },
  {
    title: 'Mint Your Assets',
    description: 'Click here to register your first IP asset on the blockchain and start earning royalties.',
  },
  {
    title: 'Track Your Earnings',
    description: 'View your dashboard to see royalties from derivatives and manage your assets.',
  },
];

export default function InteractiveTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative max-w-md w-full glass-enhanced rounded-2xl p-6 shadow-2xl"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                {currentStep + 1}
              </div>
              <p className="text-sm text-slate-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
            <p className="text-slate-300 leading-relaxed">{step.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Skip tutorial
            </button>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-6 py-2"
                >
                  Back
                </Button>
              )}
              <Button
                variant="glow"
                onClick={handleNext}
                className="px-6 py-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2 mt-6 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 $${
                  index === currentStep
                    ? 'w-8 bg-amber-500'
                    : index < currentStep
                    ? 'w-1.5 bg-green-500'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
