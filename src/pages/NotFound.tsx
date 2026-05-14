import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center space-y-4">
      <p className="text-5xl font-bold text-brand-navy">404</p>
      <p className="text-lg text-muted-foreground">Página não encontrada</p>
      <Link to="/" className="inline-block text-sm text-brand-navy font-medium underline underline-offset-2">
        Voltar para o início
      </Link>
    </div>
  </div>
);

export default NotFound;
