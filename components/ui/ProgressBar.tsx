'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export function ProgressBar({ steps, currentStep, onStepClick }: ProgressBarProps) {
  return (
    <div className="relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-0 right-0 h-1 bg-charcoal/30 rounded-full">
        <motion.div
          className="h-full bg-gradient-to-r from-soul-red to-pulse-red rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      
      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <motion.div
              key={step.id}
              className="flex flex-col items-center"
            >
              {/* Step Circle */}
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-soul-red border-2 border-soul-red'
                    : isActive
                    ? 'bg-charcoal border-2 border-soul-red shadow-lg shadow-soul-red/50'
                    : 'bg-charcoal border-2 border-white/20'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Check className="w-5 h-5 text-ghost-white" />
                  </motion.div>
                ) : (
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-soul-red' : 'text-silver-dust'
                  }`}>
                    {index + 1}
                  </span>
                )}
              </motion.div>
              
              {/* Step Label */}
              <div className="mt-3 text-center max-w-[120px]">
                <motion.p
                  className={`text-sm font-medium transition-colors ${
                    isActive ? 'text-ghost-white' : isCompleted ? 'text-soul-red' : 'text-silver-dust'
                  }`}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
                >
                  {step.label}
                </motion.p>
                
                {step.description && (
                  <motion.p
                    className="text-xs text-silver-dust/70 mt-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: isActive ? 1 : 0.5, y: 0 }}
                  >
                    {step.description}
                  </motion.p>
                )}
              </div>
              

            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
