import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FornecedorFormData, TIPOS_FORNECEDOR } from '@/types/fornecedor';
import { cn } from '@/lib/utils';

interface StepDadosFornecedorProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

// Função para formatar CNPJ: 00.000.000/0000-00
function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 14);
  return limited
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

// Função para formatar Telefone: (00) 00000-0000 ou (00) 0000-0000
function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);
  
  if (limited.length <= 10) {
    // Telefone fixo: (00) 0000-0000
    return limited
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  // Celular: (00) 00000-0000
  return limited
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function StepDadosFornecedor({ formData, onChange, errors }: StepDadosFornecedorProps) {
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    onChange('cnpj', formatted);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    onChange('telefone', formatted);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Etapa 1 — Dados do fornecedor</h3>
      
      {/* E-mail */}
      <div className="space-y-2">
        <Label htmlFor="email">
          E-mail <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          className={cn(errors.email && 'border-destructive')}
          placeholder="seu@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Tipo de fornecedor */}
      <div className="space-y-3">
        <Label>
          Tipo de fornecedor <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.tipo_fornecedor}
          onValueChange={(value) => onChange('tipo_fornecedor', value)}
          className="flex flex-col space-y-2"
        >
          {TIPOS_FORNECEDOR.map((tipo) => (
            <div key={tipo} className="flex items-center space-x-2">
              <RadioGroupItem value={tipo} id={`tipo-${tipo}`} />
              <Label htmlFor={`tipo-${tipo}`} className="font-normal cursor-pointer">
                {tipo}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.tipo_fornecedor && (
          <p className="text-sm text-destructive">{errors.tipo_fornecedor}</p>
        )}
      </div>

      {/* Razão Social */}
      <div className="space-y-2">
        <Label htmlFor="razao_social">Razão social do fornecedor</Label>
        <Input
          id="razao_social"
          value={formData.razao_social}
          onChange={(e) => onChange('razao_social', e.target.value)}
          placeholder="Razão social completa"
        />
      </div>

      {/* Ramo de atuação */}
      <div className="space-y-2">
        <Label htmlFor="ramo_atuacao">Ramo de atuação</Label>
        <Input
          id="ramo_atuacao"
          value={formData.ramo_atuacao}
          onChange={(e) => onChange('ramo_atuacao', e.target.value)}
          placeholder="Ex: Indústria, Comércio, Serviços"
        />
      </div>

      {/* CNPJ */}
      <div className="space-y-2">
        <Label htmlFor="cnpj">
          Informações cadastrais <span className="text-destructive">*</span>
        </Label>
        <p className="text-sm text-muted-foreground">
          Neste campo, escreva o CNPJ do fornecedor.
        </p>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={handleCNPJChange}
          className={cn(errors.cnpj && 'border-destructive')}
          placeholder="00.000.000/0000-00"
          maxLength={18}
        />
        {errors.cnpj && (
          <p className="text-sm text-destructive">{errors.cnpj}</p>
        )}
      </div>

      {/* Telefone */}
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={handleTelefoneChange}
          placeholder="(00) 00000-0000"
          maxLength={15}
        />
      </div>
    </div>
  );
}
