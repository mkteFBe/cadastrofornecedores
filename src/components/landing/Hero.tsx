import { Link } from "react-router-dom"; import { ArrowRight, CheckCircle2, Clock, Shield } from "lucide-react";
export const Hero = () => (
  <div className="min-h-screen flex items-center justify-center py-16 px-6" style={{ background: "var(--fb-light-gray)" }}>
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-10">
        <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-10 w-auto mx-auto mb-6" />
        <div className="w-10 h-0.5 mx-auto mb-4" style={{ background: "var(--fb-red)" }} />
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--fb-slate-gray)" }}>Portal de Cadastro de Fornecedores</p>
      </div>
      <div className="bg-white rounded-lg p-8" style={{ boxShadow: "var(--fb-shadow-floating)", border: "1px solid var(--fb-mid-gray)" }}>
        <h1 className="font-bold uppercase tracking-tight mb-2" style={{ fontSize: "22px", color: "var(--fb-blue)" }}>Cadastro de Fornecedores</h1>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--fb-slate-gray)" }}>Preencha o formulário para iniciar sua qualificação como fornecedor oficial da Filtros Brasil.</p>
        <div className="space-y-3 mb-7 p-4 rounded-md" style={{ background: "var(--fb-light-gray)" }}>
          {[{ icon: CheckCircle2, text: "Processo 100% online e gratuito" }, { icon: Clock, text: "Análise em até 5 dias úteis" }, { icon: Shield, text: "Dados protegidos e confidenciais" }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3"><Icon className="h-4 w-4 flex-shrink-0" style={{ color: "var(--fb-red)" }} /><span className="text-sm" style={{ color: "var(--fb-dark-gray)" }}>{text}</span></div>
          ))}
        </div>
        <Link to="/cadastro" className="flex items-center justify-center gap-2 w-full py-3.5 text-white font-semibold text-xs uppercase tracking-widest transition-all" style={{ background: "var(--fb-red)", borderRadius: "9999px" }}>
          Iniciar Cadastro <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="pt-5 mt-5 text-center" style={{ borderTop: "1px solid var(--fb-mid-gray)" }}>
          <Link to="/admin" className="text-[11px] font-semibold uppercase tracking-widest hover:underline" style={{ color: "var(--fb-slate-gray)" }}>Acesso Administrativo</Link>
        </div>
      </div>
      <p className="text-center text-xs mt-6" style={{ color: "var(--fb-slate-gray)" }}>Dúvidas? <a href="mailto:compras@filtrosbrasil.com.br" className="font-semibold hover:underline" style={{ color: "var(--fb-blue)" }}>compras@filtrosbrasil.com.br</a></p>
    </div>
  </div>
);
