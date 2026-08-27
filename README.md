# Gompa Porto — Website

Site institucional com loja, assinaturas e sistema de marcações/terapias, construído em
Next.js (App Router) + TypeScript + Tailwind CSS, com Stripe para pagamentos e Prisma + SQLite
para marcações e registo de encomendas.

## Estrutura

- `/` — Página inicial
- `/sobre` — Sobre a escola
- `/onde-estamos` — Morada, contactos e mapa
- `/horarios` — Horário semanal das aulas
- `/terapias` — Terapias individuais (marcação por formulário)
- `/cursos-e-retiros` — Cursos, retiros e eventos mensais
- `/loja` — Compra de packs de aulas e vouchers (Stripe Checkout)
- `/assinaturas` — Planos de membro mensais (Stripe Subscriptions)
- `/marcacoes` — Formulário geral de marcação (pode pré-selecionar o serviço via `?servico=slug`)
- `/admin` — Painel protegido por palavra-passe com a lista de marcações e pagamentos

Conteúdo editável em `src/lib/`:
- `site.ts` — nome, morada, telefone, email, mapa
- `services.ts` — aulas, terapias, eventos e cursos (nomes, horários, descrições)
- `products.ts` — artigos da loja e preços
- `plans.ts` — planos de assinatura e preços

**Os preços em `products.ts` e `plans.ts` estão marcados como provisórios — edite antes de publicar.**

## Configuração local

1. `.env` já está configurado com a ligação real à base de dados Neon (ver secção
   [Base de dados](#base-de-dados)) e chaves de teste para o resto — substitua-as pelas suas
   conforme for configurando cada serviço.
2. Instale dependências: `npm install`
3. Gere o cliente Prisma: `npx prisma generate`
4. Arranque o servidor: `npm run dev` e abra http://localhost:3000

## Configurar o Stripe (loja, assinaturas e pagamentos)

1. Crie uma conta em https://dashboard.stripe.com (pode começar em modo de testes).
2. Em **Developers → API keys**, copie a **Secret key** para `STRIPE_SECRET_KEY` no `.env`.
3. Não é necessário criar produtos/preços no dashboard — os preços definidos em `products.ts` e
   `plans.ts` são enviados diretamente para o Stripe Checkout a cada compra.
4. Para registar pagamentos no painel `/admin`, configure um webhook:
   - Local: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (usa a Stripe CLI) e
     copie o "signing secret" para `STRIPE_WEBHOOK_SECRET`.
   - Produção: em **Developers → Webhooks**, adicione um endpoint para
     `https://SEU-DOMINIO/api/webhooks/stripe`, evento `checkout.session.completed`, e copie o
     signing secret gerado para `STRIPE_WEBHOOK_SECRET`.
5. Quando estiver pronto para pagamentos reais, ative a conta Stripe e troque as chaves de teste
   (`sk_test_...`) pelas chaves em produção (`sk_live_...`).

## Painel administrativo

Aceda a `/admin` e entre com a palavra-passe definida em `ADMIN_PASSWORD` no `.env`. Mostra as
marcações recebidas e os pagamentos confirmados pelo Stripe (requer o webhook configurado).

## Notificações por email

Cada marcação fica sempre guardada na base de dados e visível em `/admin`, independentemente
do email. Para receber também um email automático (para a Gompa Porto e uma confirmação para
o cliente), já está integrado o [Resend](https://resend.com):

1. Crie uma conta gratuita em https://resend.com e gere uma API key em **API Keys**.
2. Coloque a chave em `RESEND_API_KEY` no `.env`.
3. Para testar imediatamente, deixe `RESEND_FROM_EMAIL="Gompa Porto <onboarding@resend.dev>"`
   (funciona sem configuração extra, mas os emails só chegam à morada usada para criar a conta
   Resend). Para enviar para qualquer destinatário com o nome "Gompa Porto" no remetente, verifique
   o vosso domínio em **Domains** no Resend e mude para
   `RESEND_FROM_EMAIL="Gompa Porto <marcacoes@seudominio.pt>"`.
4. Sem `RESEND_API_KEY` configurada, o envio de email é simplesmente ignorado — nada quebra.

## Base de dados

A aplicação usa Postgres na [Neon](https://neon.tech) — projeto **Gompa Porto**
(`royal-sky-19562474`) na organização **Gompa School**. `DATABASE_URL` (ligação com pooling,
usada pela aplicação) e `DATABASE_URL_UNPOOLED` (ligação direta, usada pelas migrações) já
estão configuradas em `prisma/schema.prisma`.

Para trabalhar no projeto noutra máquina:

1. `npx neon@latest auth` — inicia sessão na conta Neon.
2. `npx neon@latest link --org-id org-young-sunset-11359312 --project-id royal-sky-19562474`
3. `npx neon@latest checkout production` — associa o branch e escreve `DATABASE_URL` /
   `DATABASE_URL_UNPOOLED` no `.env` automaticamente.
4. `npx prisma generate`

Alterações ao schema (`prisma/schema.prisma`) devem ser feitas com
`npx prisma migrate dev --name descricao-da-alteracao`, que cria e aplica uma migração e
atualiza `prisma/migrations/`. Em produção, use `npx prisma migrate deploy`.

## Publicar o site

Este projeto está pronto a ser publicado na [Vercel](https://vercel.com) (criadores do Next.js):

1. Código já está em https://github.com/Helderpaulofernandes/gompa-porto.
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente no painel da Vercel — copie os valores atuais do `.env`
   local: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, e opcionalmente `RESEND_API_KEY` /
   `RESEND_FROM_EMAIL`.
4. Ligue um domínio próprio (ex. gompaporto.pt) nas definições do projeto.
