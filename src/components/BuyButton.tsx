"use client";

import { useState } from "react";

export default function BuyButton({
  slug,
  endpoint,
  label = "Comprar",
}: {
  slug: string;
  endpoint: "produto" | "assinatura";
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/checkout/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Não foi possível iniciar o pagamento.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-maroon-dark disabled:opacity-60"
      >
        {loading ? "A processar..." : label}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
