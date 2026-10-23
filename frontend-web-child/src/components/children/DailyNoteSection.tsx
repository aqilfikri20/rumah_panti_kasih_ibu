import {
  Activity,
  CalendarDays,
  ClipboardList,
  Clock,
  Moon,
  Pencil,
  Plus,
  Trash2,
  Utensils,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../services/AppDataContext";

import type {
  DailyNote,
  DailyNoteCategory,
} from "../../types/dailyNote";

import DailyNoteForm from "./DailyNoteForm";

interface DailyNoteSectionProps {
  notes: DailyNote[];
  childId: number;
}

export default function DailyNoteSection({
  notes,
  childId,
}: DailyNoteSectionProps) {
  const { createDailyNote, updateDailyNote, deleteDailyNote } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] =
    useState<DailyNote | null>(null);
  const [deletingNote, setDeletingNote] =
    useState<DailyNote | null>(null);

  const [items, setItems] =
    useState<DailyNote[]>(notes);
  useEffect(() => setItems(notes), [notes]);

  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime(),
    );
  }, [items]);

  async function handleAddNote(note: DailyNote) {
    try {
      await createDailyNote(childId, note);
      setShowForm(false);
    } catch { /* Shared API banner reports errors. */ }
  }

  async function handleEditNote(note: DailyNote) {
    try { await updateDailyNote(note); setEditingNote(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  async function handleDeleteNote() {
    if (!deletingNote) {
      return;
    }

    try { await deleteDailyNote(deletingNote.id); setDeletingNote(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-900">
            Catatan Harian
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Catatan aktivitas dan observasi anak sehari-hari.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Catatan
        </button>
      </div>

      {sortedItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="p-6">
          <div className="space-y-0">
            {sortedItems.map((note, index) => (
              <DailyNoteItem
                key={note.id}
                note={note}
                isLast={index === sortedItems.length - 1}
                onEdit={() => setEditingNote(note)}
                onDelete={() => setDeletingNote(note)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <DailyNoteForm
          childId={childId}
          onSubmit={handleAddNote}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Form */}
      {editingNote && (
        <DailyNoteForm
          childId={childId}
          note={editingNote}
          onSubmit={handleEditNote}
          onClose={() => setEditingNote(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deletingNote && (
        <DeleteNoteDialog
          note={deletingNote}
          onCancel={() => setDeletingNote(null)}
          onConfirm={handleDeleteNote}
        />
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Daily Note Item                                                            */
/* -------------------------------------------------------------------------- */

function DailyNoteItem({
  note,
  isLast,
  onEdit,
  onDelete,
}: {
  note: DailyNote;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <CategoryIcon category={note.category} />
        </div>

        {!isLast && (
          <div className="my-2 h-full min-h-8 w-px bg-slate-200" />
        )}
      </div>

      {/* Content */}
      <div
        className={`min-w-0 flex-1 ${
          isLast ? "" : "pb-8"
        }`}
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900">
                  {note.title}
                </h3>

                <CategoryBadge
                  category={note.category}
                />
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(note.recordedAt)}
                </span>

                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  {note.recordedBy}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Edit catatan"
                title="Edit catatan"
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                aria-label="Hapus catatan"
                title="Hapus catatan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {note.content}
          </p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Dialog                                                              */
/* -------------------------------------------------------------------------- */

function DeleteNoteDialog({
  note,
  onCancel,
  onConfirm,
}: {
  note: DailyNote;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Hapus Catatan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-sm leading-6 text-slate-600">
            Apakah Anda yakin ingin menghapus catatan{" "}
            <span className="font-semibold text-slate-900">
              "{note.title}"
            </span>
            ?
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <ClipboardList className="h-5 w-5 text-slate-500" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">
        Belum ada catatan
      </h3>

      <p className="mt-1 max-w-sm text-sm text-slate-500">
        Belum terdapat catatan harian untuk anak ini.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Category                                                                   */
/* -------------------------------------------------------------------------- */

function CategoryIcon({
  category,
}: {
  category: DailyNoteCategory;
}) {
  switch (category) {
    case "Aktivitas":
      return <Activity className="h-5 w-5" />;

    case "Makan":
      return <Utensils className="h-5 w-5" />;

    case "Tidur":
      return <Moon className="h-5 w-5" />;

    case "Perilaku":
      return <Clock className="h-5 w-5" />;

    case "Kesehatan":
      return <ClipboardList className="h-5 w-5" />;

    default:
      return <ClipboardList className="h-5 w-5" />;
  }
}

function CategoryBadge({
  category,
}: {
  category: DailyNoteCategory;
}) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
      {category}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

