import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";

export const Hero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 overflow-hidden bg-background">
      <GridPattern
        width={40}
        height={40}
        className="fill-brand-red/10 stroke-brand-red/20"
        squares={[
          [1, 2], [3, 5], [5, 1], [7, 4], [9, 7], [11, 3], [13, 6], [15, 2],
          [2, 8], [4, 11], [6, 9], [8, 12], [10, 10], [12, 8], [14, 11],
          [0, 5], [16, 7], [3, 14], [7, 13], [11, 15], [15, 14]
        ]}
      />
      <div className="w-full max-w-lg mx-auto px-4">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-brand-navy rounded-lg flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-2xl">FB</span>
            </div>
            <span className="text-3xl font-bold text-brand-navy">Filtros Brasil</span>
          </div>
          <div className="w-16 h-1 bg-brand-red mx-auto mb-3 rounded-full" />
          <p className="text-muted-foreground text-lg">Portal de Cadastro de Fornecedores</p>
        </div>

        {/* Card principal */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-brand-navy rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-brand-navy">
              Formulário de Autoavaliação
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Preencha o formulário para iniciar seu cadastro como fornecedor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Benefícios rápidos */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span className="text-foreground">Processo 100% online</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span className="text-foreground">Análise em até 5 dias úteis</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 text-brand-red flex-shrink-0" />
                <span className="text-foreground">Documentação simplificada</span>
              </div>
            </div>

            {/* Botão principal */}
            <Button
              asChild
              size="lg"
              className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-semibold h-14 text-lg shadow-lg"
            >
              <Link to="/cadastro" className="flex items-center gap-2">
                Iniciar Cadastro
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            {/* Link admin discreto */}
            <div className="pt-4 border-t">
              <Link
                to="/admin"
                className="block text-center text-xs text-muted-foreground hover:text-brand-navy transition-colors"
              >
                Acesso administrativo
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dúvidas */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Dúvidas? Entre em contato: <span className="text-brand-navy font-medium">compras@filtrosbrasil.com.br</span>
        </p>
      </div>
    </div>
  );
};
