"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao autenticar.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-24 max-w-sm space-y-4 rounded-2xl border border-gold/30 bg-white p-8">
      <h1 className="text-xl font-semibold text-maroon">Acesso Administrativo</h1>
      <input
        type="password"
        placeholder="Palavra-passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded-lg border border-gold/40 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-maroon px-5 py-2.5 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
      >
        {loading ? "A entrar..." : "Entrar"}
      </button>
    </form>
  );
}
