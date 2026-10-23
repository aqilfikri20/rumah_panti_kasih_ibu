import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type { Child } from "../../types/child";

interface ChildProfileFormProps {
  child: Child;
  onSubmit: (child: Child) => void;
  onClose: () => void;
}

export default function ChildProfileForm({
  child,
  onSubmit,
  onClose,
}: ChildProfileFormProps) {
  const [form, setForm] = useState({
    name: child.name,
    nickname: child.nickname ?? "",
    dateOfBirth: child.dateOfBirth,
    gender: child.gender,
    entryDate: child.entryDate,
    health: child.health,
    condition: child.condition,
    caregiver: child.caregiver,
    background: child.background ?? "",
    allergies: child.allergies?.join(", ") ?? "",
    specialConditions:
      child.specialConditions?.join(", ") ?? "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      name: child.name,
      nickname: child.nickname ?? "",
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      entryDate: child.entryDate,
      health: child.health,
      condition: child.condition,
      caregiver: child.caregiver,
      background: child.background ?? "",
      allergies: child.allergies?.join(", ") ?? "",
      specialConditions:
        child.specialConditions?.join(", ") ?? "",
    });
  }, [child]);

  function handleChange(
    field: keyof typeof form,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (!form.dateOfBirth) {
      setError("Tanggal lahir wajib diisi.");
      return;
    }

    if (!form.entryDate) {
      setError("Tanggal masuk wajib diisi.");
      return;
    }

    if (!form.caregiver.trim()) {
      setError("Pengasuh wajib diisi.");
      return;
    }

    const updatedChild: Child = {
      ...child,
      name: form.name.trim(),
      nickname: form.nickname.trim() || undefined,
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      entryDate: form.entryDate,
      health: form.health,
      condition: form.condition,
      caregiver: form.caregiver.trim(),
      background: form.background.trim() || undefined,
      allergies: parseList(form.allergies),
      specialConditions: parseList(
        form.specialConditions,
      ),
    };

    onSubmit(updatedChild);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-900">
              Edit Profil Anak
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Perbarui informasi dasar anak.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto"
        >
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <FormField
              label="Nama Lengkap"
              value={form.name}
              onChange={(value) =>
                handleChange("name", value)
              }
              required
            />

            <FormField
              label="Nama Panggilan"
              value={form.nickname}
              onChange={(value) =>
                handleChange("nickname", value)
              }
            />

            <FormField
              label="Tanggal Lahir"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) =>
                handleChange("dateOfBirth", value)
              }
              required
            />

            <SelectField
              label="Jenis Kelamin"
              value={form.gender}
              onChange={(value) =>
                handleChange("gender", value)
              }
              options={[
                "Laki-laki",
                "Perempuan",
              ]}
            />

            <FormField
              label="Tanggal Masuk"
              type="date"
              value={form.entryDate}
              onChange={(value) =>
                handleChange("entryDate", value)
              }
              required
            />

            <FormField
              label="Pengasuh"
              value={form.caregiver}
              onChange={(value) =>
                handleChange("caregiver", value)
              }
              required
            />

            <SelectField
              label="Status Kesehatan"
              value={form.health}
              onChange={(value) =>
                handleChange("health", value)
              }
              options={[
                "Normal",
                "Perlu Perhatian",
              ]}
            />

            <SelectField
              label="Kondisi"
              value={form.condition}
              onChange={(value) =>
                handleChange("condition", value)
              }
              options={[
                "Normal",
                "Disabilitas",
              ]}
            />

            <div className="sm:col-span-2">
              <TextAreaField
                label="Latar Belakang"
                value={form.background}
                onChange={(value) =>
                  handleChange("background", value)
                }
                placeholder="Masukkan informasi singkat mengenai latar belakang anak."
              />
            </div>

            <div>
              <TextAreaField
                label="Alergi"
                value={form.allergies}
                onChange={(value) =>
                  handleChange("allergies", value)
                }
                placeholder="Contoh: Susu, telur"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Pisahkan beberapa alergi dengan koma.
              </p>
            </div>

            <div>
              <TextAreaField
                label="Kondisi Khusus"
                value={form.specialConditions}
                onChange={(value) =>
                  handleChange(
                    "specialConditions",
                    value,
                  )
                }
                placeholder="Contoh: Memerlukan pendampingan khusus"
              />

              <p className="mt-1.5 text-xs text-slate-400">
                Pisahkan beberapa kondisi dengan koma.
              </p>
            </div>
          </div>

          {error && (
            <div className="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Batal
            </button>

            <button
              type="submit"
              className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </span>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </label>
  );
}

function parseList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
