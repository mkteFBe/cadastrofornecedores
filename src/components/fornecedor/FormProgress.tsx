import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function FormProgress({ currentStep, totalSteps, steps }: FormProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex flex-col items-center flex-1 relative">
              {/* Linha conectora esquerda */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute top-4 right-1/2 left-0 h-px',
                    isCompleted || isCurrent ? 'bg-brand-navy' : 'bg-border'
                  )}
                />
              )}
              {/* Linha conectora direita */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-4 left-1/2 right-0 h-px',
                    isCompleted ? 'bg-brand-navy' : 'bg-border'
                  )}
                />
              )}

              {/* Círculo */}
              <div
                className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200',
                  isCompleted && 'bg-brand-navy text-white',
                  isCurrent && 'bg-brand-navy text-white ring-4 ring-brand-navy/15',
                  !isCompleted && !isCurrent && 'bg-white border-2 border-border text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'mt-2 text-[11px] text-center leading-tight hidden sm:block max-w-[70px]',
                  isCurrent ? 'text-brand-navy font-semibold' : 'text-muted-foreground',
                  isCompleted && 'text-brand-navy'
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progresso mobile */}
      <div className="sm:hidden mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-brand-navy">{steps[currentStep - 1]}</span>
        <span>{currentStep} de {totalSteps}</span>
      </div>
    </div>
  );
}
