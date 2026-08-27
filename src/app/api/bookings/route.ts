import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServiceBySlug } from "@/lib/services";

const bodySchema = z.object({
  servico: z.string().min(1),
  nome: z.string().min(2),
  email: z.string().email(),
  telefone: z.string().optional(),
  data: z.string().optional(),
  hora: z.string().optional(),
  mensagem: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Preencha corretamente todos os campos obrigatórios." }, { status: 400 });
  }

  const { servico, nome, email, telefone, data, hora, mensagem } = parsed.data;
  const service = getServiceBySlug(servico);

  const booking = await prisma.booking.create({
    data: {
      serviceSlug: servico,
      serviceName: service?.name ?? servico,
      name: nome,
      email,
      phone: telefone || null,
      preferredDate: data || null,
      preferredTime: hora || null,
      notes: mensagem || null,
    },
  });

  return NextResponse.json({ ok: true, id: booking.id });
}
