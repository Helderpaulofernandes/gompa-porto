# Gompa Porto — Website

Site institucional com loja, assinaturas e sistema de marcações/terapias, construído em
Next.js (App Router) + TypeScript + Tailwind CSS, com Stripe para pagamentos e Prisma + SQLite
para marcações e registo de encomendas.

## Estrutura

- `/` — Página inicial
- `/sobre` — Sobre a escola
- `/onde-estamos` — Morada, contactos e mapa
- `/horarios` — Horário semanal das aulas, com calendário de reserva de lugar e pagamento
  (Yoga Tibetano e Prática de Meditação)
- `/terapias` — Terapias individuais, com calendário de horários disponíveis por
  professor/sala e pagamento
- `/cursos-e-retiros` — Cursos, retiros e eventos mensais
- `/loja` — Compra de packs de aulas e vouchers (Stripe Checkout)
- `/assinaturas` — Planos de membro mensais (Stripe Subscriptions)
- `/marcacoes` — Formulário geral, mas "inteligente": se o serviço escolhido já tem calendário
  próprio (aula ou terapia), mostra um botão a encaminhar para `/horarios` ou `/terapias` (que
  abrem automaticamente o calendário certo via `?abrir=slug`) em vez de um formulário genérico.
  Só as ofertas sem calendário (Tog Chöd, cursos, retiros, eventos) usam o formulário.
- `/admin` — Painel protegido por palavra-passe: Agenda unificada, gestão de aulas/terapias,
  marcações, reservas e pagamentos.

Conteúdo editável em `src/lib/`:
- `site.ts` — nome, morada, telefone, email, mapa
- `services.ts` — aulas, terapias, eventos e cursos (nomes, horários, descrições)
- `products.ts` — artigos da loja e preços
- `plans.ts` — planos de assinatura e preços
- `classSchedule.ts` — funções de leitura das aulas (as próprias aulas vivem na base de
  dados, geridas em `/admin` — ver abaixo)

**Os preços em `products.ts` e `plans.ts` estão marcados como provisórios — edite antes de
publicar.**

### Aulas semanais e reserva de lugar com calendário (tudo em /admin)

As aulas com horário semanal fixo (Yoga Tibetano, Prática de Meditação, e qualquer outra que
crie) já não vivem no código — são geridas inteiramente em `/admin → Aulas Semanais`:

- **Criar Nova Aula Semanal** — nome, descrição, lugares, preço da aula avulsa, duração, sala,
  professor, e um ou mais horários semanais (dia da semana + hora). Aparece de imediato em
  `/horarios`.
- Em cada aula existente pode ajustar lugares, preço, sala e professor, desativar (deixa de
  aparecer no site sem apagar o histórico) ou remover (só permitido se ainda não tiver
  reservas), e adicionar/remover horários semanais individuais.
- Atribuir sala e professor a uma aula não é só cosmético: é o que permite ao motor de
  disponibilidade das terapias (abaixo) saber que essa sala/professor está ocupado nesse
  horário todas as semanas.

Em `/horarios`, cada aula com horário mostra um botão "Ver disponibilidade e reservar" que
abre um calendário com as próximas datas e os lugares ainda disponíveis (contados a partir da
tabela `SeatReservation`). Ao reservar, a pessoa escolhe entre:

- **Pagar só esta aula** — pagamento único pelo preço de aula avulsa (Stripe Checkout, modo
  `payment`).
- **Assinar [plano] e reservar** — assina o plano de assinatura mensal indicado (por omissão,
  "Ilimitado") e a aula fica automaticamente reservada (Stripe Checkout, modo `subscription`).

Sugestão de preço da aula avulsa: ~15% acima do valor por aula do plano mais barato, para que
a assinatura seja sempre a opção mais vantajosa.

Tog Chöd e as restantes ofertas (cursos, retiros, eventos mensais) não têm horário fixo nem
preço definido (são "por marcação" / "sob consulta" / "datas a anunciar"), por isso mantêm o
formulário de marcação simples em vez do calendário.

### Terapias: motor de disponibilidade (janelas + intervalo + almoço + salas)

As terapias não têm horário fixo como as aulas — dependem de quando cada professor está
disponível. Em vez de criar horários um a um, em `/admin` define-se a disponibilidade geral e
o site calcula os horários concretos automaticamente:

- **Professores** — Anu Biak e Sónia já estão criados. Cada professor tem uma lista de
  terapias que realiza (checkboxes ao editar); só entram no cálculo de disponibilidade para
  essas terapias. Pode adicionar mais professores, editar o nome/terapias, desativar sem
  apagar (mantém o histórico), ou remover definitivamente (só se não tiver horários
  associados).
- **Salas** — igual aos professores (criar, editar, desativar, remover). "Sala de Terapias" e
  "Salao de Grupo" já existem; as aulas de grupo também podem ser associadas a uma sala (ver
  abaixo), para que o sistema saiba que essa sala está ocupada nesse horário.
- **Intervalos e Pausa de Almoço** — um intervalo padrão (minutos) inserido a seguir a cada
  sessão, e uma pausa de almoço opcional (início/fim) que bloqueia esse período em todas as
  janelas, todos os dias.
- **Janelas de Disponibilidade** — ex. "Anu, Sala de Terapias, Quarta-feira, 14:00–18:00".
  Isto é tudo o que é preciso definir; o motor (`src/lib/therapyAvailability.ts`) gera os
  horários reservváveis dentro da janela, espaçados por duração-da-terapia + intervalo (ex.:
  60 min + 15 min de intervalo = horários às 14:00, 15:15, 16:30), e marca como indisponível
  qualquer horário que:
  - já tenha uma marcação (do mesmo professor OU da mesma sala) — o tempo "trancado" por uma
    marcação é a duração da terapia + o intervalo padrão;
  - caia dentro da pausa de almoço;
  - coincida com uma aula de grupo com horário fixo na **mesma sala** (ex.: se a Sala de Grupo
    está ocupada pelo Yoga Tibetano das 19h30 às 21h00 à terça-feira, nenhuma terapia pode
    ser marcada nessa sala nesse intervalo, seja qual for o professor);
  - coincida com uma aula de grupo que o **mesmo professor** dá, mesmo que seja noutra sala
    (ex.: se o Anu dá a Prática de Meditação às 19h30 de quarta na Sala de Grupo, ele não
    aparece disponível para terapias às 19h30 de quarta em nenhuma sala, incluindo a Sala de
    Terapias).

Ao criar uma janela de disponibilidade que se sobrepõe a uma aula desse professor, a resposta
inclui um aviso nesse sentido (não bloqueia a criação — a janela continua válida para o resto
do horário, só esse troço fica indisponível automaticamente).

Duração e preço de cada terapia estão em `src/lib/therapyPricing.ts` (valores provisórios —
ver comentário no ficheiro).

O componente `AvailabilityCalendar` (mês com dias a dourado quando há vagas, lista de horários
do dia selecionado) é partilhado entre `/horarios` e `/terapias` — dias/horas sem vagas
aparecem cinzentos e desativados.

### Agenda (visão unificada por professor / por sala)

No topo de `/admin`, a secção **Agenda** junta aulas de grupo e terapias numa só vista
cronológica (próximos 21 dias), com duas visões:

- **Por Professor** — escolhe um professor, vê tudo o que tem agendado (aulas que dá +
  terapias marcadas), com hora, nome do evento, sala, e um selo colorido (dourado = aula de
  grupo, verde = terapia confirmada, âmbar = terapia pendente de pagamento) e o número de
  participantes (`3/14 lugares` numa aula, nome do cliente numa terapia).
- **Por Sala** — o mesmo, mas por sala em vez de professor — mostra tudo o que está marcado
  nessa sala, seja aula ou terapia, de qualquer professor.

A fonte de dados é `src/lib/agenda.ts` (`getAgendaEvents`), servida por `/api/admin/agenda`.

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
