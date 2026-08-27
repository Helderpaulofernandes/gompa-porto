import Link from "next/link";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-gold/30 bg-indigo text-cream/90">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-gold-light">{site.name}</p>
          <p className="mt-2 text-sm text-cream/70">{site.tagline}</p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-gold-light">Contactos</p>
          <p className="mt-2">{site.address.line1}</p>
          <p>{site.address.line2}</p>
          <p className="mt-2">
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-gold-light">
              {site.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${site.email}`} className="hover:text-gold-light">
              {site.email}
            </a>
          </p>
        </div>

        <div className="text-sm">
          <p className="font-semibold text-gold-light">Explorar</p>
          <ul className="mt-2 space-y-1">
            <li><Link href="/horarios" className="hover:text-gold-light">Horários</Link></li>
            <li><Link href="/terapias" className="hover:text-gold-light">Terapias</Link></li>
            <li><Link href="/loja" className="hover:text-gold-light">Loja</Link></li>
            <li><Link href="/assinaturas" className="hover:text-gold-light">Assinaturas</Link></li>
            <li><Link href="/onde-estamos" className="hover:text-gold-light">Onde Estamos</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
