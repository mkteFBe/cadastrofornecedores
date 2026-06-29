import { FornecedorFormData, OPCOES_AUTOAVALIACAO } from '@/types/fornecedor';

interface Props {
  formData: FornecedorFormData;
  onChange: (f: keyof FornecedorFormData, v: string) => void;
  errors: Record<string, string>;
}

const PERGUNTAS = [
  { field: 'auto_recebimento' as keyof FornecedorFormData, grupo: '1. Recebimento', texto: 'Os materiais recebidos são armazenados corretamente, protegidos de impactos naturais, humanos e acidentes?' },
  { field: 'auto_verificacao_qualidade' as keyof FornecedorFormData, grupo: '1.1', texto: 'Existe um padrão confiável para verificação da qualidade dos materiais recebidos?' },
  { field: 'auto_produto_nao_conforme' as keyof FornecedorFormData, grupo: '2. Produto não conforme', texto: 'Possui controle de produtos não conformes com identificação em cartões de qualidade?' },
  { field: 'auto_nao_conformidade_tratativa' as keyof FornecedorFormData, grupo: '2.2', texto: 'Quando ocorre não conformidade, há comunicação imediata e tratativa adequada?' },
  { field: 'auto_rastreabilidade' as keyof FornecedorFormData, grupo: '3. Rastreabilidade', texto: 'Como você avalia a rastreabilidade dos materiais e processos produtivos?' },
  { field: 'auto_controle_processo' as keyof FornecedorFormData, grupo: '4. Controle de processo', texto: 'Como você avalia o controle dos processos produtivos?' },
  { field: 'auto_calibracao_maquinas' as keyof FornecedorFormData, grupo: '5. Calibração e máquinas', texto: 'Como você avalia a calibração de instrumentos e a manutenção das máquinas?' },
  { field: 'auto_eficacia_acoes_corretivas' as keyof FornecedorFormData, grupo: '6. Eficácia e ações corretivas', texto: 'Como você avalia a eficácia das ações corretivas adotadas?' },
  { field: 'auto_qualidade_operacional' as keyof FornecedorFormData, grupo: '7. Qualidade operacional', texto: 'Como você avalia a qualidade operacional geral da empresa?' },
  { field: 'auto_taxa_defeitos' as keyof FornecedorFormData, grupo: '7.1', texto: 'Há monitoramento da taxa de defeitos ou padrões de qualidade internos?' },
  { field: 'auto_ambiente_expedicao' as keyof FornecedorFormData, grupo: '8. Ambiente, expedição e meio ambiente', texto: 'Como você avalia as práticas de expedição e cuidado com o meio ambiente?' },
  { field: 'auto_expedicao_transporte' as keyof FornecedorFormData, grupo: '8.1', texto: 'A expedição garante proteção dos materiais no transporte e há práticas de cuidado ambiental?' },
];

// Rótulos descritivos para as notas (sem revelar pontuação numérica)
const NOTA_LABELS: Record<string, string> = {
  '0': 'Não realizado',
  '4': 'Iniciando',
  '8': 'Em desenvolvimento',
  '10': 'Consolidado',
};

function countAnswered(fd: FornecedorFormData) {
  return PERGUNTAS.filter(p => !!fd[p.field]).length;
}

export function StepAutoavaliacao({ formData, onChange, errors }: Props) {
  const answered = countAnswered(formData);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold uppercase tracking-tight mb-1" style={{ fontSize: "15px", color: "var(--fb-blue)" }}>
          Autoavaliação de Qualidade
        </h3>
        <p className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>
          Avalie sua empresa em 12 critérios de gestão da qualidade
        </p>
      </div>

      {/* Progresso sem pontuação */}
      <div className="p-4 rounded-md" style={{ background: "var(--fb-light-gray)", border: "1px solid var(--fb-mid-gray)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fb-blue)" }}>
            {answered} de 12 questões respondidas
          </span>
          <span className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>
            {Math.round((answered / 12) * 100)}% concluído
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full" style={{ background: "var(--fb-mid-gray)" }}>
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${Math.round((answered / 12) * 100)}%`, background: "var(--fb-red)" }}
          />
        </div>
      </div>

      {/* Questões */}
      <div className="space-y-3">
        {PERGUNTAS.map((p, idx) => {
          const val = formData[p.field] as string;
          const hasErr = !!errors[p.field];
          return (
            <div key={p.field} className="p-4 rounded-md transition-colors"
              style={{
                border: `1px solid ${hasErr ? "var(--fb-error)" : val ? "rgba(227,0,15,0.2)" : "var(--fb-mid-gray)"}`,
                background: val ? "rgba(227,0,15,0.02)" : "#fff"
              }}>
              <div className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ background: val ? "var(--fb-red)" : "var(--fb-light-gray)", color: val ? "#fff" : "var(--fb-slate-gray)" }}>
                  {idx + 1}
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--fb-slate-gray)" }}>{p.grupo}</p>
                  <p className="text-sm leading-snug" style={{ color: "var(--fb-dark-gray)" }}>
                    {p.texto} <span style={{ color: "var(--fb-red)" }}>*</span>
                  </p>
                </div>
              </div>

              {/* Botões com rótulos descritivos — sem revelar valores numéricos */}
              <div className="grid grid-cols-4 gap-2 ml-9">
                {OPCOES_AUTOAVALIACAO.map(opcao => {
                  const isSel = val === opcao;
                  return (
                    <button key={opcao} type="button" onClick={() => onChange(p.field, opcao)}
                      className="py-2.5 px-1 rounded text-center transition-all"
                      style={{
                        border: `2px solid ${isSel ? "var(--fb-red)" : "var(--fb-mid-gray)"}`,
                        background: isSel ? "var(--fb-red)" : "#fff",
                        color: isSel ? "#fff" : "var(--fb-slate-gray)",
                      }}>
                      <span className="block text-[10px] font-semibold uppercase tracking-wide leading-tight">
                        {NOTA_LABELS[opcao]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {hasErr && <p className="text-xs mt-2 ml-9" style={{ color: "var(--fb-error)" }}>{errors[p.field]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
