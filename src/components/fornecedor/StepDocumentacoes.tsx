import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileCheck2, UploadCloud, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepDocumentacoesProps {
  documentUrl: string | null;
  onDocumentChange: (url: string | null) => void;
  errors: Record<string, string>;
}

export function StepDocumentacoes({ documentUrl, onDocumentChange, errors }: StepDocumentacoesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são aceitos.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10 MB.');
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const fileName = `documentacoes_${Date.now()}.pdf`;
      const filePath = `fornecedores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      onDocumentChange(publicUrl);
      toast.success('Documento enviado com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar documento. Tente novamente.');
      setFileName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleRemove = () => {
    onDocumentChange(null);
    setFileName(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Documentação fiscal</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Envie o Cartão CNPJ e a Inscrição Estadual em um único arquivo PDF
        </p>
      </div>

      <div className="space-y-2">
        <Label>
          Documento <span className="text-destructive">*</span>
        </Label>

        {/* Estado: enviando */}
        {isUploading && (
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/40">
            <Loader2 className="w-5 h-5 animate-spin text-brand-navy flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Enviando documento...</p>
              <p className="text-xs text-muted-foreground">{fileName}</p>
            </div>
          </div>
        )}

        {/* Estado: enviado com sucesso */}
        {!isUploading && documentUrl && (
          <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-500/30 bg-green-50">
            <div className="w-9 h-9 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
              <FileCheck2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">Documento enviado</p>
              <p className="text-xs text-green-700 truncate">{fileName || 'Arquivo PDF'}</p>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-md hover:bg-green-100 text-green-700 transition-colors"
              aria-label="Remover arquivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Estado: vazio — zona de upload */}
        {!isUploading && !documentUrl && (
          <label
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-150',
              isDragging
                ? 'border-brand-navy bg-brand-navy/5'
                : errors.documentacoes
                ? 'border-destructive bg-destructive/5'
                : 'border-border hover:border-brand-navy/50 hover:bg-muted/40'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
              isDragging ? 'bg-brand-navy/10' : 'bg-muted'
            )}>
              <UploadCloud className={cn('w-6 h-6', isDragging ? 'text-brand-navy' : 'text-muted-foreground')} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Arraste o arquivo ou <span className="text-brand-navy underline underline-offset-2">clique para selecionar</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF · máximo 10 MB</p>
            </div>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}

        {errors.documentacoes && !documentUrl && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
            {errors.documentacoes}
          </p>
        )}

        <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50 border">
          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">O que enviar:</strong> Cartão CNPJ + Inscrição Estadual em um único PDF.
            Se não tiver Inscrição Estadual, envie apenas o Cartão CNPJ.
          </p>
        </div>
      </div>
    </div>
  );
}
