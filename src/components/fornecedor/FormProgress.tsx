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
              {index > 0 && (
                <div className="absolute top-3.5 right-1/2 left-0 h-px"
                  style={{ background: isCompleted ? "var(--fb-red)" : "var(--fb-mid-gray)" }} />
              )}
              {index < steps.length - 1 && (
                <div className="absolute top-3.5 left-1/2 right-0 h-px"
                  style={{ background: isCompleted ? "var(--fb-red)" : "var(--fb-mid-gray)" }} />
              )}

              <div
                className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-200"
                style={{
                  background: isCompleted || isCurrent ? "var(--fb-red)" : "#fff",
                  border: `2px solid ${isCompleted || isCurrent ? "var(--fb-red)" : "var(--fb-mid-gray)"}`,
                  color: isCompleted || isCurrent ? "#fff" : "var(--fb-slate-gray)",
                  boxShadow: isCurrent ? "0 0 0 3px rgba(227,0,15,0.15)" : "none",
                }}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : stepNumber}
              </div>

              <span
                className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-center hidden sm:block max-w-[68px] leading-tight"
                style={{ color: isCurrent ? "var(--fb-red)" : isCompleted ? "var(--fb-blue)" : "var(--fb-slate-gray)" }}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      <div className="sm:hidden mt-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fb-red)" }}>
          {steps[currentStep - 1]}
        </span>
        <span className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>{currentStep} de {totalSteps}</span>
      </div>
    </div>
  );
}
