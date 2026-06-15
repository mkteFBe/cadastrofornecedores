import { FornecedorFormData, OPCOES_AUTOAVALIACAO } from '@/types/fornecedor';
import { TrendingUp } from 'lucide-react';
interface Props { formData: FornecedorFormData; onChange: (f: keyof FornecedorFormData, v: string) => void; errors: Record<string, string>; }
const PERGUNTAS = [
  {field:'auto_recebimento' as keyof FornecedorFormData,grupo:'1. Recebimento',texto:'Os materiais recebidos são armazenados corretamente, protegidos de impactos naturais, humanos e acidentes?'},
  {field:'auto_verificacao_qualidade' as keyof FornecedorFormData,grupo:'1.1',texto:'Existe um padrão confiável para verificação da qualidade dos materiais recebidos?'},
  {field:'auto_produto_nao_conforme' as keyof FornecedorFormData,grupo:'2. Produto não conforme',texto:'Possui controle de produtos não conformes com identificação em cartões de qualidade?'},
  {field:'auto_nao_conformidade_tratativa' as keyof FornecedorFormData,grupo:'2.2',texto:'Quando ocorre não conformidade, há comunicação imediata e tratativa adequada?'},
  {field:'auto_rastreabilidade' as keyof FornecedorFormData,grupo:'3. Rastreabilidade',texto:'Como você avalia a rastreabilidade dos materiais e processos produtivos?'},
  {field:'auto_controle_processo' as keyof FornecedorFormData,grupo:'4. Controle de processo',texto:'Como você avalia o controle dos processos produtivos?'},
  {field:'auto_calibracao_maquinas' as keyof FornecedorFormData,grupo:'5. Calibração e máquinas',texto:'Como você avalia a calibração de instrumentos e a manutenção das máquinas?'},
  {field:'auto_eficacia_acoes_corretivas' as keyof FornecedorFormData,grupo:'6. Eficácia e ações corretivas',texto:'Como você avalia a eficácia das ações corretivas adotadas?'},
  {field:'auto_qualidade_operacional' as keyof FornecedorFormData,grupo:'7. Qualidade operacional',texto:'Como você avalia a qualidade operacional geral da empresa?'},
  {field:'auto_taxa_defeitos' as keyof FornecedorFormData,grupo:'7.1',texto:'Há monitoramento da taxa de defeitos ou padrões de qualidade internos?'},
  {field:'auto_ambiente_expedicao' as keyof FornecedorFormData,grupo:'8. Ambiente, expedição e meio ambiente',texto:'Como você avalia as práticas de expedição e cuidado com o meio ambiente?'},
  {field:'auto_expedicao_transporte' as keyof FornecedorFormData,grupo:'8.1',texto:'A expedição garante proteção dos materiais no transporte e há práticas de cuidado ambiental?'},
];
const SCORE_LABELS: Record<string,string> = {'0':'Inexistente','4':'Básico','8':'Adequado','10':'Excelente'};
function calcScore(fd: FornecedorFormData){return PERGUNTAS.reduce((a,p)=>a+(fd[p.field]?parseInt(fd[p.field] as string):0),0);}
function countAnswered(fd: FornecedorFormData){return PERGUNTAS.filter(p=>!!fd[p.field]).length;}
function getClass(score:number,answered:number){if(answered===0)return null;if(score>=80)return{label:'Classe A — Apto',bg:'#E9F7EE',color:'#1A6B30',bar:'#28A745'};if(score>=50)return{label:'Classe B — Condicionalmente Apto',bg:'#FFF8E1',color:'#8A6400',bar:'#FFC107'};return{label:'Classe C — Inapto',bg:'#FEE8E8',color:'#A32D2D',bar:'#DC3545'};}
export function StepAutoavaliacao({ formData, onChange, errors }: Props) {
  const answered=countAnswered(formData); const score=calcScore(formData); const cls=getClass(score,answered); const pct=Math.round((answered/12)*100);
  return (
    <div className="space-y-5">
      <div><h3 className="font-bold uppercase tracking-tight mb-1" style={{fontSize:"15px",color:"var(--fb-blue)"}}>Autoavaliação de Qualidade</h3><p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Avalie sua empresa em 12 critérios — notas: 0 · 4 · 8 · 10</p></div>
      <div className="p-4 rounded-md" style={{background:"var(--fb-light-gray)",border:"1px solid var(--fb-mid-gray)"}}>
        <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" style={{color:"var(--fb-blue)"}}/><span className="text-xs font-semibold uppercase tracking-wider" style={{color:"var(--fb-blue)"}}>{answered} de 12 respondidas</span></div>{cls&&<span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1" style={{background:cls.bg,color:cls.color,borderRadius:"9999px"}}>{cls.label}</span>}</div>
        <div className="h-1.5 w-full rounded-full" style={{background:"var(--fb-mid-gray)"}}><div className="h-1.5 rounded-full transition-all duration-300" style={{width:`${pct}%`,background:"var(--fb-red)"}}/></div>
        {answered>0&&<div className="flex justify-between mt-2"><span className="text-[10px]" style={{color:"var(--fb-slate-gray)"}}>Pontuação: <strong style={{color:"var(--fb-blue)"}}>{score} pts</strong></span><span className="text-[10px]" style={{color:"var(--fb-slate-gray)"}}>Máx: 120 pts</span></div>}
      </div>
      <div className="space-y-3">{PERGUNTAS.map((p,idx)=>{const val=formData[p.field] as string;const hasErr=!!errors[p.field];return(
        <div key={p.field} className="p-4 rounded-md transition-colors" style={{border:`1px solid ${hasErr?"var(--fb-error)":val?"rgba(227,0,15,0.2)":"var(--fb-mid-gray)"}`,background:val?"rgba(227,0,15,0.02)":"#fff"}}>
          <div className="flex items-start gap-3 mb-3"><span className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{background:val?"var(--fb-red)":"var(--fb-light-gray)",color:val?"#fff":"var(--fb-slate-gray)"}}>{idx+1}</span><div><p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{color:"var(--fb-slate-gray)"}}>{p.grupo}</p><p className="text-sm leading-snug" style={{color:"var(--fb-dark-gray)"}}>{p.texto} <span style={{color:"var(--fb-red)"}}>*</span></p></div></div>
          <div className="grid grid-cols-4 gap-2 ml-9">{OPCOES_AUTOAVALIACAO.map(opcao=>{const isSel=val===opcao;return<button key={opcao} type="button" onClick={()=>onChange(p.field,opcao)} className="py-2 px-1 rounded text-center transition-all" style={{border:`2px solid ${isSel?"var(--fb-red)":"var(--fb-mid-gray)"}`,background:isSel?"var(--fb-red)":"#fff",color:isSel?"#fff":"var(--fb-slate-gray)"}}><span className="block text-sm font-bold">{opcao}</span><span className="block text-[9px] mt-0.5 uppercase tracking-wide font-semibold opacity-75">{SCORE_LABELS[opcao]}</span></button>;})}</div>
          {hasErr&&<p className="text-xs mt-2 ml-9" style={{color:"var(--fb-error)"}}>{errors[p.field]}</p>}
        </div>);
      })}</div>
    </div>
  );
}
