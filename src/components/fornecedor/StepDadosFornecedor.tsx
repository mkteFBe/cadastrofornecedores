import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FornecedorFormData } from '@/types/fornecedor';
import { Package, Wrench } from 'lucide-react';
interface Props { formData: FornecedorFormData; onChange: (f: keyof FornecedorFormData, v: string) => void; errors: Record<string, string>; }
const formatCNPJ = (v: string) => v.replace(/\D/g,'').slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
const formatTel = (v: string) => { const n = v.replace(/\D/g,'').slice(0,11); return n.length<=10 ? n.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2') : n.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2'); };
const RAMOS = ['Indústria','Comércio','Serviços','Agronegócio','Tecnologia','Outro'];
const ist = { border:"1px solid var(--fb-mid-gray)",borderRadius:"4px",fontFamily:"'AmpleSoft',sans-serif",fontSize:"14px",color:"var(--fb-dark-gray)" };
const lbl = { fontSize:"11px",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.05em",color:"var(--fb-blue)",marginBottom:"6px",display:"block" };
export function StepDadosFornecedor({ formData, onChange, errors }: Props) {
  return (
    <div className="space-y-5">
      <div><h3 className="font-bold uppercase tracking-tight mb-1" style={{fontSize:"15px",color:"var(--fb-blue)"}}>Dados da Empresa</h3><p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Informações básicas para identificação do fornecedor</p></div>
      <div className="space-y-2">
        <label style={lbl}>Tipo de Fornecedor <span style={{color:"var(--fb-red)"}}>*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {[{v:'MATERIAIS',l:'Materiais',desc:'Produtos físicos',icon:Package},{v:'SERVIÇOS',l:'Serviços',desc:'Prestação de serviços',icon:Wrench}].map(({v,l,desc,icon:Icon})=>{
            const sel=formData.tipo_fornecedor===v;
            return <button key={v} type="button" onClick={()=>onChange('tipo_fornecedor',v)} className="flex items-start gap-3 p-4 text-left transition-all" style={{border:`2px solid ${sel?"var(--fb-red)":"var(--fb-mid-gray)"}`,borderRadius:"8px",background:sel?"rgba(227,0,15,0.03)":"#fff"}}>
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{background:sel?"var(--fb-red)":"var(--fb-light-gray)"}}><Icon className="w-4 h-4" style={{color:sel?"#fff":"var(--fb-slate-gray)"}} /></div>
              <div><p className="text-xs font-bold uppercase tracking-wider" style={{color:sel?"var(--fb-red)":"var(--fb-blue)"}}>{l}</p><p className="text-xs mt-0.5" style={{color:"var(--fb-slate-gray)"}}>{desc}</p></div>
            </button>;
          })}
        </div>
        {errors.tipo_fornecedor && <p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.tipo_fornecedor}</p>}
      </div>
      <div className="space-y-1.5"><label style={lbl}>E-mail <span style={{color:"var(--fb-red)"}}>*</span></label><Input type="email" value={formData.email} onChange={e=>onChange('email',e.target.value)} placeholder="contato@empresa.com.br" style={{...ist,borderColor:errors.email?"var(--fb-error)":"var(--fb-mid-gray)"}} />{errors.email&&<p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.email}</p>}</div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5"><label style={lbl}>CNPJ <span style={{color:"var(--fb-red)"}}>*</span></label><Input value={formData.cnpj} onChange={e=>onChange('cnpj',formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" maxLength={18} style={{...ist,borderColor:errors.cnpj?"var(--fb-error)":"var(--fb-mid-gray)"}} />{errors.cnpj&&<p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.cnpj}</p>}</div>
        <div className="space-y-1.5"><label style={lbl}>Telefone</label><Input value={formData.telefone} onChange={e=>onChange('telefone',formatTel(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} style={ist} /></div>
      </div>
      <div className="space-y-1.5"><label style={lbl}>Razão Social</label><Input value={formData.razao_social} onChange={e=>onChange('razao_social',e.target.value)} placeholder="Nome completo da empresa" style={ist} /></div>
      <div className="space-y-1.5"><label style={lbl}>Ramo de Atuação</label><Select value={formData.ramo_atuacao||''} onValueChange={v=>onChange('ramo_atuacao',v)}><SelectTrigger style={ist}><SelectValue placeholder="Selecione o ramo" /></SelectTrigger><SelectContent>{RAMOS.map(r=><SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
    </div>
  );
}
