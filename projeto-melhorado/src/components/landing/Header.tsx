import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "BLOG", href: "#" },
    { label: "PRODUTOS", href: "#" },
    { label: "SUPORTE TÉCNICO", href: "#" },
    { label: "FALE CONOSCO", href: "#" },
  ];

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                FILTROS
              </span>
              <span className="text-xl md:text-2xl font-bold text-brand-red tracking-tight -mt-1">
                BRASIL
              </span>
            </div>
          </Link>

          {/* Menu desktop */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Botão de busca e Admin */}
          <div className="flex items-center gap-3">
            <Button
              variant="destructive"
              size="sm"
              className="hidden md:flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              <span>SUPERBUSCA</span>
            </Button>

            <Link
              to="/admin"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden md:block"
            >
              Admin
            </Link>

            {/* Hamburger mobile */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t py-4">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
                >
                  {item.label}
                </a>
              ))}
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 w-fit"
              >
                <Search className="h-4 w-4" />
                <span>SUPERBUSCA</span>
              </Button>
              <Link
                to="/admin"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Acesso Admin
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
