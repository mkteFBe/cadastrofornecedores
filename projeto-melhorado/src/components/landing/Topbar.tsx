import { Mail, Phone } from "lucide-react";

export const Topbar = () => {
  return (
    <div className="bg-primary text-primary-foreground py-2 text-sm">
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
        {/* Links à esquerda */}
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline text-xs md:text-sm">
            TRABALHE CONOSCO
          </a>
          <span className="hidden sm:inline">|</span>
          <a href="#" className="hover:underline text-xs md:text-sm hidden sm:inline">
            SEJA UM DISTRIBUIDOR
          </a>
        </div>

        {/* Contato e redes à direita */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-xs">
            <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-1 hover:underline">
              <Mail className="h-3 w-3" />
              contato@filtrosbrasil.com.br
            </a>
            <a href="tel:+551131835020" className="flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" />
              (11) 3183-5020
            </a>
          </div>
          
          {/* Bandeiras de idioma */}
          <div className="flex items-center gap-2">
            <button className="hover:opacity-80 transition-opacity" title="Español">
              <span className="text-lg">🇪🇸</span>
            </button>
            <button className="hover:opacity-80 transition-opacity" title="English">
              <span className="text-lg">🇺🇸</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
