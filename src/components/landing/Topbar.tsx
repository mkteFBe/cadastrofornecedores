import { Mail, Phone } from "lucide-react";

export const Topbar = () => (
  <div className="bg-brand-navy text-white py-2 text-sm">
    <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:underline text-xs md:text-sm">TRABALHE CONOSCO</a>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="#" className="hover:underline text-xs md:text-sm hidden sm:inline">SEJA UM DISTRIBUIDOR</a>
      </div>
      <div className="hidden md:flex items-center gap-4 text-xs opacity-80">
        <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-1 hover:opacity-100">
          <Mail className="h-3 w-3" /> contato@filtrosbrasil.com.br
        </a>
        <a href="tel:+551131835020" className="flex items-center gap-1 hover:opacity-100">
          <Phone className="h-3 w-3" /> (11) 3183-5020
        </a>
      </div>
    </div>
  </div>
);
