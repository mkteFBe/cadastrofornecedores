import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

const navItems = [
  { label: "Blog", href: "#" },
  { label: "Produtos", href: "#", hasDropdown: true },
  { label: "Suporte Técnico", href: "#" },
  { label: "Fale Conosco", href: "#" },
];

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white sticky top-0 z-50" style={{ boxShadow: "var(--fb-shadow-sm)", borderBottom: "1px solid var(--fb-mid-gray)" }}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-9 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-1 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest transition-colors hover:text-[#E3000F]"
                style={{ color: "var(--fb-blue)" }}
              >
                {item.label}
                {item.hasDropdown && <ChevronDown className="h-3 w-3" />}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden md:inline-flex text-[11px] font-semibold uppercase tracking-widest transition-colors hover:text-[#E3000F]"
              style={{ color: "var(--fb-slate-gray)" }}
            >
              Área Admin
            </Link>
            <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
              {open ? <X className="h-5 w-5" style={{ color: "var(--fb-blue)" }} /> : <Menu className="h-5 w-5" style={{ color: "var(--fb-blue)" }} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t py-4 space-y-1" style={{ borderColor: "var(--fb-mid-gray)" }}>
            {navItems.map((item) => (
              <a key={item.label} href={item.href}
                className="block px-2 py-2.5 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--fb-blue)" }}>
                {item.label}
              </a>
            ))}
            <Link to="/admin" className="block px-2 py-2.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--fb-slate-gray)" }}>
              Área Admin
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
