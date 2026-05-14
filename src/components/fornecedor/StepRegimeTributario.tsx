import { FornecedorFormData, REGIMES_TRIBUTARIOS } from '@/types/fornecedor';
import { CheckCircle2 } from 'lucide-react';

interface Props { formData: FornecedorFormData; onChange: (f: keyof FornecedorFormData, v: string) => void; errors: Record<string, string>; }

const REGIME_DESC: Record<string, string> = {
  'Lucro real': 'Base no lucro contábil ajustado. Obrigatório para receita acima de R$ 78 mi.',
  'Lucro presumido': 'Base estimada conforme percentuais por atividade. Opcional até R$ 78 mi.',
  'Simples nacional': 'Regime unificado para micro e pequenas empresas. Faturamento até R$ 4,8 mi/ano.',
};

export function StepRegimeTributario({ formData, onChange, errors }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold uppercase tracking-tight mb-1" style={{ fontSize: "15px", color: "var(--fb-blue)" }}>Regime Tributário</h3>
        <p className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>Selecione o enquadramento fiscal da empresa</p>
      </div>

      <div className="space-y-3">
        {REGIMES_TRIBUTARIOS.map(regime => {
          const sel = formData.regime_tributario === regime;
          return (
            <button key={regime} type="button" onClick={() => onChange('regime_tributario', regime)}
              className="flex items-start gap-4 p-4 text-left w-full transition-all"
              style={{ border: `2px solid ${sel ? "var(--fb-red)" : "var(--fb-mid-gray)"}`, borderRadius: "8px", background: sel ? "rgba(227,0,15,0.03)" : "#fff" }}>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                style={{ borderColor: sel ? "var(--fb-red)" : "var(--fb-mid-gray)", background: sel ? "var(--fb-red)" : "transparent" }}>
                {sel && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: sel ? "var(--fb-red)" : "var(--fb-blue)" }}>{regime}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--fb-slate-gray)" }}>{REGIME_DESC[regime]}</p>
              </div>
              {sel && <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--fb-red)" }} />}
            </button>
          );
        })}
      </div>
      {errors.regime_tributario && <p className="text-xs" style={{ color: "var(--fb-error)" }}>{errors.regime_tributario}</p>}
    </div>
  );
}
