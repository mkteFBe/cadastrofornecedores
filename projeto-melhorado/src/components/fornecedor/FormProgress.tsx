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
      {/* Mobile: barra simples */}
      <div className="sm:hidden mb-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium text-brand-navy">{steps[currentStep - 1]}</span>
          <span>Etapa {currentStep} de {totalSteps}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: steps com bullets */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Linha conectora antes */}
              {index > 0 && (
                <div className={cn(
                  "flex-1 h-px mx-2 transition-colors duration-300",
                  isCompleted ? "bg-brand-navy" : "bg-border"
                )} />
              )}

              {/* Bullet + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200",
                  isCompleted && "bg-brand-navy text-white",
                  isCurrent && "bg-brand-red text-white ring-4 ring-brand-red/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground border border-border"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span className={cn(
                  "text-[10px] text-center whitespace-nowrap",
                  isCurrent ? "text-brand-navy font-semibold" : "text-muted-foreground"
                )}>
                  {step}
                </span>
              </div>

              {/* Linha conectora depois (last step) */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-px mx-2 transition-colors duration-300",
                  isCompleted ? "bg-brand-navy" : "bg-border"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
