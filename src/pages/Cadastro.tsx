import { FornecedorForm } from "@/components/fornecedor/FornecedorForm";
import { Topbar } from "@/components/landing/Topbar";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const Cadastro = () => (
  <div className="min-h-screen flex flex-col">
    <Topbar />
    <Header />
    <main className="flex-1 bg-slate-50 py-8 px-4">
      <FornecedorForm />
    </main>
    <Footer />
  </div>
);

export default Cadastro;
