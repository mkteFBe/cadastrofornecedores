import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Clock, Shield } from "lucide-react";

export const Hero = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <img
            src="/logo-filtros-brasil.svg"
            alt="Filtros Brasil"
            className="h-12 w-auto"
          />
        </div>
        <div className="w-12 h-0.5 bg-brand-red mx-auto mb-3 rounded-full" />
        <p className="text-muted-foreground">Portal de Cadastro de Fornecedores</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 bg-brand-navy rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-brand-navy">Cadastro de Fornecedores</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Preencha o formulário para iniciar sua qualificação como fornecedor.
          </p>
        </div>

        <div className="space-y-2.5">
          {[
            { icon: CheckCircle2, text: "Processo 100% online e gratuito" },
            { icon: Clock, text: "Análise em até 5 dias úteis" },
            { icon: Shield, text: "Dados protegidos e confidenciais" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Icon className="h-4 w-4 text-brand-red flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <Link
          to="/cadastro"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-brand-red hover:bg-brand-red/90 text-white font-semibold text-sm transition-colors"
        >
          Iniciar Cadastro
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="pt-4 border-t text-center">
          <Link to="/admin" className="text-xs text-muted-foreground hover:text-brand-navy transition-colors">
            Acesso administrativo
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Dúvidas? <a href="mailto:compras@filtrosbrasil.com.br" className="text-brand-navy font-medium hover:underline">compras@filtrosbrasil.com.br</a>
      </p>
    </div>
  </div>
);
