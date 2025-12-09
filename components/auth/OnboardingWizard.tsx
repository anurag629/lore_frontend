'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, CheckCircle2, Wallet, Shield, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import GlassCard from '@/components/ui/GlassCard';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: () => void;
}

export default function OnboardingWizard({ isOpen, onClose, onConnect }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Lore",
      description: "Your journey to decentralized IP management starts here"
    },
    {
      title: "Choose Your Wallet", 
      description: "Select a wallet to connect with Lore"
    },
    {
      title: "Connect & Sign",
      description: "Securely connect your wallet to Lore"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onConnect?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl"
        >
          <GlassCard enhanced className="relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-300">{steps[currentStep].description}</p>
            </div>

            <div className="mb-8 text-slate-300">
              {currentStep === 0 && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-slate-800/50">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Free to Start</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-slate-800/50">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold">AI-Powered</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-slate-800/50">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Automatic Royalties</p>
                  </div>
                </div>
              )}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <p className="mb-4">Choose a wallet to get started</p>
                  <button className="w-full p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-amber-500 transition-all">
                    <div className="flex items-center justify-between">
                      <span>MetaMask</span>
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p>Ready to connect! Click the button below to proceed.</p>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Shield className="w-5 h-5 text-green-400 inline mr-2" />
                    <span className="text-green-300">100% Secure - We never ask for private keys</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Back
                </Button>
              )}
              <Button variant="glow" onClick={handleNext}>
                {currentStep === steps.length - 1 ? "Connect Wallet" : "Next"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex gap-2 mt-6 justify-center">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep ? 'w-8 bg-amber-500' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}