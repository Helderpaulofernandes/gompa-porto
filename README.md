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

1. Copie `.env.example` para `.env` e preencha os valores (já existe um `.env` de desenvolvimento
   com chaves de teste inválidas, apenas para a aplicação arrancar).
2. Instale dependências: `npm install`
3. Gere a base de dados: `npx prisma generate && npx prisma db push`
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

Atualmente as marcações ficam apenas guardadas na base de dados e visíveis em `/admin`. Para
receber um email automático a cada marcação, o mais simples é integrar um serviço como o
[Resend](https://resend.com) na rota `src/app/api/bookings/route.ts`.

## Base de dados

Por omissão usa SQLite (ficheiro `prisma/dev.db`), suficiente para começar. Para produção num
serviço como a Vercel (sem sistema de ficheiros persistente), mude o `datasource` em
`prisma/schema.prisma` para Postgres (por exemplo, [Neon](https://neon.tech) ou
[Vercel Postgres](https://vercel.com/storage/postgres)) e atualize `DATABASE_URL`.

## Publicar o site

Este projeto está pronto a ser publicado na [Vercel](https://vercel.com) (criadores do Next.js):

1. Suba o código para um repositório Git (GitHub/GitLab).
2. Importe o repositório na Vercel.
3. Configure as variáveis de ambiente (`DATABASE_URL`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`) no painel da Vercel.
4. Ligue um domínio próprio (ex. gompaporto.pt) nas definições do projeto.
