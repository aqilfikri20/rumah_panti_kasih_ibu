import {
  CalendarDays,
  Ruler,
  UserRound,
  Weight,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { GrowthRecord } from "../../types/growth";

interface GrowthRecordFormProps {
  childId: number;
  record?: GrowthRecord;
  onSubmit: (record: GrowthRecord) => void;
  onClose: () => void;
}

export default function GrowthRecordForm({
  childId,
  record,
  onSubmit,
  onClose,
}: GrowthRecordFormProps) {
  const isEditMode = Boolean(record);

  const [recordedAt, setRecordedAt] = useState(
    record?.recordedAt ?? getToday(),
  );

  const [weight, setWeight] = useState(
    record?.weight !== undefined
      ? String(record.weight)
      : "",
  );

  const [height, setHeight] = useState(
    record?.height !== undefined
      ? String(record.height)
      : "",
  );

  const [notes, setNotes] = useState(
    record?.notes ?? "",
  );

  const [recordedBy, setRecordedBy] = useState(
    record?.recordedBy ?? "",
  );

  const [error, setError] = useState("");

  /*
   * Sinkronisasi form ketika record yang diedit berubah.
   */
  useEffect(() => {
    setRecordedAt(record?.recordedAt ?? getToday());

    setWeight(
      record?.weight !== undefined
        ? String(record.weight)
        : "",
    );

    setHeight(
      record?.height !== undefined
        ? String(record.height)
        : "",
    );

    setNotes(record?.notes ?? "");

    setRecordedBy(record?.recordedBy ?? "");

    setError("");
  }, [record]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!recordedAt) {
      setError("Tanggal pengukuran wajib diisi.");
      return;
    }

    if (!weight.trim()) {
      setError("Berat badan wajib diisi.");
      return;
    }

    if (!height.trim()) {
      setError("Tinggi badan wajib diisi.");
      return;
    }

    if (!recordedBy.trim()) {
      setError("Nama pencatat wajib diisi.");
      return;
    }

    const weightValue = Number(weight);
    const heightValue = Number(height);

    if (
      !Number.isFinite(weightValue) ||
      !Number.isFinite(heightValue)
    ) {
      setError(
        "Berat dan tinggi harus berupa angka yang valid.",
      );
      return;
    }

    if (weightValue <= 0 || heightValue <= 0) {
      setError(
        "Berat dan tinggi harus lebih dari 0.",
      );
      return;
    }

    const updatedRecord: GrowthRecord = {
      id: record?.id ?? Date.now(),
      childId,
      recordedAt,
      weight: weightValue,
      height: heightValue,
      notes: notes.trim() || undefined,
      recordedBy: recordedBy.trim(),
    };

    onSubmit(updatedRecord);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              {isEditMode
                ? "Edit Pengukuran"
                : "Catat Pengukuran"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Perbarui data pengukuran pertumbuhan anak."
                : "Masukkan hasil pengukuran pertumbuhan anak."}
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
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Tanggal */}
            <div>
              <label
                htmlFor="growth-recorded-at"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <CalendarDays className="h-4 w-4 text-slate-400" />
                Tanggal Pengukuran
              </label>

              <input
                id="growth-recorded-at"
                type="date"
                value={recordedAt}
                onChange={(event) =>
                  setRecordedAt(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Berat & Tinggi */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Berat */}
              <div>
                <label
                  htmlFor="growth-weight"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <Weight className="h-4 w-4 text-slate-400" />
                  Berat Badan
                </label>

                <div className="relative">
                  <input
                    id="growth-weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(event) =>
                      setWeight(event.target.value)
                    }
                    placeholder="Contoh: 14.2"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    kg
                  </span>
                </div>
              </div>

              {/* Tinggi */}
              <div>
                <label
                  htmlFor="growth-height"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
                >
                  <Ruler className="h-4 w-4 text-slate-400" />
                  Tinggi Badan
                </label>

                <div className="relative">
                  <input
                    id="growth-height"
                    type="number"
                    min="0"
                    step="0.1"
                    value={height}
                    onChange={(event) =>
                      setHeight(event.target.value)
                    }
                    placeholder="Contoh: 94"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-12 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                    cm
                  </span>
                </div>
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label
                htmlFor="growth-notes"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Catatan
              </label>

              <textarea
                id="growth-notes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={3}
                placeholder="Tambahkan catatan jika diperlukan..."
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Dicatat Oleh */}
            <div>
              <label
                htmlFor="growth-recorded-by"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700"
              >
                <UserRound className="h-4 w-4 text-slate-400" />
                Dicatat Oleh
              </label>

              <input
                id="growth-recorded-by"
                type="text"
                value={recordedBy}
                onChange={(event) =>
                  setRecordedBy(event.target.value)
                }
                placeholder="Contoh: Bu Sari"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-100 px-6 py-4">
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
                : "Simpan Pengukuran"}
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
