import { X } from "lucide-react";
import { useEffect, useState } from "react";

import type {
  Reminder,
  ReminderRepeat,
  ReminderType,
} from "../../types/reminder";
import { useAppData } from "../../services/AppDataContext";

interface ReminderFormProps {
  reminder?: Reminder;
  onSubmit: (reminder: Reminder) => void;
  onClose: () => void;
}

export default function ReminderForm({
  reminder,
  onSubmit,
  onClose,
}: ReminderFormProps) {
  const { children } = useAppData();
  const isEdit = Boolean(reminder);

  const [title, setTitle] = useState(
    reminder?.title ?? "",
  );

  const [description, setDescription] = useState(
    reminder?.description ?? "",
  );

  const [type, setType] =
    useState<ReminderType>(
      reminder?.type ?? "Penting",
    );

  const [childId, setChildId] = useState(
    reminder?.childId
      ? String(reminder.childId)
      : "",
  );

  const [dueDate, setDueDate] = useState(
    reminder?.dueDate ?? getToday(),
  );

  const [dueTime, setDueTime] = useState(
    reminder?.dueTime ?? "",
  );

  const [repeat, setRepeat] =
    useState<ReminderRepeat>(
      reminder?.repeat ?? "Tidak berulang",
    );

  const [error, setError] = useState("");

  /*
   * Jika form dibuka untuk reminder lain
   * ketika komponen masih mounted, sinkronkan
   * kembali nilainya.
   */
  useEffect(() => {
    setTitle(reminder?.title ?? "");
    setDescription(
      reminder?.description ?? "",
    );
    setType(reminder?.type ?? "Penting");
    setChildId(
      reminder?.childId
        ? String(reminder.childId)
        : "",
    );
    setDueDate(
      reminder?.dueDate ?? getToday(),
    );
    setDueTime(reminder?.dueTime ?? "");
    setRepeat(
      reminder?.repeat ?? "Tidak berulang",
    );
    setError("");
  }, [reminder]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim() || !dueDate) {
      setError(
        "Judul dan tanggal pengingat wajib diisi.",
      );
      return;
    }

    const newReminder: Reminder = {
      id: reminder?.id ?? Date.now(),

      childId: childId
        ? Number(childId)
        : undefined,

      title: title.trim(),

      description:
        description.trim() || undefined,

      type,

      dueDate,

      dueTime: dueTime || undefined,

      repeat,

      completed:
        reminder?.completed ?? false,

      createdAt:
        reminder?.createdAt ??
        getToday(),
    };

    onSubmit(newReminder);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              {isEdit
                ? "Edit Pengingat"
                : "Tambah Pengingat"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Perbarui informasi pengingat."
                : "Buat pengingat untuk kegiatan atau hal yang perlu diperhatikan."}
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
          className="space-y-5 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <FormField
            label="Judul Pengingat"
            required
          >
            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Contoh: Pengukuran pertumbuhan Aisyah"
              className={inputClass}
            />
          </FormField>

          {/* Type */}
          <FormField
            label="Jenis Pengingat"
            required
          >
            <div className="grid grid-cols-2 gap-3">
              <TypeOption
                value="Penting"
                selected={type === "Penting"}
                onClick={() =>
                  setType("Penting")
                }
                description="Perlu diperhatikan"
              />

              <TypeOption
                value="Rutin"
                selected={type === "Rutin"}
                onClick={() =>
                  setType("Rutin")
                }
                description="Dilakukan berkala"
              />
            </div>
          </FormField>

          {/* Child */}
          <FormField label="Untuk Anak">
            <select
              value={childId}
              onChange={(event) =>
                setChildId(event.target.value)
              }
              className={inputClass}
            >
              <option value="">
                Semua / Umum
              </option>

              {children.map((child) => (
                <option
                  key={child.id}
                  value={child.id}
                >
                  {child.name} ({child.code})
                </option>
              ))}
            </select>
          </FormField>

          {/* Date + Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Tanggal"
              required
            >
              <input
                type="date"
                value={dueDate}
                onChange={(event) =>
                  setDueDate(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </FormField>

            <FormField label="Waktu">
              <input
                type="time"
                value={dueTime}
                onChange={(event) =>
                  setDueTime(
                    event.target.value,
                  )
                }
                className={inputClass}
              />
            </FormField>
          </div>

          {/* Repeat */}
          <FormField
            label="Pengulangan"
            required
          >
            <select
              value={repeat}
              onChange={(event) =>
                setRepeat(
                  event.target
                    .value as ReminderRepeat,
                )
              }
              className={inputClass}
            >
              <option value="Tidak berulang">
                Tidak berulang
              </option>

              <option value="Setiap hari">
                Setiap hari
              </option>

              <option value="Setiap minggu">
                Setiap minggu
              </option>

              <option value="Setiap bulan">
                Setiap bulan
              </option>
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Catatan">
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              rows={4}
              placeholder="Tambahkan keterangan jika diperlukan..."
              className={`${inputClass} resize-none`}
            />
          </FormField>

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
              {isEdit
                ? "Simpan Perubahan"
                : "Simpan Pengingat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TypeOption({
  value,
  selected,
  onClick,
  description,
}: {
  value: ReminderType;
  selected: boolean;
  onClick: () => void;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? "border-slate-900 bg-violet-700 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <p className="text-sm font-semibold">
        {value}
      </p>

      <p
        className={`mt-1 text-xs ${
          selected
            ? "text-slate-300"
            : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </button>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

function getToday() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

