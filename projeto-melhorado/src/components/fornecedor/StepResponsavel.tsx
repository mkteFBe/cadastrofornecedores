import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FornecedorFormData } from '@/types/fornecedor';

interface StepResponsavelProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

export function StepResponsavel({ formData, onChange }: StepResponsavelProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Etapa 5 — Responsável</h3>
      
      <div className="space-y-2">
        <Label htmlFor="responsavel">Responsável</Label>
        <Input
          id="responsavel"
          value={formData.responsavel}
          onChange={(e) => onChange('responsavel', e.target.value)}
          placeholder="Nome do responsável pelo preenchimento"
        />
      </div>
    </div>
  );
}
