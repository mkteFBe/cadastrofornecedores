import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Roda todo dia às 8h via Supabase Scheduled Job
// Configure em: supabase.com → seu projeto → Edge Functions → check-expirations → Schedule

const RESEND_API_KEY  = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL     = Deno.env.get("ADMIN_EMAIL") ?? "brenda.censi@filtrosbrasil.com.br";
const FROM_EMAIL      = "onboarding@resend.dev"; // trocar após verificar domínio
const FROM_NAME       = "Filtros Brasil — Portal de Fornecedores";
const ADMIN_URL       = Deno.env.get("ADMIN_URL") ?? "https://seu-projeto.vercel.app/admin";
const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // service role para bypass RLS

// ── helpers ────────────────────────────────────────────────
function fmtDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function diasAte(d: string): number {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000);
}

async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY) { console.warn("RESEND_API_KEY não configurada"); return; }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `${FROM_NAME} <${FROM_EMAIL}>`, to: [ADMIN_EMAIL], subject, html }),
  });
  if (!r.ok) console.error("Resend error:", await r.text());
  else console.log("E-mail enviado:", subject);
}

function emailCard(items: string[]): string {
  return items.map(i => `<li style="margin:6px 0; color:#334155; font-size:14px;">${i}</li>`).join("");
}

// ── handler ────────────────────────────────────────────────
serve(async () => {
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  const hoje = new Date();
  const em60dias = new Date(hoje); em60dias.setDate(hoje.getDate() + 60);
  const hoje_str = hoje.toISOString().split("T")[0];
  const em60_str = em60dias.toISOString().split("T")[0];

  const log: string[] = [];

  // ── 1. ISOs que vencem HOJE → muda status + notifica ────
  const { data: isoVencidas } = await sb
    .from("fornecedores")
    .select("id, razao_social, cnpj, iso_data_validade")
    .eq("possui_iso_9001", true)
    .lte("iso_data_validade", hoje_str)
    .not("status", "eq", "Pendente Renovação ISO");

  for (const f of isoVencidas ?? []) {
    await sb.from("fornecedores").update({ status: "Pendente Renovação ISO", updated_at: new Date().toISOString() }).eq("id", f.id);
    await sb.from("fornecedor_historico").insert({
      fornecedor_id: f.id,
      status_anterior: "Aprovado",
      status_novo: "Pendente Renovação ISO",
      motivo: `Certificado ISO 9001 venceu em ${fmtDate(f.iso_data_validade)}. Alterado automaticamente pelo sistema.`,
      admin_email: "sistema@filtrosbrasil.com.br",
      admin_user_id: "00000000-0000-0000-0000-000000000000",
    });
    log.push(`ISO VENCIDA: ${f.razao_social ?? f.cnpj} (${fmtDate(f.iso_data_validade)})`);
  }

  // ── 2. ISOs que vencem em até 60 dias → avisa ────────────
  const { data: isoProximas } = await sb
    .from("fornecedores")
    .select("id, razao_social, cnpj, iso_data_validade")
    .eq("possui_iso_9001", true)
    .gt("iso_data_validade", hoje_str)
    .lte("iso_data_validade", em60_str);

  // ── 3. Reavaliações vencidas → muda status ───────────────
  const { data: reavaliacaoVencidas } = await sb
    .from("fornecedores")
    .select("id, razao_social, cnpj, data_proxima_reavaliacao, status")
    .lte("data_proxima_reavaliacao", hoje_str)
    .in("status", ["Aprovado", "Ativo"])
    .not("data_proxima_reavaliacao", "is", null);

  for (const f of reavaliacaoVencidas ?? []) {
    await sb.from("fornecedores").update({ status: "Pendente Reavaliação", updated_at: new Date().toISOString() }).eq("id", f.id);
    await sb.from("fornecedor_historico").insert({
      fornecedor_id: f.id,
      status_anterior: f.status,
      status_novo: "Pendente Reavaliação",
      motivo: `Prazo de reavaliação anual venceu em ${fmtDate(f.data_proxima_reavaliacao)}. Alterado automaticamente pelo sistema.`,
      admin_email: "sistema@filtrosbrasil.com.br",
      admin_user_id: "00000000-0000-0000-0000-000000000000",
    });
    log.push(`REAVALIAÇÃO VENCIDA: ${f.razao_social ?? f.cnpj}`);
  }

  // ── Envia e-mail consolidado se há algo relevante ─────────
  const totalAlertas = (isoVencidas?.length ?? 0) + (isoProximas?.length ?? 0) + (reavaliacaoVencidas?.length ?? 0);

  if (totalAlertas > 0) {
    const hoje_fmt = hoje.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full" });

    let html = `<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="background:#002856;border-radius:12px 12px 0 0;padding:20px 28px;">
  <span style="color:#fff;font-weight:700;font-size:14px;">FILTROS BRASIL</span>
  <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:2px 0 0;">Relatório diário de vencimentos — ${hoje_fmt}</p>
</td></tr>
<tr><td style="background:#EA0029;height:3px;font-size:0;">&nbsp;</td></tr>
<tr><td style="background:#fff;padding:24px 28px;border-radius:0 0 12px 12px;">`;

    if ((isoVencidas?.length ?? 0) > 0) {
      html += `<h2 style="color:#dc2626;font-size:15px;margin:0 0 8px;">🔴 ISO Vencida — Status alterado para "Pendente Renovação ISO"</h2>
<ul style="margin:0 0 20px;padding-left:18px;">${emailCard(isoVencidas!.map(f => `<strong>${f.razao_social ?? f.cnpj}</strong> — venceu em ${fmtDate(f.iso_data_validade)}`))}
</ul>`;
    }

    if ((isoProximas?.length ?? 0) > 0) {
      html += `<h2 style="color:#d97706;font-size:15px;margin:0 0 8px;">🟡 ISO vence em até 60 dias — Solicite renovação</h2>
<ul style="margin:0 0 20px;padding-left:18px;">${emailCard(isoProximas!.map(f => `<strong>${f.razao_social ?? f.cnpj}</strong> — vence em ${fmtDate(f.iso_data_validade)} (${diasAte(f.iso_data_validade!)} dias)`))}
</ul>`;
    }

    if ((reavaliacaoVencidas?.length ?? 0) > 0) {
      html += `<h2 style="color:#7c3aed;font-size:15px;margin:0 0 8px;">🟣 Reavaliação anual vencida — Status alterado para "Pendente Reavaliação"</h2>
<ul style="margin:0 0 20px;padding-left:18px;">${emailCard(reavaliacaoVencidas!.map(f => `<strong>${f.razao_social ?? f.cnpj}</strong> — prazo venceu em ${fmtDate(f.data_proxima_reavaliacao)}`))}
</ul>`;
    }

    html += `<div style="text-align:center;margin-top:8px;">
<a href="${ADMIN_URL}" style="display:inline-block;background:#002856;color:#fff;text-decoration:none;font-weight:600;font-size:13px;padding:11px 28px;border-radius:8px;">
  Acessar Painel →
</a></div>
<p style="color:#94a3b8;font-size:11px;text-align:center;margin-top:20px;">Este relatório é gerado automaticamente todos os dias às 8h.</p>
</td></tr></table></td></tr></table></body></html>`;

    await sendEmail(
      `[Filtros Brasil] ${totalAlertas} alerta${totalAlertas > 1 ? 's' : ''} de vencimento — ${hoje_fmt}`,
      html,
    );
  }

  console.log("check-expirations concluído:", log.length ? log : "nada a fazer");
  return new Response(JSON.stringify({ ok: true, alertas: totalAlertas, log }), {
    headers: { "Content-Type": "application/json" },
  });
});
