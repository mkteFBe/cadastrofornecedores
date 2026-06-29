import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { FornecedorFormData } from '@/types/fornecedor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileCheck2, UploadCloud, X, CheckCircle2, XCircle, AlertCircle, Sparkles, Calendar } from 'lucide-react';
import { pdfFileToImage } from '@/lib/pdfToImage';
import { extractDatesFromImageClient } from '@/lib/extractDatesClient';

interface Props {
  formData: FornecedorFormData;
  onChange: (f: keyof FornecedorFormData, v: string) => void;
  isoPdfUrl: string | null;
  onIsoPdfChange: (url: string | null) => void;
  errors: Record<string, string>;
}

const ist = { border:"1px solid var(--fb-mid-gray)", borderRadius:"4px", fontSize:"13px", fontFamily:"'AmpleSoft',sans-serif" };
const lbl = { fontSize:"10px", fontWeight:700, textTransform:"uppercase" as const, letterSpacing:"0.05em", color:"var(--fb-blue)", display:"block", marginBottom:"5px" };

export function StepISO({ formData, onChange, isoPdfUrl, onIsoPdfChange, errors }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isoFileName, setIsoFileName] = useState<string | null>(null);

  const extractDates = async (img: string) => {
    setIsExtracting(true);
    setExtractionError(null);
    try {
      const { data_emissao, data_validade } = await extractDatesFromImageClient(img);
      if (data_emissao) onChange('iso_data_emissao', data_emissao);
      if (data_validade) onChange('iso_data_validade', data_validade);
      if (data_emissao || data_validade) toast.success('Datas extraídas com sucesso!');
      else setExtractionError('Não foi possível identificar as datas. Preencha manualmente.');
    } catch {
      setExtractionError('Não foi possível extrair as datas. Preencha manualmente.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Apenas PDF é aceito.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10 MB.'); return; }

    setIsUploading(true);
    setIsoFileName(file.name);
    setExtractionError(null);

    try {
      // 1. Faz upload para o Supabase (operação principal)
      const path = `fornecedores/iso_9001_${Date.now()}.pdf`;
      const { error: upError } = await supabase.storage.from('documentos').upload(path, file);
      if (upError) throw upError;

      const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(path);
      onIsoPdfChange(publicUrl);
      toast.success('Certificado enviado!');
      setIsUploading(false);

      // 2. Tenta extrair datas via PDF.js — falha silenciosa se não funcionar
      try {
        const img = await pdfFileToImage(file, { scale: 2, format: 'image/jpeg', quality: 0.9 });
        await extractDates(img);
      } catch (pdfErr) {
        console.warn('PDF.js worker falhou, extração de datas desativada:', pdfErr);
        setExtractionError('Extração automática de datas indisponível. Preencha as datas manualmente.');
      }

    } catch (e: any) {
      console.error('Erro no upload:', e);
      toast.error('Erro ao enviar certificado. Verifique o bucket "documentos" no Supabase.');
      setIsoFileName(null);
      setIsUploading(false);
    }
  };

  const isoOpts = [
    { v:'SIM', l:'Sim, possuo', desc:'A empresa tem certificação vigente', icon:CheckCircle2, selBorder:"var(--fb-success)", selBg:"#F0FBF3", iconBg:"#D4F4DD", iconColor:"var(--fb-success)" },
    { v:'NÃO', l:'Não possuo', desc:'Será realizada autoavaliação', icon:XCircle, selBorder:"var(--fb-red)", selBg:"rgba(227,0,15,0.03)", iconBg:"var(--fb-light-gray)", iconColor:"var(--fb-slate-gray)" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold uppercase tracking-tight mb-1" style={{fontSize:"15px", color:"var(--fb-blue)"}}>Certificação ISO 9001</h3>
        <p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Certificações de qualidade aceitas: ISO 9001, Inmetro, ANVISA, SGS e equivalentes</p>
      </div>

      {/* Pergunta SIM/NÃO */}
      <div className="space-y-2">
        <label style={lbl}>A empresa possui certificação de qualidade (ISO 9001, Inmetro, ANVISA, SGS ou equivalente)? <span style={{color:"var(--fb-red)"}}>*</span></label>
        <div className="grid grid-cols-2 gap-3">
          {isoOpts.map(({ v, l, desc, icon: Icon, selBorder, selBg, iconBg, iconColor }) => {
            const sel = formData.possui_iso_9001 === v;
            return (
              <button key={v} type="button" onClick={() => onChange('possui_iso_9001', v)}
                className="flex items-start gap-3 p-4 text-left transition-all"
                style={{ border:`2px solid ${sel ? selBorder : "var(--fb-mid-gray)"}`, borderRadius:"8px", background:sel ? selBg : "#fff" }}>
                <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5" style={{background: sel ? iconBg : "var(--fb-light-gray)"}}>
                  <Icon className="w-4 h-4" style={{color: sel ? iconColor : "var(--fb-slate-gray)"}} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{color:"var(--fb-blue)"}}>{l}</p>
                  <p className="text-xs mt-0.5 leading-snug" style={{color:"var(--fb-slate-gray)"}}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        {errors.possui_iso_9001 && <p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.possui_iso_9001}</p>}
      </div>

      {/* Caminho SIM */}
      {formData.possui_iso_9001 === 'SIM' && (
        <div className="space-y-4 p-4 rounded-md" style={{background:"var(--fb-light-gray)", border:"1px solid var(--fb-mid-gray)"}}>
          <label style={lbl}>Certificado de qualidade <span style={{color:"var(--fb-red)"}}>*</span></label>

          {isUploading && (
            <div className="flex items-center gap-3 p-3 rounded-md bg-white" style={{border:"1px solid var(--fb-mid-gray)"}}>
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{color:"var(--fb-blue)"}} />
              <div>
                <p className="text-sm font-semibold" style={{color:"var(--fb-blue)"}}>Enviando certificado...</p>
                <p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>{isoFileName}</p>
              </div>
            </div>
          )}

          {!isUploading && isoPdfUrl && (
            <div className="flex items-center gap-3 p-3 rounded-md" style={{border:"2px solid var(--fb-success)", background:"#F0FBF3"}}>
              <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{background:"#D4F4DD"}}>
                <FileCheck2 className="w-4 h-4" style={{color:"var(--fb-success)"}} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{color:"#1A6B30"}}>Certificado enviado</p>
                <p className="text-xs truncate" style={{color:"#2D8B47"}}>{isoFileName}</p>
              </div>
              <button type="button" onClick={() => { onIsoPdfChange(null); setIsoFileName(null); setExtractionError(null); onChange('iso_data_emissao',''); onChange('iso_data_validade',''); }}
                className="p-1.5" style={{color:"#1A6B30", background:"none", border:"none", cursor:"pointer"}}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isUploading && !isoPdfUrl && (
            <label className="flex flex-col items-center gap-3 p-6 rounded-md cursor-pointer transition-all"
              style={{ border:`2px dashed ${isDragging ? "var(--fb-red)" : "var(--fb-mid-gray)"}`, background: isDragging ? "rgba(227,0,15,0.03)" : "#fff" }}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}>
              <UploadCloud className="w-7 h-7" style={{color: isDragging ? "var(--fb-red)" : "var(--fb-slate-gray)"}} />
              <div className="text-center">
                <p className="text-sm font-semibold" style={{color:"var(--fb-blue)"}}>Arraste ou <span className="underline" style={{color:"var(--fb-red)"}}>clique para selecionar</span></p>
                <p className="text-xs mt-0.5" style={{color:"var(--fb-slate-gray)"}}>PDF · máximo 10 MB</p>
              </div>
              <input type="file" accept=".pdf" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
            </label>
          )}

          {errors.iso_pdf && <p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.iso_pdf}</p>}

          {/* Datas — aparecem após upload */}
          {isoPdfUrl && (
            <div className="space-y-3 pt-3" style={{borderTop:"1px solid var(--fb-mid-gray)"}}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{color:"var(--fb-blue)"}} />
                <p className="text-xs font-bold uppercase tracking-wider" style={{color:"var(--fb-blue)"}}>Datas do Certificado</p>
              </div>

              {isExtracting && (
                <div className="flex items-center gap-2.5 p-3 rounded-md" style={{background:"rgba(15,26,44,0.05)", border:"1px solid rgba(15,26,44,0.1)"}}>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{color:"var(--fb-blue)"}} />
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" style={{color:"var(--fb-blue)"}} />
                    <span className="text-xs font-semibold" style={{color:"var(--fb-blue)"}}>Lendo certificado e extraindo datas...</span>
                  </div>
                </div>
              )}

              {!isExtracting && extractionError && (
                <div className="flex items-start gap-2 p-3 rounded-md" style={{background:"#FFF8E1", border:"1px solid #F0C040"}}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:"#8A6400"}} />
                  <p className="text-xs" style={{color:"#8A6400"}}>{extractionError}</p>
                </div>
              )}

              {!isExtracting && !extractionError && (formData.iso_data_emissao || formData.iso_data_validade) && (
                <div className="flex items-center gap-2 p-2.5 rounded-md" style={{background:"#F0FBF3", border:"1px solid #A8DFB5"}}>
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{color:"var(--fb-success)"}} />
                  <p className="text-xs font-semibold" style={{color:"#1A6B30"}}>Datas extraídas — confira e edite se necessário</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={lbl}>Data de emissão</label>
                  <Input type="date" value={formData.iso_data_emissao} onChange={e => onChange('iso_data_emissao', e.target.value)} style={ist} />
                </div>
                <div>
                  <label style={lbl}>Data de validade</label>
                  <Input type="date" value={formData.iso_data_validade} onChange={e => onChange('iso_data_validade', e.target.value)} style={ist} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caminho NÃO */}
      {formData.possui_iso_9001 === 'NÃO' && (
        <div className="flex items-start gap-3 p-4 rounded-md" style={{background:"#FFF8E1", border:"1px solid #F0C040"}}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{color:"#8A6400"}} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{color:"#8A6400"}}>Autoavaliação necessária</p>
            <p className="text-xs leading-relaxed" style={{color:"#8A6400"}}>Como a empresa não possui ISO 9001, a próxima etapa será uma autoavaliação de maturidade com 12 questões.</p>
          </div>
        </div>
      )}
    </div>
  );
}
