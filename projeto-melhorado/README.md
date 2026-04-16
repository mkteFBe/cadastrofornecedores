# Portal de Cadastro de Fornecedores — Filtros Brasil

Sistema web para cadastro e qualificação de fornecedores.

Fornecedores preenchem um formulário online. A equipe interna revisa e aprova pelo painel administrativo. Quando um novo cadastro chega, Brenda recebe um e-mail automático.

---

## Antes de começar — Crie estas contas

Todos os serviços abaixo são **gratuitos**. Crie as contas antes de seguir os passos.

| Serviço | Link | Para que serve |
|---|---|---|
| GitHub | [github.com](https://github.com) | Guardar o código-fonte |
| Supabase | [supabase.com](https://supabase.com) | Banco de dados, login e arquivos |
| Vercel | [vercel.com](https://vercel.com) | Publicar o site na internet |
| Resend | [resend.com](https://resend.com) | Enviar e-mails automáticos |

> **Dica:** Em todos eles você pode usar "Entrar com Google" para facilitar.
> 
> **Resend:** crie a conta com o e-mail `brenda.censi@filtrosbrasil.com.br` — isso é importante para receber os e-mails de teste.

---

## Como usar este guia

Os passos estão divididos em dois tipos. Fique atento ao ícone no início de cada bloco:

> 🌐 **NAVEGADOR** — Faça pelo navegador (pode usar a extensão do Claude no Chrome)
>
> 💻 **TERMINAL** — Copie e cole no terminal do seu computador

---

---

# 🌐 PARTE 1 — GitHub: criar o repositório

> Feito **no navegador**. A extensão do Claude no Chrome pode fazer isso por você.

### Passo 1.1 — Criar o repositório

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"New"** (ou **"+"** → "New repository")
3. Preencha:
   - **Repository name:** `cadastro-fornecedores`
   - Marque **"Private"**
4. Clique em **"Create repository"**
5. **Anote a URL** do repositório — vai aparecer assim: `https://github.com/SEU_USUARIO/cadastro-fornecedores.git`

---

# 💻 PARTE 2 — Terminal: enviar o código para o GitHub

> Feito **no terminal**. Abra o Prompt de Comando (Windows) ou Terminal (Mac).

### Passo 2.1 — Instalar o Node.js (se ainda não tiver)

Acesse [nodejs.org](https://nodejs.org), baixe a versão **LTS** e instale.

### Passo 2.2 — Extrair o projeto

Baixe e extraia o arquivo `.tar.gz` deste projeto. Você verá a pasta `projeto-melhorado/`.

### Passo 2.3 — Enviar para o GitHub

No terminal, navegue até a pasta do projeto e execute os comandos abaixo **um por vez**.
Substitua a URL pelo endereço do repositório que você anotou no Passo 1.1:

```
cd caminho/para/projeto-melhorado
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cadastro-fornecedores.git
git push -u origin main
```

✅ **Concluído quando:** o terminal mostrar `Branch 'main' set up to track remote branch 'main'`

---

---

# 🌐 PARTE 3 — Supabase: criar o banco de dados

> Feito **no navegador**. A extensão do Claude no Chrome pode fazer isso por você.

### Passo 3.1 — Criar o projeto

1. Acesse [supabase.com](https://supabase.com) → clique em **"New project"**
2. Preencha:
   - **Name:** `cadastro-fornecedores`
   - **Database Password:** crie uma senha forte e **guarde-a**
   - **Region:** South America (São Paulo)
3. Clique em **"Create new project"** e aguarde ~2 minutos

### Passo 3.2 — Executar o script do banco de dados

1. No menu esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Abra o arquivo `supabase/setup.sql` com o Bloco de Notas (clique com o botão direito → Abrir com → Bloco de Notas)
4. Selecione tudo (`Ctrl+A`), copie (`Ctrl+C`)
5. Cole no SQL Editor e clique em **"Run"**

✅ **Concluído quando:** aparecer `Success. No rows returned`

### Passo 3.3 — Anotar as credenciais

1. No menu esquerdo: **Settings** (ícone de engrenagem) → **API**
2. Anote os dois valores abaixo — você vai precisar deles depois:
   - **Project URL** → ex: `https://xxxxxxxxxxx.supabase.co`
   - **anon public** → começa com `eyJ...`
3. Também anote o **Reference ID** em **Settings → General** → ex: `xxxxxxxxxxx`

### Passo 3.4 — Criar o bucket de arquivos

1. No menu esquerdo: **Storage**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name:** `documentos`
   - **Public bucket:** deixe **desativado**
4. Clique em **"Save"**

### Passo 3.5 — Criar o usuário administrador

1. No menu esquerdo: **Authentication → Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha com o e-mail e senha que Brenda usará para fazer login
4. Clique em **"Create user"**
5. Na lista, clique no usuário criado e copie o **"User UID"**

Agora dê permissão de admin:

1. Clique em **"SQL Editor"** → **"New query"**
2. Cole o código abaixo substituindo o UUID:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('COLE-O-UUID-AQUI', 'admin');
```

3. Clique em **"Run"**

---

---

# 🌐 PARTE 4 — Vercel: publicar o site

> Feito **no navegador**. A extensão do Claude no Chrome pode fazer isso por você.

### Passo 4.1 — Criar arquivo de configuração local

Antes do deploy, crie um arquivo `.env.local` dentro da pasta `projeto-melhorado/` com o seguinte conteúdo (use o Bloco de Notas):

```
VITE_SUPABASE_URL=COLE-A-PROJECT-URL-AQUI
VITE_SUPABASE_ANON_KEY=COLE-A-ANON-KEY-AQUI
```

Substitua pelos valores que você anotou no Passo 3.3.

### Passo 4.2 — Importar na Vercel

1. Acesse [vercel.com](https://vercel.com) → clique em **"Add New..." → "Project"**
2. Clique em **"Continue with GitHub"** e autorize o acesso
3. Encontre `cadastro-fornecedores` e clique em **"Import"**
4. **Não altere nada** — exceto a seção **"Environment Variables"**
5. Adicione as duas variáveis abaixo clicando em **"Add"** para cada uma:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | A Project URL do Passo 3.3 |
| `VITE_SUPABASE_ANON_KEY` | A anon public do Passo 3.3 |

6. Clique em **"Deploy"** e aguarde ~1 minuto
7. Quando aparecer 🎉 clique em **"Visit"** e anote o link do site
   - Ex: `https://cadastro-fornecedores.vercel.app`

✅ **Concluído quando:** o site abrir com a tela da Filtros Brasil

---

---

# 💻 PARTE 5 — Terminal: configurar as funções automáticas

> Feito **no terminal**. Execute os comandos abaixo copiando e colando.

### Passo 5.1 — Instalar o Supabase CLI

```
npm install -g supabase
```

### Passo 5.2 — Fazer login e conectar ao projeto

```
supabase login
```
> Abrirá o navegador. Clique em **"Confirm"**.

```
supabase link --project-ref COLE-O-REFERENCE-ID-AQUI
```
> Pedirá a senha do banco que você criou no Passo 3.1.

### Passo 5.3 — Configurar todas as chaves de uma vez

Execute cada linha abaixo substituindo os valores:

```
supabase secrets set RESEND_API_KEY=COLE-SUA-CHAVE-RESEND-AQUI
```

```
supabase secrets set ADMIN_EMAIL=brenda.censi@filtrosbrasil.com.br
```

```
supabase secrets set ADMIN_URL=https://COLE-SEU-LINK-DA-VERCEL/admin
```

```
supabase secrets set SUPABASE_URL=https://COLE-O-REFERENCE-ID.supabase.co
```

```
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=COLE-A-SERVICE-ROLE-KEY-AQUI
```

> **Onde encontrar a Service Role Key?** Supabase → Settings → API → `service_role` (seção "Project API Keys")

### Passo 5.4 — Fazer o deploy das três funções automáticas

```
supabase functions deploy notify-admin
```

```
supabase functions deploy check-expirations
```

✅ **Concluído quando:** cada comando mostrar `Deployed Function extract-iso-dates` (e os outros)

---

---

# 🌐 PARTE 6 — Supabase: ativar as notificações e o agendamento diário

> Feito **no navegador**. A extensão do Claude no Chrome pode fazer isso por você.

### Passo 6.1 — Ativar a notificação de novo cadastro

1. No Supabase: **SQL Editor → New query**
2. Cole o código abaixo, substituindo `SEU_PROJECT_REF` e a ANON KEY (do Passo 3.3):

```sql
ALTER DATABASE postgres SET app.supabase_anon_key = 'COLE-A-ANON-KEY-AQUI';
```

3. Clique em **"Run"**

### Passo 6.2 — Ativar a extensão de agendamento

1. No menu esquerdo: **Database → Extensions**
2. Procure por **"pg_cron"** e clique em **"Enable"**

### Passo 6.3 — Criar o agendamento diário

1. **SQL Editor → New query**
2. Cole o código abaixo, substituindo `SEU_PROJECT_REF` e `SUA_ANON_KEY`:

```sql
SELECT cron.schedule(
  'check-expirations-daily',
  '0 11 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://SEU_PROJECT_REF.supabase.co/functions/v1/check-expirations',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer SUA_ANON_KEY"}'::jsonb,
      body    := '{}'::jsonb
    );
  $$
);
```

3. Clique em **"Run"**

✅ **Concluído:** o sistema verificará vencimentos todo dia às 8h (horário de Brasília)

---

---

# 🌐 PARTE 7 — Resend: ativar o domínio oficial (quando estiver pronto)

> Feito **no navegador**. Pode ser feito depois — os e-mails já funcionam no modo de teste.

Por enquanto os e-mails saem como `onboarding@resend.dev`. Quando verificar o domínio `filtrosbrasil.com.br` no Resend, passarão a sair como `compras@filtrosbrasil.com.br`.

### Passo 7.1 — Verificar o domínio

1. No painel do Resend: **Domains → Add Domain**
2. Digite `filtrosbrasil.com.br` e clique em **"Add"**
3. O Resend mostrará 3 registros DNS — adicione-os no provedor do domínio
4. Aguarde 5 a 30 minutos para a verificação ser concluída

### Passo 7.2 — Atualizar o remetente

Após verificar o domínio, abra o arquivo `supabase/functions/notify-admin/index.ts` com o Bloco de Notas. Localize:

```
const FROM_EMAIL = "onboarding@resend.dev";
```

Substitua por:

```
const FROM_EMAIL = "compras@filtrosbrasil.com.br";
```

Salve o arquivo e, no terminal, execute:

```
supabase functions deploy notify-admin
supabase functions deploy check-expirations
```

---

---

## Resumo dos comandos de terminal (todos de uma vez)

Se preferir, aqui estão **todos os comandos de terminal** em sequência, para copiar e colar de uma só vez após ter as chaves em mãos:

```
npm install -g supabase

supabase login

supabase link --project-ref REFERENCE_ID

supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=brenda.censi@filtrosbrasil.com.br
supabase secrets set ADMIN_URL=https://cadastro-fornecedores.vercel.app/admin
supabase secrets set SUPABASE_URL=https://REFERENCE_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...

supabase functions deploy notify-admin
supabase functions deploy check-expirations
```

---

## Dúvidas frequentes

**O site ficou fora do ar depois que mexi em algo — o que faço?**
Acesse [vercel.com](https://vercel.com), abra o projeto e clique em **"Deployments"**. Clique em **"Redeploy"** em uma versão anterior que funcionava.

**Esqueci a senha do painel admin — como recupero?**
No Supabase: **Authentication → Users** → clique no usuário → **"Send password recovery"**.

**Quero adicionar um segundo administrador — como faço?**
Repita o Passo 3.5 com o e-mail e senha do novo administrador.

**Os e-mails estão indo para o spam — o que faço?**
Isso é comum antes de verificar o domínio. Após verificar `filtrosbrasil.com.br` no Resend (Parte 7), os e-mails param de ir para o spam.

**Como sei se o agendamento diário está funcionando?**
No Supabase: **Database → Extensions → pg_cron**. Clique em **"cron.job_run_details"** para ver o histórico de execuções.

---

## Telas do sistema

| Endereço | Quem acessa | O que é |
|---|---|---|
| `seusite.vercel.app/` | Fornecedores | Página inicial |
| `seusite.vercel.app/cadastro` | Fornecedores | Formulário de cadastro |
| `seusite.vercel.app/auth` | Brenda / Admin | Tela de login |
| `seusite.vercel.app/admin` | 🔒 Somente admin | Lista de fornecedores |
| `seusite.vercel.app/admin/fornecedor/ID` | 🔒 Somente admin | Detalhe, aprovação e histórico |

---

## O que o sistema registra para auditoria

| Evidência | Para que serve |
|---|---|
| Declaração de veracidade com IP e timestamp | Prova que o fornecedor enviou o cadastro |
| Histórico completo de alterações de status | Quem mudou, quando e por quê |
| Nome e e-mail de quem aprovou | Responsabilidade pela decisão |
| Data de próxima reavaliação (1 ano) | Controle de prazo automático |
| Documentos individualizados por tipo | Contrato Social, Alvará e Certidões separados |
| Alertas automáticos de ISO vencida | Registrado no histórico com motivo |
