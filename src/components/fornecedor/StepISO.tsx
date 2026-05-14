import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FornecedorFormData, OPCOES_ISO } from '@/types/fornecedor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Loader2, FileCheck2, UploadCloud, X,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { pdfFileToImage } from '@/lib/pdfToImage';
import { extractDatesFromImageClient } from '@/lib/extractDatesClient';

interface StepISOProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  isoPdfUrl: string | null;
  onIsoPdfChange: (url: string | null) => void;
  errors: Record<string, string>;
}

export function StepISO({ formData, onChange, isoPdfUrl, onIsoPdfChange, errors }: StepISOProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isoFileName, setIsoFileName] = useState<string | null>(null);

  const extractDatesFromImage = async (imageBase64: string) => {
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const { data_emissao, data_validade } = await extractDatesFromImageClient(imageBase64);
      if (data_emissao) onChange('iso_data_emissao', data_emissao);
      if (data_validade) onChange('iso_data_validade', data_validade);
      if (data_emissao || data_validade) {
        toast.success('Datas extraídas do certificado com sucesso!');
      } else {
        setExtractionError('Não foi possível identificar as datas automaticamente. Preencha manualmente.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      setExtractionError(`Não foi possível extrair as datas: ${message}. Preencha manualmente.`);
    } finally {
      setIsExtracting(false);
    }
  };

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
    setIsoFileName(file.name);
    setExtractionError(null);

    try {
      const imageBase64 = await pdfFileToImage(file, { scale: 2, format: 'image/jpeg', quality: 0.9 });

      const fileName = `iso_9001_${Date.now()}.pdf`;
      const filePath = `fornecedores/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      onIsoPdfChange(publicUrl);
      toast.success('Certificado ISO enviado!');
      setIsUploading(false);

      await extractDatesFromImage(imageBase64);
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao enviar certificado. Tente novamente.');
      setIsoFileName(null);
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

  const handleRemoveIso = () => {
    onIsoPdfChange(null);
    setIsoFileName(null);
    setExtractionError(null);
    onChange('iso_data_emissao', '');
    onChange('iso_data_validade', '');
  };

  const isoOptions = [
    {
      value: 'SIM',
      label: 'Sim, possuo',
      desc: 'A empresa tem certificação ISO 9001:2015 vigente',
      icon: CheckCircle2,
      color: 'text-green-600',
      selectedBg: 'border-green-500 bg-green-50',
      iconBg: 'bg-green-100 text-green-600',
    },
    {
      value: 'NÃO',
      label: 'Não possuo',
      desc: 'Será realizada uma autoavaliação de qualidade',
      icon: XCircle,
      color: 'text-muted-foreground',
      selectedBg: 'border-brand-navy bg-brand-navy/5',
      iconBg: 'bg-muted text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-foreground">Certificação ISO 9001</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Norma ABNT ISO 9001:2015 — Sistema de Gestão da Qualidade
        </p>
      </div>

      {/* Pergunta principal */}
      <div className="space-y-2">
        <Label>
          A empresa possui certificação ISO 9001:2015? <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {isoOptions.map(({ value, label, desc, icon: Icon, selectedBg, iconBg }) => {
            const isSelected = formData.possui_iso_9001 === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange('possui_iso_9001', value)}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all duration-150',
                  isSelected ? selectedBg : 'border-border hover:border-brand-navy/30 hover:bg-muted/40'
                )}
              >
                <div className={cn('w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5', isSelected ? iconBg : 'bg-muted text-muted-foreground')}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.possui_iso_9001 && (
          <p className="text-sm text-destructive">{errors.possui_iso_9001}</p>
        )}
      </div>

      {/* Caminho SIM: upload + datas */}
      {formData.possui_iso_9001 === 'SIM' && (
        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
          <p className="text-sm font-medium text-foreground">Envie o certificado ISO 9001:2015</p>

          {/* Upload */}
          {isUploading && (
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-white">
              <Loader2 className="w-5 h-5 animate-spin text-brand-navy flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Enviando certificado...</p>
                <p className="text-xs text-muted-foreground">{isoFileName}</p>
              </div>
            </div>
          )}

          {!isUploading && isoPdfUrl && (
            <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-500/30 bg-green-50">
              <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">Certificado enviado</p>
                <p className="text-xs text-green-700 truncate">{isoFileName || 'Arquivo PDF'}</p>
              </div>
              <button type="button" onClick={handleRemoveIso} className="p-1.5 rounded-md hover:bg-green-100 text-green-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isUploading && !isoPdfUrl && (
            <label
              className={cn(
                'flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-150',
                isDragging ? 'border-brand-navy bg-brand-navy/5' : errors.iso_pdf ? 'border-destructive' : 'border-border hover:border-brand-navy/50 hover:bg-white'
              )}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <UploadCloud className="w-7 h-7 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Arraste ou <span className="text-brand-navy underline underline-offset-2">clique para selecionar</span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">PDF · máximo 10 MB</p>
              </div>
              <Input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
          )}

          {errors.iso_pdf && <p className="text-sm text-destructive">{errors.iso_pdf}</p>}

          {/* Extração de datas */}
          {isoPdfUrl && (
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-navy" />
                <p className="text-sm font-medium text-foreground">Datas do certificado</p>
              </div>

              {isExtracting && (
                <div className="flex items-center gap-3 p-3 rounded-md bg-brand-navy/5 border border-brand-navy/20">
                  <Loader2 className="w-4 h-4 animate-spin text-brand-navy flex-shrink-0" />
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-navy" />
                    <span className="text-xs text-brand-navy font-medium">Lendo certificado e extraindo datas automaticamente…</span>
                  </div>
                </div>
              )}

              {!isExtracting && extractionError && (
                <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{extractionError}</p>
                </div>
              )}

              {!isExtracting && !extractionError && (formData.iso_data_emissao || formData.iso_data_validade) && (
                <div className="flex items-center gap-2 p-2.5 rounded-md bg-green-50 border border-green-200">
                  <Sparkles className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-800 font-medium">Datas extraídas automaticamente — confira e edite se necessário</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="iso_data_emissao" className="text-xs">Data de emissão</Label>
                  <Input
                    type="date"
                    id="iso_data_emissao"
                    value={formData.iso_data_emissao}
                    onChange={(e) => onChange('iso_data_emissao', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iso_data_validade" className="text-xs">Data de validade</Label>
                  <Input
                    type="date"
                    id="iso_data_validade"
                    value={formData.iso_data_validade}
                    onChange={(e) => onChange('iso_data_validade', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caminho NÃO: aviso */}
      {formData.possui_iso_9001 === 'NÃO' && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Autoavaliação necessária</p>
            <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
              Como a empresa não possui certificação ISO 9001, a próxima etapa será uma autoavaliação de
              maturidade em gestão da qualidade com 12 questões.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
