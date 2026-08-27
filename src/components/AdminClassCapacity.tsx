"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminClassCapacity({
  slug,
  name,
  capacity,
}: {
  slug: string;
  name: string;
  capacity: number;
}) {
  const [value, setValue] = useState(capacity);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/aulas/capacidade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, capacity: value }),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gold/30 bg-white px-4 py-3">
      <span className="text-sm font-medium text-ink">{name}</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          max={500}
          value={value}
          onChange={(e) => {
            setValue(Number(e.target.value));
            setSaved(false);
          }}
          className="w-20 rounded-lg border border-gold/40 px-2 py-1 text-sm focus:border-maroon focus:outline-none"
        />
        <span className="text-xs text-ink/50">lugares</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-maroon px-4 py-1.5 text-xs font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
        >
          {saving ? "A guardar…" : saved ? "Guardado ✓" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
