import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Search,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppData } from "../services/AppDataContext";
import type { DailyNoteCategory } from "../types/dailyNote";

type CategoryFilter =
  | "Semua"
  | DailyNoteCategory;

type SortOption =
  | "newest"
  | "oldest";

export default function Notes() {
  const { children, dailyNotes } = useAppData();
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<CategoryFilter>("Semua");

  const [childId, setChildId] =
    useState<string>("");

  const [sort, setSort] =
    useState<SortOption>("newest");

  const filteredNotes = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return [...dailyNotes]
      .filter((note) => {
        const child = children.find(
          (item) =>
            item.id === note.childId,
        );

        const matchesSearch =
          keyword === "" ||
          note.title
            .toLowerCase()
            .includes(keyword) ||
          note.content
            .toLowerCase()
            .includes(keyword) ||
          note.recordedBy
            .toLowerCase()
            .includes(keyword) ||
          child?.name
            .toLowerCase()
            .includes(keyword);

        const matchesCategory =
          category === "Semua" ||
          note.category === category;

        const matchesChild =
          childId === "" ||
          note.childId === Number(childId);

        return (
          matchesSearch &&
          matchesCategory &&
          matchesChild
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.recordedAt,
        ).getTime();

        const dateB = new Date(
          b.recordedAt,
        ).getTime();

        return sort === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [
    search,
    category,
    childId,
    sort,
    children,
    dailyNotes,
  ]);

  const activeFilterCount =
    (category !== "Semua" ? 1 : 0) +
    (childId !== "" ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setCategory("Semua");
    setChildId("");
    setSort("newest");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-emerald-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-slate-600" />

              <h1 className="text-lg font-bold text-slate-900">
                Catatan Harian
              </h1>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Kumpulan catatan aktivitas dan
              kondisi anak.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            label="Semua Catatan"
            value={dailyNotes.length}
            description="Total catatan"
            icon={ClipboardCheck}
          />

          <SummaryCard
            label="Hari Ini"
            value={countTodayNotes(dailyNotes)}
            description="Catatan yang dicatat hari ini"
            icon={CalendarDays}
          />

          <SummaryCard
            label="Anak Tercatat"
            value={
              new Set(
                dailyNotes.map(
                  (note) => note.childId,
                ),
              ).size
            }
            description="Anak yang memiliki catatan"
            icon={User}
          />
        </section>

        {/* Toolbar */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* Search */}
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Cari catatan, anak, atau pencatat..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Category */}
              <div className="relative">
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target
                        .value as CategoryFilter,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none transition hover:bg-slate-50 focus:border-slate-400 sm:w-44"
                >
                  <option value="Semua">
                    Semua kategori
                  </option>

                  <option value="Aktivitas">
                    Aktivitas
                  </option>

                  <option value="Makan">
                    Makan
                  </option>

                  <option value="Tidur">
                    Tidur
                  </option>

                  <option value="Perilaku">
                    Perilaku
                  </option>

                  <option value="Kesehatan">
                    Kesehatan
                  </option>

                  <option value="Lainnya">
                    Lainnya
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Child */}
              <div className="relative">
                <select
                  value={childId}
                  onChange={(event) =>
                    setChildId(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none transition hover:bg-slate-50 focus:border-slate-400 sm:w-48"
                >
                  <option value="">
                    Semua anak
                  </option>

                  {children.map(
                    (child) => (
                      <option
                        key={child.id}
                        value={child.id}
                      >
                        {child.name}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target
                        .value as SortOption,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-600 outline-none transition hover:bg-slate-50 focus:border-slate-400 sm:w-44"
                >
                  <option value="newest">
                    Terbaru
                  </option>

                  <option value="oldest">
                    Terlama
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Active filters */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                {activeFilterCount} filter
                aktif
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
              >
                <X className="h-3.5 w-3.5" />
                Reset filter
              </button>
            </div>
          )}
        </section>

        {/* Result */}
        <section className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {filteredNotes.length}
              </span>{" "}
              dari{" "}
              <span className="font-semibold text-slate-700">
                {dailyNotes.length}
              </span>{" "}
              catatan
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {filteredNotes.length === 0 ? (
              <EmptyState
                onReset={resetFilters}
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotes.map(
                  (note) => {
                    const child =
                      children.find(
                        (item) =>
                          item.id ===
                          note.childId,
                      );

                    return (
                      <Link
                        key={note.id}
                        to={`/children/${note.childId}`}
                        className="block p-5 transition hover:bg-slate-50"
                      >
                        <div className="flex gap-4">
                          {/* Category icon */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <ClipboardCheck className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            {/* Top */}
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">
                                  {child?.name ??
                                    "Anak"}
                                </h3>

                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                  {note.category}
                                </span>
                              </div>

                              <span className="shrink-0 text-xs text-slate-400">
                                {formatDate(
                                  note.recordedAt,
                                )}
                              </span>
                            </div>

                            {/* Title */}
                            <p className="mt-2 text-sm font-medium text-slate-700">
                              {note.title}
                            </p>

                            {/* Content */}
                            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                              {note.content}
                            </p>

                            {/* Meta */}
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5" />
                                Dicatat oleh{" "}
                                {note.recordedBy}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5" />
                                {formatDate(
                                  note.recordedAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/*
 * =========================
 * SUMMARY CARD
 * =========================
 */

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

/*
 * =========================
 * EMPTY STATE
 * =========================
 */

function EmptyState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <ClipboardCheck className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        Catatan tidak ditemukan
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Tidak ada catatan yang sesuai
        dengan pencarian atau filter yang
        dipilih.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
      >
        <X className="h-4 w-4" />
        Reset
      </button>
    </div>
  );
}

/*
 * =========================
 * HELPERS
 * =========================
 */

function countTodayNotes(notes: import("../types/dailyNote").DailyNote[]) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  return notes.filter(
    (note) =>
      note.recordedAt === today,
  ).length;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(date));
}

