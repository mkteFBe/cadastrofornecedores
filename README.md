# Filtros Brasil — Portal de Cadastro de Fornecedores

## Deploy rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar localmente
```bash
npm run dev
```
Acesse: http://localhost:8080

### 3. Subir no GitHub e Vercel
```bash
git init
git add .
git commit -m "feat: portal fornecedores filtros brasil"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```
Na Vercel: importe o repositório e clique em Deploy (sem variáveis de ambiente necessárias).

## Supabase — Storage (necessário para uploads)
No painel do Supabase, vá em SQL Editor e rode:
```sql
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', true)
on conflict (id) do update set public = true;

create policy "allow_anon_upload" on storage.objects
for insert to anon with check (bucket_id = 'documentos');

create policy "allow_public_read" on storage.objects
for select to anon using (bucket_id = 'documentos');
```

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui · Supabase · Sonner · Zod · pdfjs-dist
