import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FornecedorFormData } from '@/types/fornecedor';
import { User, Info } from 'lucide-react';

interface StepResponsavelProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

export function StepResponsavel({ formData, onChange }: StepResponsavelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Responsável pelo preenchimento</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Identifique quem está preenchendo este formulário pela empresa
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsavel">Nome do responsável</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="responsavel"
            value={formData.responsavel}
            onChange={(e) => onChange('responsavel', e.target.value)}
            placeholder="Ex.: João da Silva"
            className="pl-9"
          />
        </div>
        <p className="text-xs text-muted-foreground">Campo opcional</p>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          O nome do responsável é utilizado apenas para fins de contato e auditoria interna.
          Não será divulgado a terceiros.
        </p>
      </div>
    </div>
  );
}
