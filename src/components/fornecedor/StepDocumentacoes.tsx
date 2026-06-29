import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileCheck2, UploadCloud, X, FileText } from 'lucide-react';
interface Props { documentUrl: string | null; onDocumentChange: (url: string | null) => void; errors: Record<string, string>; }
export function StepDocumentacoes({ documentUrl, onDocumentChange, errors }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') { toast.error('Apenas PDF é aceito.'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Máximo 10 MB.'); return; }
    setIsUploading(true); setFileName(file.name);
    try {
      const path = `fornecedores/documentacoes_${Date.now()}.pdf`;
      const { error: up } = await supabase.storage.from('documentos').upload(path, file);
      if (up) throw up;
      const { data: { publicUrl } } = supabase.storage.from('documentos').getPublicUrl(path);
      onDocumentChange(publicUrl); toast.success('Documento enviado!');
    } catch (e: any) { console.error(e); toast.error('Erro ao enviar. Tente novamente.'); setFileName(null); }
    finally { setIsUploading(false); }
  };
  return (
    <div className="space-y-5">
      <div><h3 className="font-bold uppercase tracking-tight mb-1" style={{fontSize:"15px",color:"var(--fb-blue)"}}>Documentação Fiscal</h3><p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>Envie o Cartão CNPJ e a Inscrição Estadual em um único PDF</p></div>
      {isUploading && <div className="flex items-center gap-3 p-4 rounded-md" style={{border:"1px solid var(--fb-mid-gray)",background:"var(--fb-light-gray)"}}><Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{color:"var(--fb-blue)"}} /><div><p className="text-sm font-semibold" style={{color:"var(--fb-blue)"}}>Enviando...</p><p className="text-xs" style={{color:"var(--fb-slate-gray)"}}>{fileName}</p></div></div>}
      {!isUploading && documentUrl && <div className="flex items-center gap-3 p-4 rounded-md" style={{border:"2px solid var(--fb-success)",background:"#F0FBF3"}}><div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{background:"#D4F4DD"}}><FileCheck2 className="w-5 h-5" style={{color:"var(--fb-success)"}} /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{color:"#1A6B30"}}>Documento enviado</p><p className="text-xs truncate" style={{color:"#2D8B47"}}>{fileName||'Arquivo PDF'}</p></div><button type="button" onClick={()=>{onDocumentChange(null);setFileName(null);}} className="p-1.5 rounded" style={{color:"#1A6B30"}}><X className="w-4 h-4" /></button></div>}
      {!isUploading && !documentUrl && <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-md cursor-pointer transition-all" style={{border:`2px dashed ${isDragging?"var(--fb-red)":errors.documentacoes?"var(--fb-error)":"var(--fb-mid-gray)"}`,background:isDragging?"rgba(227,0,15,0.03)":"var(--fb-light-gray)"}} onDragOver={e=>{e.preventDefault();setIsDragging(true);}} onDragLeave={()=>setIsDragging(false)} onDrop={e=>{e.preventDefault();setIsDragging(false);const f=e.dataTransfer.files?.[0];if(f)handleFile(f);}}>
        <UploadCloud className="w-8 h-8" style={{color:isDragging?"var(--fb-red)":"var(--fb-slate-gray)"}} />
        <div className="text-center"><p className="text-sm font-semibold" style={{color:"var(--fb-blue)"}}>Arraste ou <span className="underline underline-offset-2" style={{color:"var(--fb-red)"}}>clique para selecionar</span></p><p className="text-xs mt-1" style={{color:"var(--fb-slate-gray)"}}>PDF · máximo 10 MB</p></div>
        <input type="file" accept=".pdf" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}} className="hidden" />
      </label>}
      {errors.documentacoes&&!documentUrl&&<p className="text-xs" style={{color:"var(--fb-error)"}}>{errors.documentacoes}</p>}
      <div className="flex items-start gap-2.5 p-3 rounded-md" style={{background:"var(--fb-light-gray)",border:"1px solid var(--fb-mid-gray)"}}><FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{color:"var(--fb-slate-gray)"}} /><p className="text-xs leading-relaxed" style={{color:"var(--fb-slate-gray)"}}><strong style={{color:"var(--fb-dark-gray)"}}>O que enviar:</strong> Cartão CNPJ + Inscrição Estadual em um único PDF. Se não tiver IE, envie apenas o Cartão CNPJ.</p></div>
    </div>
  );
}
