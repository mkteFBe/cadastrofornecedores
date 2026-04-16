import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Fornecedor, STATUS_FORNECEDOR } from '@/types/fornecedor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Loader2, LogOut, AlertTriangle, CheckCircle2, RefreshCw, Users } from 'lucide-react';
import { ExportButton } from '@/components/ExportButton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Pendente': 'badge-pendente',
    'Em Análise': 'badge-analise',
    'Aprovado': 'badge-aprovado',
    'Ativo': 'badge-ativo',
    'Reprovado': 'badge-reprovado',
    'Inativo': 'badge-inativo',
    'Pendente Reavaliação': 'badge-reavaliacao',
    'Pendente Renovação ISO': 'badge-renovacao-iso',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'badge-pendente'}`}>
      {status}
    </span>
  );
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  useEffect(() => { fetchFornecedores(); }, []);
  useEffect(() => { filterFornecedores(); }, [searchTerm, statusFilter, fornecedores]);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('fornecedores').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFornecedores(data || []);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFornecedores = () => {
    let filtered = [...fornecedores];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        (f.razao_social?.toLowerCase().includes(term) ?? false) ||
        f.cnpj.includes(term) ||
        f.email.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'todos') filtered = filtered.filter(f => f.status === statusFilter);
    setFilteredFornecedores(filtered);
  };

  const isIsoExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const isIsoExpiringSoon = (d: string | null) => {
    if (!d) return false;
    const v = new Date(d); const t = new Date(); const t30 = new Date();
    t30.setDate(t.getDate() + 30);
    return v > t && v <= t30;
  };
  const formatDate = (d: string | null) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—';

  // KPIs
  const kpis = [
    { label: 'Total', value: fornecedores.length, color: 'text-brand-navy' },
    { label: 'Pendentes', value: fornecedores.filter(f => f.status === 'Pendente').length, color: 'text-amber-600' },
    { label: 'Em Análise', value: fornecedores.filter(f => f.status === 'Em Análise').length, color: 'text-blue-600' },
    { label: 'Aprovados', value: fornecedores.filter(f => f.status === 'Aprovado' || f.status === 'Ativo').length, color: 'text-emerald-600' },
  ];

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
          <div className="flex items-center gap-4">
            {user?.email && (
              <span className="text-white/50 text-xs hidden sm:block">{user.email}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white/60 hover:text-white hover:bg-white/10 gap-2 h-8"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {kpis.map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
              <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Fornecedores</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {filteredFornecedores.length}
              </span>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input
                  placeholder="Buscar por razão social, CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {STATUS_FORNECEDOR.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchFornecedores} className="h-9 w-9 p-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
              <ExportButton fornecedores={filteredFornecedores} filtroStatus={statusFilter} />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : filteredFornecedores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Nenhum fornecedor encontrado</p>
              <p className="text-xs mt-1">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Razão Social</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">CNPJ</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">E-mail</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Tipo</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ISO</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Validade ISO</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Cadastro</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFornecedores.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-foreground">{f.razao_social || '—'}</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">{f.cnpj}</td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">{f.email}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded">{f.tipo_fornecedor}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {f.possui_iso_9001 ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Sim
                          </span>
                        ) : (
                          <span className="inline-flex text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">Não</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden xl:table-cell">
                        {f.possui_iso_9001 ? (
                          <div className="flex items-center gap-1.5">
                            <span className={
                              isIsoExpired(f.iso_data_validade) ? 'text-red-600 font-medium text-xs' :
                              isIsoExpiringSoon(f.iso_data_validade) ? 'text-amber-600 font-medium text-xs' : 'text-xs'
                            }>
                              {formatDate(f.iso_data_validade)}
                            </span>
                            {isIsoExpired(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                            {isIsoExpiringSoon(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={f.status} />
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-muted-foreground">
                        {format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link to={`/admin/fornecedor/${f.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-brand-navy">
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
