import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, FileCheck, Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="bg-brand-navy py-2 px-4">
        <p className="text-center text-xs text-white/60">
          Portal exclusivo para cadastro de fornecedores Filtros Brasil
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-border/60 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-navy rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">FB</span>
            </div>
            <div>
              <span className="text-sm font-bold text-brand-navy tracking-wide">FILTROS BRASIL</span>
              <div className="w-full h-px bg-brand-red mt-0.5" />
            </div>
          </div>
          <Link
            to="/auth"
            className="text-xs text-muted-foreground hover:text-brand-navy transition-colors"
          >
            Acesso administrativo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-navy/5 border border-brand-navy/10 rounded-full px-3 py-1 mb-6">
                <div className="w-2 h-2 rounded-full bg-brand-red" />
                <span className="text-xs font-medium text-brand-navy">Cadastro de Fornecedores</span>
              </div>

              <h1 className="text-4xl font-bold text-brand-navy leading-tight mb-4">
                Seja um fornecedor<br />
                <span className="text-brand-red">Filtros Brasil</span>
              </h1>

              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Preencha o formulário de qualificação e faça parte da nossa rede de fornecedores homologados. Processo 100% digital, rápido e seguro.
              </p>

              <div className="space-y-3 mb-10">
                {[
                  { icon: CheckCircle2, text: "Processo 100% online — sem papelada" },
                  { icon: Clock, text: "Análise em até 5 dias úteis" },
                  { icon: FileCheck, text: "Documentação simplificada" },
                  { icon: Shield, text: "Dados protegidos com segurança" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3 h-3 text-brand-red" />
                    </div>
                    <span className="text-sm text-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/cadastro"
                className="inline-flex items-center gap-3 bg-brand-red hover:bg-brand-red/90 active:scale-[0.98] text-white font-semibold px-8 py-4 rounded-xl transition-all duration-150 shadow-lg shadow-brand-red/20 group"
              >
                Iniciar Cadastro
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Right — steps card */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
                Como funciona
              </p>
              <div className="space-y-6">
                {[
                  { n: "01", title: "Dados da empresa", desc: "CNPJ, razão social e informações de contato" },
                  { n: "02", title: "Documentação", desc: "Upload de CNPJ, alvará e certidões" },
                  { n: "03", title: "Certificação ISO", desc: "Certificado ISO 9001 ou autoavaliação de qualidade" },
                  { n: "04", title: "Análise e aprovação", desc: "Nossa equipe revisa em até 5 dias úteis" },
                ].map((step, i) => (
                  <div key={step.n} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-brand-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {step.n}
                      </div>
                      {i < 3 && <div className="w-px h-full bg-border mt-2" />}
                    </div>
                    <div className="pb-6">
                      <p className="font-semibold text-sm text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-navy py-5 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Filtros Brasil. Todos os direitos reservados.
          </p>
          <p className="text-xs text-white/40">
            Dúvidas? <span className="text-white/60">compras@filtrosbrasil.com.br</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
