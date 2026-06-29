import { FornecedorForm } from "@/components/fornecedor/FornecedorForm";
import { Topbar } from "@/components/landing/Topbar";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
const Cadastro = () => (<div className="min-h-screen flex flex-col"><Topbar/><Header/><main className="flex-1 py-8 px-4" style={{background:"var(--fb-light-gray)"}}><FornecedorForm/></main><Footer/></div>);
export default Cadastro;
