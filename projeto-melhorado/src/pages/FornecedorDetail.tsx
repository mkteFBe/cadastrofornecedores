import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Fornecedor, HistoricoItem, STATUS_FORNECEDOR, STATUS_CORES } from '@/types/fornecedor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { HistoricoTimeline } from '@/components/HistoricoTimeline';
import { ArrowLeft, Download, Save, Loader2, LogOut, FileText, Award, User, Building2, History, ShieldCheck } from 'lucide-react';
import { exportFornecedorPDF } from '@/lib/exportFornecedorSingle';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_CORES[status] ?? 'badge-pendente';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value ?? '—'}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-muted-foreground text-sm">—</span>;
  const pct = (score / 10) * 100;
  const color = score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-400' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold w-6 text-right">{score}</span>
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string | null | undefined }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/40 border border-border/60">
      <div className="flex items-center gap-2.5">
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
            <Download className="w-3 h-3" /> Baixar
          </Button>
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Não enviado</span>
      )}
    </div>
  );
}

export default function FornecedorDetail() {
  const { id } = useParams<{ id: string }>();
  const { signOut, user } = useAuth();
  const [fornecedor, setFornecedor] = useState<Fornecedor | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => { if (id) fetchFornecedor(); }, [id]);

  const fetchFornecedor = async () => {
    setIsLoading(true);
    try {
      const [{ data: fData, error: fError }, { data: hData }] = await Promise.all([
        supabase.from('fornecedores').select('*').eq('id', id).maybeSingle(),
        supabase.from('fornecedor_historico').select('*').eq('fornecedor_id', id).order('created_at', { ascending: false }),
      ]);
      if (fError) throw fError;
      if (fData) {
        setFornecedor(fData);
        setStatus(fData.status);
        setObservacoes(fData.observacoes_internas || '');
      }
      setHistorico(hData || []);
    } catch { toast.error('Erro ao carregar dados do fornecedor'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!fornecedor || !user) return;
    setIsSaving(true);
    try {
      const statusMudou = status !== fornecedor.status;
      const now = new Date().toISOString();

      // Campos extra ao aprovar
      const extraFields: Record<string, unknown> = {};
      if (statusMudou && (status === 'Aprovado' || status === 'Ativo')) {
        const reavaliacao = new Date();
        reavaliacao.setFullYear(reavaliacao.getFullYear() + 1);
        extraFields.aprovado_por_email = user.email;
        extraFields.aprovado_em = now;
        extraFields.data_proxima_reavaliacao = reavaliacao.toISOString().split('T')[0];
      }

      const { error } = await supabase.from('fornecedores').update({
        status,
        observacoes_internas: observacoes || null,
        updated_at: now,
        ...extraFields,
      }).eq('id', fornecedor.id);
      if (error) throw error;

      // Grava histórico se status mudou
      if (statusMudou) {
        await supabase.from('fornecedor_historico').insert({
          fornecedor_id: fornecedor.id,
          status_anterior: fornecedor.status,
          status_novo: status,
          motivo: motivo.trim() || null,
          admin_email: user.email ?? 'desconhecido',
          admin_user_id: user.id,
        });
        setMotivo('');
      }

      setFornecedor(prev => prev ? {
        ...prev, status, observacoes_internas: observacoes, ...extraFields,
      } : null);
      await fetchFornecedor(); // recarrega histórico
      toast.success('Alterações salvas!');
    } catch { toast.error('Erro ao salvar alterações'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-brand-navy" />
    </div>
  );

  if (!fornecedor) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <p className="font-medium mb-4">Fornecedor não encontrado</p>
        <Link to="/admin"><Button size="sm">Voltar para lista</Button></Link>
      </div>
    </div>
  );

  const autoScores = [
    { label: 'Recebimento', value: fornecedor.auto_recebimento },
    { label: 'Verificação de qualidade', value: fornecedor.auto_verificacao_qualidade },
    { label: 'Produto não conforme', value: fornecedor.auto_produto_nao_conforme },
    { label: 'Não conformidade / tratativa', value: fornecedor.auto_nao_conformidade_tratativa },
    { label: 'Rastreabilidade', value: fornecedor.auto_rastreabilidade },
    { label: 'Controle de processo', value: fornecedor.auto_controle_processo },
    { label: 'Calibração e máquinas', value: fornecedor.auto_calibracao_maquinas },
    { label: 'Eficácia e ações corretivas', value: fornecedor.auto_eficacia_acoes_corretivas },
    { label: 'Qualidade operacional', value: fornecedor.auto_qualidade_operacional },
    { label: 'Taxa de defeitos', value: fornecedor.auto_taxa_defeitos },
    { label: 'Ambiente / expedição', value: fornecedor.auto_ambiente_expedicao },
    { label: 'Expedição e transporte', value: fornecedor.auto_expedicao_transporte },
  ];
  const validScores = autoScores.map(s => s.value).filter((s): s is number => s !== null);
  const totalScore = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) : null;
  const classif = totalScore !== null
    ? (totalScore >= 80 ? { label: 'A — Apto', cls: 'badge-aprovado' }
      : totalScore >= 50 ? { label: 'B — Condicionalmente Apto', cls: 'badge-analise' }
      : { label: 'C — Inapto', cls: 'badge-reprovado' })
    : null;

  const statusMudou = status !== fornecedor.status;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-brand-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">FB</span>
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wide">FILTROS BRASIL</span>
              <p className="text-white/40 text-xs">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.email && <span className="text-white/40 text-xs hidden sm:block">{user.email}</span>}
            <Button variant="ghost" size="sm" onClick={signOut} className="text-white/60 hover:text-white hover:bg-white/10 gap-2 h-8">
              <LogOut className="w-3.5 h-3.5" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8 pl-2">
                <ArrowLeft className="w-4 h-4" /> Fornecedores
              </Button>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm font-medium truncate max-w-xs">{fornecedor.razao_social || 'Detalhe'}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs"
            onClick={() => { try { exportFornecedorPDF(fornecedor); toast.success('PDF gerado!'); } catch { toast.error('Erro ao gerar PDF'); } }}>
            <Download className="w-3.5 h-3.5" /> Exportar PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">

            {/* Dados da empresa */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Dados da Empresa</h3>
                </div>
                <StatusBadge status={fornecedor.status} />
              </div>
              <div className="px-6 py-2">
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <InfoRow label="Razão Social" value={fornecedor.razao_social} />
                  <InfoRow label="CNPJ" value={fornecedor.cnpj} />
                  <InfoRow label="E-mail" value={fornecedor.email} />
                  <InfoRow label="Telefone" value={fornecedor.telefone} />
                  <InfoRow label="Tipo" value={fornecedor.tipo_fornecedor} />
                  <InfoRow label="Ramo de Atuação" value={fornecedor.ramo_atuacao} />
                  <InfoRow label="Regime Tributário" value={fornecedor.regime_tributario} />
                  <InfoRow label="Responsável" value={fornecedor.responsavel} />
                </div>
              </div>
            </div>

            {/* Aceite formal */}
            {fornecedor.aceite_declaracao && (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm">Declaração de Veracidade</h3>
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aceita
                  </span>
                </div>
                <div className="px-6 py-2">
                  <div className="grid sm:grid-cols-3 gap-x-8">
                    <InfoRow label="Aceite em" value={fornecedor.aceite_timestamp ? format(new Date(fornecedor.aceite_timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : null} />
                    <InfoRow label="Endereço IP registrado" value={fornecedor.aceite_ip} />
                  </div>
                </div>
              </div>
            )}

            {/* ISO */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Certificação ISO 9001</h3>
              </div>
              <div className="px-6 py-2">
                <div className="grid sm:grid-cols-3 gap-x-8">
                  <InfoRow label="Possui ISO 9001:2015?" value={fornecedor.possui_iso_9001 ? 'Sim' : 'Não'} />
                  {fornecedor.possui_iso_9001 && <>
                    <InfoRow label="Data de Emissão" value={fornecedor.iso_data_emissao ? format(new Date(fornecedor.iso_data_emissao), 'dd/MM/yyyy', { locale: ptBR }) : null} />
                    <InfoRow label="Data de Validade" value={fornecedor.iso_data_validade ? format(new Date(fornecedor.iso_data_validade), 'dd/MM/yyyy', { locale: ptBR }) : null} />
                  </>}
                </div>
              </div>
            </div>

            {/* Autoavaliação */}
            {!fornecedor.possui_iso_9001 && validScores.length > 0 && (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">Autoavaliação de Qualidade</h3>
                  </div>
                  {classif && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${classif.cls}`}>
                      {classif.label}
                    </span>
                  )}
                </div>
                <div className="px-6 py-4 space-y-3">
                  {autoScores.map(s => (
                    <div key={s.label}>
                      <p className="text-xs text-muted-foreground mb-1.5">{s.label}</p>
                      <ScoreBar score={s.value} />
                    </div>
                  ))}
                  {totalScore !== null && (
                    <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
                      <span className="text-sm font-medium">Pontuação total</span>
                      <span className="text-2xl font-bold text-brand-navy">
                        {totalScore}<span className="text-sm font-normal text-muted-foreground">/120</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documentos */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Documentos</h3>
              </div>
              <div className="px-6 py-4 space-y-2">
                <DocLink label="Contrato Social" url={fornecedor.doc_contrato_social_url} />
                <DocLink label="Alvará de Funcionamento" url={fornecedor.doc_alvara_url} />
                <DocLink label="Certidão Negativa Federal" url={fornecedor.doc_certidao_federal_url} />
                <DocLink label="Certidão Negativa Estadual" url={fornecedor.doc_certidao_estadual_url} />
                <DocLink label="Outros Documentos" url={fornecedor.doc_outros_url} />
                {fornecedor.possui_iso_9001 && (
                  <DocLink label="Certificado ISO 9001:2015" url={fornecedor.iso_9001_pdf_url} />
                )}
              </div>
            </div>

            {/* Histórico */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-center gap-2">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Histórico de Alterações</h3>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {historico.length} registro{historico.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="px-6 py-4">
                <HistoricoTimeline historico={historico} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Gerenciamento */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm">Gerenciamento</h3>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FORNECEDOR.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Motivo — aparece só quando status muda */}
                {statusMudou && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Motivo da alteração <span className="text-muted-foreground/60">(recomendado)</span>
                    </Label>
                    <Textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex: Documentação verificada e aprovada / ISO vencida..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground">Ficará registrado no histórico de alterações.</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Observações internas</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Anotações visíveis apenas para o time..."
                    rows={4}
                    className="text-sm resize-none"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  className="w-full bg-brand-navy hover:bg-brand-navy/90 h-9 gap-2 text-sm"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Salvar
                </Button>
              </div>
            </div>

            {/* Aprovação */}
            {(fornecedor.aprovado_por_email || fornecedor.data_proxima_reavaliacao) && (
              <div className="bg-white rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-semibold text-sm text-muted-foreground">Aprovação</h3>
                </div>
                <div className="px-5 py-4 space-y-3 text-xs">
                  {fornecedor.aprovado_por_email && (
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Aprovado por</span>
                      <span className="text-foreground font-medium text-right">{fornecedor.aprovado_por_email}</span>
                    </div>
                  )}
                  {fornecedor.aprovado_em && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aprovado em</span>
                      <span className="text-foreground font-medium">
                        {format(new Date(fornecedor.aprovado_em), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {fornecedor.data_proxima_reavaliacao && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Próxima reavaliação</span>
                      <span className={`font-medium ${new Date(fornecedor.data_proxima_reavaliacao) < new Date() ? 'text-red-600' : 'text-foreground'}`}>
                        {format(new Date(fornecedor.data_proxima_reavaliacao), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadados */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="font-semibold text-sm text-muted-foreground">Informações</h3>
              </div>
              <div className="px-5 py-4 space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Cadastrado em</span>
                  <span className="text-foreground font-medium">{format(new Date(fornecedor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Atualizado em</span>
                  <span className="text-foreground font-medium">{format(new Date(fornecedor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID</span>
                  <span className="font-mono text-[10px] truncate max-w-[120px]">{fornecedor.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
