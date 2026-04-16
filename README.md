# Portal de Cadastro de Fornecedores — Filtros Brasil

Sistema web para cadastro e qualificação de fornecedores.

Fornecedores preenchem um formulário online. A equipe interna revisa e aprova pelo painel administrativo. Quando um novo cadastro chega, Brenda recebe um e-mail automático.

---

## O que você vai precisar configurar (visão geral)

Antes de começar, veja os serviços que este projeto usa. Todos têm plano gratuito:

| Serviço | Para que serve | Custo |
|---|---|---|
| **GitHub** | Guardar o código-fonte | Grátis |
| **Vercel** | Publicar o site na internet | Grátis |
| **Supabase** | Banco de dados + login + arquivos | Grátis |
| **Resend** | Enviar e-mails automáticos | Grátis (3.000/mês) |
| **OpenAI** | Ler datas do certificado ISO automaticamente | Pago por uso (centavos) |

> **Dica:** Se não tiver conta em algum desses serviços, crie antes de começar. Todos aceitam login com conta Google.

---

## PARTE 1 — Subir o código no GitHub

> **O que é o GitHub?** É onde o código fica guardado na nuvem. A Vercel vai buscar o código de lá para publicar o site.

### Passo 1.1 — Criar uma conta no GitHub

Acesse [github.com](https://github.com) e crie uma conta gratuita (se ainda não tiver).

### Passo 1.2 — Criar um repositório novo

1. Clique no botão verde **"New"** (ou **"+"** no canto superior direito → "New repository")
2. Dê um nome, por exemplo: `cadastro-fornecedores`
3. Deixe como **Private** (privado)
4. Clique em **"Create repository"**

### Passo 1.3 — Extrair o projeto e enviar para o GitHub

1. Baixe e extraia o arquivo `.tar.gz` deste projeto no seu computador
2. Dentro da pasta extraída, você verá a pasta `projeto-melhorado/` — essa é a pasta do projeto
3. Abra o terminal (no Windows: pesquise "Prompt de Comando" ou "PowerShell") e navegue até essa pasta:

```
cd caminho/para/projeto-melhorado
```

4. Execute os comandos abaixo **um por vez** (substitua os valores em MAIÚSCULAS):

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/cadastro-fornecedores.git
git push -u origin main
```

> **Como encontrar a URL do repositório?** Na página do repositório que você criou no GitHub, clique em **"Code"** (botão verde) → copie a URL que aparece em "HTTPS".

Após esses comandos, o código estará no GitHub.

---

## PARTE 2 — Criar o banco de dados no Supabase

> **O que é o Supabase?** É onde os dados dos fornecedores ficam guardados. Também cuida do login dos administradores e dos arquivos enviados (PDFs).

### Passo 2.1 — Criar conta e projeto

1. Acesse [supabase.com](https://supabase.com) e clique em **"Start your project"**
2. Faça login com sua conta Google
3. Clique em **"New project"**
4. Preencha:
   - **Name:** `cadastro-fornecedores`
   - **Database Password:** crie uma senha forte e **guarde-a** (você precisará depois)
   - **Region:** South America (São Paulo)
5. Clique em **"Create new project"** e aguarde ~2 minutos

### Passo 2.2 — Executar o script de configuração do banco

Este passo cria todas as tabelas, regras de segurança e configurações necessárias.

1. No painel do Supabase, clique em **"SQL Editor"** no menu da esquerda
2. Clique em **"New query"**
3. Abra o arquivo `supabase/setup.sql` que está na pasta do projeto (pode abrir com o Bloco de Notas)
4. Copie **todo** o conteúdo do arquivo
5. Cole na área de texto do SQL Editor
6. Clique em **"Run"** (botão verde)

Você verá a mensagem `Success. No rows returned` — isso é normal e significa que funcionou.

### Passo 2.3 — Anotar as credenciais do projeto

Você vai precisar de duas informações do Supabase:

1. No menu da esquerda, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Anote esses dois valores:
   - **Project URL** → parece com `https://xxxxxxxxxxx.supabase.co`
   - **anon public** (em "Project API Keys") → começa com `eyJ...`

Guarde esses valores — você vai usá-los nas próximas etapas.

### Passo 2.4 — Criar o bucket de arquivos

Os PDFs enviados pelos fornecedores ficam guardados aqui.

1. No menu da esquerda, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Preencha:
   - **Name:** `documentos`
   - **Public bucket:** deixe **desativado** (privado)
4. Clique em **"Save"**

### Passo 2.5 — Criar o primeiro usuário administrador

1. No menu da esquerda, clique em **"Authentication"**
2. Clique em **"Users"** → **"Add user"** → **"Create new user"**
3. Preencha com o e-mail e senha que Brenda (ou você) usará para fazer login no painel
4. Clique em **"Create user"**
5. Na lista de usuários, **clique no usuário** que acabou de criar
6. Copie o valor do campo **"User UID"** (parece com `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

Agora dê permissão de admin para esse usuário:

1. Clique em **"SQL Editor"** → **"New query"**
2. Cole o código abaixo, **substituindo** o UUID pelo que você copiou:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('COLE-O-UUID-AQUI', 'admin');
```

3. Clique em **"Run"**

---

## PARTE 3 — Publicar o site na Vercel

> **O que é a Vercel?** É o serviço que pega o código do GitHub e transforma em um site acessível na internet, com link próprio.

### Passo 3.1 — Criar conta na Vercel

Acesse [vercel.com](https://vercel.com) e clique em **"Sign Up"**. Use **"Continue with GitHub"** para conectar com sua conta do GitHub — isso facilita muito.

### Passo 3.2 — Importar o projeto

1. No painel da Vercel, clique em **"Add New..."** → **"Project"**
2. Encontre o repositório `cadastro-fornecedores` e clique em **"Import"**
3. **Não altere nada** nas configurações — a Vercel detecta automaticamente que é um projeto Vite/React
4. Antes de clicar em "Deploy", expanda a seção **"Environment Variables"** e adicione as duas variáveis abaixo:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | A **Project URL** que você anotou no Passo 2.3 |
| `VITE_SUPABASE_ANON_KEY` | A chave **anon public** que você anotou no Passo 2.3 |

5. Clique em **"Deploy"**
6. Aguarde ~1 minuto. Quando aparecer 🎉 **"Congratulations!"**, o site está no ar!
7. Clique em **"Visit"** para ver o link do seu site — anote ele (ex: `https://cadastro-fornecedores.vercel.app`)

> **Dica:** A partir de agora, toda vez que você enviar código novo para o GitHub, a Vercel atualiza o site automaticamente.

---

## PARTE 4 — Ativar a leitura automática de datas do certificado ISO

> Quando um fornecedor envia o certificado ISO em PDF, o sistema lê automaticamente as datas de emissão e validade. Isso usa a inteligência artificial da OpenAI.

### Passo 4.1 — Criar conta e chave na OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com) e crie uma conta
2. Adicione um método de pagamento (o uso é cobrado por uso, centavos por operação)
3. Vá em **"API Keys"** → **"Create new secret key"**
4. Copie a chave (começa com `sk-...`) — ela só aparece uma vez

### Passo 4.2 — Instalar o Supabase CLI

> **O que é o CLI?** É uma ferramenta que você instala no computador para enviar configurações ao Supabase pelo terminal.

No terminal, execute:

```bash
npm install -g supabase
```

> **Não tem o Node.js instalado?** Acesse [nodejs.org](https://nodejs.org), baixe a versão **LTS** e instale. Depois tente o comando acima novamente.

### Passo 4.3 — Conectar o CLI ao seu projeto Supabase

1. No Supabase, vá em **Settings → General**
2. Copie o valor de **"Reference ID"** (ex: `xxxxxxxxxxx`)

No terminal, execute os comandos abaixo **um por vez**:

```bash
supabase login
```
> Abrirá o navegador pedindo para confirmar o login. Clique em "Confirm".

```bash
supabase link --project-ref COLE-O-REFERENCE-ID-AQUI
```
> Pedirá a senha do banco que você criou no Passo 2.1.

### Passo 4.4 — Configurar a chave da OpenAI e fazer o deploy

```bash
supabase secrets set OPENAI_API_KEY=COLE-SUA-CHAVE-AQUI
supabase functions deploy extract-iso-dates
```

Pronto! A leitura automática de datas está ativa.

---

## PARTE 5 — Ativar notificações de e-mail para Brenda

> Quando um fornecedor enviar o cadastro, Brenda recebe um e-mail automático com os dados e um botão direto para o painel.

### Passo 5.1 — Criar conta no Resend

1. Acesse [resend.com](https://resend.com) e clique em **"Get Started for Free"**
2. **Importante:** crie a conta usando o e-mail `brenda.censi@filtrosbrasil.com.br`
   - Isso é necessário porque, enquanto o domínio não estiver verificado, o Resend só envia para o e-mail da própria conta
3. Confirme o e-mail se pedido

### Passo 5.2 — Gerar a chave da API do Resend

1. No painel do Resend, clique em **"API Keys"** no menu da esquerda
2. Clique em **"Create API Key"**
3. Dê um nome como `filtros-brasil`
4. Clique em **"Add"**
5. Copie a chave gerada (começa com `re_...`) — ela só aparece uma vez

### Passo 5.3 — Configurar as chaves no Supabase

No terminal (na pasta do projeto), execute os três comandos abaixo, substituindo os valores:

```bash
supabase secrets set RESEND_API_KEY=COLE-SUA-CHAVE-AQUI
```

```bash
supabase secrets set ADMIN_EMAIL=brenda.censi@filtrosbrasil.com.br
```

```bash
supabase secrets set ADMIN_URL=https://COLE-SEU-LINK-DA-VERCEL-AQUI/admin
```
> O link da Vercel você anotou no Passo 3.2, ex: `https://cadastro-fornecedores.vercel.app/admin`

### Passo 5.4 — Fazer o deploy da função de e-mail

```bash
supabase functions deploy notify-admin
```

### Passo 5.5 — Ativar o gatilho automático no banco de dados

Este passo faz com que o banco de dados "avise" automaticamente quando um novo fornecedor se cadastrar.

1. No Supabase, clique em **"SQL Editor"** → **"New query"**
2. Abra o arquivo `supabase/setup.sql` com o Bloco de Notas
3. Role até o final do arquivo, na seção **"7. DATABASE WEBHOOK"**
4. Copie apenas aquela seção (a partir de `CREATE EXTENSION IF NOT EXISTS pg_net;`)
5. **Antes de colar**, localize as duas linhas que precisam ser editadas:
   - Substitua `SEU_PROJECT_REF` pelo **Reference ID** do seu projeto (Passo 4.3)
   - Localize a linha com `ALTER DATABASE` — remova os dois hífens `--` do início e substitua `eyJ...` pela sua **anon public** key (Passo 2.3)
6. Cole o código editado no SQL Editor e clique em **"Run"**

### Passo 5.6 — Testar se está funcionando

Acesse o site pelo link da Vercel, vá em **"Iniciar Cadastro"** e preencha um cadastro fictício até o final. Em 1 a 3 segundos após clicar em "Enviar Cadastro", Brenda deverá receber um e-mail.

---

## PARTE 6 — Ativar o domínio oficial nos e-mails (quando estiver pronto)

> Por enquanto os e-mails saem como `onboarding@resend.dev`. Quando o domínio `filtrosbrasil.com.br` for verificado no Resend, eles passarão a sair como `compras@filtrosbrasil.com.br`.

### Passo 6.1 — Verificar o domínio no Resend

1. No painel do Resend, clique em **"Domains"** → **"Add Domain"**
2. Digite `filtrosbrasil.com.br` e clique em **"Add"**
3. O Resend mostrará 3 registros DNS para adicionar
4. Acesse o painel do provedor do domínio (onde `filtrosbrasil.com.br` foi registrado — ex: Registro.br, GoDaddy, etc.) e adicione os registros
5. Aguarde de 5 a 30 minutos para a verificação ser concluída

### Passo 6.2 — Atualizar o remetente no código

Abra o arquivo `supabase/functions/notify-admin/index.ts` com o Bloco de Notas. Localize a linha:

```
const FROM_EMAIL = "onboarding@resend.dev";
```

Substitua por:

```
const FROM_EMAIL = "compras@filtrosbrasil.com.br";
```

Salve o arquivo e, no terminal, execute:

```bash
supabase functions deploy notify-admin
```

---

## Dúvidas frequentes

**O site ficou fora do ar depois que mexi em algo — o que faço?**
Acesse [vercel.com](https://vercel.com), abra o projeto e clique em **"Deployments"**. Você verá o histórico de versões e pode clicar em **"Redeploy"** em uma versão anterior que funcionava.

**Esqueci a senha do painel admin — como recupero?**
No Supabase, vá em **Authentication → Users**, clique no usuário e clique em **"Send password recovery"**.

**Quero adicionar um segundo administrador — como faço?**
Repita o Passo 2.5 com o e-mail e senha do novo administrador.

**Os e-mails estão indo para o spam — o que faço?**
Isso é comum enquanto o domínio não está verificado. Após verificar `filtrosbrasil.com.br` no Resend (Parte 6), os e-mails param de ir para o spam.

**Preciso de ajuda com algum passo — onde busco?**
Entre em contato com quem desenvolveu o sistema ou abra este README e peça ajuda ao Claude descrevendo em qual passo está com dificuldade.

---

## Resumo das telas do sistema

| Endereço | Quem acessa | O que é |
|---|---|---|
| `seusite.vercel.app/` | Fornecedores | Página inicial com botão de cadastro |
| `seusite.vercel.app/cadastro` | Fornecedores | Formulário de 6 etapas |
| `seusite.vercel.app/auth` | Brenda / Admin | Tela de login |
| `seusite.vercel.app/admin` | 🔒 Somente admin | Lista de todos os fornecedores |
| `seusite.vercel.app/admin/fornecedor/ID` | 🔒 Somente admin | Detalhe, aprovação e exportação |


---

## PARTE 7 — Ativar a verificação diária de vencimentos

> O sistema verifica automaticamente todo dia se alguma ISO venceu ou se algum fornecedor precisa de reavaliação anual. Quando encontra, muda o status e avisa Brenda por e-mail.

### Passo 7.1 — Fazer o deploy da função de verificação

```bash
supabase functions deploy check-expirations
```

### Passo 7.2 — Configurar a chave de serviço (necessária para esta função)

Esta função precisa de uma chave especial do Supabase para conseguir alterar dados automaticamente.

1. No Supabase: **Settings → API**
2. Copie a chave **service_role** (atenção: é diferente da anon key — **nunca exponha ela no frontend**)

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
supabase secrets set SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
```

### Passo 7.3 — Ativar o agendamento diário

1. No Supabase: **Database → Extensions** → ative a extensão **pg_cron**
2. Clique em **SQL Editor → New query**
3. Copie a seção **9** do arquivo `supabase/setup.sql`, preencha `SEU_PROJECT_REF` e `SUA_ANON_KEY`
4. Execute

A partir daí, todos os dias às 8h o sistema verifica automaticamente.

---

## O que o sistema registra para auditoria

| Evidência | Onde fica | Para que serve |
|---|---|---|
| Declaração de veracidade | Tabela `fornecedores` | Prova que o fornecedor assinou o cadastro |
| IP e timestamp do aceite | Tabela `fornecedores` | Rastreabilidade do envio |
| Histórico de alterações | Tabela `fornecedor_historico` | Quem mudou o status, quando e por quê |
| Nome do aprovador | Campo `aprovado_por_email` | Responsabilidade pela aprovação |
| Data de próxima reavaliação | Campo `data_proxima_reavaliacao` | Controle de prazo (1 ano) |
| Documentos individualizados | Storage + URLs no banco | Contrato Social, Alvará, Certidões separados |
| Alertas automáticos de ISO | E-mail + histórico | ISO vencida registrada com motivo |
