import {
  AlertCircle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import ReminderForm from "../components/reminders/ReminderForm";
import { useAppData } from "../services/AppDataContext";
import type { Reminder } from "../types/reminder";

type ReminderFilter =
  | "Semua"
  | "Penting"
  | "Rutin";

export default function Reminders() {
  const { children, reminders: reminderList, createReminder, updateReminder, deleteReminder } = useAppData();

  const [showForm, setShowForm] =
    useState(false);

  const [editingReminder, setEditingReminder] =
    useState<Reminder | undefined>();

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<ReminderFilter>("Semua");

  const [deletingReminder, setDeletingReminder] =
    useState<Reminder | undefined>();

  /*
   * =========================
   * FILTER
   * =========================
   */

  const filteredReminders = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return [...reminderList]
      .filter((reminder) => {
        const child = reminder.childId
          ? children.find(
              (item) =>
                item.id === reminder.childId,
            )
          : undefined;

        const matchesSearch =
          keyword === "" ||
          reminder.title
            .toLowerCase()
            .includes(keyword) ||
          reminder.description
            ?.toLowerCase()
            .includes(keyword) ||
          child?.name
            .toLowerCase()
            .includes(keyword);

        const matchesFilter =
          filter === "Semua" ||
          reminder.type === filter;

        return (
          matchesSearch &&
          matchesFilter
        );
      })
      .sort((a, b) => {
        /*
         * Pengingat yang belum selesai
         * selalu berada di atas.
         */
        if (
          a.completed !== b.completed
        ) {
          return a.completed ? 1 : -1;
        }

        /*
         * Setelah itu urut berdasarkan
         * tanggal terdekat.
         */
        const dateA = new Date(
          `${a.dueDate}T${a.dueTime ?? "23:59"}`,
        ).getTime();

        const dateB = new Date(
          `${b.dueDate}T${b.dueTime ?? "23:59"}`,
        ).getTime();

        return dateA - dateB;
      });
  }, [reminderList, search, filter]);

  /*
   * =========================
   * COUNTS
   * =========================
   */

  const totalCount =
    reminderList.length;

  const importantCount =
    reminderList.filter(
      (item) => item.type === "Penting",
    ).length;

  const routineCount =
    reminderList.filter(
      (item) => item.type === "Rutin",
    ).length;

  const activeCount =
    reminderList.filter(
      (item) => !item.completed,
    ).length;

  /*
   * =========================
   * ADD / EDIT
   * =========================
   */

  async function handleSubmit(
    reminder: Reminder,
  ) {
    try {
      if (editingReminder) await updateReminder(reminder);
      else await createReminder(reminder);
      setShowForm(false);
      setEditingReminder(undefined);
    } catch { /* Shared API banner reports errors. */ }
  }

  function handleAdd() {
    setEditingReminder(undefined);
    setShowForm(true);
  }

  function handleEdit(
    reminder: Reminder,
  ) {
    setEditingReminder(reminder);
    setShowForm(true);
  }

  /*
   * =========================
   * DELETE
   * =========================
   */

  async function handleDelete() {
    if (!deletingReminder) {
      return;
    }

    try {
      await deleteReminder(deletingReminder.id);
      setDeletingReminder(undefined);
    } catch { /* Shared API banner reports errors. */ }
  }

  /*
   * =========================
   * COMPLETE
   * =========================
   */

  async function toggleCompleted(
    reminderId: number,
  ) {
    const reminder = reminderList.find((item) => item.id === reminderId);
    if (reminder) {
      try { await updateReminder({ ...reminder, completed: !reminder.completed }); }
      catch { /* Shared API banner reports errors. */ }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-slate-50 to-emerald-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="flex min-h-16 items-center justify-between gap-4 px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />

              <h1 className="text-lg font-bold text-slate-900">
                Pengingat
              </h1>
            </div>

            <p className="mt-0.5 text-xs text-slate-500">
              Kelola hal penting dan kegiatan rutin
              yang perlu diingat.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
          >
            <Plus className="h-4 w-4" />

            <span className="hidden sm:inline">
              Tambah Pengingat
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={Bell}
            label="Semua Pengingat"
            value={totalCount}
            description="Total pengingat"
            active={filter === "Semua"}
            onClick={() =>
              setFilter("Semua")
            }
          />

          <SummaryCard
            icon={CircleAlert}
            label="Penting"
            value={importantCount}
            description="Pengingat prioritas"
            active={filter === "Penting"}
            onClick={() =>
              setFilter("Penting")
            }
          />

          <SummaryCard
            icon={CalendarDays}
            label="Rutin"
            value={routineCount}
            description="Kegiatan berkala"
            active={filter === "Rutin"}
            onClick={() =>
              setFilter("Rutin")
            }
          />
        </section>

        {/* Toolbar */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari pengingat atau nama anak..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              {(
                [
                  "Semua",
                  "Penting",
                  "Rutin",
                ] as ReminderFilter[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setFilter(item)
                  }
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    filter === item
                      ? "bg-violet-700 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Info */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {filteredReminders.length}
            </span>{" "}
            dari{" "}
            <span className="font-semibold text-slate-700">
              {totalCount}
            </span>{" "}
            pengingat
          </p>

          <p className="hidden text-xs text-slate-400 sm:block">
            {activeCount} belum selesai
          </p>
        </div>

        {/* Reminder List */}
        <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {filteredReminders.length === 0 ? (
            <EmptyState
              search={search}
              filter={filter}
              onReset={() => {
                setSearch("");
                setFilter("Semua");
              }}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredReminders.map(
                (reminder) => {
                  const child =
                    reminder.childId
                      ? children.find(
                          (item) =>
                            item.id ===
                            reminder.childId,
                        )
                      : undefined;

                  return (
                    <ReminderRow
                      key={reminder.id}
                      reminder={reminder}
                      childName={child?.name}
                      onEdit={() =>
                        handleEdit(
                          reminder,
                        )
                      }
                      onDelete={() =>
                        setDeletingReminder(
                          reminder,
                        )
                      }
                      onToggleComplete={() =>
                        toggleCompleted(
                          reminder.id,
                        )
                      }
                    />
                  );
                },
              )}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Form */}
      {showForm && (
        <ReminderForm
          reminder={editingReminder}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingReminder(undefined);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deletingReminder && (
        <DeleteDialog
          reminder={deletingReminder}
          onCancel={() =>
            setDeletingReminder(undefined)
          }
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

/*
 * =========================
 * SUMMARY CARD
 * =========================
 */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
        active
          ? "border-slate-900 ring-1 ring-slate-900"
          : "border-slate-200 hover:border-slate-300 hover:shadow"
      }`}
    >
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
    </button>
  );
}

/*
 * =========================
 * REMINDER ROW
 * =========================
 */

function ReminderRow({
  reminder,
  childName,
  onEdit,
  onDelete,
  onToggleComplete,
}: {
  reminder: Reminder;
  childName?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}) {
  return (
    <div
      className={`p-5 transition hover:bg-slate-50 ${
        reminder.completed
          ? "opacity-60"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Status icon */}
        <button
          type="button"
          onClick={onToggleComplete}
          title={
            reminder.completed
              ? "Tandai belum selesai"
              : "Tandai selesai"
          }
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
            reminder.completed
              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
              : reminder.type ===
                  "Penting"
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-amber-100 bg-amber-50 text-amber-600"
          }`}
        >
          {reminder.completed ? (
            <Check className="h-5 w-5" />
          ) : reminder.type === "Penting" ? (
            <CircleAlert className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </button>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                reminder.type === "Penting"
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {reminder.type ===
              "Penting" ? (
                <CircleAlert className="h-3 w-3" />
              ) : (
                <CalendarDays className="h-3 w-3" />
              )}

              {reminder.type}
            </span>

            {reminder.repeat !==
              "Tidak berulang" && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                {reminder.repeat}
              </span>
            )}

            {reminder.completed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Selesai
              </span>
            )}
          </div>

          <h3
            className={`mt-2 text-sm font-semibold ${
              reminder.completed
                ? "text-slate-500 line-through"
                : "text-slate-900"
            }`}
          >
            {reminder.title}
          </h3>

          {reminder.description && (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              {reminder.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            {childName ? (
              <Link
                to={`/children/${reminder.childId}`}
                className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900"
              >
                <User className="h-3.5 w-3.5" />
                {childName}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Umum
              </span>
            )}

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(
                reminder.dueDate,
              )}
            </span>

            {reminder.dueTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {reminder.dueTime}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 lg:self-center">
          {childName && (
            <Link
              to={`/children/${reminder.childId}`}
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm sm:inline-flex"
            >
              Lihat Anak
            </Link>
          )}

          <button
            type="button"
            onClick={onEdit}
            title="Edit pengingat"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            title="Hapus pengingat"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
  search,
  filter,
  onReset,
}: {
  search: string;
  filter: ReminderFilter;
  onReset: () => void;
}) {
  const hasFilter =
    search.trim() !== "" ||
    filter !== "Semua";

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <Bell className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        {hasFilter
          ? "Pengingat tidak ditemukan"
          : "Belum ada pengingat"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        {hasFilter
          ? "Tidak ada pengingat yang sesuai dengan pencarian atau filter."
          : "Tambahkan pengingat untuk membantu pengurus mengingat kegiatan penting."}
      </p>

      {hasFilter && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
          Reset
        </button>
      )}
    </div>
  );
}

/*
 * =========================
 * DELETE DIALOG
 * =========================
 */

function DeleteDialog({
  reminder,
  onCancel,
  onConfirm,
}: {
  reminder: Reminder;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          Hapus pengingat?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Pengingat{" "}
          <span className="font-medium text-slate-700">
            "{reminder.title}"
          </span>{" "}
          akan dihapus dari daftar.
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Hapus Pengingat
          </button>
        </div>
      </div>
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


