import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Fornecedor, STATUS_FORNECEDOR } from '@/types/fornecedor';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Home, AlertTriangle, CheckCircle2, RefreshCw, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  'Aprovado':              { bg: '#E9F7EE', color: '#1A6B30' },
  'Ativo':                 { bg: '#E9F7EE', color: '#1A6B30' },
  'Pendente':              { bg: '#FFF8E1', color: '#8A6400' },
  'Em Análise':            { bg: '#E3F0FB', color: '#0C4A8A' },
  'Reprovado':             { bg: '#FEE8E8', color: '#A32D2D' },
  'Inativo':               { bg: '#F4F4F4', color: '#666666' },
  'Pendente Reavaliação':  { bg: '#F0EBF8', color: '#5A2D82' },
  'Pendente Renovação ISO':{ bg: '#FFF0E0', color: '#8A4500' },
};

const thStyle = { fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--fb-slate-gray)", background: "var(--fb-light-gray)", padding: "10px 14px" };

export default function Admin() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filtered, setFiltered] = useState<Fornecedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  useEffect(() => { fetchFornecedores(); }, []);
  useEffect(() => { filterFornecedores(); }, [search, statusFilter, fornecedores]);

  const fetchFornecedores = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('fornecedores').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setFornecedores(data || []);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const filterFornecedores = () => {
    let f = [...fornecedores];
    if (search) { const t = search.toLowerCase(); f = f.filter(x => (x.razao_social?.toLowerCase().includes(t) ?? false) || x.cnpj.includes(t) || x.email.toLowerCase().includes(t)); }
    if (statusFilter !== 'todos') f = f.filter(x => x.status === statusFilter);
    setFiltered(f);
  };

  const fmtDate = (d: string | null) => { if (!d) return '-'; try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return '-'; } };
  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const isExpiringSoon = (d: string | null) => { if (!d) return false; const v = new Date(d); const s = new Date(); s.setDate(s.getDate() + 30); return v > new Date() && v <= s; };

  const total = fornecedores.length;
  const pendentes = fornecedores.filter(f => f.status === 'Pendente').length;
  const emAnalise = fornecedores.filter(f => f.status === 'Em Análise').length;
  const aprovados = fornecedores.filter(f => f.status === 'Aprovado' || f.status === 'Ativo').length;
  const alertas = fornecedores.filter(f => f.possui_iso_9001 && (isExpired(f.iso_data_validade) || isExpiringSoon(f.iso_data_validade))).length;

  const KPI = [
    { label: 'Total', value: total, color: "var(--fb-blue)" },
    { label: 'Pendentes', value: pendentes, color: "#8A6400" },
    { label: 'Em Análise', value: emAnalise, color: "#0C4A8A" },
    { label: 'Aprovados', value: aprovados, color: "#1A6B30" },
    { label: 'Alertas ISO', value: alertas, color: "var(--fb-error)" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--fb-light-gray)" }}>
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-8 w-auto" />
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: "var(--fb-slate-gray)" }}>Painel Administrativo · Compras</p>
          </div>
          <Link to="/">
            <button className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-all"
              style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "9999px", color: "var(--fb-blue)", background: "transparent" }}>
              <Home className="w-3.5 h-3.5" /> Voltar ao Site
            </button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {KPI.map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-md p-4 text-center" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: "var(--fb-slate-gray)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-md overflow-hidden" style={{ border: "1px solid var(--fb-mid-gray)", boxShadow: "var(--fb-shadow-sm)" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--fb-mid-gray)" }}>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-3">
              <h2 className="font-bold uppercase tracking-tight" style={{ fontSize: "14px", color: "var(--fb-blue)" }}>Fornecedores Cadastrados</h2>
              <button onClick={fetchFornecedores} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 transition-all"
                style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "9999px", color: "var(--fb-slate-gray)", background: "transparent" }}>
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--fb-slate-gray)" }} />
                <input placeholder="Buscar por razão social, CNPJ ou e-mail..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "4px", fontSize: "13px", color: "var(--fb-dark-gray)", fontFamily: "'AmpleSoft', sans-serif" }} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-52" style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "4px", fontSize: "13px" }}>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {STATUS_FORNECEDOR.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-14"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--fb-slate-gray)" }} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-sm" style={{ color: "var(--fb-slate-gray)" }}>Nenhum fornecedor encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow style={{ borderBottom: "1px solid var(--fb-mid-gray)" }}>
                    {['Razão Social','CNPJ','Tipo','ISO 9001','Validade ISO','Status','Cadastro',''].map(h => (
                      <TableHead key={h} style={thStyle}>{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(f => {
                    const sc = STATUS_COLORS[f.status] || { bg: '#F4F4F4', color: '#666' };
                    return (
                      <TableRow key={f.id} style={{ borderBottom: "1px solid var(--fb-mid-gray)" }}>
                        <TableCell className="font-semibold text-sm" style={{ color: "var(--fb-blue)" }}>{f.razao_social || '-'}</TableCell>
                        <TableCell className="text-xs" style={{ color: "var(--fb-dark-gray)" }}>{f.cnpj}</TableCell>
                        <TableCell className="text-xs" style={{ color: "var(--fb-dark-gray)" }}>{f.tipo_fornecedor}</TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                            style={{ background: f.possui_iso_9001 ? '#E9F7EE' : 'var(--fb-light-gray)', color: f.possui_iso_9001 ? '#1A6B30' : 'var(--fb-slate-gray)', borderRadius: "9999px" }}>
                            {f.possui_iso_9001 ? 'Sim' : 'Não'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {f.possui_iso_9001 ? (
                            <div className="flex items-center gap-1 text-xs">
                              <span style={{ color: isExpired(f.iso_data_validade) ? "var(--fb-error)" : isExpiringSoon(f.iso_data_validade) ? "#8A6400" : "var(--fb-dark-gray)", fontWeight: isExpired(f.iso_data_validade) || isExpiringSoon(f.iso_data_validade) ? 600 : 400 }}>
                                {fmtDate(f.iso_data_validade)}
                              </span>
                              {isExpired(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--fb-error)" }} />}
                              {isExpiringSoon(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#8A6400" }} />}
                              {f.iso_data_validade && !isExpired(f.iso_data_validade) && !isExpiringSoon(f.iso_data_validade) && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#1A6B30" }} />}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1"
                            style={{ background: sc.bg, color: sc.color, borderRadius: "9999px" }}>
                            {f.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs" style={{ color: "var(--fb-slate-gray)" }}>
                          {format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/fornecedor/${f.id}`}>
                            <button className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 transition-all"
                              style={{ border: "1px solid var(--fb-mid-gray)", borderRadius: "9999px", color: "var(--fb-blue)", background: "transparent" }}>
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
