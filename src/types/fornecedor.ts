export interface Fornecedor {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  tipo_fornecedor: string;
  razao_social: string | null;
  ramo_atuacao: string | null;
  cnpj: string;
  telefone: string | null;
  documentacoes_url: string | null;
  regime_tributario: string;
  possui_iso_9001: boolean;
  iso_9001_pdf_url: string | null;
  iso_data_emissao: string | null;
  iso_data_validade: string | null;
  responsavel: string | null;
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
  status: string;
  observacoes_internas: string | null;
}

export interface FornecedorFormData {
  email: string;
  tipo_fornecedor: string;
  razao_social: string;
  ramo_atuacao: string;
  cnpj: string;
  telefone: string;
  regime_tributario: string;
  possui_iso_9001: string;
  iso_data_emissao: string;
  iso_data_validade: string;
  responsavel: string;
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

export const REGIMES_TRIBUTARIOS = ['Lucro real', 'Lucro presumido', 'Simples nacional'];

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
