import { Link } from "react-router-dom";
const NotFound = () => <div className="min-h-screen flex items-center justify-center" style={{background:"var(--fb-light-gray)"}}><div className="text-center space-y-4"><p className="text-5xl font-bold" style={{color:"var(--fb-blue)"}}>404</p><p className="text-lg" style={{color:"var(--fb-slate-gray)"}}>Página não encontrada</p><Link to="/" className="inline-block text-sm font-semibold underline underline-offset-2" style={{color:"var(--fb-red)"}}>Voltar para o início</Link></div></div>;
export default NotFound;
