import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "BLOG", href: "#" },
  { label: "PRODUTOS", href: "#" },
  { label: "SUPORTE TÉCNICO", href: "#" },
  { label: "FALE CONOSCO", href: "#" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <img
              src="/logo-filtros-brasil.svg"
              alt="Filtros Brasil"
              className="h-8 w-auto"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-xs font-semibold text-foreground hover:text-brand-navy transition-colors tracking-wide">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/admin" className="text-xs text-muted-foreground hover:text-brand-navy transition-colors hidden md:block">
              Acesso Admin
            </Link>
            <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t py-4 space-y-3">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="block text-sm font-medium py-1.5">
                {item.label}
              </a>
            ))}
            <Link to="/admin" className="block text-xs text-muted-foreground py-1.5">Acesso Admin</Link>
          </div>
        )}
      </div>
    </header>
  );
};
