import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FornecedorFormData } from '@/types/fornecedor';
import { cn } from '@/lib/utils';
import { Package, Wrench } from 'lucide-react';

interface StepDadosFornecedorProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 14);
  return limited
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function formatTelefone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const limited = numbers.slice(0, 11);
  if (limited.length <= 10) {
    return limited
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return limited
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

const RAMOS = ['Indústria', 'Comércio', 'Serviços', 'Agronegócio', 'Tecnologia', 'Outro'];

export function StepDadosFornecedor({ formData, onChange, errors }: StepDadosFornecedorProps) {
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('cnpj', formatCNPJ(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange('telefone', formatTelefone(e.target.value));
  };

  const tipoOptions = [
    { value: 'MATERIAIS', label: 'Materiais', icon: Package, desc: 'Fornecimento de produtos físicos' },
    { value: 'SERVIÇOS', label: 'Serviços', icon: Wrench, desc: 'Prestação de serviços' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Dados da empresa</h3>
        <p className="text-sm text-muted-foreground mt-0.5">Informações básicas para identificação do fornecedor</p>
      </div>

      {/* Tipo de fornecedor — cards clicáveis */}
      <div className="space-y-2">
        <Label>
          Tipo de fornecedor <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {tipoOptions.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange('tipo_fornecedor', value)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-150',
                formData.tipo_fornecedor === value
                  ? 'border-brand-navy bg-brand-navy/5'
                  : 'border-border hover:border-brand-navy/40 hover:bg-muted/50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5',
                formData.tipo_fornecedor === value ? 'bg-brand-navy text-white' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className={cn(
                  'text-sm font-semibold',
                  formData.tipo_fornecedor === value ? 'text-brand-navy' : 'text-foreground'
                )}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
        {errors.tipo_fornecedor && (
          <p className="text-sm text-destructive">{errors.tipo_fornecedor}</p>
        )}
      </div>

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
          className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
          placeholder="contato@empresa.com.br"
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
      </div>

      {/* CNPJ + Telefone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cnpj">
            CNPJ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={handleCNPJChange}
            className={cn(errors.cnpj && 'border-destructive focus-visible:ring-destructive')}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
        </div>

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

      {/* Razão social */}
      <div className="space-y-2">
        <Label htmlFor="razao_social">Razão social</Label>
        <Input
          id="razao_social"
          value={formData.razao_social}
          onChange={(e) => onChange('razao_social', e.target.value)}
          placeholder="Nome completo da empresa"
        />
      </div>

      {/* Ramo de atuação */}
      <div className="space-y-2">
        <Label htmlFor="ramo_atuacao">Ramo de atuação</Label>
        <Select
          value={formData.ramo_atuacao || ''}
          onValueChange={(value) => onChange('ramo_atuacao', value)}
        >
          <SelectTrigger id="ramo_atuacao">
            <SelectValue placeholder="Selecione o ramo" />
          </SelectTrigger>
          <SelectContent>
            {RAMOS.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
