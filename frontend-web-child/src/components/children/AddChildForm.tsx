import { X } from "lucide-react";
import { useState } from "react";

import type {
  Child,
  ChildCondition,
  ChildHealthStatus,
} from "../../types/child";

interface AddChildFormProps {
  onSubmit: (child: Child) => void;
  onClose: () => void;
}

export default function AddChildForm({
  onSubmit,
  onClose,
}: AddChildFormProps) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<
    Child["gender"]
  >("Laki-laki");
  const [entryDate, setEntryDate] = useState(getToday());
  const [health, setHealth] =
    useState<ChildHealthStatus>("Normal");
  const [condition, setCondition] =
    useState<ChildCondition>("Normal");
  const [caregiver, setCaregiver] = useState("");
  const [background, setBackground] = useState("");

  const [error, setError] = useState("");

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !dateOfBirth ||
      !entryDate ||
      !caregiver.trim()
    ) {
      setError(
        "Nama, tanggal lahir, tanggal masuk, dan pengasuh wajib diisi.",
      );
      return;
    }

    const newChild: Child = {
      id: Date.now(),
      code: generateChildCode(),
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      dateOfBirth,
      gender,
      entryDate,
      health,
      condition,
      caregiver: caregiver.trim(),
      background: background.trim() || undefined,
      allergies: [],
      specialConditions: [],
    };

    onSubmit(newChild);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Tambah Anak
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Masukkan informasi dasar anak.
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
          className="space-y-6 p-6"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Data dasar */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Data Dasar
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Nama Lengkap" required>
                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Contoh: Ahmad"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Nama Panggilan">
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) =>
                    setNickname(event.target.value)
                  }
                  placeholder="Contoh: Ahmad"
                  className={inputClass}
                />
              </FormField>

              <FormField label="Tanggal Lahir" required>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(event) =>
                    setDateOfBirth(event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Jenis Kelamin" required>
                <select
                  value={gender}
                  onChange={(event) =>
                    setGender(
                      event.target.value as Child["gender"],
                    )
                  }
                  className={inputClass}
                >
                  <option value="Laki-laki">
                    Laki-laki
                  </option>
                  <option value="Perempuan">
                    Perempuan
                  </option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Data pengasuhan */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Data Pengasuhan
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Tanggal Masuk" required>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) =>
                    setEntryDate(event.target.value)
                  }
                  className={inputClass}
                />
              </FormField>

              <FormField label="Pengasuh" required>
                <input
                  type="text"
                  value={caregiver}
                  onChange={(event) =>
                    setCaregiver(event.target.value)
                  }
                  placeholder="Contoh: Bu Sari"
                  className={inputClass}
                />
              </FormField>
            </div>
          </div>

          {/* Kondisi awal */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Kondisi Awal
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField label="Status Kesehatan">
                <select
                  value={health}
                  onChange={(event) =>
                    setHealth(
                      event.target.value as ChildHealthStatus,
                    )
                  }
                  className={inputClass}
                >
                  <option value="Normal">
                    Normal
                  </option>

                  <option value="Perlu Perhatian">
                    Perlu Perhatian
                  </option>
                </select>
              </FormField>

              <FormField label="Kondisi">
                <select
                  value={condition}
                  onChange={(event) =>
                    setCondition(
                      event.target.value as ChildCondition,
                    )
                  }
                  className={inputClass}
                >
                  <option value="Normal">
                    Normal
                  </option>

                  <option value="Disabilitas">
                    Disabilitas
                  </option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Latar belakang */}
          <FormField label="Latar Belakang">
            <textarea
              value={background}
              onChange={(event) =>
                setBackground(event.target.value)
              }
              rows={4}
              placeholder="Tambahkan informasi latar belakang anak jika diperlukan..."
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
              Simpan Anak
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Form Components                                                            */
/* -------------------------------------------------------------------------- */

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
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function generateChildCode() {
  return `RANS-${String(Date.now()).slice(-3)}`;
}

