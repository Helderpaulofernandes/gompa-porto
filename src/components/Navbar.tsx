"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/lib/site";

const links = [
  { href: "/sobre", label: "Sobre" },
  { href: "/horarios", label: "Horários" },
  { href: "/terapias", label: "Terapias" },
  { href: "/cursos-e-retiros", label: "Cursos e Retiros" },
  { href: "/loja", label: "Loja" },
  { href: "/assinaturas", label: "Assinaturas" },
  { href: "/onde-estamos", label: "Onde Estamos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold/30 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="text-xl font-semibold tracking-wide text-maroon">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink/80 transition hover:text-maroon"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/marcacoes"
            className="rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-cream transition hover:bg-maroon-dark"
          >
            Marcar
          </Link>
        </nav>

        <button
          aria-label="Abrir menu"
          className="flex flex-col gap-1.5 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
          <span className="h-0.5 w-6 bg-ink" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-gold/30 bg-cream px-4 pb-4 lg:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded px-2 py-2 text-sm font-medium text-ink/80 hover:bg-gold-light/20"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/marcacoes"
            className="mt-2 rounded-full bg-maroon px-5 py-2 text-center text-sm font-semibold text-cream"
            onClick={() => setOpen(false)}
          >
            Marcar
          </Link>
        </nav>
      )}
    </header>
  );
}
