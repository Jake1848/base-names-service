'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Loader2, Rocket } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export type RegistrationStep = 'idle' | 'committing' | 'waiting' | 'registering' | 'complete';

interface RegistrationProgressProps {
  step: RegistrationStep;
  waitTimeRemaining: number;
}

export function RegistrationProgress({ step, waitTimeRemaining }: RegistrationProgressProps) {
  const steps = [
    { key: 'committing', label: 'Creating Commitment', icon: Loader2 },
    { key: 'waiting', label: 'Waiting Period', icon: Clock },
    { key: 'registering', label: 'Finalizing Registration', icon: Rocket },
  ];

  const getCurrentStepIndex = () => {
    switch (step) {
      case 'committing': return 0;
      case 'waiting': return 1;
      case 'registering': return 2;
      case 'complete': return 3;
      default: return -1;
    }
  };

  const currentStepIndex = getCurrentStepIndex();
  const progress = step === 'waiting'
    ? 33 + ((60 - waitTimeRemaining) / 60) * 33
    : currentStepIndex * 33;

  if (step === 'idle') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-foreground">
            {step === 'complete' ? 'Registration Complete!' : 'Registration in Progress...'}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = index < currentStepIndex;
          const Icon = stepItem.icon;

          return (
            <div key={stepItem.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2
                    ${isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'}
                  `}
                >
                  {isComplete ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.div>
                <span className={`
                  text-xs text-center
                  ${isActive ? 'font-semibold text-foreground' : 'text-muted-foreground'}
                `}>
                  {stepItem.label}
                </span>
                {isActive && stepItem.key === 'waiting' && waitTimeRemaining > 0 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-primary font-mono mt-1"
                  >
                    {waitTimeRemaining}s
                  </motion.span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  h-[2px] flex-1 mx-2
                  ${isComplete ? 'bg-green-500' : 'bg-border'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Step Message */}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm"
      >
        {step === 'committing' && (
          <p><span className="font-semibold">Step 1/3:</span> Creating your commitment on the blockchain...</p>
        )}
        {step === 'waiting' && (
          <p>
            <span className="font-semibold">Step 2/3:</span> Anti-frontrunning protection active.
            <span className="text-muted-foreground"> Waiting {waitTimeRemaining} seconds...</span>
          </p>
        )}
        {step === 'registering' && (
          <p><span className="font-semibold">Step 3/3:</span> Finalizing your domain registration...</p>
        )}
        {step === 'complete' && (
          <p className="text-green-600 dark:text-green-400 font-semibold">
            ✅ Registration complete! Your domain is now yours.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
