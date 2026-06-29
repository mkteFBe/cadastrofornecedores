import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) return new Response(JSON.stringify({ error: 'Imagem base64 é obrigatória' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) return new Response(JSON.stringify({ error: 'Configure OPENAI_API_KEY nas secrets do Supabase.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const response = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 150, messages: [{ role: 'user', content: [{ type: 'text', text: `Analise esta imagem de certificado ISO 9001 e extraia as datas. Retorne APENAS JSON: {"data_emissao": "YYYY-MM-DD", "data_validade": "YYYY-MM-DD"}. Use null se não encontrar.` }, { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }] }] }) });
    if (!response.ok) return new Response(JSON.stringify({ error: 'Erro ao processar documento' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return new Response(JSON.stringify({ error: 'Não foi possível analisar' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    let extracted;
    try { extracted = JSON.parse(content.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()); } catch { const em=content.match(/data_emissao["\s:]+["']?(\d{4}-\d{2}-\d{2})["']?/i); const vl=content.match(/data_validade["\s:]+["']?(\d{4}-\d{2}-\d{2})["']?/i); extracted={data_emissao:em?.[1]||null,data_validade:vl?.[1]||null}; }
    return new Response(JSON.stringify({ data_emissao: extracted.data_emissao||null, data_validade: extracted.data_validade||null }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) { return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
});
