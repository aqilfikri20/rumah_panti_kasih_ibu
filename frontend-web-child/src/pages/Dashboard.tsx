import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  HeartPulse,
  Info,
  MessageCircle,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppData } from "../services/AppDataContext";
import { api } from "../services/api";

interface DashboardNeed {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
}

type AttentionLevel = "important" | "reminder";

interface AttentionItem {
  id: string;
  childId: number;
  level: AttentionLevel;
  childName: string;
  title: string;
  description: string;
  date: string;
  domain: "Kesehatan" | "Pertumbuhan";
}

function ConditionSummary({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "emerald" | "amber" | "rose";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
  }[color];
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`rounded-xl p-2 ring-1 ring-inset ${styles}`}><Icon className="h-4 w-4" /></span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-xl font-bold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

function AttentionBadge({
  level,
}: {
  level: AttentionLevel;
}) {
  if (level === "important") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
        <CircleAlert className="h-3.5 w-3.5" />
        Penting
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-600">
      <AlertCircle className="h-3.5 w-3.5" />
      Perlu Perhatian
    </span>
  );
}

function NoteStatus({
  type,
}: {
  type: "normal" | "reminder" | "important";
}) {
  if (type === "important") {
    return (
      <span className="block h-2 w-2 rounded-full bg-red-500" />
    );
  }

  if (type === "reminder") {
    return (
      <span className="block h-2 w-2 rounded-full bg-amber-400" />
    );
  }

  return (
    <span className="block h-2 w-2 rounded-full bg-emerald-500" />
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { children, caregivers, dailyNotes, growthData, growthAssessmentData, healthData, reminders } = useAppData();
  const [needs, setNeeds] = useState<DashboardNeed[]>([]);

  useEffect(() => {
    let active = true;
    api.get<DashboardNeed[]>("/needs")
      .then((rows) => { if (active) setNeeds(rows); })
      .catch(() => { if (active) setNeeds([]); });
    return () => { active = false; };
  }, []);

  /*
   * =========================
   * SUMMARY
   * =========================
   */

  const totalChildren = children.length;
  const outOfStockNeeds = needs.filter((item) => item.quantity <= 0);

  const hasSevereGrowthConcern = (child: (typeof children)[number]) => {
    const indicators = growthAssessmentData[child.id]?.indicators ?? [];
    return indicators.some((item) => item.status === "Perlu Perhatian" && item.value <= -3);
  };
  const isImportantChild = (child: (typeof children)[number]) =>
    child.health === "Penting" || hasSevereGrowthConcern(child);
  const isAttentionChild = (child: (typeof children)[number]) =>
    !isImportantChild(child) && (child.health === "Perlu Perhatian" || growthAssessmentData[child.id]?.status === "Perlu Perhatian");

  const normalChildren = children.filter(
    (child) => child.health === "Normal" && !isImportantChild(child) && !isAttentionChild(child),
  ).length;

  const attentionChildren = children.filter(isAttentionChild).length;

  // Pertumbuhan diberi prioritas penting hanya jika indikator terukur berada
  // pada atau di bawah z-score -3; status kesehatan mengikuti catatan terbaru.
  const importantChildren = children.filter(isImportantChild).length;

  /*
   * =========================
   * ATTENTION
   * =========================
   */

  const attentionItems: AttentionItem[] = [];

  children.forEach((child) => {
    const health = healthData[child.id];
    const growthAssessment =
      growthAssessmentData[child.id];

    if (health?.status === "Penting") {
      attentionItems.push({
        id: `health-${child.id}`, childId: child.id, level: "important", domain: "Kesehatan",
        childName: child.name, title: health.lastCheckup?.title ?? "Catatan kesehatan",
        description: health.lastCheckup?.summary ?? "Ringkasan catatan tidak tersedia.",
        date: health.lastCheckup?.recordedAt ?? "",
      });
    } else if (health?.status === "Perlu Perhatian") {
      attentionItems.push({
        id: `health-${child.id}`,
        childId: child.id,
        level: "reminder",
        domain: "Kesehatan",
        childName: child.name,
        title: health.lastCheckup?.title ?? "Catatan kesehatan",
        description:
          health.lastCheckup?.summary ??
          "Ringkasan catatan tidak tersedia.",
        date:
          health.lastCheckup?.recordedAt ??
          "",
      });
    }

    if (
      growthAssessment?.status === "Perlu Perhatian"
    ) {
      attentionItems.push({
        id: `growth-${child.id}`,
        childId: child.id,
        level: growthAssessment.indicators.some((item) => item.status === "Perlu Perhatian" && item.value <= -3) ? "important" : "reminder",
        domain: "Pertumbuhan",
        childName: child.name,
        title: growthAssessment.indicators.filter((item) => item.status === "Perlu Perhatian").map((item) => item.type).join(", ") || "Hasil pengukuran",
        description:
          growthAssessment.summary,
        date: growthAssessment.assessedAt,
      });
    }
  });

  attentionItems.sort((a, b) => {
    const priority = (item: AttentionItem) => item.level === "important" ? 0 : 1;
    return priority(a) - priority(b) || new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  /*
   * =========================
   * REMINDERS
   * =========================
   *
   * Reminder dibuat dari data aktual.
   * Tidak ada jadwal palsu.
   */

const activeReminders = reminders
  .filter((reminder) => !reminder.completed)
  .sort((a, b) => {
    const dateA = new Date(
      `${a.dueDate}T${a.dueTime ?? "23:59"}`,
    ).getTime();

    const dateB = new Date(
      `${b.dueDate}T${b.dueTime ?? "23:59"}`,
    ).getTime();

    return dateA - dateB;
  });

const latestReminders =
  activeReminders.slice(0, 4);

  /*
   * =========================
   * RECENT NOTES
   * =========================
   */

  const recentNotes = [...dailyNotes]
    .sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime(),
    )
    .slice(0, 5)
    .map((note) => {
      const child = children.find(
        (item) => item.id === note.childId,
      );

      return {
        ...note,
        childName:
          child?.name ?? "Anak",
        type:
          note.category === "Kesehatan"
            ? "important"
            : note.category === "Makan"
              ? "reminder"
              : "normal",
      } as const;
    });

  /*
   * =========================
   * GROWTH
   * =========================
   */

  const growthAssessments = children.map(
    (child) => {
      const assessment =
        growthAssessmentData[child.id];

      const growth =
        growthData[child.id];

      const latestRecord =
        growth?.history?.[0];

      return {
        child,
        assessment,
        latestRecord,
      };
    },
  );

  const growthNormalCount =
    growthAssessments.filter(
      (item) =>
        item.assessment?.status === "Normal",
    ).length;

  const growthAttentionCount =
    growthAssessments.filter(
      (item) =>
        item.assessment?.status ===
        "Perlu Perhatian",
    ).length;

  const growthRecordedCount =
    growthAssessments.filter(
      (item) => item.latestRecord,
    ).length;

  const growthPercentage =
    totalChildren === 0
      ? 0
      : Math.round(
          (growthNormalCount /
            totalChildren) *
            100,
        );

  /*
   * =========================
   * HANDLERS
   * =========================
   */

  function handleSearch() {
    navigate("/children");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-100/80 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 shadow-md shadow-violet-200">
              <HeartPulse className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Rumah Kasih Ibu
              </p>

              <p className="hidden text-[11px] text-slate-500 sm:block">
                Tumbuh sehat, penuh kasih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <button
              type="button"
              onClick={handleSearch}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 md:flex"
            >
              <Search className="h-4 w-4" />

              <span>
                Cari anak...
              </span>

              <kbd className="ml-3 rounded border border-slate-200 px-1.5 py-0.5 text-[10px]">
                /
              </kbd>
            </button>

            {/* Notification */}
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById(
                    "attention-section",
                  )
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Lihat perhatian"
              aria-label="Lihat perhatian"
            >
              <Bell className="h-5 w-5" />

              {attentionItems.length > 0 && (
                <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            {/* User */}
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                AD
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Admin
                </p>

                <p className="text-[11px] text-slate-500">
                  Pengurus
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1600px] px-6 py-8 lg:px-8">
        {/* System introduction and child condition summary */}
        <section className="grid gap-5 xl:grid-cols-3">
          <article className="relative flex min-h-[520px] flex-col overflow-hidden rounded-[30px] bg-gradient-to-br from-violet-950 via-violet-800 to-indigo-700 p-7 text-white shadow-xl shadow-violet-200/60 sm:p-10 lg:p-12 xl:col-span-2">
            <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[42px] border-white/5" />
            <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative flex h-full flex-1 flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-violet-100 shadow-sm backdrop-blur">
                <BookOpen className="h-4 w-4" /> Tentang sistem
              </div>
              <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Sistem Manajemen <span className="mt-1 block bg-gradient-to-r from-white via-violet-100 to-emerald-200 bg-clip-text text-transparent">Rumah Kasih Ibu</span>
              </h1>
              <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-violet-100 sm:text-lg">
                Perawatan yang terdata, perhatian yang terasa.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-violet-100/85 sm:text-base">
                Satu ruang kerja untuk membantu pengurus menyusun pencatatan, memantau kebutuhan, dan mengoordinasikan pendampingan sehari-hari. Informasi tersusun agar lebih mudah ditinjau dan ditindaklanjuti bersama.
              </p>

              <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-xs font-medium text-violet-100"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Pencatatan lebih teratur</div>
                <div className="flex items-center gap-2 text-xs font-medium text-violet-100"><HeartPulse className="h-4 w-4 text-rose-200" />Pendampingan lebih terarah</div>
              </div>
              <div className="mt-7 max-w-md">
                <Link to="/needs" className="group flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur transition hover:bg-white/15">
                  <span><span className="block text-xs text-violet-200">Inventaris kebutuhan</span><span className="mt-1 block text-lg font-semibold">{needs.length} jenis tercatat</span></span>
                  <ArrowUpRight className="h-5 w-5 text-violet-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-5">
                <div className="flex items-center gap-2 text-xs text-violet-100"><Boxes className="h-4 w-4" />{outOfStockNeeds.length} kebutuhan dengan stok kosong</div>
                <Link to="/needs" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-violet-800 transition hover:bg-violet-50">Kelola kebutuhan<ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </article>

          <aside className="flex min-h-[460px] flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Ringkasan anak</p><h2 className="mt-1 text-xl font-bold text-slate-900">Kondisi saat ini</h2><p className="mt-1 text-xs leading-5 text-slate-500">Berdasarkan status kesehatan dan pemantauan terakhir.</p></div>
              <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><Users className="h-5 w-5" /></div>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white">
              <p className="text-xs font-medium text-slate-300">Total anak dalam pengasuhan</p><p className="mt-1 text-4xl font-bold tracking-tight">{totalChildren}</p>
            </div>
            <div className="mt-3 grid flex-1 grid-rows-3 gap-3">
              <ConditionSummary icon={CheckCircle2} label="Normal" value={normalChildren} color="emerald" />
              <ConditionSummary icon={AlertCircle} label="Perlu perhatian" value={attentionChildren} color="amber" />
              <ConditionSummary icon={CircleAlert} label="Penting" value={importantChildren} color="rose" />
            </div>
            <Link to="/children" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800">Buka data anak<ArrowRight className="h-4 w-4" /></Link>
          </aside>
        </section>

        {/* Attention */}
        <section
          id="attention-section"
          className="mt-8"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Perlu Perhatian
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {attentionItems.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Hal yang perlu dipantau berdasarkan
                data terakhir.
              </p>
            </div>

            {attentionItems.length > 0 && (
              <Link
                to="/children"
                className="hidden items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 sm:flex"
              >
                Lihat semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/60 shadow-sm">
            {attentionItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-900">
                  Tidak ada perhatian aktif
                </p>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Belum ada data yang menunjukkan
                  hal yang perlu ditindaklanjuti.
                </p>
              </div>
            ) : (
              attentionItems.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className={`p-5 transition hover:bg-white/70 ${
                      index !==
                      attentionItems.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            item.level ===
                            "important"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {item.level ===
                          "important" ? (
                            <CircleAlert className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <AttentionBadge
                              level={
                                item.level
                              }
                            />

                            <span className="text-xs text-slate-400">
                              {formatDate(
                                item.date,
                              )}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">{item.domain}</span>
                          </div>

                          <h3 className="font-semibold text-slate-900">
                            {item.childName}
                          </h3>

                          <p className="mt-0.5 text-sm font-medium text-slate-700">
                            {item.title}
                          </p>

                          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 pl-14 lg:pl-0">
                        <Link
                          to={`/children/${item.childId}`}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-white hover:shadow-sm"
                        >
                          Lihat Anak
                        </Link>

                        <Link
                          to={`/ai?childId=${item.childId}`}
                          title="Tanya AI"
                          aria-label={`Tanya AI tentang ${item.childName}`}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ),
              )
            )}
          </div>

          {attentionItems.length > 0 && (
            <Link
              to="/children"
              className="mt-3 flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-slate-600 sm:hidden"
            >
              Lihat semua perhatian
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>

        {/* Today */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
{/* Reminders */}
<div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 shadow-sm">
  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-slate-600" />

        <h2 className="font-bold text-slate-900">
          Pengingat
        </h2>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        Pengingat yang belum selesai.
      </p>
    </div>

    <Link
      to="/reminders"
      className="hidden items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 sm:flex"
    >
      Lihat semua
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>

  <div className="divide-y divide-slate-100">
    {latestReminders.length === 0 ? (
      <div className="px-5 py-10 text-center">
        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />

        <p className="mt-2 text-sm font-medium text-slate-900">
          Tidak ada pengingat aktif
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Semua pengingat sudah selesai.
        </p>
      </div>
    ) : (
      latestReminders.map((reminder) => {
        const child = reminder.childId
          ? children.find(
              (item) =>
                item.id === reminder.childId,
            )
          : undefined;

        return (
          <Link
            key={reminder.id}
            to="/reminders"
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                reminder.type === "Penting"
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {reminder.type === "Penting" ? (
                <CircleAlert className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-slate-900">
                  {reminder.title}
                </p>

                <span
                  className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${
                    reminder.type === "Penting"
                      ? "bg-red-50 text-red-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {reminder.type}
                </span>
              </div>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {child
                  ? child.name
                  : "Pengingat umum"}
                {" · "}
                {formatDate(
                  reminder.dueDate,
                )}
                {reminder.dueTime &&
                  ` · ${reminder.dueTime}`}
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </Link>
        );
      })
    )}
  </div>

  {latestReminders.length > 0 && (
    <div className="border-t border-slate-100 px-5 py-3 sm:hidden">
      <Link
        to="/reminders"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        Lihat semua pengingat
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )}
</div>

          {/* Recent notes */}
          <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/70 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-slate-600" />

                  <h2 className="font-bold text-slate-900">
                    Catatan Terbaru
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Catatan harian yang baru dicatat.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentNotes.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <ClipboardCheck className="mx-auto h-5 w-5 text-slate-400" />

                  <p className="mt-2 text-sm font-medium text-slate-900">
                    Belum ada catatan
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Belum ada catatan harian yang
                    tersedia.
                  </p>
                </div>
              ) : (
                recentNotes
                  .map((item) => (
                    <Link
                      key={item.id}
                      to={`/children/${item.childId}`}
                      className="flex gap-3 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="pt-1.5">
                        <NoteStatus
                          type={item.type}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.childName}
                          </p>

                          <span className="shrink-0 text-[11px] text-slate-400">
                            {formatDate(
                              item.recordedAt,
                            )}
                          </span>
                        </div>

                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {item.content}
                        </p>
                      </div>
                    </Link>
                  ))
              )}
            </div>

            {recentNotes.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3">
                <Link
                to="/notes"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                Lihat semua catatan
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Growth + AI */}
        <section className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Growth */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-slate-600" />

                  <h2 className="font-bold text-slate-900">
                    Pemantauan Pertumbuhan
                  </h2>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Ringkasan hasil pemantauan
                  pertumbuhan anak.
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {growthRecordedCount} dari{" "}
                {totalChildren} anak
              </span>
            </div>

            <div className="mt-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900">
                    {growthNormalCount}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    hasil assessment normal
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-700">
                  {growthPercentage}%
                </p>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-800"
                  style={{
                    width: `${growthPercentage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-2xl font-bold text-amber-700">
                  {growthAttentionCount}
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Perlu pemantauan
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-700">
                  {growthRecordedCount}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Sudah ada pengukuran
                </p>
              </div>
            </div>

            {growthAssessments.length > 0 && (
              <div className="mt-5 space-y-2">
                {growthAssessments
                  .filter(
                    (item) =>
                      item.assessment
                        ?.status ===
                      "Perlu Perhatian",
                  )
                  .map((item) => (
                    <Link
                      key={item.child.id}
                      to={`/children/${item.child.id}`}
                      className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/50 px-4 py-3 transition hover:bg-amber-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.child.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.assessment?.summary}
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  ))}
              </div>
            )}

            <Link
              to="/children"
              className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Lihat data pertumbuhan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* AI */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-violet-800 to-emerald-900 p-6 text-white shadow-lg shadow-violet-200/70 lg:col-span-2">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-white/10 p-2">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <h2 className="font-bold">
                  AI Assistant
                </h2>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-300">
                Tanyakan kondisi anak, rangkuman
                catatan, atau hal yang membutuhkan
                perhatian.
              </p>

              <div className="mt-5 space-y-2">
                <Link
                  to="/ai"
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-200 transition hover:bg-white/10"
                >
                  <span>
                    Siapa yang perlu perhatian?
                  </span>

                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/ai"
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-200 transition hover:bg-white/10"
                >
                  <span>
                    Ringkas catatan hari ini
                  </span>

                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  to="/ai"
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-left text-xs text-slate-200 transition hover:bg-white/10"
                >
                  <span>
                    Ada pertumbuhan yang perlu
                    ditinjau?
                  </span>

                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <Link
                to="/ai"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Tanya AI
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-300/15" />
            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/15" />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Pengasuh</h2>
              <p className="mt-1 text-sm text-slate-500">Daftar pengasuh dan anak yang didampingi.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{caregivers.length} aktif</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white/75 p-4">
            <div><p className="font-semibold text-slate-800">{caregivers.length} pengasuh · {caregivers.reduce((sum, caregiver) => sum + caregiver.childCount, 0)} anak dampingan</p><p className="mt-1 text-sm text-slate-500">Lihat pembagian anak dan data setiap pengasuh.</p></div>
            <Link to="/caregivers" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800">Buka data pengasuh<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        {/* Footer info */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <Info className="h-3.5 w-3.5" />

          <span>
            Status dan peringatan berdasarkan data
            terakhir yang tercatat di sistem.
          </span>
        </div>
      </main>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(date));
}


