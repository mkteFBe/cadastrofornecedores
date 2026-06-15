import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
const loginSchema = z.object({ email: z.string().email('E-mail inválido'), password: z.string().min(6,'Senha deve ter pelo menos 6 caracteres') });
const lbl = { fontSize:"11px",fontWeight:600,textTransform:"uppercase" as const,letterSpacing:"0.05em",color:"var(--fb-blue)",display:"block",marginBottom:"6px" };
const ist = { border:"1px solid var(--fb-mid-gray)",borderRadius:"4px",fontFamily:"'AmpleSoft',sans-serif",fontSize:"14px" };
export default function Auth() {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [isLoading,setIsLoading]=useState(false); const [errors,setErrors]=useState<Record<string,string>>({});
  const { signIn } = useAuth(); const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setErrors({});
    try { loginSchema.parse({email,password}); } catch(err) { if(err instanceof z.ZodError){const n:Record<string,string>={};err.errors.forEach(e=>{if(e.path[0])n[e.path[0] as string]=e.message;});setErrors(n);return;} }
    setIsLoading(true);
    try { const {error}=await signIn(email,password); if(error){toast.error(error.message.includes('Invalid login credentials')?'E-mail ou senha incorretos':error.message);return;} toast.success('Login realizado!'); navigate('/admin'); }
    catch { toast.error('Erro ao fazer login.'); } finally { setIsLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background:"var(--fb-light-gray)"}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8"><img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-9 w-auto mx-auto mb-5"/><div className="w-8 h-0.5 mx-auto mb-4" style={{background:"var(--fb-red)"}}/><h1 className="font-bold uppercase tracking-tight" style={{fontSize:"16px",color:"var(--fb-blue)"}}>Área Administrativa</h1><p className="text-xs mt-1" style={{color:"var(--fb-slate-gray)"}}>Acesso restrito — Filtros Brasil</p></div>
        <div className="bg-white rounded-lg p-7" style={{boxShadow:"var(--fb-shadow-floating)",border:"1px solid var(--fb-mid-gray)"}}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label style={lbl}>E-mail</label><Input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@filtrosbrasil.com.br" style={{...ist,borderColor:errors.email?"var(--fb-error)":"var(--fb-mid-gray)"}} disabled={isLoading}/>{errors.email&&<p className="text-xs mt-1" style={{color:"var(--fb-error)"}}>{errors.email}</p>}</div>
            <div><label style={lbl}>Senha</label><Input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{...ist,borderColor:errors.password?"var(--fb-error)":"var(--fb-mid-gray)"}} disabled={isLoading}/>{errors.password&&<p className="text-xs mt-1" style={{color:"var(--fb-error)"}}>{errors.password}</p>}</div>
            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 text-white text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-60 mt-2" style={{background:"var(--fb-blue)",borderRadius:"9999px",border:"none",cursor:"pointer"}}>{isLoading&&<Loader2 className="w-4 h-4 animate-spin"/>}Entrar</button>
          </form>
          <div className="mt-4 pt-4 text-center" style={{borderTop:"1px solid var(--fb-mid-gray)"}}><button onClick={()=>navigate('/')} className="text-[11px] font-semibold uppercase tracking-wider hover:underline" style={{color:"var(--fb-slate-gray)",background:"none",border:"none",cursor:"pointer"}}>Voltar para o formulário</button></div>
        </div>
      </div>
    </div>
  );
}
