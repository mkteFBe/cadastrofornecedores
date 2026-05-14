import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Fornecedor, STATUS_FORNECEDOR } from '@/types/fornecedor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Eye, Loader2, Home, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Admin() {
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
      filtered = filtered.filter((f) =>
        (f.razao_social?.toLowerCase().includes(term) ?? false) ||
        f.cnpj.includes(term) ||
        f.email.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'todos') filtered = filtered.filter((f) => f.status === statusFilter);
    setFilteredFornecedores(filtered);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Aprovado': case 'Ativo': return 'default';
      case 'Pendente': case 'Em Análise': return 'secondary';
      case 'Reprovado': case 'Inativo': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '-';
    try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return '-'; }
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;
  const isExpiringSoon = (d: string | null) => {
    if (!d) return false;
    const v = new Date(d);
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    return v > new Date() && v <= soon;
  };

  // KPIs
  const total = fornecedores.length;
  const pendentes = fornecedores.filter((f) => f.status === 'Pendente').length;
  const emAnalise = fornecedores.filter((f) => f.status === 'Em Análise').length;
  const aprovados = fornecedores.filter((f) => f.status === 'Aprovado' || f.status === 'Ativo').length;
  const alertas = fornecedores.filter((f) => f.possui_iso_9001 && (isExpired(f.iso_data_validade) || isExpiringSoon(f.iso_data_validade))).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-7 w-auto" />
            <p className="text-xs text-muted-foreground mt-0.5">Painel Administrativo · Compras</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" /> Voltar ao Site
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: total, color: 'text-foreground' },
            { label: 'Pendentes', value: pendentes, color: 'text-amber-600' },
            { label: 'Em Análise', value: emAnalise, color: 'text-blue-600' },
            { label: 'Aprovados', value: aprovados, color: 'text-green-600' },
            { label: 'Alertas ISO', value: alertas, color: 'text-destructive' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="text-base">Fornecedores Cadastrados</CardTitle>
              <Button variant="outline" size="sm" onClick={fetchFornecedores}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Buscar por razão social, CNPJ ou e-mail..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-52">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {STATUS_FORNECEDOR.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFornecedores.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                Nenhum fornecedor encontrado.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Razão Social</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>ISO 9001</TableHead>
                      <TableHead>Validade ISO</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFornecedores.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.razao_social || '-'}</TableCell>
                        <TableCell className="text-sm">{f.cnpj}</TableCell>
                        <TableCell>{f.tipo_fornecedor}</TableCell>
                        <TableCell>
                          <Badge variant={f.possui_iso_9001 ? 'default' : 'secondary'}>
                            {f.possui_iso_9001 ? 'Sim' : 'Não'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {f.possui_iso_9001 ? (
                            <div className="flex items-center gap-1">
                              <span className={isExpired(f.iso_data_validade) ? 'text-destructive font-medium' : isExpiringSoon(f.iso_data_validade) ? 'text-amber-600 font-medium' : ''}>
                                {formatDate(f.iso_data_validade)}
                              </span>
                              {isExpired(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                              {isExpiringSoon(f.iso_data_validade) && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                              {f.iso_data_validade && !isExpired(f.iso_data_validade) && !isExpiringSoon(f.iso_data_validade) && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(f.status)}>{f.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(f.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/admin/fornecedor/${f.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4 mr-1" /> Ver
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
