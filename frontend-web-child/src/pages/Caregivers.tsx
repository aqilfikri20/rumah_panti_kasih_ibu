import { useState } from "react";
import { ArrowRight, Heart, MapPin, Pencil, Phone, Save, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppData } from "../services/AppDataContext";

const colors = ["from-sky-600 to-blue-700", "from-violet-600 to-indigo-700", "from-teal-600 to-emerald-700"];

export default function Caregivers() {
  const { caregivers, loading, updateCaregiver } = useAppData();
  const totalChildren = caregivers.reduce((sum, caregiver) => sum + caregiver.childCount, 0);

  return (
    <div className="min-h-screen bg-slate-100/80 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-violet-700 via-violet-800 to-emerald-900 p-7 text-white shadow-lg shadow-violet-300/40 sm:flex-row sm:items-end sm:p-9">
          <div><p className="text-sm font-medium text-sky-200">Tim pendamping</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Data Pengasuh</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Lihat kontak pengasuh dan anak yang berada dalam pendampingan masing-masing.</p></div>
          <div className="flex gap-3"><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur"><p className="text-xs text-slate-300">Pengasuh aktif</p><p className="mt-1 text-2xl font-bold">{caregivers.length}</p></div><div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur"><p className="text-xs text-slate-300">Anak didampingi</p><p className="mt-1 text-2xl font-bold">{totalChildren}</p></div></div>
        </header>

        {loading ? <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">Memuat data pengasuh...</div> : caregivers.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><Users className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-semibold text-slate-800">Belum ada data pengasuh</p><p className="mt-1 text-sm text-slate-500">Data pengasuh akan tampil setelah anak memiliki pengasuh.</p></div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {caregivers.map((caregiver, index) => <CaregiverCard key={caregiver.id} caregiver={caregiver} color={colors[index % colors.length]} onSave={updateCaregiver} />)}
          </div>
        )}
        <p className="mt-6 text-xs text-slate-500">Informasi pengasuh dan anak dampingan tersimpan pada data Rumah Kasih Ibu.</p>
      </div>
    </div>
  );
}

function CaregiverCard({ caregiver, color, onSave }: {
  caregiver: ReturnType<typeof useAppData>["caregivers"][number];
  color: string;
  onSave: (id: number, contact: { address: string; phone: string }) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(caregiver.address ?? "");
  const [phone, setPhone] = useState(caregiver.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    try { await onSave(caregiver.id, { address, phone }); setEditing(false); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Gagal menyimpan kontak pengasuh."); }
    finally { setSaving(false); }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`bg-gradient-to-r ${color} px-5 py-5 text-white`}>
        <div className="flex items-center justify-between"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20">{caregiver.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{caregiver.active ? "Aktif" : "Tidak aktif"}</span></div>
        <h2 className="mt-4 text-xl font-bold">{caregiver.name}</h2><p className="mt-1 text-sm text-white/75">Pengasuh anak</p>
      </div>
      <div className="p-5">
        <section className="rounded-xl bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Informasi kontak</h3>{!editing && <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"><Pencil className="h-3.5 w-3.5" />Ubah</button>}</div>
          {editing ? <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-600">Alamat<textarea rows={2} value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Masukkan alamat pengasuh" className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
            <label className="block text-xs font-medium text-slate-600">Nomor HP<input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Contoh: 08xxxxxxxxxx" className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" /></label>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setAddress(caregiver.address ?? ""); setPhone(caregiver.phone ?? ""); setEditing(false); setError(""); }} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"><X className="h-3.5 w-3.5" />Batal</button><button type="button" disabled={saving} onClick={() => void save()} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-800 disabled:opacity-50"><Save className="h-3.5 w-3.5" />{saving ? "Menyimpan..." : "Simpan"}</button></div>
          </div> : <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><p className="text-slate-700">{caregiver.address || <span className="text-slate-400">Alamat belum diisi</span>}</p></div>
            <div className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0 text-slate-400" /><p className="text-slate-700">{caregiver.phone || <span className="text-slate-400">Nomor HP belum diisi</span>}</p></div>
          </div>}
        </section>
        <div className="mb-3 mt-5 flex items-center justify-between"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Heart className="h-4 w-4 text-rose-500" />Anak dampingan</div><span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700">{caregiver.childCount}</span></div>
        {caregiver.children.length ? <ul className="divide-y divide-slate-100">{caregiver.children.map((child) => <li key={child.id}><Link to={`/children/${child.id}`} className="flex items-center justify-between py-3 text-sm transition hover:text-blue-700"><span><span className="font-medium text-slate-800">{child.name}</span><span className="ml-2 text-xs text-slate-400">{child.code}</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></Link></li>)}</ul> : <p className="py-3 text-sm text-slate-500">Belum ada anak dampingan.</p>}
      </div>
    </article>
  );
}
