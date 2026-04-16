import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FornecedorFormData, REGIMES_TRIBUTARIOS } from '@/types/fornecedor';

interface StepRegimeTributarioProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

export function StepRegimeTributario({ formData, onChange, errors }: StepRegimeTributarioProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Etapa 3 — Regime tributário</h3>
      
      <div className="space-y-3">
        <Label>
          Regime tributário <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.regime_tributario}
          onValueChange={(value) => onChange('regime_tributario', value)}
          className="flex flex-col space-y-2"
        >
          {REGIMES_TRIBUTARIOS.map((regime) => (
            <div key={regime} className="flex items-center space-x-2">
              <RadioGroupItem value={regime} id={`regime-${regime}`} />
              <Label htmlFor={`regime-${regime}`} className="font-normal cursor-pointer">
                {regime}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.regime_tributario && (
          <p className="text-sm text-destructive">{errors.regime_tributario}</p>
        )}
      </div>
    </div>
  );
}
