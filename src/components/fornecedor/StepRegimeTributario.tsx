import { Label } from '@/components/ui/label';
import { FornecedorFormData, REGIMES_TRIBUTARIOS } from '@/types/fornecedor';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface StepRegimeTributarioProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

const REGIME_INFO: Record<string, string> = {
  'Lucro real': 'Tributação com base no lucro contábil ajustado. Obrigatório para empresas com receita acima de R$ 78 mi.',
  'Lucro presumido': 'Base de cálculo estimada conforme percentuais definidos por atividade. Opcional até R$ 78 mi.',
  'Simples nacional': 'Regime unificado e simplificado para micro e pequenas empresas. Faturamento até R$ 4,8 mi/ano.',
};

export function StepRegimeTributario({ formData, onChange, errors }: StepRegimeTributarioProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Regime tributário</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Selecione o enquadramento fiscal da empresa</p>
      </div>

      <div className="space-y-2">
        <Label>
          Regime <span className="text-destructive">*</span>
        </Label>

        <div className="flex flex-col gap-3">
          {REGIMES_TRIBUTARIOS.map((regime) => {
            const isSelected = formData.regime_tributario === regime;
            return (
              <button
                key={regime}
                type="button"
                onClick={() => onChange('regime_tributario', regime)}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all duration-150 w-full',
                  isSelected
                    ? 'border-brand-navy bg-brand-navy/5'
                    : 'border-border hover:border-brand-navy/40 hover:bg-muted/40'
                )}
              >
                {/* Indicador de seleção */}
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                  isSelected ? 'border-brand-navy bg-brand-navy' : 'border-border'
                )}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold',
                    isSelected ? 'text-brand-navy' : 'text-foreground'
                  )}>
                    {regime}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {REGIME_INFO[regime]}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-brand-navy flex-shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {errors.regime_tributario && (
          <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
            <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
            {errors.regime_tributario}
          </p>
        )}
      </div>
    </div>
  );
}
