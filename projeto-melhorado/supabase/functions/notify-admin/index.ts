import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ─────────────────────────────────────────────────────────────
// CONFIGURAÇÃO
// Defina via: supabase secrets set RESEND_API_KEY=re_...
//             supabase secrets set ADMIN_EMAIL=brenda.censi@filtrosbrasil.com.br
// ─────────────────────────────────────────────────────────────
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL    = Deno.env.get("ADMIN_EMAIL") ?? "brenda.censi@filtrosbrasil.com.br";

// Enquanto o domínio não estiver verificado no Resend, use:
//   FROM = "onboarding@resend.dev"  ← sandbox do Resend (só envia para sua própria conta)
// Após verificar filtrosbrasil.com.br, troque para:
//   FROM = "compras@filtrosbrasil.com.br"
const FROM_EMAIL = "onboarding@resend.dev";
const FROM_NAME  = "Filtros Brasil — Portal de Fornecedores";

// URL do painel admin em produção (ajuste após deploy na Vercel)
const ADMIN_URL = Deno.env.get("ADMIN_URL") ?? "https://seu-projeto.vercel.app/admin";

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────
interface FornecedorPayload {
  id: string;
  razao_social: string | null;
  cnpj: string;
  email: string;
  telefone: string | null;
  responsavel: string | null;
  tipo_fornecedor: string;
  regime_tributario: string;
  ramo_atuacao: string | null;
  possui_iso_9001: boolean;
  iso_data_emissao: string | null;
  iso_data_validade: string | null;
  // autoavaliação
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
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  } catch { return "—"; }
}

function calcClassificacao(f: FornecedorPayload): { label: string; color: string } {
  if (f.possui_iso_9001) return { label: "ISO 9001 Certificado", color: "#059669" };

  const scores = [
    f.auto_recebimento, f.auto_verificacao_qualidade, f.auto_produto_nao_conforme,
    f.auto_nao_conformidade_tratativa, f.auto_rastreabilidade, f.auto_controle_processo,
    f.auto_calibracao_maquinas, f.auto_eficacia_acoes_corretivas, f.auto_qualidade_operacional,
    f.auto_taxa_defeitos, f.auto_ambiente_expedicao, f.auto_expedicao_transporte,
  ].filter((s): s is number => s !== null);

  if (!scores.length) return { label: "Sem autoavaliação", color: "#94a3b8" };

  const total = scores.reduce((a, b) => a + b, 0);
  if (total >= 80) return { label: `A — Apto (${total}/120)`, color: "#059669" };
  if (total >= 50) return { label: `B — Cond. Apto (${total}/120)`, color: "#d97706" };
  return { label: `C — Inapto (${total}/120)`, color: "#dc2626" };
}

// ─────────────────────────────────────────────────────────────
// TEMPLATE HTML DO E-MAIL
// ─────────────────────────────────────────────────────────────
function buildEmailHtml(f: FornecedorPayload): string {
  const classif    = calcClassificacao(f);
  const detailUrl  = `${ADMIN_URL}/fornecedor/${f.id}`;
  const cadTime    = fmtDate(f.created_at);

  const isoBlock = f.possui_iso_9001 ? `
    <tr>
      <td style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
        <span style="color:#64748b; font-size:12px;">Emissão ISO</span><br>
        <strong style="color:#0f172a; font-size:14px;">${fmtDate(f.iso_data_emissao)}</strong>
      </td>
      <td style="padding:6px 0; border-bottom:1px solid #f1f5f9;">
        <span style="color:#64748b; font-size:12px;">Validade ISO</span><br>
        <strong style="color:#0f172a; font-size:14px;">${fmtDate(f.iso_data_validade)}</strong>
      </td>
    </tr>` : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Fornecedor Cadastrado</title>
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px; width:100%;">

          <!-- CABEÇALHO -->
          <tr>
            <td style="background:#002856; border-radius:12px 12px 0 0; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#ffffff; border-radius:8px; width:36px; height:36px; text-align:center; vertical-align:middle;">
                          <span style="color:#002856; font-weight:800; font-size:13px;">FB</span>
                        </td>
                        <td style="padding-left:12px;">
                          <div style="color:#ffffff; font-weight:700; font-size:14px; letter-spacing:0.05em;">FILTROS BRASIL</div>
                          <div style="color:rgba(255,255,255,0.5); font-size:11px; margin-top:1px;">Portal de Fornecedores</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" style="color:rgba(255,255,255,0.4); font-size:11px;">${cadTime}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FAIXA VERMELHA -->
          <tr>
            <td style="background:#EA0029; height:3px; line-height:3px; font-size:0;">&nbsp;</td>
          </tr>

          <!-- CORPO -->
          <tr>
            <td style="background:#ffffff; padding: 28px 32px 8px;">

              <!-- Tag + Título -->
              <p style="margin:0 0 4px 0;">
                <span style="background:#fef3c7; color:#92400e; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; border:1px solid #fde68a;">
                  Novo cadastro pendente
                </span>
              </p>
              <h1 style="margin:12px 0 4px; color:#002856; font-size:20px; font-weight:700; line-height:1.3;">
                ${f.razao_social ?? "Fornecedor sem razão social"}
              </h1>
              <p style="margin:0 0 20px; color:#64748b; font-size:13px;">
                CNPJ: <strong style="color:#334155;">${f.cnpj}</strong>
              </p>

              <!-- Dados principais -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden; margin-bottom:20px;">
                <tr style="background:#f8fafc;">
                  <td colspan="2" style="padding:10px 16px; border-bottom:1px solid #e2e8f0;">
                    <span style="font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em;">Dados do Fornecedor</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9; width:50%;">
                    <span style="color:#64748b; font-size:12px;">E-mail</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.email}</strong>
                  </td>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:12px;">Telefone</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.telefone ?? "—"}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:12px;">Tipo</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.tipo_fornecedor}</strong>
                  </td>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:12px;">Responsável</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.responsavel ?? "—"}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:12px;">Regime Tributário</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.regime_tributario}</strong>
                  </td>
                  <td style="padding:10px 16px; border-bottom:1px solid #f1f5f9;">
                    <span style="color:#64748b; font-size:12px;">Ramo de Atuação</span><br>
                    <strong style="color:#0f172a; font-size:13px;">${f.ramo_atuacao ?? "—"}</strong>
                  </td>
                </tr>
                ${isoBlock}
                <tr>
                  <td colspan="2" style="padding:10px 16px;">
                    <span style="color:#64748b; font-size:12px;">Qualificação</span><br>
                    <strong style="color:${classif.color}; font-size:13px;">${classif.label}</strong>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${detailUrl}"
                       style="display:inline-block; background:#002856; color:#ffffff; text-decoration:none;
                              font-weight:600; font-size:14px; padding:13px 32px; border-radius:8px;
                              letter-spacing:0.01em;">
                      Revisar Cadastro no Painel →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <a href="${ADMIN_URL}" style="color:#94a3b8; font-size:12px; text-decoration:none;">
                      ou acesse a lista completa de fornecedores
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- RODAPÉ -->
          <tr>
            <td style="background:#f8fafc; border-top:1px solid #e2e8f0; border-radius:0 0 12px 12px; padding:16px 32px; text-align:center;">
              <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.6;">
                Filtros Brasil — Sistema de Cadastro de Fornecedores<br>
                Este e-mail foi enviado automaticamente. Não responda a este endereço.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// HANDLER PRINCIPAL
// ─────────────────────────────────────────────────────────────
serve(async (req) => {
  // A função é chamada via Database Webhook (HTTP POST interno)
  // Não precisa de CORS pois não é chamada pelo browser
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Valida API key
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY não configurada. Execute: supabase secrets set RESEND_API_KEY=re_..." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Recebe o payload do Database Trigger (registro do novo fornecedor)
    const payload = await req.json();

    // O Supabase Database Webhook envia o registro em payload.record
    const fornecedor: FornecedorPayload = payload.record ?? payload;

    if (!fornecedor?.id) {
      console.error("Payload inválido — sem campo 'id':", JSON.stringify(payload));
      return new Response(
        JSON.stringify({ error: "Payload inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Enviando notificação para novo fornecedor: ${fornecedor.razao_social ?? fornecedor.cnpj}`);

    const assunto = `[Novo Fornecedor] ${fornecedor.razao_social ?? "Sem razão social"} — ${fornecedor.cnpj}`;
    const html    = buildEmailHtml(fornecedor);

    // Chama a API do Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to:   [ADMIN_EMAIL],
        subject: assunto,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const err = await resendResponse.text();
      console.error("Erro na API do Resend:", resendResponse.status, err);

      // Erro 403 geralmente significa domínio não verificado ainda
      if (resendResponse.status === 403) {
        return new Response(
          JSON.stringify({
            error: "Domínio não verificado no Resend.",
            detalhe: "Enquanto o domínio não estiver verificado, use FROM_EMAIL = 'onboarding@resend.dev' e envie apenas para o e-mail da sua conta Resend.",
          }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Falha ao enviar e-mail", detalhe: err }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await resendResponse.json();
    console.log("E-mail enviado com sucesso. ID Resend:", result.id);

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro inesperado na função notify-admin:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
