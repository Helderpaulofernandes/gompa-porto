import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Onde Estamos — ${site.name}`,
};

export default function OndeEstamosPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-gold">Onde estamos</p>
      <h1 className="mt-2 text-4xl font-semibold text-maroon">Visite-nos</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-ink">Morada</h2>
          <p className="mt-2 text-ink/75">{site.address.line1}</p>
          <p className="text-ink/75">{site.address.line2}</p>

          <h2 className="mt-6 text-lg font-semibold text-ink">Contactos</h2>
          <p className="mt-2 text-ink/75">
            Telefone:{" "}
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="text-maroon hover:underline">
              {site.phone}
            </a>
          </p>
          <p className="text-ink/75">
            Email:{" "}
            <a href={`mailto:${site.email}`} className="text-maroon hover:underline">
              {site.email}
            </a>
          </p>

          <a
            href={site.mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-maroon px-6 py-2.5 text-sm font-semibold text-cream hover:bg-maroon-dark"
          >
            Abrir no Google Maps
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gold/30">
          <iframe
            src={site.mapsEmbedSrc}
            className="h-full min-h-96 w-full"
            loading="lazy"
            title={`Mapa - ${site.name}`}
          />
        </div>
      </div>
    </div>
  );
}
