import { Mail, Phone } from "lucide-react";
export const Topbar = () => (
  <div style={{ background: "var(--fb-blue)" }} className="text-white py-2">
    <div className="container mx-auto px-6 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-4">
        <a href="#" className="hover:underline text-[11px] font-semibold uppercase tracking-widest opacity-80 hover:opacity-100">Trabalhe Conosco</a>
        <span className="opacity-30 hidden sm:inline">|</span>
        <a href="#" className="hover:underline text-[11px] font-semibold uppercase tracking-widest opacity-80 hover:opacity-100 hidden sm:inline">Seja um Distribuidor</a>
      </div>
      <div className="hidden md:flex items-center gap-5 opacity-70 text-[11px]">
        <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-1.5 hover:opacity-100"><Mail className="h-3 w-3" /> contato@filtrosbrasil.com.br</a>
        <a href="tel:+551131835020" className="flex items-center gap-1.5 hover:opacity-100"><Phone className="h-3 w-3" /> (11) 3183-5020</a>
      </div>
    </div>
  </div>
);
