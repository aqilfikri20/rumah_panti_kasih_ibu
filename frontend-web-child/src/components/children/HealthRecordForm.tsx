import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type {
  HealthRecord,
  HealthStatus,
} from "../../types/health";

interface HealthRecordFormProps {
  childId: number;
  record?: HealthRecord;
  onClose: () => void;
  onSubmit: (record: HealthRecord) => void;
}

export default function HealthRecordForm({
  childId,
  record,
  onClose,
  onSubmit,
}: HealthRecordFormProps) {
  const isEditMode = Boolean(record);

  const [status, setStatus] =
    useState<HealthStatus>(
      record?.status ?? "Normal",
    );

  const [recordedAt, setRecordedAt] = useState(
    record?.recordedAt ?? getToday(),
  );

  const [title, setTitle] = useState(
    record?.title ?? "",
  );

  const [summary, setSummary] = useState(
    record?.summary ?? "",
  );

  const [notes, setNotes] = useState(
    record?.notes ?? "",
  );

  const [recordedBy, setRecordedBy] = useState(
    record?.recordedBy ?? "Admin",
  );

  const [error, setError] = useState("");

  /*
   * Sinkronisasi form ketika record yang diedit berubah.
   */
  useEffect(() => {
    setStatus(record?.status ?? "Normal");
    setRecordedAt(record?.recordedAt ?? getToday());
    setTitle(record?.title ?? "");
    setSummary(record?.summary ?? "");
    setNotes(record?.notes ?? "");
    setRecordedBy(record?.recordedBy ?? "Admin");
    setError("");
  }, [record]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!recordedAt) {
      setError("Tanggal pemeriksaan wajib diisi.");
      return;
    }

    if (!title.trim()) {
      setError("Judul catatan wajib diisi.");
      return;
    }

    if (!summary.trim()) {
      setError("Ringkasan kondisi wajib diisi.");
      return;
    }

    if (!recordedBy.trim()) {
      setError("Nama pencatat wajib diisi.");
      return;
    }

    const updatedRecord: HealthRecord = {
      id: record?.id ?? Date.now(),
      childId,
      recordedAt,
      status,
      title: title.trim(),
      summary: summary.trim(),
      notes: notes.trim() || undefined,
      recordedBy: recordedBy.trim(),
    };

    onSubmit(updatedRecord);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode
                ? "Edit Catatan Kesehatan"
                : "Tambah Catatan Kesehatan"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Perbarui informasi hasil pemantauan atau pemeriksaan kesehatan anak."
                : "Tambahkan hasil pemantauan atau pemeriksaan kesehatan anak."}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
            {/* Status */}
            <div>
              <label className="text-sm font-semibold text-slate-900">
                Status kesehatan
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Pilih status berdasarkan hasil pemantauan saat
                ini.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {/* Normal */}
                <button
                  type="button"
                  onClick={() => setStatus("Normal")}
                  className={`rounded-xl border p-4 text-left transition ${
                    status === "Normal"
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        status === "Normal"
                          ? "bg-white text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Normal
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Tidak ada perhatian aktif.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Perlu Perhatian */}
                <button
                  type="button"
                  onClick={() =>
                    setStatus("Perlu Perhatian")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    status === "Perlu Perhatian"
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        status === "Perlu Perhatian"
                          ? "bg-white text-amber-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <AlertCircle className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Perlu Perhatian
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        Ada hal yang perlu dipantau.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label
                htmlFor="health-recorded-at"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Tanggal pemeriksaan
              </label>

              <input
                id="health-recorded-at"
                type="date"
                value={recordedAt}
                onChange={(event) =>
                  setRecordedAt(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Judul */}
            <div>
              <label
                htmlFor="health-title"
                className="text-sm font-semibold text-slate-900"
              >
                Judul catatan
              </label>

              <input
                id="health-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Contoh: Pemeriksaan rutin"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Ringkasan */}
            <div>
              <label
                htmlFor="health-summary"
                className="text-sm font-semibold text-slate-900"
              >
                Ringkasan kondisi
              </label>

              <textarea
                id="health-summary"
                value={summary}
                onChange={(event) =>
                  setSummary(event.target.value)
                }
                rows={4}
                placeholder="Tuliskan kondisi atau hasil pemantauan..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Catatan tambahan */}
            <div>
              <label
                htmlFor="health-notes"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <FileText className="h-4 w-4 text-slate-400" />
                Catatan tambahan
              </label>

              <textarea
                id="health-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={3}
                placeholder="Catatan tambahan jika diperlukan..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Pencatat */}
            <div>
              <label
                htmlFor="recorded-by"
                className="flex items-center gap-2 text-sm font-semibold text-slate-900"
              >
                <UserRound className="h-4 w-4 text-slate-400" />
                Dicatat oleh
              </label>

              <input
                id="recorded-by"
                type="text"
                value={recordedBy}
                onChange={(event) =>
                  setRecordedBy(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
