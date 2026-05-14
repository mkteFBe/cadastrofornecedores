import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => (
  <footer className="bg-brand-navy text-white">
    <div className="container mx-auto px-4 py-10">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <img
            src="/logo-filtros-brasil-branco.svg"
            alt="Filtros Brasil"
            className="h-8 w-auto"
          />
          <p className="text-sm opacity-70 max-w-xs">
            Uma marca que cresce junto com o mercado. Investimos no presente para liderar o futuro.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Contato</h3>
          <div className="space-y-2 text-sm opacity-75">
            <a href="mailto:contato@filtrosbrasil.com.br" className="flex items-center gap-2 hover:opacity-100">
              <Mail className="h-4 w-4" /> contato@filtrosbrasil.com.br
            </a>
            <a href="tel:+551131835020" className="flex items-center gap-2 hover:opacity-100">
              <Phone className="h-4 w-4" /> (11) 3183-5020
            </a>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5" /> São Paulo, Brasil
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold">Links Rápidos</h3>
          <div className="space-y-1.5 text-sm opacity-75">
            {["Produtos", "Suporte Técnico", "Fale Conosco", "Blog"].map((l) => (
              <a key={l} href="#" className="block hover:opacity-100">{l}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs opacity-50">
        © {new Date().getFullYear()} Filtros Brasil. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);
