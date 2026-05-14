import { Mail, Phone } from "lucide-react";

export const Topbar = () => (
  <div style={{ background: "var(--fb-blue)" }} className="text-white py-2 text-xs">
    <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:underline font-semibold tracking-widest uppercase opacity-80 hover:opacity-100 text-[11px]">Trabalhe Conosco</a>
        <span className="opacity-30">|</span>
        <a href="#" className="hover:underline font-semibold tracking-widest uppercase opacity-80 hover:opacity-100 text-[11px] hidden sm:inline">Seja um Distribuidor</a>
      </div>
      <div className="hidden md:flex items-center gap-5 opacity-70">
        <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-1.5 hover:opacity-100 text-[11px]">
          <Mail className="h-3 w-3" /> contato@filtrosbrasil.com.br
        </a>
        <a href="tel:+551131835020" className="flex items-center gap-1.5 hover:opacity-100 text-[11px]">
          <Phone className="h-3 w-3" /> (11) 3183-5020
        </a>
      </div>
    </div>
  </div>
);
