"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { categoryLabels, type Service, type ServiceCategory } from "@/lib/services";

const CATEGORIES: ServiceCategory[] = ["aula", "terapia", "evento", "curso"];

async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/services/upload", { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erro ao enviar imagem.");
  return json.url;
}

function ServiceFields({
  name,
  setName,
  category,
  setCategory,
  schedule,
  setSchedule,
  duration,
  setDuration,
  priceLabel,
  setPriceLabel,
  description,
  setDescription,
  photo,
  setPhoto,
  bookable,
  setBookable,
  priceEuros,
  setPriceEuros,
  therapyDuration,
  setTherapyDuration,
  uploading,
  setUploading,
  setError,
}: {
  name: string;
  setName: (v: string) => void;
  category: ServiceCategory;
  setCategory: (v: ServiceCategory) => void;
  schedule: string;
  setSchedule: (v: string) => void;
  duration: string;
  setDuration: (v: string) => void;
  priceLabel: string;
  setPriceLabel: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  photo: string;
  setPhoto: (v: string) => void;
  bookable: boolean;
  setBookable: (v: boolean) => void;
  priceEuros: string;
  setPriceEuros: (v: string) => void;
  therapyDuration: string;
  setTherapyDuration: (v: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  setError: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ServiceCategory)}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {categoryLabels[c]}
          </option>
        ))}
      </select>
      <input
        placeholder="Horário (texto, ex.: Terças e quintas, 19h30)"
        value={schedule}
        onChange={(e) => setSchedule(e.target.value)}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm sm:col-span-2"
      />
      <input
        placeholder="Duração (texto, opcional)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
      />
      <input
        placeholder="Preço (texto, ex.: Preço sob consulta)"
        value={priceLabel}
        onChange={(e) => setPriceLabel(e.target.value)}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm"
      />
      <textarea
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="rounded-lg border border-gold/40 px-2 py-1.5 text-sm sm:col-span-2"
      />
      {category === "terapia" && (
        <>
          <label className="text-xs text-ink/60">
            Preço real (€, pagamento online):{" "}
            <input
              type="text"
              inputMode="decimal"
              value={priceEuros}
              onChange={(e) => setPriceEuros(e.target.value)}
              className="w-24 rounded-lg border border-gold/40 px-2 py-1 text-sm"
            />
          </label>
          <label className="text-xs text-ink/60">
            Duração real (min):{" "}
            <input
              type="number"
              min={5}
              step={5}
              value={therapyDuration}
              onChange={(e) => setTherapyDuration(e.target.value)}
              className="w-20 rounded-lg border border-gold/40 px-2 py-1 text-sm"
            />
          </label>
        </>
      )}
      <label className="flex items-center gap-1 text-xs text-ink/60">
        <input type="checkbox" checked={bookable} onChange={(e) => setBookable(e.target.checked)} />
        Reservável (mostra botão de marcação)
      </label>
      <div className="sm:col-span-2">
        <p className="text-xs text-ink/60">Imagem</p>
        <div className="mt-1 flex items-center gap-3">
          {photo && (
            <Image src={photo} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError("");
              try {
                const url = await uploadPhoto(file);
                setPhoto(url);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao enviar imagem.");
              } finally {
                setUploading(false);
              }
            }}
            className="text-xs"
          />
          {photo && (
            <button type="button" onClick={() => setPhoto("")} className="text-xs text-red-600">
              remover imagem
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExistingServiceRow({ service }: { service: Service }) {
  const router = useRouter();
  const [name, setName] = useState(service.name);
  const [category, setCategory] = useState<ServiceCategory>(service.category);
  const [schedule, setSchedule] = useState(service.schedule);
  const [duration, setDuration] = useState(service.duration ?? "");
  const [priceLabel, setPriceLabel] = useState(service.priceLabel);
  const [description, setDescription] = useState(service.description);
  const [photo, setPhoto] = useState(service.photo ?? "");
  const [bookable, setBookable] = useState(service.bookable);
  const [priceEuros, setPriceEuros] = useState(service.priceCents ? (service.priceCents / 100).toFixed(2) : "");
  const [therapyDuration, setTherapyDuration] = useState(
    service.durationMinutes ? String(service.durationMinutes) : ""
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: service.id,
        name,
        category,
        schedule,
        duration: duration || null,
        priceLabel,
        description,
        photo: photo || null,
        bookable,
        priceCents: category === "terapia" && priceEuros ? Math.round(parseFloat(priceEuros) * 100) : null,
        durationMinutes: category === "terapia" && therapyDuration ? Number(therapyDuration) : null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Erro ao guardar.");
    }
  }

  async function toggleActive() {
    await fetch("/api/admin/services", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id, active: !service.active }),
    });
    router.refresh();
  }

  async function remove() {
    const res = await fetch("/api/admin/services", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: service.id }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Erro ao remover.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-gold/30 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${service.active ? "text-ink" : "text-ink/40 line-through"}`}>
          {service.name} <span className="text-xs font-normal text-ink/40">({service.slug})</span>
        </span>
        <div className="flex gap-3">
          <button onClick={toggleActive} className="text-xs font-semibold text-maroon hover:underline">
            {service.active ? "Desativar" : "Ativar"}
          </button>
          <button onClick={remove} className="text-xs font-semibold text-red-600 hover:underline">
            Remover
          </button>
        </div>
      </div>

      <div className="mt-3">
        <ServiceFields
          name={name}
          setName={setName}
          category={category}
          setCategory={setCategory}
          schedule={schedule}
          setSchedule={setSchedule}
          duration={duration}
          setDuration={setDuration}
          priceLabel={priceLabel}
          setPriceLabel={setPriceLabel}
          description={description}
          setDescription={setDescription}
          photo={photo}
          setPhoto={setPhoto}
          bookable={bookable}
          setBookable={setBookable}
          priceEuros={priceEuros}
          setPriceEuros={setPriceEuros}
          therapyDuration={therapyDuration}
          setTherapyDuration={setTherapyDuration}
          uploading={uploading}
          setUploading={setUploading}
          setError={setError}
        />
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <button
        onClick={save}
        disabled={saving || uploading}
        className="mt-3 rounded-full bg-maroon px-3 py-1.5 text-xs font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60"
      >
        {saving ? "A guardar…" : saved ? "Guardado ✓" : "Guardar"}
      </button>
    </div>
  );
}

export default function AdminServiceManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("aula");
  const [schedule, setSchedule] = useState("");
  const [duration, setDuration] = useState("");
  const [priceLabel, setPriceLabel] = useState("Preço sob consulta");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [bookable, setBookable] = useState(true);
  const [priceEuros, setPriceEuros] = useState("");
  const [therapyDuration, setTherapyDuration] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function createService() {
    if (!name.trim() || !schedule.trim() || !priceLabel.trim() || !description.trim()) {
      setError("Preencha nome, horário, preço e descrição.");
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category,
          schedule: schedule.trim(),
          duration: duration.trim() || null,
          priceLabel: priceLabel.trim(),
          description: description.trim(),
          photo: photo || null,
          bookable,
          priceCents: category === "terapia" && priceEuros ? Math.round(parseFloat(priceEuros) * 100) : null,
          durationMinutes: category === "terapia" && therapyDuration ? Number(therapyDuration) : null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro ao criar serviço.");
      setSaved(true);
      setName("");
      setSchedule("");
      setDuration("");
      setPriceLabel("Preço sob consulta");
      setDescription("");
      setPhoto("");
      setPriceEuros("");
      setTherapyDuration("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <ExistingServiceRow key={s.id} service={s} />
        ))}
      </div>

      <div className="rounded-xl border border-gold/30 bg-white p-4">
        <h3 className="text-sm font-semibold text-ink">Criar Novo Serviço</h3>
        <div className="mt-3">
          <ServiceFields
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            schedule={schedule}
            setSchedule={setSchedule}
            duration={duration}
            setDuration={setDuration}
            priceLabel={priceLabel}
            setPriceLabel={setPriceLabel}
            description={description}
            setDescription={setDescription}
            photo={photo}
            setPhoto={setPhoto}
            bookable={bookable}
            setBookable={setBookable}
            priceEuros={priceEuros}
            setPriceEuros={setPriceEuros}
            therapyDuration={therapyDuration}
            setTherapyDuration={setTherapyDuration}
            uploading={uploading}
            setUploading={setUploading}
            setError={setError}
          />
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <button
          onClick={createService}
          disabled={saving || uploading}
          className="mt-4 w-full rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-cream hover:bg-maroon-dark disabled:opacity-60 sm:w-auto"
        >
          {saving ? "A criar…" : saved ? "Criado ✓" : "Criar"}
        </button>
      </div>
    </div>
  );
}
