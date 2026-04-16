import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo e descrição */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight">FILTROS</span>
              <span className="text-2xl font-bold text-brand-red tracking-tight -mt-1">
                BRASIL
              </span>
            </div>
            <p className="text-sm opacity-80 max-w-xs">
              Uma marca que cresce junto com o mercado. Investimos no presente para liderar o futuro.
            </p>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Contato</h3>
            <div className="space-y-3 text-sm opacity-80">
              <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-2 hover:opacity-100">
                <Mail className="h-4 w-4" />
                contato@filtrosbrasil.com.br
              </a>
              <a href="tel:+551131835020" className="flex items-center gap-2 hover:opacity-100">
                <Phone className="h-4 w-4" />
                (11) 3183-5020
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>São Paulo, Brasil</span>
              </div>
            </div>
          </div>

          {/* Links rápidos */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Links Rápidos</h3>
            <div className="space-y-2 text-sm opacity-80">
              <a href="#" className="block hover:opacity-100">Produtos</a>
              <a href="#" className="block hover:opacity-100">Suporte Técnico</a>
              <a href="#" className="block hover:opacity-100">Fale Conosco</a>
              <a href="#" className="block hover:opacity-100">Blog</a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-60">
          <p>© {new Date().getFullYear()} Filtros Brasil. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
