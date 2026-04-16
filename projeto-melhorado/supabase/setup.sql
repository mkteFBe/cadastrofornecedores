-- ============================================================
-- CADASTRO DE FORNECEDORES — Setup Completo do Supabase v2
-- ============================================================
-- Execute no SQL Editor do Supabase (menu esquerdo → SQL Editor)
-- ============================================================


-- ── 1. TABELA PRINCIPAL: fornecedores ───────────────────────
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Dados do fornecedor
  email                           TEXT NOT NULL,
  tipo_fornecedor                 TEXT NOT NULL,
  razao_social                    TEXT,
  ramo_atuacao                    TEXT,
  cnpj                            TEXT NOT NULL,
  telefone                        TEXT,

  -- Documentações individualizadas
  doc_contrato_social_url         TEXT,
  doc_alvara_url                  TEXT,
  doc_certidao_federal_url        TEXT,
  doc_certidao_estadual_url       TEXT,
  doc_outros_url                  TEXT,

  -- Regime tributário
  regime_tributario               TEXT NOT NULL,

  -- ISO 9001
  possui_iso_9001                 BOOLEAN NOT NULL DEFAULT FALSE,
  iso_9001_pdf_url                TEXT,
  iso_data_emissao                DATE,
  iso_data_validade               DATE,

  -- Responsável
  responsavel                     TEXT,

  -- Aceite formal do fornecedor
  aceite_declaracao               BOOLEAN NOT NULL DEFAULT FALSE,
  aceite_ip                       TEXT,
  aceite_timestamp                TIMESTAMPTZ,

  -- Autoavaliação
  auto_recebimento                INTEGER CHECK (auto_recebimento BETWEEN 0 AND 10),
  auto_verificacao_qualidade      INTEGER CHECK (auto_verificacao_qualidade BETWEEN 0 AND 10),
  auto_produto_nao_conforme       INTEGER CHECK (auto_produto_nao_conforme BETWEEN 0 AND 10),
  auto_nao_conformidade_tratativa INTEGER CHECK (auto_nao_conformidade_tratativa BETWEEN 0 AND 10),
  auto_rastreabilidade            INTEGER CHECK (auto_rastreabilidade BETWEEN 0 AND 10),
  auto_controle_processo          INTEGER CHECK (auto_controle_processo BETWEEN 0 AND 10),
  auto_calibracao_maquinas        INTEGER CHECK (auto_calibracao_maquinas BETWEEN 0 AND 10),
  auto_eficacia_acoes_corretivas  INTEGER CHECK (auto_eficacia_acoes_corretivas BETWEEN 0 AND 10),
  auto_qualidade_operacional      INTEGER CHECK (auto_qualidade_operacional BETWEEN 0 AND 10),
  auto_taxa_defeitos              INTEGER CHECK (auto_taxa_defeitos BETWEEN 0 AND 10),
  auto_ambiente_expedicao         INTEGER CHECK (auto_ambiente_expedicao BETWEEN 0 AND 10),
  auto_expedicao_transporte       INTEGER CHECK (auto_expedicao_transporte BETWEEN 0 AND 10),

  -- Administração
  status                          TEXT NOT NULL DEFAULT 'Pendente'
    CHECK (status IN (
      'Pendente','Em Análise','Aprovado','Reprovado',
      'Ativo','Inativo','Pendente Reavaliação','Pendente Renovação ISO'
    )),
  observacoes_internas            TEXT,
  aprovado_por_email              TEXT,
  aprovado_em                     TIMESTAMPTZ,
  data_proxima_reavaliacao        DATE
);

-- Trigger: updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS set_updated_at ON public.fornecedores;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 2. TABELA DE HISTÓRICO DE ALTERAÇÕES ────────────────────
CREATE TABLE IF NOT EXISTS public.fornecedor_historico (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  fornecedor_id   UUID NOT NULL REFERENCES public.fornecedores(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo     TEXT NOT NULL,
  motivo          TEXT,
  admin_email     TEXT NOT NULL,
  admin_user_id   UUID NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_historico_fornecedor
  ON public.fornecedor_historico(fornecedor_id, created_at DESC);


-- ── 3. TABELA DE ROLES (controle de admin) ──────────────────
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);


-- ── 4. FUNÇÃO RPC: is_admin ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  );
END; $$;


-- ── 5. ROW LEVEL SECURITY (RLS) ─────────────────────────────
ALTER TABLE public.fornecedores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles          ENABLE ROW LEVEL SECURITY;

-- Fornecedores: INSERT público
DROP POLICY IF EXISTS "insert_public" ON public.fornecedores;
CREATE POLICY "insert_public" ON public.fornecedores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Fornecedores: SELECT apenas admin
DROP POLICY IF EXISTS "select_admin" ON public.fornecedores;
CREATE POLICY "select_admin" ON public.fornecedores FOR SELECT
  TO authenticated USING (public.is_admin(auth.uid()));

-- Fornecedores: UPDATE apenas admin
DROP POLICY IF EXISTS "update_admin" ON public.fornecedores;
CREATE POLICY "update_admin" ON public.fornecedores FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Histórico: SELECT apenas admin
DROP POLICY IF EXISTS "select_historico_admin" ON public.fornecedor_historico;
CREATE POLICY "select_historico_admin" ON public.fornecedor_historico FOR SELECT
  TO authenticated USING (public.is_admin(auth.uid()));

-- Histórico: INSERT apenas admin
DROP POLICY IF EXISTS "insert_historico_admin" ON public.fornecedor_historico;
CREATE POLICY "insert_historico_admin" ON public.fornecedor_historico FOR INSERT
  TO authenticated WITH CHECK (public.is_admin(auth.uid()));

-- Roles: SELECT próprio
DROP POLICY IF EXISTS "select_own_role" ON public.user_roles;
CREATE POLICY "select_own_role" ON public.user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid());


-- ── 6. STORAGE: bucket "documentos" ─────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "upload_public" ON storage.objects;
CREATE POLICY "upload_public" ON storage.objects FOR INSERT
  TO anon, authenticated WITH CHECK (bucket_id = 'documentos');

DROP POLICY IF EXISTS "download_admin" ON storage.objects;
CREATE POLICY "download_admin" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'documentos' AND public.is_admin(auth.uid()));


-- ── 7. ADICIONAR PRIMEIRO ADMIN ──────────────────────────────
-- Execute após criar o usuário em Authentication → Users
-- Substitua o UUID pelo ID real do usuário

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin');

-- Como encontrar o UUID:
-- SELECT id, email FROM auth.users WHERE email = 'brenda.censi@filtrosbrasil.com.br';


-- ── 8. DATABASE WEBHOOK — Notificação de e-mail ao admin ────
-- Execute APÓS: supabase functions deploy notify-admin
-- Substitua SEU_PROJECT_REF pelo Reference ID do projeto

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_admin_new_fornecedor()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE _url TEXT; _key TEXT;
BEGIN
  _url := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/notify-admin';
  _key := current_setting('app.supabase_anon_key', true);
  PERFORM net.http_post(
    url     := _url,
    headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || _key),
    body    := jsonb_build_object('record', row_to_json(NEW))
  );
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_new_fornecedor_notify ON public.fornecedores;
CREATE TRIGGER on_new_fornecedor_notify
  AFTER INSERT ON public.fornecedores
  FOR EACH ROW EXECUTE FUNCTION public.notify_admin_new_fornecedor();

-- Descomente e preencha com sua ANON KEY após o deploy:
-- ALTER DATABASE postgres SET app.supabase_anon_key = 'eyJ...';


-- ── 9. SCHEDULED JOB — Verificação diária de vencimentos ────
-- Execute APÓS: supabase functions deploy check-expirations
-- Substitua SEU_PROJECT_REF e a ANON KEY

-- SELECT cron.schedule(
--   'check-expirations-daily',
--   '0 8 * * *',     -- todo dia às 8h (horário UTC = 5h BRT)
--   $$
--     SELECT net.http_post(
--       url     := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/check-expirations',
--       headers := '{"Content-Type":"application/json","Authorization":"Bearer SUA_ANON_KEY"}'::jsonb,
--       body    := '{}'::jsonb
--     );
--   $$
-- );

-- Para habilitar o pg_cron (necessário para o job acima):
-- Vá em: supabase.com → seu projeto → Database → Extensions → ative "pg_cron"

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
