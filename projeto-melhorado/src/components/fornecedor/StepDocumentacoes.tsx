import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileCheck, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocUrls {
  contrato_social: string | null;
  alvara: string | null;
  certidao_federal: string | null;
  certidao_estadual: string | null;
  outros: string | null;
}

interface StepDocumentacoesProps {
  docUrls: DocUrls;
  onDocChange: (field: keyof DocUrls, url: string | null) => void;
  errors: Record<string, string>;
}

const DOCUMENTOS = [
  {
    key: 'contrato_social' as keyof DocUrls,
    label: 'Contrato Social ou Requerimento de Empresário',
    descricao: 'Documento constitutivo da empresa (última alteração consolidada)',
    obrigatorio: true,
  },
  {
    key: 'alvara' as keyof DocUrls,
    label: 'Alvará de Funcionamento',
    descricao: 'Licença municipal vigente para funcionamento',
    obrigatorio: true,
  },
  {
    key: 'certidao_federal' as keyof DocUrls,
    label: 'Certidão Negativa de Débitos Federais',
    descricao: 'CND da Receita Federal + PGFN (emitida nos últimos 180 dias)',
    obrigatorio: true,
  },
  {
    key: 'certidao_estadual' as keyof DocUrls,
    label: 'Certidão Negativa de Débitos Estaduais',
    descricao: 'CND da Fazenda Estadual (emitida nos últimos 180 dias)',
    obrigatorio: false,
  },
  {
    key: 'outros' as keyof DocUrls,
    label: 'Outros Documentos',
    descricao: 'Certificados, licenças ou outros documentos relevantes (opcional)',
    obrigatorio: false,
  },
] as const;

function UploadField({
  docKey, label, descricao, obrigatorio, url, error,
  onUpload,
}: {
  docKey: string; label: string; descricao: string; obrigatorio: boolean;
  url: string | null; error?: string; onUpload: (file: File) => Promise<void>;
}) {
  const [uploading, setUploading] = useState(false);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Apenas PDFs são aceitos.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Tamanho máximo: 10MB.'); return; }
    setUploading(true);
    try { await onUpload(file); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="text-sm font-medium">
            {label} {obrigatorio && <span className="text-destructive">*</span>}
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">{descricao}</p>
        </div>
        {url && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 mt-0.5">
            <FileCheck className="w-3 h-3" /> Enviado
          </span>
        )}
      </div>

      <label className={cn(
        'flex items-center gap-3 border-2 border-dashed rounded-lg px-4 py-3 cursor-pointer transition-colors',
        url ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50' : 'border-border hover:border-primary/40 hover:bg-muted/30',
        error && 'border-destructive',
      )}>
        {uploading
          ? <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />
          : url
            ? <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            : <Upload className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        <span className="text-sm text-muted-foreground truncate">
          {uploading ? 'Enviando...' : url ? 'Clique para substituir o arquivo' : 'Clique para selecionar PDF'}
        </span>
        <Input type="file" accept=".pdf" onChange={handle} className="hidden" />
      </label>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

export function StepDocumentacoes({ docUrls, onDocChange, errors }: StepDocumentacoesProps) {
  const uploadDoc = async (field: keyof DocUrls, file: File) => {
    const path = `fornecedores/${field}_${Date.now()}.pdf`;
    const { error } = await supabase.storage.from('documentos').upload(path, file);
    if (error) { toast.error('Erro ao enviar. Tente novamente.'); return; }
    const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(path);
    onDocChange(field, publicUrl);
    toast.success('Documento enviado!');
  };

  const obrigatoriosFaltando = DOCUMENTOS
    .filter(d => d.obrigatorio && !docUrls[d.key]).length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Envie os documentos da empresa em formato PDF. Os marcados com <span className="text-destructive font-medium">*</span> são obrigatórios.
          </p>
        </div>
        {obrigatoriosFaltando > 0 && (
          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
            {obrigatoriosFaltando} obrigatório{obrigatoriosFaltando > 1 ? 's' : ''} pendente{obrigatoriosFaltando > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {DOCUMENTOS.map(doc => (
          <UploadField
            key={doc.key}
            docKey={doc.key}
            label={doc.label}
            descricao={doc.descricao}
            obrigatorio={doc.obrigatorio}
            url={docUrls[doc.key]}
            error={errors[`doc_${doc.key}`]}
            onUpload={(file) => uploadDoc(doc.key, file)}
          />
        ))}
      </div>
    </div>
  );
}
