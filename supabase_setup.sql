-- ============================================================
-- FILTROS BRASIL — Setup completo do banco de dados
-- Execute no Supabase → SQL Editor
-- ============================================================

-- 1. TABELA PRINCIPAL DE FORNECEDORES
create table if not exists public.fornecedores (
  id                              uuid default gen_random_uuid() primary key,
  created_at                      timestamptz default now() not null,
  updated_at                      timestamptz default now() not null,

  -- Etapa 1 — Dados
  email                           text not null,
  tipo_fornecedor                 text not null,
  razao_social                    text,
  ramo_atuacao                    text,
  cnpj                            text not null,
  telefone                        text,

  -- Etapa 2 — Documentações
  documentacoes_url               text,

  -- Etapa 3 — Regime tributário
  regime_tributario               text not null,

  -- Etapa 4 — ISO 9001
  possui_iso_9001                 boolean not null default false,
  iso_9001_pdf_url                text,
  iso_data_emissao                date,
  iso_data_validade               date,

  -- Etapa 5 — Responsável
  responsavel                     text,

  -- Etapa 6 — Autoavaliação (apenas quando ISO = NÃO)
  auto_recebimento                integer,
  auto_verificacao_qualidade      integer,
  auto_produto_nao_conforme       integer,
  auto_nao_conformidade_tratativa integer,
  auto_rastreabilidade            integer,
  auto_controle_processo          integer,
  auto_calibracao_maquinas        integer,
  auto_eficacia_acoes_corretivas  integer,
  auto_qualidade_operacional      integer,
  auto_taxa_defeitos              integer,
  auto_ambiente_expedicao         integer,
  auto_expedicao_transporte       integer,

  -- Gestão administrativa
  status                          text not null default 'Pendente',
  observacoes_internas            text
);

-- 2. ÍNDICES
create index if not exists idx_fornecedores_status on public.fornecedores(status);
create index if not exists idx_fornecedores_created_at on public.fornecedores(created_at desc);
create index if not exists idx_fornecedores_cnpj on public.fornecedores(cnpj);

-- 3. ROW LEVEL SECURITY
alter table public.fornecedores enable row level security;

-- Qualquer pessoa (anon) pode inserir (cadastro público)
create policy "anon_insert_fornecedores"
  on public.fornecedores for insert
  to anon
  with check (true);

-- Apenas usuários autenticados (admin) podem ver e editar
create policy "auth_select_fornecedores"
  on public.fornecedores for select
  to authenticated
  using (true);

create policy "auth_update_fornecedores"
  on public.fornecedores for update
  to authenticated
  using (true);

-- 4. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_fornecedores_updated_at
  before update on public.fornecedores
  for each row execute function public.set_updated_at();

-- 5. FUNÇÃO is_admin (usada pelo AuthContext)
create or replace function public.is_admin(_user_id uuid)
returns boolean language plpgsql security definer as $$
begin
  return exists (
    select 1 from auth.users
    where id = _user_id
      and raw_user_meta_data->>'role' = 'admin'
  );
end;
$$;

-- 6. STORAGE — Bucket de documentos
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do update set public = true;

-- Política de upload para anon
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'allow_anon_upload'
  ) then
    create policy "allow_anon_upload"
      on storage.objects for insert
      to anon
      with check (bucket_id = 'documentos');
  end if;
end $$;

-- Política de leitura pública
do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'objects'
      and policyname = 'allow_public_read'
  ) then
    create policy "allow_public_read"
      on storage.objects for select
      to anon
      using (bucket_id = 'documentos');
  end if;
end $$;

-- Confirmação
select 'Setup concluído com sucesso!' as resultado;
