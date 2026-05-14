import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Fornecedor, STATUS_FORNECEDOR } from '@/types/fornecedor';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Save, Loader2, Home } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

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
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar dados do fornecedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fornecedor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('fornecedores')
        .update({ status, observacoes_internas: observacoes || null, updated_at: new Date().toISOString() })
        .eq('id', fornecedor.id);
      if (error) throw error;
      setFornecedor((prev) => prev ? { ...prev, status, observacoes_internas: observacoes } : null);
      toast.success('Alterações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusVariant = (s: string) => {
    switch (s) {
      case 'Aprovado': case 'Ativo': return 'default';
      case 'Pendente': case 'Em Análise': return 'secondary';
      case 'Reprovado': case 'Inativo': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
    </div>
  );

  if (!fornecedor) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <p className="font-medium">Fornecedor não encontrado</p>
        <Link to="/admin"><Button>Voltar para lista</Button></Link>
      </div>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value ?? '-'}</p>
    </div>
  );

  const DocumentLink = ({ label, url }: { label: string; url: string | null | undefined }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <span className="text-sm">{label}</span>
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" /> Baixar</Button>
        </a>
      ) : (
        <span className="text-xs text-muted-foreground">Não enviado</span>
      )}
    </div>
  );

  const autoFields = [
    { label: '1. Recebimento', value: fornecedor.auto_recebimento },
    { label: '1.1 Verificação de qualidade', value: fornecedor.auto_verificacao_qualidade },
    { label: '2. Produto não conforme', value: fornecedor.auto_produto_nao_conforme },
    { label: '2.2 Não conformidade/tratativa', value: fornecedor.auto_nao_conformidade_tratativa },
    { label: '3. Rastreabilidade', value: fornecedor.auto_rastreabilidade },
    { label: '4. Controle de processo', value: fornecedor.auto_controle_processo },
    { label: '5. Calibração e máquinas', value: fornecedor.auto_calibracao_maquinas },
    { label: '6. Eficácia e ações corretivas', value: fornecedor.auto_eficacia_acoes_corretivas },
    { label: '7. Qualidade operacional', value: fornecedor.auto_qualidade_operacional },
    { label: '7.1 Taxa de defeitos', value: fornecedor.auto_taxa_defeitos },
    { label: '8. Ambiente e expedição', value: fornecedor.auto_ambiente_expedicao },
    { label: '8.1 Expedição/transporte', value: fornecedor.auto_expedicao_transporte },
  ];

  const totalScore = autoFields.reduce((a, f) => a + (f.value || 0), 0);
  const classificacao = totalScore >= 80 ? { label: 'A — Apto', variant: 'default' as const }
    : totalScore >= 50 ? { label: 'B — Condicionalmente apto', variant: 'secondary' as const }
    : { label: 'C — Inapto', variant: 'destructive' as const };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-7 w-auto" />
            <p className="text-xs text-muted-foreground mt-0.5">Painel Administrativo</p>
          </div>
          <Link to="/"><Button variant="outline" size="sm"><Home className="w-4 h-4 mr-2" /> Site</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-5">
          <Link to="/admin">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para lista</Button>
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            {/* Dados principais */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{fornecedor.razao_social || 'Fornecedor'}</CardTitle>
                    <p className="text-sm text-muted-foreground">{fornecedor.tipo_fornecedor} · {fornecedor.ramo_atuacao || 'Ramo não informado'}</p>
                  </div>
                  <Badge variant={getStatusVariant(fornecedor.status)}>{fornecedor.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <InfoItem label="E-mail" value={fornecedor.email} />
                  <InfoItem label="CNPJ" value={fornecedor.cnpj} />
                  <InfoItem label="Telefone" value={fornecedor.telefone} />
                  <InfoItem label="Regime tributário" value={fornecedor.regime_tributario} />
                  <InfoItem label="Responsável" value={fornecedor.responsavel} />
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-semibold mb-3">ISO 9001:2015</p>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <InfoItem label="Possui certificação?" value={fornecedor.possui_iso_9001 ? 'Sim' : 'Não'} />
                    {fornecedor.possui_iso_9001 && (
                      <>
                        <InfoItem label="Data de emissão" value={fornecedor.iso_data_emissao ? format(new Date(fornecedor.iso_data_emissao), 'dd/MM/yyyy', { locale: ptBR }) : '-'} />
                        <InfoItem label="Data de validade" value={fornecedor.iso_data_validade ? format(new Date(fornecedor.iso_data_validade), 'dd/MM/yyyy', { locale: ptBR }) : '-'} />
                      </>
                    )}
                  </div>
                </div>

                {!fornecedor.possui_iso_9001 && autoFields.some((f) => f.value !== null) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold mb-3">Autoavaliação de qualidade</p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {autoFields.map((f) => <InfoItem key={f.label} label={f.label} value={f.value} />)}
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-muted flex items-center justify-between">
                        <span className="text-sm font-medium">Pontuação total: {totalScore} pontos</span>
                        <Badge variant={classificacao.variant}>Classe {classificacao.label}</Badge>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Documentos</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <DocumentLink label="Documentações (CNPJ + IE)" url={fornecedor.documentacoes_url} />
                {fornecedor.possui_iso_9001 && (
                  <DocumentLink label="Certificado ISO 9001:2015" url={fornecedor.iso_9001_pdf_url} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Gerenciamento</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_FORNECEDOR.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Observações internas</Label>
                  <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Anotações internas sobre este fornecedor..." rows={4} />
                </div>
                <Button onClick={handleSave} className="w-full bg-brand-navy hover:bg-brand-navy/90" disabled={isSaving}>
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Informações</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cadastrado em</span>
                  <span>{format(new Date(fornecedor.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em</span>
                  <span>{format(new Date(fornecedor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
