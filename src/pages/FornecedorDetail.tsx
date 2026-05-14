import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Fornecedor, STATUS_FORNECEDOR } from '@/types/fornecedor';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Save, Loader2, Home } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const labelStyle = { fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--fb-slate-gray)", display: "block", marginBottom: "5px" };
const valueStyle = { fontSize: "14px", fontWeight: 500, color: "var(--fb-blue)" };

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Aprovado': { bg: '#E9F7EE', color: '#1A6B30' }, 'Ativo': { bg: '#E9F7EE', color: '#1A6B30' },
  'Pendente': { bg: '#FFF8E1', color: '#8A6400' }, 'Em Análise': { bg: '#E3F0FB', color: '#0C4A8A' },
  'Reprovado': { bg: '#FEE8E8', color: '#A32D2D' }, 'Inativo': { bg: '#F4F4F4', color: '#666' },
  'Pendente Reavaliação': { bg: '#F0EBF8', color: '#5A2D82' }, 'Pendente Renovação ISO': { bg: '#FFF0E0', color: '#8A4500' },
};

export default function FornecedorDetail() {
  const { id } = useParams<{ id: string }>();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => { if (id) fetchFornecedor(); }, [id]);

  const fetchFornecedor = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('fornecedores').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (data) { setFornecedor(data); setStatus(data.status); setObservacoes(data.observacoes_internas || ''); }
    } catch { toast.error('Erro ao carregar dados do fornecedor'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!fornecedor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('fornecedores').update({ status, observacoes_internas: observacoes || null, updated_at: new Date().toISOString() }).eq('id', fornecedor.id);
      if (error) throw error;
      setFornecedor(p => p ? { ...p, status, observacoes_internas: observacoes } : null);
      toast.success('Alterações salvas!');
    } catch { toast.error('Erro ao salvar'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--fb-slate-gray)" }} /></div>;
  if (!fornecedor) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="font-semibold mb-3" style={{ color: "var(--fb-blue)" }}>Fornecedor não encontrado</p><Link to="/admin"><button className="text-xs font-semibold uppercase tracking-wider px-4 py-2" style={{ background: "var(--fb-blue)", color: "#fff", borderRadius: "9999px" }}>Voltar para lista</button></Link></div></div>;

  const sc = STATUS_COLORS[fornecedor.status] || { bg: '#F4F4F4', color: '#666' };
  const autoFields = [
    { label: '1. Recebimento', value: fornecedor.auto_recebimento },
    { label: '1.1 Verificação', value: fornecedor.auto_verificacao_qualidade },
    { label: '2. Produto não conforme', value: fornecedor.auto_produto_nao_conforme },
    { label: '2.2 Não conformidade', value: fornecedor.auto_nao_conformidade_tratativa },
    { label: '3. Rastreabilidade', value: fornecedor.auto_rastreabilidade },
    { label: '4. Controle processo', value: fornecedor.auto_controle_processo },
    { label: '5. Calibração', value: fornecedor.auto_calibracao_maquinas },
    { label: '6. Ações corretivas', value: fornecedor.auto_eficacia_acoes_corretivas },
    { label: '7. Qualidade operacional', value: fornecedor.auto_qualidade_operacional },
    { label: '7.1 Taxa defeitos', value: fornecedor.auto_taxa_defeitos },
    { label: '8. Expedição/ambiente', value: fornecedor.auto_ambiente_expedicao },
    { label: '8.1 Transporte', value: fornecedor.auto_expedicao_transporte },
  ];
  const totalScore = autoFields.reduce((a, f) => a + (f.value || 0), 0);
  const cls = totalScore >= 80 ? { label: 'A — Apto', bg: '#E9F7EE', color: '#1A6B30' } : totalScore >= 50 ? { label: 'B — Condicionalmente Apto', bg: '#FFF8E1', color: '#8A6400' } : { label: 'C — Inapto', bg: '#FEE8E8', color: '#A32D2D' };

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div><p style={labelStyle}>{label}</p><p style={valueStyle}>{value ?? '-'}</p></div>
  );

  const DocLink = ({ label, url }: { label: string; url: string | null | undefined }) => (
    <div className="flex items-center justify-between p-3 rounded-md" style={{ border: "1px solid var(--fb-mid-gray)" }}>
      <span className="text-sm" style={{ color: "var(--fb-dark-gray)" }}>{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <button className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5"
            style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "9999px", color: "var(--fb-blue)", background: "transparent" }}>
            <Download className="w-3.5 h-3.5" /> Baixar
          </button>
        </a>
      ) : <span className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>Não enviado</span>}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--fb-light-gray)" }}>
      <header className="bg-white" style={{ borderBottom: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-8 w-auto" />
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--fb-slate-gray)" }}>Painel Administrativo</p>
          </div>
          <Link to="/"><button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2" style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "9999px", color: "var(--fb-blue)", background: "transparent" }}><Home className="w-3.5 h-3.5" /> Site</button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-5">
          <Link to="/admin"><button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fb-slate-gray)", background: "none", border: "none", cursor: "pointer" }}><ArrowLeft className="w-4 h-4" /> Voltar para lista</button></Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {/* Dados principais */}
            <div className="bg-white rounded-md p-6" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="font-bold uppercase tracking-tight" style={{ fontSize: "18px", color: "var(--fb-blue)" }}>{fornecedor.razao_social || 'Fornecedor'}</h2>
                  <p className="text-xs mt-1" style={{ color: "var(--fb-slate-gray)" }}>{fornecedor.tipo_fornecedor} · {fornecedor.ramo_atuacao || 'Ramo não informado'}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5" style={{ background: sc.bg, color: sc.color, borderRadius: "9999px" }}>{fornecedor.status}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="E-mail" value={fornecedor.email} />
                <InfoItem label="CNPJ" value={fornecedor.cnpj} />
                <InfoItem label="Telefone" value={fornecedor.telefone} />
                <InfoItem label="Regime Tributário" value={fornecedor.regime_tributario} />
                <InfoItem label="Responsável" value={fornecedor.responsavel} />
              </div>
              <Separator className="my-5" />
              <h3 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "13px", color: "var(--fb-blue)" }}>ISO 9001:2015</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <InfoItem label="Possui certificação?" value={fornecedor.possui_iso_9001 ? 'Sim' : 'Não'} />
                {fornecedor.possui_iso_9001 && <>
                  <InfoItem label="Data de emissão" value={fornecedor.iso_data_emissao ? format(new Date(fornecedor.iso_data_emissao), 'dd/MM/yyyy', { locale: ptBR }) : '-'} />
                  <InfoItem label="Data de validade" value={fornecedor.iso_data_validade ? format(new Date(fornecedor.iso_data_validade), 'dd/MM/yyyy', { locale: ptBR }) : '-'} />
                </>}
              </div>
              {!fornecedor.possui_iso_9001 && autoFields.some(f => f.value !== null) && <>
                <Separator className="my-5" />
                <h3 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "13px", color: "var(--fb-blue)" }}>Autoavaliação de Qualidade</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{autoFields.map(f => <InfoItem key={f.label} label={f.label} value={f.value} />)}</div>
                <div className="mt-4 p-3 rounded-md flex items-center justify-between" style={{ background: "var(--fb-light-gray)", border: "1px solid var(--fb-mid-gray)" }}>
                  <span className="text-sm font-semibold" style={{ color: "var(--fb-blue)" }}>Pontuação total: {totalScore} pontos</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1" style={{ background: cls.bg, color: cls.color, borderRadius: "9999px" }}>Classe {cls.label}</span>
                </div>
              </>}
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-md p-6" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
              <h3 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "13px", color: "var(--fb-blue)" }}>Documentos</h3>
              <div className="space-y-2">
                <DocLink label="Documentações (CNPJ + IE)" url={fornecedor.documentacoes_url} />
                {fornecedor.possui_iso_9001 && <DocLink label="Certificado ISO 9001:2015" url={fornecedor.iso_9001_pdf_url} />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-md p-5" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
              <h3 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "13px", color: "var(--fb-blue)" }}>Gerenciamento</h3>
              <div className="space-y-4">
                <div>
                  <label style={labelStyle}>Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "4px", fontSize: "13px" }}><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_FORNECEDOR.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label style={labelStyle}>Observações Internas</label>
                  <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Anotações internas..." rows={4}
                    style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "4px", fontSize: "13px", fontFamily: "'AmpleSoft', sans-serif" }} />
                </div>
                <button onClick={handleSave} disabled={isSaving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-white text-xs font-semibold uppercase tracking-widest transition-all disabled:opacity-60"
                  style={{ background: "var(--fb-blue)", borderRadius: "9999px" }}>
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </button>
              </div>
            </div>

            <div className="bg-white rounded-md p-5" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
              <h3 className="font-bold uppercase tracking-tight mb-4" style={{ fontSize: "13px", color: "var(--fb-blue)" }}>Informações</h3>
              <div className="space-y-2">
                {[{ label: 'Cadastrado em', value: format(new Date(fornecedor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) },
                  { label: 'Atualizado em', value: format(new Date(fornecedor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) }].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>{label}</span>
                    <span className="text-xs font-semibold" style={{ color: "var(--fb-blue)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
