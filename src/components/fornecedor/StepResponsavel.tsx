import { Input } from '@/components/ui/input';
import { FornecedorFormData } from '@/types/fornecedor';
import { User, Info } from 'lucide-react';
interface Props { formData: FornecedorFormData; onChange: (f: keyof FornecedorFormData, v: string) => void; errors: Record<string, string>; }
export function StepResponsavel({ formData, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div><h3 className="font-bold uppercase tracking-tight mb-1" style={{fontSize:"15px",color:"var(--fb-blue)"}}>Responsável pelo Preenchimento</h3><p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Identifique quem está preenchendo este formulário pela empresa</p></div>
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider" style={{color:"var(--fb-blue)",letterSpacing:"0.05em"}}>Nome do Responsável</label>
        <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:"var(--fb-slate-gray)"}}/><Input value={formData.responsavel} onChange={e=>onChange('responsavel',e.target.value)} placeholder="Ex.: João da Silva" className="pl-9" style={{border:"1px solid var(--fb-mid-gray)",borderRadius:"4px",fontSize:"14px",color:"var(--fb-dark-gray)"}}/></div>
        <p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Campo opcional</p>
      </div>
      <div className="flex items-start gap-3 p-4 rounded-md" style={{background:"var(--fb-light-gray)",border:"1px solid var(--fb-mid-gray)"}}><Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:"var(--fb-slate-gray)"}}/><p className="text-xs leading-relaxed" style={{color:"var(--fb-slate-gray)"}}>O nome do responsável é utilizado apenas para fins de contato e auditoria interna. Não será divulgado a terceiros.</p></div>
    </div>
  );
}
