import { useState } from 'react';
import { Shield, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepAceiteProps {
  aceite: boolean;
  onChange: (value: boolean) => void;
  errors: Record<string, string>;
}

export function StepAceite({ aceite, onChange, errors }: StepAceiteProps) {
  return (
    <div className="space-y-6">
      {/* Ícone + intro */}
      <div className="flex flex-col items-center text-center py-4">
        <div className="w-14 h-14 bg-brand-navy/5 rounded-2xl flex items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-brand-navy" />
        </div>
        <h3 className="font-semibold text-brand-navy text-lg">Declaração de Veracidade</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Antes de enviar, leia e confirme a declaração abaixo. Este registro é parte do processo formal de qualificação de fornecedores.
        </p>
      </div>

      {/* Texto da declaração */}
      <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Declaração de Responsabilidade
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          Declaro, para os devidos fins, que todas as informações prestadas neste formulário de cadastro de fornecedor são <strong>verdadeiras, completas e atualizadas</strong>, sendo de minha inteira responsabilidade quaisquer omissões ou incorreções.
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Estou ciente de que o fornecimento de informações falsas ou documentos adulterados poderá acarretar a <strong>imediata reprovação</strong> do cadastro, além das sanções legais cabíveis.
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          Autorizo a <strong>Filtros Brasil</strong> a realizar verificações das informações e documentos aqui fornecidos junto aos órgãos competentes.
        </p>
        <p className="text-xs text-muted-foreground pt-2 border-t border-border">
          Este aceite será registrado com data, hora e endereço IP, ficando arquivado nos sistemas da Filtros Brasil conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </div>

      {/* Checkbox de aceite */}
      <button
        type="button"
        onClick={() => onChange(!aceite)}
        className={cn(
          'w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left',
          aceite
            ? 'border-brand-navy bg-brand-navy/5'
            : 'border-border hover:border-brand-navy/40',
          errors.aceite && 'border-destructive',
        )}
      >
        <div className={cn(
          'w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
          aceite ? 'bg-brand-navy border-brand-navy' : 'border-muted-foreground/40',
        )}>
          {aceite && <CheckCircle2 className="w-4 h-4 text-white" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Li, compreendi e aceito a declaração acima <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ao marcar esta opção, você confirma que as informações prestadas são verdadeiras.
          </p>
        </div>
      </button>

      {errors.aceite && (
        <p className="text-sm text-destructive text-center">{errors.aceite}</p>
      )}
    </div>
  );
}
