import { Resend } from "resend";
import { site } from "@/lib/site";

type BookingEmailInput = {
  serviceName: string;
  name: string;
  email: string;
  phone?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  notes?: string | null;
};

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

/**
 * Envia o email de notificação (para a Gompa Porto) e de confirmação (para o cliente).
 * Não faz nada se RESEND_API_KEY não estiver configurada — a marcação fica sempre
 * guardada na base de dados e visível em /admin, mesmo sem email configurado.
 */
export async function sendBookingEmails(booking: BookingEmailInput) {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.RESEND_FROM_EMAIL || "Gompa Porto <onboarding@resend.dev>";
  const preferencia = [booking.preferredDate, booking.preferredTime].filter(Boolean).join(" às ") || "sem preferência indicada";

  try {
    await resend.emails.send({
      from,
      to: site.email,
      replyTo: booking.email,
      subject: `Nova marcação: ${booking.serviceName}`,
      text: [
        `Serviço: ${booking.serviceName}`,
        `Nome: ${booking.name}`,
        `Email: ${booking.email}`,
        `Telefone: ${booking.phone || "—"}`,
        `Data/hora preferida: ${preferencia}`,
        `Mensagem: ${booking.notes || "—"}`,
      ].join("\n"),
    });

    await resend.emails.send({
      from,
      to: booking.email,
      subject: `Recebemos o seu pedido — ${site.name}`,
      text: [
        `Olá ${booking.name},`,
        "",
        `Recebemos o seu pedido de marcação para "${booking.serviceName}" (${preferencia}).`,
        "Entraremos em contacto brevemente para confirmar o dia e a hora.",
        "",
        `${site.name}`,
        site.phone,
        site.email,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Falha ao enviar email de marcação:", err);
  }
}
