"use client";

import { useState } from "react";
import { services } from "@/lib/services";

export default function BookingForm({ initialSlug }: { initialSlug?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const payload = {
      servico: form.get("servico"),
      nome: form.get("nome"),
      email: form.get("email"),
      telefone: form.get("telefone"),
      data: form.get("data"),
      hora: form.get("hora"),
      mensagem: form.get("mensagem"),
    };

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Erro ao enviar o pedido.");
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro inesperado.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-gold/30 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-maroon">Pedido enviado!</h2>
        <p className="mt-2 text-ink/70">
          Obrigado. Entraremos em contacto brevemente para confirmar o dia e a hora.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gold/30 bg-white p-8">
      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="servico">
          Serviço
        </label>
        <select
          id="servico"
          name="servico"
          required
          defaultValue={initialSlug ?? ""}
          className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
        >
          <option value="" disabled>
            Escolha um serviço
          </option>
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="telefone">
            Telefone (opcional)
          </label>
          <input
            id="telefone"
            name="telefone"
            className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="data">
            Data preferida
          </label>
          <input
            id="data"
            name="data"
            type="date"
            className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink" htmlFor="hora">
            Hora preferida
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink" htmlFor="mensagem">
          Mensagem (opcional)
        </label>
        <textarea
          id="mensagem"
          name="mensagem"
          rows={3}
          className="mt-1 w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-cream transition hover:bg-maroon-dark disabled:opacity-60"
      >
        {status === "loading" ? "A enviar..." : "Enviar pedido de marcação"}
      </button>
    </form>
  );
}
