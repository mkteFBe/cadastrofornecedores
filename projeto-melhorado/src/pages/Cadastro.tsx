import { FornecedorForm } from "@/components/fornecedor/FornecedorForm";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Cadastro = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header compacto */}
      <header className="bg-white border-b border-border/60">
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
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-brand-navy">Cadastro de Fornecedor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Preencha todas as etapas para concluir sua qualificação
            </p>
          </div>
          <FornecedorForm />
        </div>
      </main>

      <footer className="bg-brand-navy py-4 px-6 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Filtros Brasil. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Cadastro;
