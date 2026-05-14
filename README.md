# Filtros Brasil — Portal de Cadastro de Fornecedores

Sistema web para cadastro, qualificação e gestão de fornecedores da Filtros Brasil.

---

## 🚀 Deploy em 4 passos

### 1. Instalar dependências e componentes shadcn/ui

```bash
npm install
```

Em seguida, instale os componentes shadcn/ui necessários:

```bash
npx shadcn@latest add button input label select textarea card badge separator table toast sonner tooltip radio-group
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Abra o `.env` e preencha com os dados do seu projeto Supabase:
- Acesse [supabase.com](https://supabase.com) → seu projeto → **Settings → API**
- Copie a **Project URL** e a **anon public key**

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 3. Subir para o GitHub

```bash
git init
git add .
git commit -m "feat: portal de cadastro de fornecedores filtros brasil"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

### 4. Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório GitHub que você acabou de criar
3. Antes de clicar em **Deploy**, vá em **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` → sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` → sua chave anon do Supabase
4. Clique em **Deploy**

✅ A Vercel detecta automaticamente que é um projeto Vite.

---

## 🗂️ Estrutura do projeto

```
src/
├── components/
│   ├── fornecedor/        # Formulário de cadastro (7 etapas)
│   │   ├── FornecedorForm.tsx
│   │   ├── FormProgress.tsx
│   │   ├── StepDadosFornecedor.tsx
│   │   ├── StepDocumentacoes.tsx
│   │   ├── StepRegimeTributario.tsx
│   │   ├── StepISO.tsx
│   │   ├── StepResponsavel.tsx
│   │   └── StepAutoavaliacao.tsx
│   ├── landing/           # Header, Footer, Hero, Topbar
│   └── ui/                # Componentes shadcn/ui (instalar via CLI)
├── contexts/              # AuthContext (Supabase Auth)
├── integrations/supabase/ # Cliente Supabase
├── lib/                   # Utils, pdfToImage, extractDates
├── pages/                 # Index, Cadastro, Admin, FornecedorDetail, Auth
└── types/                 # Tipos TypeScript (Fornecedor, FormData)

supabase/
└── functions/
    └── extract-iso-dates/ # Edge Function para extração de datas via OpenAI
```

---

## ⚙️ Rotas

| Rota | Acesso | Descrição |
|---|---|---|
| `/` | Público | Landing page com botão de cadastro |
| `/cadastro` | Público | Formulário de 7 etapas |
| `/auth` | Público | Login administrativo |
| `/admin` | Admin | Dashboard com lista de fornecedores |
| `/admin/fornecedor/:id` | Admin | Detalhe, aprovação e observações |

---

## 🔧 Desenvolvimento local

```bash
npm run dev
```

Acesse: `http://localhost:8080`

---

## 📦 Build para produção

```bash
npm run build
```

---

## 🔑 Variáveis de ambiente necessárias

| Variável | Onde obter |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

> **Importante:** Nunca suba o arquivo `.env` para o GitHub. Ele está no `.gitignore`.
> Na Vercel, cadastre as variáveis em **Project Settings → Environment Variables**.

---

## 🏷️ Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Sonner (toasts)
- React Router DOM
- Zod (validação)
- pdfjs-dist (conversão PDF → imagem)
