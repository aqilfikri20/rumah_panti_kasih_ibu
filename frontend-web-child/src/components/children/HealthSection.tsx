import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  HeartPulse,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../services/AppDataContext";

import type {
  HealthInfo,
  HealthRecord,
} from "../../types/health";

import HealthRecordForm from "./HealthRecordForm";

interface HealthSectionProps {
  health: HealthInfo;
  childId: number;
}

export default function HealthSection({
  health,
  childId,
}: HealthSectionProps) {
  const { createHealthRecord, updateHealthRecord, deleteHealthRecord } = useAppData();
  const [showForm, setShowForm] = useState(false);

  const [editingRecord, setEditingRecord] =
    useState<HealthRecord | null>(null);

  const [deletingRecord, setDeletingRecord] =
    useState<HealthRecord | null>(null);

  const [records, setRecords] = useState<HealthRecord[]>(
    health.history,
  );
  useEffect(() => setRecords(health.history), [health.history]);

  /*
   * Selalu tampilkan record terbaru terlebih dahulu.
   */
  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime(),
    );
  }, [records]);

  const latestRecord = sortedRecords[0];

  /*
   * Status kesehatan mengikuti record terbaru.
   *
   * Jika belum ada record, gunakan status awal dari health.
   */
  const currentStatus =
    latestRecord?.status ?? health.status;

  async function handleAddRecord(record: HealthRecord) {
    try {
      await createHealthRecord(childId, record);
      setShowForm(false);
    } catch { /* Shared API banner reports errors. */ }
  }

  async function handleEditRecord(record: HealthRecord) {
    try { await updateHealthRecord(record); setEditingRecord(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  async function handleDeleteRecord() {
    if (!deletingRecord) {
      return;
    }

    try { await deleteHealthRecord(deletingRecord.id); setDeletingRecord(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2">
              <HeartPulse className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Informasi Kesehatan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Kondisi kesehatan dan riwayat pemantauan anak.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
          >
            <Plus className="h-4 w-4" />
            Tambah Catatan
          </button>
        </div>

        <div className="p-6">
          {/* Status kesehatan */}
          <HealthStatus status={currentStatus} />

          {/* Alergi & kondisi khusus */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <HealthInfoCard
              title="Alergi"
              items={health.allergies}
              emptyText="Tidak ada data alergi."
            />

            <HealthInfoCard
              title="Kondisi Khusus"
              items={health.specialConditions}
              emptyText="Tidak ada kondisi khusus."
            />
          </div>

          {/* Pemeriksaan terakhir */}
          {latestRecord && (
            <LastCheckup
              record={latestRecord}
              onEdit={() =>
                setEditingRecord(latestRecord)
              }
              onDelete={() =>
                setDeletingRecord(latestRecord)
              }
            />
          )}

          {/* Riwayat */}
          <HealthHistory
            history={sortedRecords}
            onEdit={setEditingRecord}
            onDelete={setDeletingRecord}
          />
        </div>
      </section>

      {/* Tambah Catatan */}
      {showForm && (
        <HealthRecordForm
          childId={childId}
          onClose={() => setShowForm(false)}
          onSubmit={handleAddRecord}
        />
      )}

      {/* Edit Catatan */}
      {editingRecord && (
        <HealthRecordForm
          childId={childId}
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSubmit={handleEditRecord}
        />
      )}

      {/* Konfirmasi Hapus */}
      {deletingRecord && (
        <DeleteHealthDialog
          record={deletingRecord}
          onCancel={() => setDeletingRecord(null)}
          onConfirm={handleDeleteRecord}
        />
      )}
    </>
  );
}

/* =========================================================
   STATUS KESEHATAN
   ========================================================= */

function HealthStatus({
  status,
}: {
  status: HealthInfo["status"];
}) {
  const isNormal = status === "Normal";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isNormal
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-lg bg-white p-2 ${
            isNormal
              ? "text-emerald-600"
              : "text-amber-600"
          }`}
        >
          {isNormal ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-wide ${
              isNormal
                ? "text-emerald-700"
                : "text-amber-700"
            }`}
          >
            Status kesehatan saat ini
          </p>

          <h3
            className={`mt-1 text-base font-bold ${
              isNormal
                ? "text-emerald-900"
                : "text-amber-900"
            }`}
          >
            {status}
          </h3>

          <p
            className={`mt-1 text-sm leading-6 ${
              isNormal
                ? "text-emerald-800"
                : "text-amber-800"
            }`}
          >
            {isNormal
              ? "Tidak terdapat perhatian kesehatan aktif berdasarkan data pemantauan."
              : "Terdapat informasi kesehatan yang perlu ditinjau atau dipantau lebih lanjut."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ALERGI / KONDISI KHUSUS
   ========================================================= */

function HealthInfoCard({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      {items.length > 0 ? (
        <div className="mt-3 space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-start gap-2"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />

              <p className="text-sm leading-6 text-slate-700">
                {item}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PEMERIKSAAN TERAKHIR
   ========================================================= */

function LastCheckup({
  record,
  onEdit,
  onDelete,
}: {
  record: HealthRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-slate-500" />

        <h3 className="text-sm font-semibold text-slate-900">
          Pemeriksaan Terakhir
        </h3>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-slate-900">
                {record.title}
              </h4>

              <StatusBadge status={record.status} />
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {record.summary}
            </p>

            {record.notes && (
              <p className="mt-2 text-sm leading-6 text-slate-500">
                <span className="font-medium text-slate-700">
                  Catatan:
                </span>{" "}
                {record.notes}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 md:items-end">
            <div className="space-y-2 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(record.recordedAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span>{record.recordedBy}</span>
              </div>
            </div>

            <RecordActions
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   RIWAYAT KESEHATAN
   ========================================================= */

function HealthHistory({
  history,
  onEdit,
  onDelete,
}: {
  history: HealthRecord[];
  onEdit: (record: HealthRecord) => void;
  onDelete: (record: HealthRecord) => void;
}) {
  return (
    <div className="mt-8">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Riwayat Kesehatan
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Catatan pemantauan kesehatan dari waktu ke waktu.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
          <p className="text-sm text-slate-500">
            Belum ada riwayat kesehatan.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute bottom-0 left-[7px] top-2 w-px bg-slate-200" />

          <div className="space-y-6">
            {history.map((record) => (
              <div
                key={record.id}
                className="relative flex gap-4"
              >
                <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-4 border-white bg-slate-300 ring-1 ring-slate-200" />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {record.title}
                        </p>

                        <StatusBadge status={record.status} />
                      </div>

                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        {record.summary}
                      </p>

                      {record.notes && (
                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {record.notes}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-slate-400">
                        Dicatat oleh {record.recordedBy}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                      <span className="text-xs text-slate-400">
                        {formatDate(record.recordedAt)}
                      </span>

                      <RecordActions
                        onEdit={() => onEdit(record)}
                        onDelete={() => onDelete(record)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
   ========================================================= */

function RecordActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Hapus
      </button>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({
  status,
}: {
  status: HealthRecord["status"];
}) {
  const isNormal = status === "Normal";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${
        isNormal
          ? "bg-emerald-50 text-emerald-700"
          : status === "Penting"
            ? "bg-red-50 text-red-700"
            : "bg-amber-50 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   DELETE DIALOG
   ========================================================= */

function DeleteHealthDialog({
  record,
  onCancel,
  onConfirm,
}: {
  record: HealthRecord;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Hapus catatan kesehatan?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Catatan{" "}
            <span className="font-medium text-slate-700">
              "{record.title}"
            </span>{" "}
            akan dihapus dan tidak dapat dikembalikan.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

