import { Mail, Phone, MapPin } from "lucide-react";
export const Footer = () => (
  <footer style={{ background: "var(--fb-blue)", color: "#fff" }}>
    <div className="container mx-auto px-6 py-16">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="space-y-4">
          <img src="/logo-filtros-brasil-branco.svg" alt="Filtros Brasil" className="h-8 w-auto" />
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>Uma marca que cresce junto com o mercado. Investimos no presente para liderar o futuro.</p>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Contato</h4>
          <div className="space-y-2.5">
            {[{ icon: Mail, text: "contato@filtrosbrasil.com.br", href: "mailto:contato@filtrosbrasil.com.br" }, { icon: Phone, text: "(11) 3183-5020", href: "tel:+551131835020" }, { icon: MapPin, text: "São Paulo, Brasil", href: "#" }].map(({ icon: Icon, text, href }) => <a key={text} href={href} className="flex items-center gap-2.5 text-sm hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.6)" }}><Icon className="h-4 w-4 flex-shrink-0" />{text}</a>)}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white">Links Rápidos</h4>
          <div className="space-y-2">{["Produtos","Suporte Técnico","Fale Conosco","Blog"].map(l => <a key={l} href="#" className="block text-sm hover:opacity-100 transition-opacity" style={{ color: "rgba(255,255,255,0.6)" }}>{l}</a>)}</div>
        </div>
      </div>
      <div className="mt-12 pt-6 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>© {new Date().getFullYear()} Filtros Brasil. Todos os direitos reservados.</div>
    </div>
  </footer>
);
