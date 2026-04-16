export interface Fornecedor {
  id: string;
  created_at: string;
  updated_at: string;
  // Etapa 1 — Dados do fornecedor
  email: string;
  tipo_fornecedor: string;
  razao_social: string | null;
  ramo_atuacao: string | null;
  cnpj: string;
  telefone: string | null;
  // Etapa 2 — Documentações individualizadas
  doc_contrato_social_url: string | null;
  doc_alvara_url: string | null;
  doc_certidao_federal_url: string | null;
  doc_certidao_estadual_url: string | null;
  doc_outros_url: string | null;
  // Etapa 3 — Regime tributário
  regime_tributario: string;
  // Etapa 4 — ISO 9001
  possui_iso_9001: boolean;
  iso_9001_pdf_url: string | null;
  iso_data_emissao: string | null;
  iso_data_validade: string | null;
  // Etapa 5 — Responsável
  responsavel: string | null;
  // Etapa 6 — Aceite formal
  aceite_declaracao: boolean;
  aceite_ip: string | null;
  aceite_timestamp: string | null;
  // Autoavaliação (apenas quando ISO = NÃO)
  auto_recebimento: number | null;
  auto_verificacao_qualidade: number | null;
  auto_produto_nao_conforme: number | null;
  auto_nao_conformidade_tratativa: number | null;
  auto_rastreabilidade: number | null;
  auto_controle_processo: number | null;
  auto_calibracao_maquinas: number | null;
  auto_eficacia_acoes_corretivas: number | null;
  auto_qualidade_operacional: number | null;
  auto_taxa_defeitos: number | null;
  auto_ambiente_expedicao: number | null;
  auto_expedicao_transporte: number | null;
  // Admin
  status: string;
  observacoes_internas: string | null;
  aprovado_por_email: string | null;
  aprovado_em: string | null;
  data_proxima_reavaliacao: string | null;
}

export interface HistoricoItem {
  id: string;
  fornecedor_id: string;
  created_at: string;
  status_anterior: string | null;
  status_novo: string;
  motivo: string | null;
  admin_email: string;
  admin_user_id: string;
}

export interface FornecedorFormData {
  // Etapa 1
  email: string;
  tipo_fornecedor: string;
  razao_social: string;
  ramo_atuacao: string;
  cnpj: string;
  telefone: string;
  // Etapa 3
  regime_tributario: string;
  // Etapa 4
  possui_iso_9001: string;
  iso_data_emissao: string;
  iso_data_validade: string;
  // Etapa 5
  responsavel: string;
  // Autoavaliação
  auto_recebimento: string;
  auto_verificacao_qualidade: string;
  auto_produto_nao_conforme: string;
  auto_nao_conformidade_tratativa: string;
  auto_rastreabilidade: string;
  auto_controle_processo: string;
  auto_calibracao_maquinas: string;
  auto_eficacia_acoes_corretivas: string;
  auto_qualidade_operacional: string;
  auto_taxa_defeitos: string;
  auto_ambiente_expedicao: string;
  auto_expedicao_transporte: string;
}

export const TIPOS_FORNECEDOR = ['MATERIAIS', 'SERVIÇOS'];

export const REGIMES_TRIBUTARIOS = [
  'Lucro real',
  'Lucro presumido',
  'Simples nacional',
  'MEI',
];

export const OPCOES_ISO = ['SIM', 'NÃO'];

export const OPCOES_AUTOAVALIACAO = ['0', '4', '8', '10'];

export const STATUS_FORNECEDOR = [
  'Pendente',
  'Em Análise',
  'Aprovado',
  'Reprovado',
  'Ativo',
  'Inativo',
  'Pendente Reavaliação',
  'Pendente Renovação ISO',
];

export const STATUS_CORES: Record<string, string> = {
  'Pendente':               'badge-pendente',
  'Em Análise':             'badge-analise',
  'Aprovado':               'badge-aprovado',
  'Ativo':                  'badge-ativo',
  'Reprovado':              'badge-reprovado',
  'Inativo':                'badge-inativo',
  'Pendente Reavaliação':   'badge-reavaliacao',
  'Pendente Renovação ISO': 'badge-renovacao-iso',
};
