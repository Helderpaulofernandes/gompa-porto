"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRemoveSlotButton({ id }: { id: string }) {
  const [removing, setRemoving] = useState(false);
  const router = useRouter();

  async function handleRemove() {
    setRemoving(true);
    await fetch("/api/admin/therapy/slots", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <button
      onClick={handleRemove}
      disabled={removing}
      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
    >
      {removing ? "A remover…" : "Remover"}
    </button>
  );
}
