import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Fornecedor } from '@/types/fornecedor';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return '—'; }
}

function calcClassificacao(f: Fornecedor): string {
  if (f.possui_iso_9001) return 'ISO 9001';
  const scores = [
    f.auto_recebimento, f.auto_verificacao_qualidade, f.auto_produto_nao_conforme,
    f.auto_nao_conformidade_tratativa, f.auto_rastreabilidade, f.auto_controle_processo,
    f.auto_calibracao_maquinas, f.auto_eficacia_acoes_corretivas, f.auto_qualidade_operacional,
    f.auto_taxa_defeitos, f.auto_ambiente_expedicao, f.auto_expedicao_transporte,
  ].filter((s): s is number => s !== null);
  if (!scores.length) return '—';
  const total = scores.reduce((a, b) => a + b, 0);
  if (total >= 80) return 'A — Apto';
  if (total >= 50) return 'B — Cond. Apto';
  return 'C — Inapto';
}

function calcPontuacao(f: Fornecedor): string {
  if (f.possui_iso_9001) return '—';
  const scores = [
    f.auto_recebimento, f.auto_verificacao_qualidade, f.auto_produto_nao_conforme,
    f.auto_nao_conformidade_tratativa, f.auto_rastreabilidade, f.auto_controle_processo,
    f.auto_calibracao_maquinas, f.auto_eficacia_acoes_corretivas, f.auto_qualidade_operacional,
    f.auto_taxa_defeitos, f.auto_ambiente_expedicao, f.auto_expedicao_transporte,
  ].filter((s): s is number => s !== null);
  if (!scores.length) return '—';
  return `${scores.reduce((a, b) => a + b, 0)} / 120`;
}

// ─────────────────────────────────────────────
// Excel
// ─────────────────────────────────────────────

export function exportToExcel(fornecedores: Fornecedor[]): void {
  const timestamp = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });

  // ── Aba 1: Resumo ──────────────────────────
  const resumoData = fornecedores.map((f) => ({
    'Razão Social':        f.razao_social ?? '—',
    'CNPJ':               f.cnpj,
    'E-mail':             f.email,
    'Telefone':           f.telefone ?? '—',
    'Responsável':        f.responsavel ?? '—',
    'Tipo':               f.tipo_fornecedor,
    'Regime Tributário':  f.regime_tributario,
    'Ramo de Atuação':    f.ramo_atuacao ?? '—',
    'Possui ISO 9001':    f.possui_iso_9001 ? 'Sim' : 'Não',
    'Emissão ISO':        fmtDate(f.iso_data_emissao),
    'Validade ISO':       fmtDate(f.iso_data_validade),
    'Classificação':      calcClassificacao(f),
    'Pontuação Auto.':    calcPontuacao(f),
    'Status':             f.status,
    'Cadastro em':        fmtDate(f.created_at),
  }));

  // ── Aba 2: Autoavaliação ───────────────────
  const autoData = fornecedores
    .filter((f) => !f.possui_iso_9001)
    .map((f) => ({
      'Razão Social':            f.razao_social ?? '—',
      'CNPJ':                    f.cnpj,
      'Status':                  f.status,
      'Recebimento':             f.auto_recebimento ?? '—',
      'Verificação Qualidade':   f.auto_verificacao_qualidade ?? '—',
      'Produto Não Conforme':    f.auto_produto_nao_conforme ?? '—',
      'Não Conf. / Tratativa':   f.auto_nao_conformidade_tratativa ?? '—',
      'Rastreabilidade':         f.auto_rastreabilidade ?? '—',
      'Controle de Processo':    f.auto_controle_processo ?? '—',
      'Calibração / Máquinas':   f.auto_calibracao_maquinas ?? '—',
      'Eficácia Ações Corret.':  f.auto_eficacia_acoes_corretivas ?? '—',
      'Qualidade Operacional':   f.auto_qualidade_operacional ?? '—',
      'Taxa de Defeitos':        f.auto_taxa_defeitos ?? '—',
      'Ambiente / Expedição':    f.auto_ambiente_expedicao ?? '—',
      'Expedição / Transporte':  f.auto_expedicao_transporte ?? '—',
      'Pontuação Total':         calcPontuacao(f),
      'Classificação':           calcClassificacao(f),
    }));

  const wb = XLSX.utils.book_new();

  // Aba Resumo
  const wsResumo = XLSX.utils.json_to_sheet(resumoData);
  // Larguras de coluna automáticas
  wsResumo['!cols'] = [
    { wch: 32 }, { wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 22 },
    { wch: 12 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 12 },
    { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 12 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Fornecedores');

  // Aba Autoavaliação (só se houver dados)
  if (autoData.length > 0) {
    const wsAuto = XLSX.utils.json_to_sheet(autoData);
    wsAuto['!cols'] = Array(18).fill({ wch: 22 });
    XLSX.utils.book_append_sheet(wb, wsAuto, 'Autoavaliação');
  }

  XLSX.writeFile(wb, `fornecedores_${timestamp}.xlsx`);
}

// ─────────────────────────────────────────────
// PDF
// ─────────────────────────────────────────────

const NAVY  = [0, 40, 86]   as [number, number, number];   // #002856
const RED   = [234, 0, 41]  as [number, number, number];   // #EA0029
const LIGHT = [248, 249, 251] as [number, number, number]; // background

function statusColor(status: string): [number, number, number] {
  switch (status) {
    case 'Aprovado':
    case 'Ativo':     return [16, 185, 129];   // emerald
    case 'Reprovado':
    case 'Inativo':   return [239, 68, 68];    // red
    case 'Em Análise': return [59, 130, 246];  // blue
    default:           return [245, 158, 11];  // amber (Pendente)
  }
}

export function exportToPDF(
  fornecedores: Fornecedor[],
  filtroStatus?: string,
): void {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  const fileTs   = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Cabeçalho ────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 20, 'F');

  // Barra vermelha fina
  doc.setFillColor(...RED);
  doc.rect(0, 20, W, 1.5, 'F');

  // Logo placeholder "FB"
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  doc.roundedRect(8, 4, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('FB', 14, 11.5, { align: 'center' });

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FILTROS BRASIL', 24, 9);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255, 0.6);
  doc.text('Relatório de Fornecedores', 24, 14);

  // Info direita
  doc.setFontSize(7);
  doc.setTextColor(200, 220, 240);
  doc.text(`Gerado em: ${timestamp}`, W - 8, 9, { align: 'right' });
  if (filtroStatus && filtroStatus !== 'todos') {
    doc.text(`Filtro: ${filtroStatus}`, W - 8, 14, { align: 'right' });
  }
  doc.text(`Total: ${fornecedores.length} fornecedor${fornecedores.length !== 1 ? 'es' : ''}`, W - 8, 18, { align: 'right' });

  // ── KPIs ────────────────────────────────────
  const kpis = [
    { label: 'Total',      value: fornecedores.length,                                                            color: NAVY },
    { label: 'Pendentes',  value: fornecedores.filter(f => f.status === 'Pendente').length,                       color: [245, 158, 11] as [number,number,number] },
    { label: 'Em Análise', value: fornecedores.filter(f => f.status === 'Em Análise').length,                     color: [59, 130, 246] as [number,number,number] },
    { label: 'Aprovados',  value: fornecedores.filter(f => f.status === 'Aprovado' || f.status === 'Ativo').length, color: [16, 185, 129] as [number,number,number] },
    { label: 'Reprovados', value: fornecedores.filter(f => f.status === 'Reprovado').length,                      color: RED },
  ];

  const kpiW = (W - 16) / kpis.length;
  kpis.forEach((k, i) => {
    const x = 8 + i * kpiW;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(x, 26, kpiW - 3, 18, 2, 2, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...k.color);
    doc.text(String(k.value), x + (kpiW - 3) / 2, 37, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(k.label, x + (kpiW - 3) / 2, 41, { align: 'center' });
  });

  // ── Tabela ───────────────────────────────────
  const rows = fornecedores.map(f => [
    f.razao_social ?? '—',
    f.cnpj,
    f.email,
    f.tipo_fornecedor,
    f.regime_tributario,
    f.possui_iso_9001 ? 'Sim' : 'Não',
    f.possui_iso_9001 ? fmtDate(f.iso_data_validade) : '—',
    calcClassificacao(f),
    f.status,
    fmtDate(f.created_at),
  ]);

  autoTable(doc, {
    startY: 48,
    head: [[
      'Razão Social', 'CNPJ', 'E-mail', 'Tipo', 'Regime',
      'ISO', 'Val. ISO', 'Classif.', 'Status', 'Cadastro',
    ]],
    body: rows,
    styles: {
      fontSize: 7,
      cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: LIGHT,
    },
    columnStyles: {
      0: { cellWidth: 42 },  // Razão Social
      1: { cellWidth: 30, font: 'courier', fontSize: 6.5 },  // CNPJ
      2: { cellWidth: 48 },  // E-mail
      3: { cellWidth: 18 },  // Tipo
      4: { cellWidth: 24 },  // Regime
      5: { cellWidth: 10, halign: 'center' },  // ISO
      6: { cellWidth: 18, halign: 'center' },  // Val ISO
      7: { cellWidth: 24 },  // Classif
      8: { cellWidth: 22 },  // Status
      9: { cellWidth: 18, halign: 'center' },  // Cadastro
    },
    // Colorir célula de status
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 8) {
        const status = data.cell.raw as string;
        const [r, g, b] = statusColor(status);
        data.cell.styles.textColor = [r, g, b];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    // Rodapé de páginas
    didDrawPage(data) {
      const pageCount = (doc as any).internal.getNumberOfPages();
      const pageNum   = data.pageNumber;
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Filtros Brasil — Relatório de Fornecedores  |  Página ${pageNum} de ${pageCount}`,
        W / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' },
      );
      // Linha fina no rodapé
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(8, doc.internal.pageSize.getHeight() - 10, W - 8, doc.internal.pageSize.getHeight() - 10);
    },
    margin: { left: 8, right: 8, bottom: 14 },
  });

  doc.save(`fornecedores_${fileTs}.pdf`);
}
