export type Service = {
  slug: string;
  name: string;
  category: "aula" | "terapia" | "evento" | "curso";
  schedule: string;
  duration?: string;
  priceLabel: string;
  description: string;
  bookable: boolean;
};

/**
 * Conteúdo de partida com a informação fornecida pela Gompa Porto.
 * Horários, preços e descrições marcados como provisórios devem ser
 * revistos antes do lançamento do site.
 */
export const services: Service[] = [
  // Aulas regulares
  {
    slug: "yoga-tibetano",
    name: "Yoga Tibetano",
    category: "aula",
    schedule: "Terças e quintas, 19h30 – 21h00 · Sábados, 10h00 – 11h30",
    priceLabel: "Consultar valores de mensalidade / avulso",
    description:
      "Prática de yoga tibetano orientada para o equilíbrio entre corpo, energia e mente, incluindo movimentos suaves, respiração e relaxamento.",
    bookable: true,
  },
  {
    slug: "pratica-meditacao",
    name: "Prática de Meditação",
    category: "aula",
    schedule: "Quartas, 19h30",
    priceLabel: "Consultar valores de mensalidade / avulso",
    description:
      "Sessão semanal de meditação guiada, aberta a iniciantes e praticantes com experiência.",
    bookable: true,
  },
  {
    slug: "tog-chod",
    name: "Tog Chöd – Espada de Sabedoria",
    category: "aula",
    schedule: "Treino personalizado individual — dia e horário a combinar com o aluno",
    priceLabel: "Preço sob consulta",
    description:
      "Treino individual e personalizado de Tog Chöd (Espada de Sabedoria), adaptado ao ritmo e objetivos de cada praticante.",
    bookable: true,
  },

  // Terapias
  {
    slug: "terapia-do-som",
    name: "Terapia do Som",
    category: "terapia",
    schedule: "Individual — marcação prévia",
    priceLabel: "Preço sob consulta",
    description:
      "Sessão terapêutica com sons tibetanos (taças, gongos e mantras) para relaxamento profundo e equilíbrio energético.",
    bookable: true,
  },
  {
    slug: "tsa-lung-healing",
    name: "Tsa Lung Healing – Toque Energético (Reiki)",
    category: "terapia",
    schedule: "Individual — marcação prévia",
    priceLabel: "Preço sob consulta",
    description:
      "Terapia energética Tsa Lung Healing, um toque suave que trabalha os canais de energia sutil do corpo.",
    bookable: true,
  },
  {
    slug: "massagem-shiatsu",
    name: "Massagem Shiatsu, Auriculoterapia e Reflexologia",
    category: "terapia",
    schedule: "Individual — marcação prévia · com Sónia",
    priceLabel: "Preço sob consulta",
    description:
      "Sessões terapêuticas de shiatsu, auriculoterapia e reflexologia com a terapeuta Sónia.",
    bookable: true,
  },

  // Eventos mensais
  {
    slug: "praticas-lua",
    name: "Práticas de Orações e Dias Auspiciosos",
    category: "evento",
    schedule: "Mensal — Meditação da Lua Nova e da Lua Cheia",
    priceLabel: "Consultar",
    description:
      "Práticas de orações e práticas budistas realizadas nos dias auspiciosos do calendário lunar, incluindo as meditações da Lua Nova e da Lua Cheia.",
    bookable: true,
  },
  {
    slug: "concertos-meditativos",
    name: "Concertos Meditativos – Tibetan Healing Sounds",
    category: "evento",
    schedule: "Mensal — datas a anunciar",
    priceLabel: "Consultar",
    description:
      "Meditação com o suporte sonoro de taças tibetanas, gongos e mantras budistas, num concerto meditativo aberto à comunidade.",
    bookable: true,
  },

  // Cursos e retiros
  {
    slug: "curso-introducao-meditacao",
    name: "Curso de Introdução à Meditação",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Curso introdutório para quem quer começar a praticar meditação com uma base sólida.",
    bookable: true,
  },
  {
    slug: "curso-intermedio-avancado-meditacao",
    name: "Curso Intermédio / Avançado de Meditação",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Aprofundamento da prática para quem já tem experiência em meditação.",
    bookable: true,
  },
  {
    slug: "curso-tsa-lung-healing",
    name: "Curso de Tsa Lung Healing",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Formação na técnica terapêutica de Tsa Lung Healing.",
    bookable: true,
  },
  {
    slug: "curso-lujong",
    name: "Curso de Yoga Tibetano – Lujong 1 e 2",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Formação estruturada em Lujong (yoga tibetano), níveis 1 e 2.",
    bookable: true,
  },
  {
    slug: "workshop-mantras",
    name: "Workshop de Mantras Budistas",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Workshop dedicado à prática e significado dos mantras budistas.",
    bookable: true,
  },
  {
    slug: "retiro-1-dia",
    name: "Retiro de 1 Dia (Preparação para Retiro)",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Retiro de um dia pensado como preparação para retiros mais longos.",
    bookable: true,
  },
  {
    slug: "retiro-3-dias",
    name: "Retiro de 3 Dias",
    category: "curso",
    schedule: "Datas a anunciar",
    priceLabel: "Preço sob consulta",
    description: "Retiro de imersão de três dias em prática contemplativa e comunidade.",
    bookable: true,
  },
];

export const categoryLabels: Record<Service["category"], string> = {
  aula: "Aulas Regulares",
  terapia: "Terapias",
  evento: "Eventos Mensais",
  curso: "Cursos e Retiros",
};

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
