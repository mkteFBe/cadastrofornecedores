import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FornecedorFormData, OPCOES_ISO } from '@/types/fornecedor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileCheck, Upload, Calendar, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepISOProps {
  formData: FornecedorFormData;
  onChange: (field: keyof FornecedorFormData, value: string) => void;
  isoPdfUrl: string | null;
  onIsoPdfChange: (url: string | null) => void;
  errors: Record<string, string>;
}

export function StepISO({ formData, onChange, isoPdfUrl, onIsoPdfChange, errors }: StepISOProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Apenas arquivos PDF são aceitos.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const filePath = `fornecedores/iso_9001_${Date.now()}.pdf`;
      const { error } = await supabase.storage.from('documentos').upload(filePath, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(filePath);
      onIsoPdfChange(publicUrl);
      toast.success('Certificado ISO enviado!');
    } catch {
      toast.error('Erro ao enviar certificado. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pergunta ISO */}
      <div className="space-y-3">
        <Label>
          Possui certificação ABNT ISO 9001:2015? <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={formData.possui_iso_9001}
          onValueChange={(v) => onChange('possui_iso_9001', v)}
          className="flex gap-4"
        >
          {OPCOES_ISO.map((opcao) => (
            <label
              key={opcao}
              htmlFor={`iso-${opcao}`}
              className={cn(
                'flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 cursor-pointer transition-all',
                formData.possui_iso_9001 === opcao
                  ? 'border-brand-navy bg-brand-navy/5'
                  : 'border-border hover:border-brand-navy/30'
              )}
            >
              <RadioGroupItem value={opcao} id={`iso-${opcao}`} />
              <span className="font-medium text-sm">{opcao}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.possui_iso_9001 && (
          <p className="text-sm text-destructive">{errors.possui_iso_9001}</p>
        )}
      </div>

      {/* Bloco ISO = SIM */}
      {formData.possui_iso_9001 === 'SIM' && (
        <div className="space-y-5">
          {/* Upload do certificado */}
          <div className="space-y-2">
            <Label>
              Certificado ISO 9001:2015 (PDF) <span className="text-destructive">*</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Envie o certificado vigente em formato PDF (máximo 10MB).
            </p>
            <label className={cn(
              'flex items-center gap-3 border-2 border-dashed rounded-xl px-5 py-4 cursor-pointer transition-colors',
              isoPdfUrl
                ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                : 'border-border hover:border-primary/40 hover:bg-muted/30',
              errors.iso_pdf && 'border-destructive',
            )}>
              {isUploading
                ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground flex-shrink-0" />
                : isoPdfUrl
                  ? <FileCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  : <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
              <span className="text-sm text-muted-foreground">
                {isUploading
                  ? 'Enviando...'
                  : isoPdfUrl
                    ? 'Certificado enviado — clique para substituir'
                    : 'Clique para selecionar o certificado PDF'}
              </span>
              <Input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
            </label>
            {errors.iso_pdf && <p className="text-sm text-destructive">{errors.iso_pdf}</p>}
          </div>

          {/* Datas manuais — aparecem após o upload */}
          {isoPdfUrl && (
            <div className="bg-muted/40 border border-border rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-navy" />
                <span className="text-sm font-semibold text-brand-navy">Datas do Certificado</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="iso_data_emissao" className="text-sm">
                    Data de Emissão
                  </Label>
                  <Input
                    type="date"
                    id="iso_data_emissao"
                    value={formData.iso_data_emissao}
                    onChange={(e) => onChange('iso_data_emissao', e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="iso_data_validade" className="text-sm">
                    Data de Validade
                  </Label>
                  <Input
                    type="date"
                    id="iso_data_validade"
                    value={formData.iso_data_validade}
                    onChange={(e) => onChange('iso_data_validade', e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <Info className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Preencha as datas conforme constam no certificado enviado.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bloco ISO = NÃO */}
      {formData.possui_iso_9001 === 'NÃO' && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Como não possui certificação ISO 9001, você será direcionado para a etapa de <strong>Autoavaliação de Qualidade</strong> na próxima etapa.
          </p>
        </div>
      )}
    </div>
  );
}
