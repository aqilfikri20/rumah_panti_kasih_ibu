import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  DailyNote,
  DailyNoteCategory,
} from "../../types/dailyNote";

interface DailyNoteFormProps {
  childId: number;
  note?: DailyNote;
  onSubmit: (note: DailyNote) => void;
  onClose: () => void;
}

const categories: DailyNoteCategory[] = [
  "Aktivitas",
  "Makan",
  "Tidur",
  "Perilaku",
  "Kesehatan",
  "Lainnya",
];

export default function DailyNoteForm({
  childId,
  note,
  onSubmit,
  onClose,
}: DailyNoteFormProps) {
  const isEditMode = Boolean(note);

  const [recordedAt, setRecordedAt] = useState(
    note?.recordedAt ?? getToday(),
  );

  const [category, setCategory] =
    useState<DailyNoteCategory>(
      note?.category ?? "Aktivitas",
    );

  const [title, setTitle] = useState(
    note?.title ?? "",
  );

  const [content, setContent] = useState(
    note?.content ?? "",
  );

  const [recordedBy, setRecordedBy] = useState(
    note?.recordedBy ?? "",
  );

  const [error, setError] = useState("");

  useEffect(() => {
    setRecordedAt(note?.recordedAt ?? getToday());
    setCategory(note?.category ?? "Aktivitas");
    setTitle(note?.title ?? "");
    setContent(note?.content ?? "");
    setRecordedBy(note?.recordedBy ?? "");
    setError("");
  }, [note]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !recordedAt ||
      !title.trim() ||
      !content.trim() ||
      !recordedBy.trim()
    ) {
      setError(
        "Tanggal, judul, catatan, dan nama pencatat wajib diisi.",
      );
      return;
    }

    const updatedNote: DailyNote = {
      id: note?.id ?? Date.now(),
      childId,
      recordedAt,
      category,
      title: title.trim(),
      content: content.trim(),
      recordedBy: recordedBy.trim(),
    };

    onSubmit(updatedNote);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              {isEditMode
                ? "Edit Catatan Harian"
                : "Tambah Catatan Harian"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Perbarui catatan aktivitas atau kondisi anak."
                : "Catat aktivitas atau kondisi anak hari ini."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Tanggal
            </label>

            <input
              type="date"
              value={recordedAt}
              onChange={(event) =>
                setRecordedAt(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Kategori
            </label>

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as DailyNoteCategory,
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Judul Catatan
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Contoh: Sarapan pagi"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Catatan
            </label>

            <textarea
              value={content}
              onChange={(event) =>
                setContent(event.target.value)
              }
              rows={4}
              placeholder="Tuliskan apa yang terjadi atau diamati..."
              className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Recorded by */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Dicatat Oleh
            </label>

            <input
              type="text"
              value={recordedBy}
              onChange={(event) =>
                setRecordedBy(event.target.value)
              }
              placeholder="Contoh: Bu Sari"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
            >
              {isEditMode
                ? "Simpan Perubahan"
                : "Simpan Catatan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}


