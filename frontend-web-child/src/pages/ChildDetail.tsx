import { useState } from "react";
import {
  ArrowLeft,
  HeartPulse,
  Pencil,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import ChildProfileForm from "../components/children/ChildProfileForm";
import DailyNoteSection from "../components/children/DailyNoteSection";
import GrowthSection from "../components/children/GrowthSection";
import HealthSection from "../components/children/HealthSection";

import { useAppData } from "../services/AppDataContext";

import type { Child } from "../types/child";
import { formatAge } from "../utils/formatAge";

export default function ChildDetail() {
  const { id } = useParams();
  const { children, dailyNotes, healthData, growthData, growthAssessmentData, updateChild, loading } = useAppData();
  const childData = children.find((item) => item.id === Number(id)) ?? null;

  const [editingProfile, setEditingProfile] =
    useState(false);

  if (loading && !childData) return <div className="p-10 text-center text-slate-500">Memuat data anak...</div>;
  if (!childData) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <HeartPulse className="h-5 w-5 text-slate-500" />
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Anak tidak ditemukan
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Data anak yang Anda cari tidak tersedia.
          </p>

          <Link
            to="/children"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data Anak
          </Link>
        </div>
      </div>
    );
  }

  const health = healthData[childData.id];
  const growth = growthData[childData.id];

  const growthAssessment = growthAssessmentData[childData.id];

  const childNotes = dailyNotes.filter(
    (note) => note.childId === childData.id,
  );

  async function handleUpdateProfile(updatedChild: Child) {
    try {
      await updateChild(updatedChild);
      setEditingProfile(false);
    } catch { /* Shared API banner reports errors. */ }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5 lg:px-8">
          {/* Back */}
          <Link
            to="/children"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data Anak
          </Link>

          {/* Child identity */}
          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
                {childData.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {childData.name}
                  </h1>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                    {childData.code}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {formatAge(childData.dateOfBirth)} â€¢{" "}
                  {childData.gender}
                </p>
              </div>
            </div>

            {/* Health status */}
            <HealthStatusBadge status={health.status} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8">
        {/* Health alert */}
        {health.status === "Perlu Perhatian" && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Anak memerlukan perhatian
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Terdapat informasi kesehatan yang perlu
                  ditinjau atau dipantau lebih lanjut.
                  Periksa bagian kesehatan untuk melihat
                  detailnya.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Profil */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Section header */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-bold text-slate-900">
                Informasi Profil
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Informasi dasar anak.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditingProfile(true)}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit Profil
            </button>
          </div>

          {/* Profile information */}
          <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Nama Lengkap"
              value={childData.name}
            />

            <InfoItem
              label="Nama Panggilan"
              value={childData.nickname || "-"}
            />

            <InfoItem
              label="Tanggal Lahir"
              value={formatDate(childData.dateOfBirth)}
            />

            <InfoItem
              label="Umur"
              value={formatAge(childData.dateOfBirth)}
            />

            <InfoItem
              label="Jenis Kelamin"
              value={childData.gender}
            />

            <InfoItem
              label="Tanggal Masuk"
              value={formatDate(childData.entryDate)}
            />

            <InfoItem
              label="Pengasuh"
              value={childData.caregiver}
            />

            <InfoItem
              label="Kondisi"
              value={childData.condition}
            />

            <InfoItem
              label="Kode Anak"
              value={childData.code}
            />
          </div>
        </section>

        {/* Latar Belakang */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="font-bold text-slate-900">
              Latar Belakang
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Informasi singkat mengenai latar belakang
              anak.
            </p>
          </div>

          <div className="p-6">
            <p className="text-sm leading-7 text-slate-600">
              {childData.background ||
                "Belum ada informasi."}
            </p>
          </div>
        </section>

        {/* Kesehatan */}
        <HealthSection
          health={health}
          childId={childData.id}
        />

        {/* Pertumbuhan */}
        <GrowthSection
          growth={growth}
          assessment={growthAssessment}
          childId={childData.id}
          dateOfBirth={childData.dateOfBirth}
          gender={childData.gender}
        />

        {/* Catatan Harian */}
        <DailyNoteSection
          notes={childNotes}
          childId={childData.id}
        />
      </main>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <ChildProfileForm
          child={childData}
          onSubmit={handleUpdateProfile}
          onClose={() => setEditingProfile(false)}
        />
      )}
    </div>
  );
}

function HealthStatusBadge({
  status,
}: {
  status: "Normal" | "Perlu Perhatian";
}) {
  const isNormal = status === "Normal";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
        isNormal
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isNormal
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />

      {isNormal
        ? "Kondisi normal"
        : "Perlu perhatian"}
    </span>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

