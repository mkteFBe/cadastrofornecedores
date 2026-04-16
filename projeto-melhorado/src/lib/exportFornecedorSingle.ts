import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Fornecedor } from '@/types/fornecedor';

const NAVY  = [0, 40, 86]    as [number, number, number];
const RED   = [234, 0, 41]   as [number, number, number];
const LIGHT = [248, 249, 251] as [number, number, number];

function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  try { return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }); } catch { return '—'; }
}

function calcTotal(f: Fornecedor): number | null {
  const scores = [
    f.auto_recebimento, f.auto_verificacao_qualidade, f.auto_produto_nao_conforme,
    f.auto_nao_conformidade_tratativa, f.auto_rastreabilidade, f.auto_controle_processo,
    f.auto_calibracao_maquinas, f.auto_eficacia_acoes_corretivas, f.auto_qualidade_operacional,
    f.auto_taxa_defeitos, f.auto_ambiente_expedicao, f.auto_expedicao_transporte,
  ].filter((s): s is number => s !== null);
  return scores.length ? scores.reduce((a, b) => a + b, 0) : null;
}

export function exportFornecedorPDF(f: Fornecedor): void {
  const timestamp = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  const fileTs    = format(new Date(), 'dd-MM-yyyy_HH-mm', { locale: ptBR });
  const total     = calcTotal(f);
  const classif   = f.possui_iso_9001 ? 'ISO 9001'
    : total === null ? '—'
    : total >= 80 ? 'A — Apto'
    : total >= 50 ? 'B — Condicionalmente Apto'
    : 'C — Inapto';

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();

  // ── Cabeçalho ──────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 22, 'F');
  doc.setFillColor(...RED);
  doc.rect(0, 22, W, 1.5, 'F');

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 5, 12, 12, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.text('FB', 14, 12.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('FILTROS BRASIL', 25, 11);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 240);
  doc.text('Ficha de Fornecedor', 25, 16);

  doc.setFontSize(7);
  doc.setTextColor(200, 220, 240);
  doc.text(`Gerado em: ${timestamp}`, W - 8, 11, { align: 'right' });

  // ── Título do fornecedor ───────────────────
  doc.setTextColor(...NAVY);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(f.razao_social ?? 'Fornecedor', 8, 34);

  // Status badge
  const statusColors: Record<string, [number,number,number]> = {
    'Aprovado': [16, 185, 129], 'Ativo': [16, 185, 129],
    'Reprovado': [239, 68, 68], 'Inativo': [148, 163, 184],
    'Em Análise': [59, 130, 246], 'Pendente': [245, 158, 11],
  };
  const sc = statusColors[f.status] ?? [245, 158, 11];
  doc.setFillColor(sc[0], sc[1], sc[2], 0.12);
  doc.setDrawColor(...sc);
  doc.roundedRect(W - 45, 27, 37, 9, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...sc);
  doc.text(f.status, W - 26.5, 33, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`CNPJ: ${f.cnpj}  •  Cadastrado em: ${fmtDate(f.created_at)}`, 8, 40);

  // Linha divisória
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(8, 43, W - 8, 43);

  let y = 48;

  // ── Dados gerais ────────────────────────────
  const dadosRows: [string, string][] = [
    ['E-mail',             f.email],
    ['Telefone',           f.telefone ?? '—'],
    ['Responsável',        f.responsavel ?? '—'],
    ['Tipo de Fornecedor', f.tipo_fornecedor],
    ['Ramo de Atuação',    f.ramo_atuacao ?? '—'],
    ['Regime Tributário',  f.regime_tributario],
  ];

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Dados da Empresa', 8, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    body: dadosRows,
    styles: { fontSize: 8, cellPadding: { top: 2.5, right: 5, bottom: 2.5, left: 5 }, lineColor: [226, 232, 240], lineWidth: 0.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [71, 85, 105], fillColor: LIGHT },
      1: { cellWidth: W - 16 - 50, textColor: [15, 23, 42] },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 8, right: 8 },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── ISO 9001 ────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Certificação ISO 9001', 8, y);
  y += 3;

  const isoRows: [string, string][] = f.possui_iso_9001
    ? [
        ['Possui ISO 9001:2015', 'Sim'],
        ['Data de Emissão',      fmtDate(f.iso_data_emissao)],
        ['Data de Validade',     fmtDate(f.iso_data_validade)],
      ]
    : [['Possui ISO 9001:2015', 'Não — realizou autoavaliação']];

  autoTable(doc, {
    startY: y,
    body: isoRows,
    styles: { fontSize: 8, cellPadding: { top: 2.5, right: 5, bottom: 2.5, left: 5 }, lineColor: [226, 232, 240], lineWidth: 0.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [71, 85, 105], fillColor: LIGHT },
      1: { cellWidth: W - 16 - 50, textColor: [15, 23, 42] },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { left: 8, right: 8 },
    theme: 'grid',
  });

  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Autoavaliação ────────────────────────────
  if (!f.possui_iso_9001 && total !== null) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text('Autoavaliação de Qualidade', 8, y);
    y += 3;

    const autoRows: [string, string, string][] = [
      ['Recebimento',                 String(f.auto_recebimento ?? '—'),               '/ 10'],
      ['Verificação de qualidade',    String(f.auto_verificacao_qualidade ?? '—'),      '/ 10'],
      ['Produto não conforme',        String(f.auto_produto_nao_conforme ?? '—'),       '/ 10'],
      ['Não conformidade / tratativa',String(f.auto_nao_conformidade_tratativa ?? '—'), '/ 10'],
      ['Rastreabilidade',             String(f.auto_rastreabilidade ?? '—'),            '/ 10'],
      ['Controle de processo',        String(f.auto_controle_processo ?? '—'),          '/ 10'],
      ['Calibração e máquinas',       String(f.auto_calibracao_maquinas ?? '—'),        '/ 10'],
      ['Eficácia e ações corretivas', String(f.auto_eficacia_acoes_corretivas ?? '—'),  '/ 10'],
      ['Qualidade operacional',       String(f.auto_qualidade_operacional ?? '—'),      '/ 10'],
      ['Taxa de defeitos',            String(f.auto_taxa_defeitos ?? '—'),              '/ 10'],
      ['Ambiente / expedição',        String(f.auto_ambiente_expedicao ?? '—'),         '/ 10'],
      ['Expedição e transporte',      String(f.auto_expedicao_transporte ?? '—'),       '/ 10'],
    ];

    autoTable(doc, {
      startY: y,
      body: autoRows,
      styles: { fontSize: 7.5, cellPadding: { top: 2, right: 5, bottom: 2, left: 5 }, lineColor: [226, 232, 240], lineWidth: 0.2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70, textColor: [71, 85, 105], fillColor: LIGHT },
        1: { cellWidth: 20, halign: 'center', fontStyle: 'bold', textColor: [15, 23, 42] },
        2: { cellWidth: W - 16 - 90, textColor: [148, 163, 184] },
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      foot: [[`Pontuação total: ${total} / 120`, `Classificação: ${classif}`, '']],
      footStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      margin: { left: 8, right: 8 },
      theme: 'grid',
    });
  }

  // ── Observações ──────────────────────────────
  if (f.observacoes_internas) {
    y = (doc as any).lastAutoTable?.finalY ?? y;
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text('Observações Internas', 8, y);
    y += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(f.observacoes_internas, W - 16);
    doc.text(lines, 8, y);
  }

  // ── Rodapé em todas as páginas ───────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(8, pH - 10, W - 8, pH - 10);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Filtros Brasil — Ficha de Fornecedor  |  Página ${i} de ${pageCount}`, W / 2, pH - 5, { align: 'center' });
  }

  const slug = (f.razao_social ?? 'fornecedor').toLowerCase().replace(/\s+/g, '-').slice(0, 30);
  doc.save(`fornecedor_${slug}_${fileTs}.pdf`);
}
