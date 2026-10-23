import { useEffect, useState } from "react";
import { Boxes, PackageOpen, Pill, Plus, Search, Shirt, Baby, Utensils, Minus, Check, Trash2 } from "lucide-react";
import { api } from "../services/api";

type Group = "Makanan" | "Obat" | "Pakaian" | "Perlengkapan Bayi";
type StockItem = { id: string; name: string; group: Group; section?: string; detail?: string; quantity: number; unit?: string; gender?: "Pria" | "Wanita"; size?: string; color?: string };
type ClothingVariant = { id: string; name: string; gender: "Pria" | "Wanita"; size: string; color: string; quantity: number };

const initialItems: StockItem[] = [
  { id: "beras", name: "Beras", group: "Makanan", detail: "Kebutuhan pokok", quantity: 0 },
  { id: "susu-neocate", name: "Nutricia Neocate LCP", group: "Makanan", detail: "Susu", quantity: 2, unit: "kaleng" },
  { id: "susu-s26-lbw", name: "S26 LBW GOLD", group: "Makanan", detail: "Susu · tersedia di beberapa apotek dan toko perlengkapan bayi", quantity: 2, unit: "kaleng" },
  { id: "susu-uht-plain", name: "Susu UHT plain", group: "Makanan", detail: "Susu", quantity: 12, unit: "kotak" },
  { id: "susu-sgm-eksplor", name: "SGM Eksplor 1+", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-sgm-ananda", name: "SGM Ananda 6–12", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-sgm-gain", name: "SGM Gain 0–12 bulan dan Gain 1+", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-isoprosoy", name: "SGM Isoprosoy 1+", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-chilkid-gold", name: "Morinaga Chil Kid Gold", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-chilkid-soya", name: "Morinaga Chil Kid Soya", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-chilkid-php", name: "Morinaga Chil Kid P-HP", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-lactogrow", name: "Lactogrow 1+", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "susu-lactogen-llm", name: "Lactogen Less Lactose / SGM LLM", group: "Makanan", detail: "Susu", quantity: 0 },
  { id: "kentang", name: "Kentang", group: "Makanan", quantity: 0 },
  { id: "telur", name: "Telur ayam (negeri, omega)", group: "Makanan", quantity: 0 },
  { id: "ayam", name: "Daging ayam", group: "Makanan", quantity: 0 },
  { id: "hati-ayam", name: "Hati ayam", group: "Makanan", quantity: 0 },
  { id: "sapi", name: "Daging sapi", group: "Makanan", quantity: 0 },
  { id: "ikan", name: "Ikan segar", group: "Makanan", quantity: 0 },
  { id: "sayur", name: "Sayuran segar", group: "Makanan", detail: "Wortel, kol, sawi hijau, bayam", quantity: 0 },
  { id: "buah", name: "Buah-buahan segar", group: "Makanan", detail: "Pisang, buah naga, pear, apel, jeruk, pepaya, alpukat", quantity: 0 },
  { id: "air", name: "Air minum kemasan (galon)", group: "Makanan", quantity: 0 },
  { id: "tepung", name: "Tepung serbaguna", group: "Makanan", quantity: 0 },
  { id: "minyak", name: "Minyak goreng", group: "Makanan", quantity: 0 },
  { id: "singkong", name: "Singkong", group: "Makanan", quantity: 0 },
  { id: "ubi", name: "Ubi", group: "Makanan", quantity: 0 },
  { id: "obat-curcuma", name: "Curcuma Plus Grow Emulsion / Curvit Appetite", group: "Obat", quantity: 0 },
  { id: "obat-lanos", name: "Lanos", group: "Obat", quantity: 0 },
  { id: "obat-interlac-biogaia", name: "Interlac Biogaia", group: "Obat", quantity: 0 },
  { id: "obat-demam", name: "Bye Bye Fever / Cool Fever", group: "Obat", quantity: 0 },
  { id: "obat-dettol", name: "Dettol cairan antiseptik", group: "Obat", quantity: 0 },
  { id: "obat-mucos", name: "Mucos Drop", group: "Obat", quantity: 0 },
  { id: "obat-zinc", name: "Zinc Sulfate Drop", group: "Obat", quantity: 0 },
  { id: "obat-rhinos", name: "Rhinos Neo Drop", group: "Obat", quantity: 0 },
  { id: "obat-hufagrip", name: "Hufagrip", group: "Obat", quantity: 0 },
  { id: "obat-thrombophob", name: "Thrombophob", group: "Obat", quantity: 0 },
  { id: "obat-bioplacenton", name: "Bioplacenton", group: "Obat", quantity: 0 },
  { id: "obat-alkohol", name: "Alkohol", group: "Obat", quantity: 0 },
  { id: "obat-gentamicin", name: "Gentamicin", group: "Obat", quantity: 0 },
  { id: "obat-bigroot", name: "Bigroot Nose Hygiene", group: "Obat", quantity: 0 },
  { id: "obat-sterimar", name: "Sterimar Nose Hygiene", group: "Obat", quantity: 0 },
  { id: "obat-pipet", name: "Pipet obat", group: "Obat", quantity: 0 },
  { id: "obat-interlac", name: "Interlac", group: "Obat", quantity: 0 },
  { id: "obat-prove", name: "Prove D", group: "Obat", quantity: 0 },
  { id: "popok-mamypoko", name: "Mamypoko Xtra Kering", group: "Perlengkapan Bayi", detail: "Ukuran NBS, S", quantity: 0 },
  { id: "popok-pampers", name: "Pampers", group: "Perlengkapan Bayi", detail: "Ukuran M, L, XL, XXL", quantity: 0 },
  { id: "mandi-wash", name: "Hair and body wash", group: "Perlengkapan Bayi", detail: "Lactacyd, Moell, Mybaby, Zwitsal", quantity: 0 },
  { id: "mandi-shampoo", name: "Shampoo", group: "Perlengkapan Bayi", detail: "Zwitsal, Cussons, Mybaby, Moell", quantity: 0 },
  { id: "mandi-cologne", name: "Cologne", group: "Perlengkapan Bayi", detail: "Mybaby, Zwitsal, Cussons, Mitu, Johnsons", quantity: 0 },
  { id: "mandi-cologne-spray", name: "Cologne spray", group: "Perlengkapan Bayi", detail: "My Baby, Mitu, BnB, Cussons, Zwitsal, dll.", quantity: 2, unit: "botol" },
  { id: "mandi-telon", name: "Minyak telon", group: "Perlengkapan Bayi", detail: "My Baby", quantity: 0 },
  { id: "minyak-kemiri", name: "Minyak kemiri", group: "Perlengkapan Bayi", quantity: 2, unit: "botol" },
  { id: "nipple-s-gepeng", name: "Nipple ukuran S gepeng", group: "Perlengkapan Bayi", detail: "Huki, Dodo, Lusty Bunny, Pigeon, Reliable, dll.", quantity: 4, unit: "buah" },
  { id: "oral-cleaner", name: "Oral cleaner", group: "Perlengkapan Bayi", detail: "Sakumini, Momabae, Mamiko, Sugarbaby, dll.", quantity: 3, unit: "pak" },
  { id: "skin-face", name: "Face cream", group: "Perlengkapan Bayi", detail: "Moell, Cussons", quantity: 0 },
  { id: "skin-bedak", name: "Bedak padat", group: "Perlengkapan Bayi", detail: "Pigeon, Bambi", quantity: 0 },
  { id: "skin-lotion", name: "Body lotion", group: "Perlengkapan Bayi", detail: "Moell, Pigeon, Johnsons", quantity: 0 },
  { id: "skin-sunscreen", name: "Sunscreen", group: "Perlengkapan Bayi", detail: "Moell", quantity: 0 },
  { id: "skin-hair", name: "Hair lotion", group: "Perlengkapan Bayi", detail: "Moell, Cussons, Zwitsal, Pigeon, Tropee", quantity: 0 },
  { id: "skin-balm", name: "Multipurpose balm", group: "Perlengkapan Bayi", detail: "Moell", quantity: 0 },
  { id: "cuci-detergent", name: "Detergent cair", group: "Perlengkapan Bayi", detail: "Sleek, My Baby, So Klin, Rinso, Gentle Gen, dll.", quantity: 0 },
  { id: "cuci-pewangi", name: "Pewangi", group: "Perlengkapan Bayi", detail: "Sleek, Cussons, My Baby, Molto, Downy, So Klin, Royal", quantity: 0 },
  { id: "lain-tisu-basah", name: "Tisu basah", group: "Perlengkapan Bayi", quantity: 0 },
  { id: "lain-tisu-kering", name: "Tisu kering", group: "Perlengkapan Bayi", quantity: 0 },
  { id: "lain-snack", name: "Snack bayi", group: "Perlengkapan Bayi", quantity: 0 },
  { id: "lain-promina", name: "Promina Supmi / mi batita / pasta", group: "Perlengkapan Bayi", quantity: 0 },
  { id: "lain-muslim", name: "Baju muslim seragam usia 3 tahun", group: "Perlengkapan Bayi", quantity: 0 },
  { id: "lain-hijab", name: "Hijab bayi", group: "Perlengkapan Bayi", quantity: 0 },
];

const filters: Array<Group | "Semua"> = ["Semua", "Makanan", "Obat", "Pakaian", "Perlengkapan Bayi"];
const sectionById: Record<string, string> = {
  "susu-neocate": "SUSU", "susu-sgm-eksplor": "SUSU", "susu-sgm-ananda": "SUSU", "susu-sgm-gain": "SUSU",
  "susu-isoprosoy": "SUSU", "susu-chilkid-gold": "SUSU", "susu-chilkid-soya": "SUSU", "susu-chilkid-php": "SUSU",
  "susu-lactogrow": "SUSU", "susu-lactogen-llm": "SUSU", "popok-mamypoko": "PAMPERS", "popok-pampers": "PAMPERS",
  "mandi-wash": "PERLENGKAPAN MANDI", "mandi-shampoo": "PERLENGKAPAN MANDI", "mandi-cologne": "PERLENGKAPAN MANDI", "mandi-telon": "PERLENGKAPAN MANDI",
  "skin-face": "SKINCARE & HAIRCARE", "skin-bedak": "SKINCARE & HAIRCARE", "skin-lotion": "SKINCARE & HAIRCARE", "skin-sunscreen": "SKINCARE & HAIRCARE", "skin-hair": "SKINCARE & HAIRCARE", "skin-balm": "SKINCARE & HAIRCARE",
  "cuci-detergent": "SABUN CUCI BAYI", "cuci-pewangi": "SABUN CUCI BAYI",
  "obat-curcuma": "OBAT-OBATAN", "obat-lanos": "OBAT-OBATAN", "obat-interlac-biogaia": "OBAT-OBATAN", "obat-demam": "OBAT-OBATAN", "obat-dettol": "OBAT-OBATAN", "obat-mucos": "OBAT-OBATAN", "obat-zinc": "OBAT-OBATAN", "obat-rhinos": "OBAT-OBATAN", "obat-hufagrip": "OBAT-OBATAN", "obat-thrombophob": "OBAT-OBATAN", "obat-bioplacenton": "OBAT-OBATAN", "obat-alkohol": "OBAT-OBATAN", "obat-gentamicin": "OBAT-OBATAN", "obat-bigroot": "OBAT-OBATAN", "obat-sterimar": "OBAT-OBATAN", "obat-pipet": "OBAT-OBATAN", "obat-interlac": "OBAT-OBATAN", "obat-prove": "OBAT-OBATAN",
  beras: "BERAS", kentang: "KEBUTUHAN DAPUR", telur: "KEBUTUHAN DAPUR", ayam: "KEBUTUHAN DAPUR", "hati-ayam": "KEBUTUHAN DAPUR", sapi: "KEBUTUHAN DAPUR", ikan: "KEBUTUHAN DAPUR", sayur: "KEBUTUHAN DAPUR", buah: "KEBUTUHAN DAPUR", air: "KEBUTUHAN DAPUR", tepung: "KEBUTUHAN DAPUR", minyak: "KEBUTUHAN DAPUR", singkong: "KEBUTUHAN DAPUR", ubi: "KEBUTUHAN DAPUR",
  "lain-tisu-basah": "LAIN-LAIN", "lain-tisu-kering": "LAIN-LAIN", "lain-snack": "LAIN-LAIN", "lain-promina": "LAIN-LAIN", "lain-muslim": "LAIN-LAIN", "lain-hijab": "LAIN-LAIN",
  "susu-s26-lbw": "KEBUTUHAN MENDESAK", "susu-uht-plain": "KEBUTUHAN MENDESAK", "mandi-cologne-spray": "KEBUTUHAN MENDESAK", "minyak-kemiri": "KEBUTUHAN MENDESAK", "nipple-s-gepeng": "KEBUTUHAN MENDESAK", "oral-cleaner": "KEBUTUHAN MENDESAK",
};
const initialClothing: StockItem[] = [
  { id: "pakaian-pria-awal", name: "Pakaian pria", group: "Pakaian", section: "PAKAIAN", quantity: 0, gender: "Pria", size: "Belum diisi", color: "Belum diisi" },
  { id: "pakaian-wanita-awal", name: "Pakaian wanita", group: "Pakaian", section: "PAKAIAN", quantity: 0, gender: "Wanita", size: "Belum diisi", color: "Belum diisi" },
];
const needCatalog = [...initialItems.map((item) => ({ ...item, section: sectionById[item.id] })), ...initialClothing];
const cardSections: Array<{ title: string; group: Group; groups?: Group[]; icon: typeof Utensils; urgent?: boolean }> = [
  { title: "BERAS", group: "Makanan", icon: Utensils },
  { title: "SUSU", group: "Makanan", icon: Utensils },
  { title: "PAMPERS", group: "Perlengkapan Bayi", icon: Baby },
  { title: "PERLENGKAPAN MANDI", group: "Perlengkapan Bayi", icon: Baby },
  { title: "SKINCARE & HAIRCARE", group: "Perlengkapan Bayi", icon: Baby },
  { title: "SABUN CUCI BAYI", group: "Perlengkapan Bayi", icon: Baby },
  { title: "OBAT-OBATAN", group: "Obat", icon: Pill },
  { title: "KEBUTUHAN DAPUR", group: "Makanan", icon: Utensils },
  { title: "LAIN-LAIN", group: "Perlengkapan Bayi", icon: Baby },
  { title: "KEBUTUHAN MENDESAK", group: "Makanan", groups: ["Makanan", "Obat", "Perlengkapan Bayi"], icon: PackageOpen, urgent: true },
  { title: "PAKAIAN", group: "Pakaian", icon: Shirt },
];

function readSaved<T,>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch { return fallback; }
}

export default function Needs() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [variants, setVariants] = useState<ClothingVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<Group | "Semua">("Semua");
  const [search, setSearch] = useState("");
  const [showClothingForm, setShowClothingForm] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 1000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const refreshNeeds = async () => {
    const rows = await api.get<StockItem[]>("/needs");
    setItems(rows.filter((item) => item.group !== "Pakaian"));
    setVariants(rows.filter((item) => item.group === "Pakaian").map((item) => ({
      id: item.id, name: item.name, gender: (item.gender ?? "Pria") as ClothingVariant["gender"], size: item.size ?? "",
      color: item.color ?? "", quantity: item.quantity,
    })));
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        await api.post("/needs/initialize", needCatalog);
        const rows = await api.get<StockItem[]>("/needs");
        const migrationKey = "web-child-needs-db-migrated-v1";
        if (!localStorage.getItem(migrationKey)) {
          const oldItems = readSaved<StockItem[]>("web-child-needs-items", []);
          const oldClothes = readSaved<ClothingVariant[]>("web-child-needs-clothes", []);
          const serverById = new Map(rows.map((item) => [item.id, item]));
          for (const item of oldItems) {
            const serverItem = serverById.get(item.id);
            if (serverItem && item.quantity > 0 && item.quantity !== serverItem.quantity) {
              await api.patch(`/needs/${encodeURIComponent(item.id)}`, { quantity: item.quantity });
            }
          }
          for (const variant of oldClothes) {
            await api.post("/needs", { id: variant.id, name: variant.name ?? `Pakaian ${variant.gender} ${variant.size} ${variant.color}`, group: "Pakaian", section: "PAKAIAN", quantity: variant.quantity,
              gender: variant.gender, size: variant.size, color: variant.color });
          }
          localStorage.setItem(migrationKey, "1");
        }
        const currentRows = await api.get<StockItem[]>("/needs");
        if (active) {
          setItems(currentRows.filter((item) => item.group !== "Pakaian"));
          setVariants(currentRows.filter((item) => item.group === "Pakaian").map((item) => ({
            id: item.id, name: item.name, gender: (item.gender ?? "Pria") as ClothingVariant["gender"], size: item.size ?? "",
            color: item.color ?? "", quantity: item.quantity,
          })));
        }
      } catch (error) {
        if (active) setLoadError(error instanceof Error ? error.message : "Tidak dapat memuat data kebutuhan dari database.");
      } finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  function changeQuantity(id: string, quantity: number) {
    const nextQuantity = Math.max(0, quantity);
    setItems((current) => current.map((item) => item.id === id ? { ...item, quantity: nextQuantity } : item));
  }
  async function saveQuantity(id: string, quantity: number) {
    try {
      await api.patch(`/needs/${encodeURIComponent(id)}`, { quantity: Math.max(0, quantity) });
      setNotice("Stok ditambah");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal menyimpan stok.");
      await refreshNeeds();
    }
  }
  function changeVariant(id: string, patch: Partial<ClothingVariant>) {
    setVariants((current) => current.map((variant) => variant.id === id ? { ...variant, ...patch } : variant));
    if (patch.quantity !== undefined) return;
    void api.patch(`/needs/${encodeURIComponent(id)}`, patch).catch((error: unknown) => {
      setLoadError(error instanceof Error ? error.message : "Gagal menyimpan stok pakaian.");
      void refreshNeeds();
    });
  }
  async function saveVariantQuantity(id: string, quantity: number) {
    try {
      await api.patch(`/needs/${encodeURIComponent(id)}`, { quantity: Math.max(0, quantity) });
      setNotice("Stok ditambah");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Gagal menyimpan stok pakaian.");
      await refreshNeeds();
    }
  }

  return <div className="min-h-screen bg-slate-50">
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="flex min-h-20 items-center gap-3 px-6 lg:px-8">
        <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><PackageOpen className="h-5 w-5" /></div>
        <div><h1 className="text-xl font-bold text-slate-900">Kebutuhan Anak</h1><p className="mt-1 text-sm text-slate-500">Kelola stok makanan, obat, pakaian, dan perlengkapan bayi.</p></div>
      </div>
    </header>
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {loadError && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Database: {loadError}</div>}
      {notice && <div role="status" className="fixed right-5 top-5 z-50 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-lg">{notice}</div>}
      {loading && <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Memuat data kebutuhan dari database...</div>}
      <section className="grid gap-3 sm:grid-cols-2">
        <Summary icon={Boxes} label="Jenis kebutuhan" value={items.length + variants.length} />
        <Summary icon={Shirt} label="Stok pakaian" value={variants.reduce((sum, item) => sum + item.quantity, 0)} />
      </section>
      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama atau detail kebutuhan..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100" /></div>
          <div className="flex flex-wrap gap-2">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${filter === item ? "border-violet-700 bg-violet-700 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50"}`}>{item}</button>)}</div>
        </div>
      </section>

      <section className="mt-5 grid items-start gap-4 xl:grid-cols-2">
        {cardSections.map((card) => {
          if (card.title === "PAKAIAN") {
            if (filter !== "Semua" && filter !== "Pakaian") return null;
            const matching = variants.filter((variant) => `${variant.name} ${variant.gender} ${variant.size} ${variant.color}`.toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID")));
            return <ClothingSection key={card.title} variants={matching} existingNames={[...items.map((item) => item.name), ...variants.map((variant) => variant.name)]} showForm={showClothingForm} onToggleForm={() => setShowClothingForm(!showClothingForm)}
              onAdd={(variant) => {
                const id = crypto.randomUUID();
                void api.post<StockItem>("/needs", { id, group: "Pakaian", section: "PAKAIAN", ...variant })
                  .then(() => refreshNeeds()).then(() => setShowClothingForm(false))
                  .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Gagal menyimpan pakaian."));
              }}
              onChange={(id, patch) => changeVariant(id, patch)}
              onSaveQuantity={saveVariantQuantity}
              onDelete={(id) => { void api.delete(`/needs/${encodeURIComponent(id)}`).then(() => setVariants((current) => current.filter((entry) => entry.id !== id))).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Gagal menghapus pakaian.")); }} />;
          }
          if (filter !== "Semua" && !(card.groups ?? [card.group]).includes(filter)) return null;
          const matching = items.filter((item) => (item.section === card.title || (card.urgent && item.id === "susu-neocate"))
            && (filter === "Semua" || item.group === filter)
            && `${item.name} ${item.detail ?? ""}`.toLocaleLowerCase("id-ID").includes(search.trim().toLocaleLowerCase("id-ID")));
          return <StockSection key={card.title} title={card.title} icon={card.icon} defaultGroup={card.group} items={matching} urgent={card.urgent} onChange={changeQuantity} onSaveQuantity={saveQuantity} existingNames={[...items.map((item) => item.name), ...variants.map((variant) => variant.name)]}
            onAdd={(entry) => {
              const id = crypto.randomUUID();
              void api.post("/needs", { id, name: entry.name, group: entry.group, section: card.title, detail: entry.detail, quantity: entry.quantity, unit: entry.unit })
                .then(() => refreshNeeds()).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Gagal menambahkan kebutuhan."));
            }}
            onDelete={(id) => { void api.delete(`/needs/${encodeURIComponent(id)}`).then(() => setItems((current) => current.filter((item) => item.id !== id))).catch((error: unknown) => setLoadError(error instanceof Error ? error.message : "Gagal menghapus kebutuhan.")); }} />;
        })}
      </section>
    </main>
  </div>;
}

function StockSection({ title, icon: Icon, items, urgent, defaultGroup, existingNames, onChange, onSaveQuantity, onAdd, onDelete }: { title: string; icon: typeof Utensils; items: StockItem[]; urgent?: boolean; defaultGroup: Group; existingNames: string[]; onChange: (id: string, quantity: number) => void; onSaveQuantity: (id: string, quantity: number) => Promise<void>; onAdd: (item: NewStockItem) => Promise<void>; onDelete: (id: string) => void }) {
  const [showForm, setShowForm] = useState(false);
  return <section className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md ${urgent ? "border-rose-200" : "border-slate-200"}`}>
    <header className={`flex items-center justify-between gap-3 border-b px-4 py-4 sm:px-5 ${urgent ? "border-rose-100 bg-rose-50/60" : "border-slate-100 bg-white"}`}>
      <div className="flex min-w-0 items-center gap-3"><div className={`rounded-xl p-2.5 ${urgent ? "bg-rose-100 text-rose-700" : "bg-violet-50 text-violet-700"}`}><Icon className="h-5 w-5" /></div><div className="min-w-0"><h2 className="font-semibold text-slate-900">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{items.length} jenis kebutuhan</p></div></div>
      <button onClick={() => setShowForm(!showForm)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-violet-700 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-800"><Plus className="h-4 w-4" />Tambah</button>
    </header>
    {showForm && <StockItemForm defaultGroup={defaultGroup} existingNames={existingNames} onAdd={(entry) => { void onAdd(entry).then(() => setShowForm(false)); }} onCancel={() => setShowForm(false)} />}
    {items.length === 0 ? <div className="px-5 py-8 text-center text-sm text-slate-500">Belum ada kebutuhan di bagian ini.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[500px] text-left text-sm">
      <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Nama kebutuhan</th><th className="px-3 py-3 text-center">Stok</th><th className="px-5 py-3 text-right">Ubah jumlah</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.id} className="transition-colors hover:bg-slate-50/80">
        <td className="max-w-[230px] px-5 py-3"><p className="font-medium text-slate-800">{item.name}</p>{item.detail && <p className="mt-1 text-[11px] leading-4 text-slate-500">{item.detail}</p>}</td>
        <td className="whitespace-nowrap px-3 py-3 text-center font-semibold text-slate-900">{item.quantity} <span className="font-normal text-slate-500">{item.unit}</span></td>
        <td className="px-5 py-3"><div className="flex justify-end gap-1.5"><button aria-label={`Kurangi stok ${item.name}`} onClick={() => onChange(item.id, item.quantity - 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-white"><Minus className="h-3.5 w-3.5" /></button><input aria-label={`Jumlah stok ${item.name}`} type="number" min="0" value={item.quantity} onChange={(event) => onChange(item.id, Number(event.target.value))} className="w-16 rounded-lg border border-slate-200 px-1.5 py-1.5 text-center text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100" /><button aria-label={`Tambah stok ${item.name}`} onClick={() => onChange(item.id, item.quantity + 1)} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 transition hover:border-slate-300 hover:bg-white"><Plus className="h-3.5 w-3.5" /></button><button aria-label={`Simpan stok ${item.name}`} title="Simpan stok" onClick={() => void onSaveQuantity(item.id, item.quantity)} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-100"><Check className="h-4 w-4" /></button><button aria-label={`Hapus ${item.name}`} title={`Hapus ${item.name}`} onClick={() => onDelete(item.id)} className="ml-1 rounded-lg p-1.5 text-red-600 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}

type NewStockItem = { name: string; detail: string; group: Group; quantity: number; unit: string };

function NeedNameInput({ value, onChange, existingNames }: { value: string; onChange: (value: string) => void; existingNames: string[] }) {
  const query = value.trim().toLocaleLowerCase("id-ID");
  const matches = query ? [...new Set(existingNames)].filter((name) => name.toLocaleLowerCase("id-ID").includes(query)).slice(0, 5) : [];
  const duplicate = existingNames.some((name) => name.trim().toLocaleLowerCase("id-ID") === query && query !== "");
  return <div className="relative mt-1.5">
    <input required autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Ketik nama barang" className={`h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none ${duplicate ? "border-amber-400 focus:border-amber-500" : "border-slate-200 focus:border-violet-400"}`} />
    {matches.length > 0 && <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
      {matches.map((name) => <button type="button" key={name} onClick={() => onChange(name)} className="block w-full border-b border-slate-100 px-3 py-2 text-left text-xs text-slate-700 last:border-0 hover:bg-slate-50"><span className="font-medium">{name}</span><span className="ml-2 text-slate-400">Sudah ada</span></button>)}
    </div>}
    {duplicate && <p role="status" className="mt-1.5 text-xs font-medium text-amber-700">Kebutuhan sudah ada. Pilih barang lain atau gunakan barang yang terdaftar.</p>}
  </div>;
}

function StockItemForm({ defaultGroup, existingNames, onAdd, onCancel }: { defaultGroup: Group; existingNames: string[]; onAdd: (item: NewStockItem) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [group, setGroup] = useState<Group>(defaultGroup === "Pakaian" ? "Perlengkapan Bayi" : defaultGroup);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState("");
  const duplicate = existingNames.some((existing) => existing.trim().toLocaleLowerCase("id-ID") === name.trim().toLocaleLowerCase("id-ID"));
  function submit(event: React.FormEvent) { event.preventDefault(); if (name.trim() && !duplicate) onAdd({ name: name.trim(), detail: detail.trim(), group, quantity, unit: unit.trim() }); }
  return <form onSubmit={submit} className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
    <label className="text-xs font-medium text-slate-600">Nama kebutuhan<NeedNameInput value={name} onChange={setName} existingNames={existingNames} /><span className="sr-only">Saran akan muncul saat nama yang sudah terdaftar diketik.</span></label>
    <label className="text-xs font-medium text-slate-600">Catatan / merek<input value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Opsional" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
    <label className="text-xs font-medium text-slate-600">Jenis kebutuhan<select value={group} onChange={(event) => setGroup(event.target.value as Group)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option value="Makanan">Makanan</option><option value="Obat">Obat</option><option value="Perlengkapan Bayi">Perlengkapan Bayi</option></select></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-600">Jumlah stok<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value)))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label><label className="text-xs font-medium text-slate-600">Satuan<input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="pcs, kotak, kg" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label></div>
    <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">Batal</button><button type="submit" disabled={!name.trim() || duplicate} className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">Simpan kebutuhan</button></div>
  </form>;
}
function ClothingSection({ variants, existingNames, showForm, onToggleForm, onAdd, onChange, onSaveQuantity, onDelete }: { variants: ClothingVariant[]; existingNames: string[]; showForm: boolean; onToggleForm: () => void; onAdd: (variant: Omit<ClothingVariant, "id">) => void; onChange: (id: string, patch: Partial<ClothingVariant>) => void; onSaveQuantity: (id: string, quantity: number) => Promise<void>; onDelete: (id: string) => void }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><Shirt className="h-5 w-5" /></div><div><h2 className="font-semibold text-slate-900">PAKAIAN</h2><p className="text-xs text-slate-500">Pria dan wanita, jumlah, ukuran, dan warna</p></div></div><button onClick={onToggleForm} className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-3 py-2 text-sm font-medium text-white hover:bg-violet-800"><Plus className="h-4 w-4" />Tambah pakaian</button></header>
    {showForm && <ClothingForm existingNames={existingNames} onAdd={onAdd} onCancel={onToggleForm} />}
    {variants.length === 0 ? <div className="px-5 py-8 text-center text-sm text-slate-500">Belum ada data pakaian. Tambahkan data pria atau wanita untuk mulai mencatat stok.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Nama pakaian</th><th className="px-3 py-3">Jenis kelamin</th><th className="px-3 py-3">Ukuran</th><th className="px-3 py-3">Warna</th><th className="px-3 py-3 text-center">Stok</th><th className="px-4 py-3 text-right">Atur</th></tr></thead><tbody className="divide-y divide-slate-100">{variants.map((variant) => <tr key={variant.id}><td className="px-4 py-3 font-medium text-slate-800">{variant.name}</td><td className="px-3 py-3 text-slate-600">{variant.gender}</td><td className="px-3 py-3"><input aria-label="Ukuran pakaian" value={variant.size} onChange={(event) => onChange(variant.id, { size: event.target.value })} className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></td><td className="px-3 py-3"><input aria-label="Warna pakaian" value={variant.color} onChange={(event) => onChange(variant.id, { color: event.target.value })} className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm" /></td><td className="px-3 py-3 text-center font-semibold text-slate-900">{variant.quantity}</td><td className="px-4 py-3"><div className="flex justify-end gap-1"><button aria-label="Kurangi stok pakaian" onClick={() => onChange(variant.id, { quantity: Math.max(0, variant.quantity - 1) })} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"><Minus className="h-3.5 w-3.5" /></button><input aria-label="Jumlah pakaian" type="number" min="0" value={variant.quantity} onChange={(event) => onChange(variant.id, { quantity: Math.max(0, Number(event.target.value)) })} className="w-14 rounded-lg border border-slate-200 px-1 py-1.5 text-center" /><button aria-label="Tambah stok pakaian" onClick={() => onChange(variant.id, { quantity: variant.quantity + 1 })} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" /></button><button aria-label="Simpan stok pakaian" title="Simpan stok" onClick={() => void onSaveQuantity(variant.id, variant.quantity)} className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-100"><Check className="h-4 w-4" /></button><button aria-label="Hapus data pakaian" title="Hapus pakaian" onClick={() => onDelete(variant.id)} className="ml-1 rounded-lg p-1.5 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>}
  </section>;
}

function Summary({ icon: Icon, label, value }: { icon: typeof Boxes; label: string; value: number }) {
  return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value}</p></div><div className="rounded-xl bg-violet-50 p-3 text-violet-700"><Icon className="h-5 w-5" /></div></div>;
}

function ClothingForm({ existingNames, onAdd, onCancel }: { existingNames: string[]; onAdd: (variant: Omit<ClothingVariant, "id">) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<ClothingVariant["gender"]>("Pria");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(0);
  const duplicate = existingNames.some((existing) => existing.trim().toLocaleLowerCase("id-ID") === name.trim().toLocaleLowerCase("id-ID"));
  function submit(event: React.FormEvent) { event.preventDefault(); if (name.trim() && size.trim() && color.trim() && !duplicate) onAdd({ name: name.trim(), gender, size: size.trim(), color: color.trim(), quantity }); }
  return <form onSubmit={submit} className="grid gap-3 border-b border-slate-100 bg-slate-50 p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
    <label className="text-xs font-medium text-slate-600">Nama kebutuhan<NeedNameInput value={name} onChange={setName} existingNames={existingNames} /></label>
    <label className="text-xs font-medium text-slate-600">Jenis kelamin<select value={gender} onChange={(event) => setGender(event.target.value as ClothingVariant["gender"])} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm"><option>Pria</option><option>Wanita</option></select></label>
    <label className="text-xs font-medium text-slate-600">Ukuran<input required value={size} onChange={(event) => setSize(event.target.value)} placeholder="Contoh: 3 tahun, M, XL" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
    <label className="text-xs font-medium text-slate-600">Warna<input required value={color} onChange={(event) => setColor(event.target.value)} placeholder="Contoh: biru, merah" className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
    <label className="text-xs font-medium text-slate-600">Jumlah<input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value)))} className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm" /></label>
    <div className="flex gap-2"><button type="submit" disabled={!name.trim() || !size.trim() || !color.trim() || duplicate} className="h-10 flex-1 rounded-xl bg-violet-700 px-3 text-sm font-medium text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50">Simpan</button><button type="button" onClick={onCancel} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600">Batal</button></div>
  </form>;
}
