import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FornecedorFormData, OPCOES_AUTOAVALIACAO } from '@/types/fornecedor';
import { cn } from '@/lib/utils';

interface StepAutoavaliacaoProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  errors: Record<string, string>;
}

const PERGUNTAS_AUTOAVALIACAO = [
  {
    field: 'auto_recebimento' as keyof FornecedorFormData,
    titulo: '1. Recebimento',
    texto: 'Os materiais recebidos são armazenados corretamente, protegidos de impactos naturais, humanos e acidentes?'
  },
  {
    field: 'auto_verificacao_qualidade' as keyof FornecedorFormData,
    titulo: '1.1',
    texto: 'Existe um padrão confiável para verificação da qualidade dos materiais recebidos?'
  },
  {
    field: 'auto_produto_nao_conforme' as keyof FornecedorFormData,
    titulo: '2. Produto não conforme',
    texto: 'Possui controle de produtos não conformes com identificação em cartões de qualidade?'
  },
  {
    field: 'auto_nao_conformidade_tratativa' as keyof FornecedorFormData,
    titulo: '2.2',
    texto: 'Quando ocorre não conformidade, há comunicação imediata e tratativa adequada?'
  },
  {
    field: 'auto_rastreabilidade' as keyof FornecedorFormData,
    titulo: '3. Rastreabilidade',
    texto: ''
  },
  {
    field: 'auto_controle_processo' as keyof FornecedorFormData,
    titulo: '4. Controle de processo',
    texto: ''
  },
  {
    field: 'auto_calibracao_maquinas' as keyof FornecedorFormData,
    titulo: '5. Calibração e máquinas',
    texto: ''
  },
  {
    field: 'auto_eficacia_acoes_corretivas' as keyof FornecedorFormData,
    titulo: '6. Eficácia e ações corretivas',
    texto: ''
  },
  {
    field: 'auto_qualidade_operacional' as keyof FornecedorFormData,
    titulo: '7. Qualidade operacional',
    texto: ''
  },
  {
    field: 'auto_taxa_defeitos' as keyof FornecedorFormData,
    titulo: '7.1',
    texto: 'Há monitoramento da taxa de defeitos ou padrões de qualidade internos?'
  },
  {
    field: 'auto_ambiente_expedicao' as keyof FornecedorFormData,
    titulo: '8. Ambiente, expedição e meio ambiente',
    texto: ''
  },
  {
    field: 'auto_expedicao_transporte' as keyof FornecedorFormData,
    titulo: '8.1',
    texto: 'A expedição garante proteção dos materiais no transporte e há práticas de cuidado ambiental (armazenamento de resíduos, redução de impacto)?'
  }
];

export function StepAutoavaliacao({ formData, onChange, errors }: StepAutoavaliacaoProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">AUTOAVALIAÇÃO DE FORNECEDORES</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Nesta sessão, seguiremos com 8 temas objetivos e relacionados à sua autoavaliação como fornecedor, 
          em relação aos processos de controle da qualidade.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <p className="font-medium">Escala de avaliação: 0 – 4 – 6 – 8 – 10. Abaixo, as métricas:</p>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="font-semibold text-green-700">Classificação A:</span>
            <span>Pontuação de 80 a 100 pontos — Fornecedor apto.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-yellow-700">Classificação B:</span>
            <span>Pontuação de 50 a 79 pontos — Fornecedor condicionalmente apto.</span>
          </div>
          <div className="flex gap-2">
            <span className="font-semibold text-red-700">Classificação C:</span>
            <span>Pontuação menor que 50 pontos — Fornecedor inapto.</span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {PERGUNTAS_AUTOAVALIACAO.map((pergunta) => (
          <div key={pergunta.field} className="space-y-3">
            <Label className={cn(errors[pergunta.field] && "text-destructive")}>
              {pergunta.titulo} <span className="text-destructive">*</span>
            </Label>
            {pergunta.texto && (
              <p className="text-sm text-muted-foreground">{pergunta.texto}</p>
            )}
            <RadioGroup
              value={formData[pergunta.field] as string}
              onValueChange={(value) => onChange(pergunta.field, value)}
              className="flex flex-wrap gap-4"
            >
              {OPCOES_AUTOAVALIACAO.map((opcao) => (
                <div key={opcao} className="flex items-center space-x-2">
                  <RadioGroupItem value={opcao} id={`${pergunta.field}-${opcao}`} />
                  <Label 
                    htmlFor={`${pergunta.field}-${opcao}`} 
                    className="font-normal cursor-pointer"
                  >
                    {opcao}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors[pergunta.field] && (
              <p className="text-sm text-destructive">{errors[pergunta.field]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
