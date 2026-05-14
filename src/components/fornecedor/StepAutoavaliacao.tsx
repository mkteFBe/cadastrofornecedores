import { Label } from '@/components/ui/label';
import { FornecedorFormData, OPCOES_AUTOAVALIACAO } from '@/types/fornecedor';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface StepAutoavaliacaoProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

const PERGUNTAS_AUTOAVALIACAO = [
  {
    field: 'auto_recebimento' as keyof FornecedorFormData,
    grupo: '1. Recebimento',
    texto: 'Os materiais recebidos são armazenados corretamente, protegidos de impactos naturais, humanos e acidentes?',
  },
  {
    field: 'auto_verificacao_qualidade' as keyof FornecedorFormData,
    grupo: '1.1',
    texto: 'Existe um padrão confiável para verificação da qualidade dos materiais recebidos?',
  },
  {
    field: 'auto_produto_nao_conforme' as keyof FornecedorFormData,
    grupo: '2. Produto não conforme',
    texto: 'Possui controle de produtos não conformes com identificação em cartões de qualidade?',
  },
  {
    field: 'auto_nao_conformidade_tratativa' as keyof FornecedorFormData,
    grupo: '2.2',
    texto: 'Quando ocorre não conformidade, há comunicação imediata e tratativa adequada?',
  },
  {
    field: 'auto_rastreabilidade' as keyof FornecedorFormData,
    grupo: '3. Rastreabilidade',
    texto: 'Como você avalia a rastreabilidade dos materiais e processos produtivos?',
  },
  {
    field: 'auto_controle_processo' as keyof FornecedorFormData,
    grupo: '4. Controle de processo',
    texto: 'Como você avalia o controle dos processos produtivos?',
  },
  {
    field: 'auto_calibracao_maquinas' as keyof FornecedorFormData,
    grupo: '5. Calibração e máquinas',
    texto: 'Como você avalia a calibração de instrumentos e a manutenção das máquinas?',
  },
  {
    field: 'auto_eficacia_acoes_corretivas' as keyof FornecedorFormData,
    grupo: '6. Eficácia e ações corretivas',
    texto: 'Como você avalia a eficácia das ações corretivas adotadas?',
  },
  {
    field: 'auto_qualidade_operacional' as keyof FornecedorFormData,
    grupo: '7. Qualidade operacional',
    texto: 'Como você avalia a qualidade operacional geral da empresa?',
  },
  {
    field: 'auto_taxa_defeitos' as keyof FornecedorFormData,
    grupo: '7.1',
    texto: 'Há monitoramento da taxa de defeitos ou padrões de qualidade internos?',
  },
  {
    field: 'auto_ambiente_expedicao' as keyof FornecedorFormData,
    grupo: '8. Ambiente, expedição e meio ambiente',
    texto: 'Como você avalia as práticas de expedição e cuidado com o meio ambiente?',
  },
  {
    field: 'auto_expedicao_transporte' as keyof FornecedorFormData,
    grupo: '8.1',
    texto: 'A expedição garante proteção dos materiais no transporte e há práticas de cuidado ambiental?',
  },
];

function calcScore(formData: FornecedorFormData): number {
  return PERGUNTAS_AUTOAVALIACAO.reduce((acc, p) => {
    const v = formData[p.field] as string;
    return acc + (v ? parseInt(v) : 0);
  }, 0);
}

function countAnswered(formData: FornecedorFormData): number {
  return PERGUNTAS_AUTOAVALIACAO.filter((p) => !!formData[p.field]).length;
}

function getClassificacao(score: number, answered: number) {
  if (answered === 0) return null;
  if (score >= 80) return { label: 'Classe A — Apto', color: 'text-green-700', bg: 'bg-green-100', bar: 'bg-green-500' };
  if (score >= 50) return { label: 'Classe B — Condicionalmente apto', color: 'text-amber-700', bg: 'bg-amber-100', bar: 'bg-amber-500' };
  return { label: 'Classe C — Inapto', color: 'text-red-700', bg: 'bg-red-100', bar: 'bg-red-500' };
}

const SCORE_LABELS: Record<string, string> = {
  '0': 'Inexistente',
  '4': 'Básico',
  '8': 'Adequado',
  '10': 'Excelente',
};

export function StepAutoavaliacao({ formData, onChange, errors }: StepAutoavaliacaoProps) {
  const answered = countAnswered(formData);
  const score = calcScore(formData);
  const classificacao = getClassificacao(score, answered);
  const progressPct = Math.round((answered / 12) * 100);
  const maxScore = 120;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Autoavaliação de qualidade</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Avalie sua empresa em 12 critérios de gestão da qualidade. Notas: 0 · 4 · 8 · 10
        </p>
      </div>

      {/* Painel de progresso */}
      <div className="p-4 rounded-lg border bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-navy" />
            <span className="text-sm font-medium text-foreground">
              {answered} de 12 questões respondidas
            </span>
          </div>
          {classificacao && (
            <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', classificacao.bg, classificacao.color)}>
              {classificacao.label}
            </span>
          )}
        </div>

        {/* Barra de progresso de questões */}
        <div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-navy rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Barra de pontuação */}
        {answered > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Pontuação parcial: <strong className="text-foreground">{score} pts</strong></span>
              <span>Máx: {maxScore} pts</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-300', classificacao?.bar ?? 'bg-brand-navy')}
                style={{ width: `${Math.round((score / maxScore) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Questões */}
      <div className="space-y-4">
        {PERGUNTAS_AUTOAVALIACAO.map((pergunta, idx) => {
          const value = formData[pergunta.field] as string;
          const hasError = !!errors[pergunta.field];

          return (
            <div
              key={pergunta.field}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                value ? 'border-brand-navy/20 bg-brand-navy/[0.02]' : 'border-border bg-white',
                hasError && 'border-destructive bg-destructive/5'
              )}
            >
              {/* Cabeçalho */}
              <div className="flex items-start gap-3 mb-3">
                <span className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5',
                  value ? 'bg-brand-navy text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">
                    {pergunta.grupo}
                  </p>
                  <p className="text-sm text-foreground leading-snug">
                    {pergunta.texto}
                    <span className="text-destructive ml-0.5">*</span>
                  </p>
                </div>
              </div>

              {/* Botões de score */}
              <div className="grid grid-cols-4 gap-2 ml-9">
                {OPCOES_AUTOAVALIACAO.map((opcao) => {
                  const isSelected = value === opcao;
                  return (
                    <button
                      key={opcao}
                      type="button"
                      onClick={() => onChange(pergunta.field, opcao)}
                      className={cn(
                        'py-2 px-1 rounded-md border text-center transition-all duration-150',
                        isSelected
                          ? 'border-brand-navy bg-brand-navy text-white font-semibold'
                          : 'border-border bg-white text-muted-foreground hover:border-brand-navy/40 hover:text-brand-navy hover:bg-brand-navy/5'
                      )}
                    >
                      <span className="block text-sm font-semibold">{opcao}</span>
                      <span className={cn('block text-[10px] mt-0.5', isSelected ? 'text-white/80' : 'text-muted-foreground')}>
                        {SCORE_LABELS[opcao]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasError && (
                <p className="text-xs text-destructive mt-2 ml-9">{errors[pergunta.field]}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
