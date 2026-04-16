import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileSpreadsheet, FileText, Loader2, ChevronDown } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/exportFornecedores';
import type { Fornecedor } from '@/types/fornecedor';
import { toast } from 'sonner';

interface ExportButtonProps {
  fornecedores: Fornecedor[];
  filtroStatus?: string;
}

export function ExportButton({ fornecedores, filtroStatus }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  const handleExcel = async () => {
    if (!fornecedores.length) { toast.error('Nenhum dado para exportar'); return; }
    setLoading('excel');
    setOpen(false);
    try {
      // Pequeno delay para o loader aparecer antes do processamento síncrono
      await new Promise(r => setTimeout(r, 50));
      exportToExcel(fornecedores);
      toast.success(`Excel gerado com ${fornecedores.length} fornecedor${fornecedores.length !== 1 ? 'es' : ''}!`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar o Excel');
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = async () => {
    if (!fornecedores.length) { toast.error('Nenhum dado para exportar'); return; }
    setLoading('pdf');
    setOpen(false);
    try {
      await new Promise(r => setTimeout(r, 50));
      exportToPDF(fornecedores, filtroStatus);
      toast.success(`PDF gerado com ${fornecedores.length} fornecedor${fornecedores.length !== 1 ? 'es' : ''}!`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao gerar o PDF');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 text-sm"
        onClick={() => setOpen(o => !o)}
        disabled={!!loading || fornecedores.length === 0}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Exportar
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-1.5 z-20 bg-white border border-border rounded-xl shadow-lg overflow-hidden min-w-[180px]">
            <div className="px-3 pt-2.5 pb-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {fornecedores.length} registro{fornecedores.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={handleExcel}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-foreground leading-none">Excel (.xlsx)</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Com aba de autoavaliação</p>
              </div>
            </button>

            <button
              onClick={handlePDF}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-foreground leading-none">PDF (.pdf)</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Com KPIs e tabela formatada</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
