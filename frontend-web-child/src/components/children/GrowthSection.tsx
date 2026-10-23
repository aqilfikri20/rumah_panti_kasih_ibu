import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../services/AppDataContext";

import type {
  GrowthInfo,
  GrowthRecord,
} from "../../types/growth";

import type {
  GrowthAssessment,
  GrowthIndicator,
} from "../../types/growthAssessment";

import GrowthRecordForm from "./GrowthRecordForm";

interface GrowthSectionProps {
  growth: GrowthInfo;
  assessment?: GrowthAssessment;
  childId: number;
  dateOfBirth: string;
  gender: "Laki-laki" | "Perempuan";
}

export default function GrowthSection({
  growth,
  assessment,
  childId,
  dateOfBirth,
  gender,
}: GrowthSectionProps) {
  const { createGrowthRecord, updateGrowthRecord, deleteGrowthRecord } = useAppData();
  const [showForm, setShowForm] = useState(false);

  const [editingRecord, setEditingRecord] =
    useState<GrowthRecord | null>(null);

  const [deletingRecord, setDeletingRecord] =
    useState<GrowthRecord | null>(null);

  const [records, setRecords] = useState<GrowthRecord[]>(
    growth.history,
  );
  useEffect(() => setRecords(growth.history), [growth.history]);

  /*
   * Data untuk tampilan selalu diurutkan
   * dari pengukuran terbaru ke terlama.
   */
  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) =>
        new Date(b.recordedAt).getTime() -
        new Date(a.recordedAt).getTime(),
    );
  }, [records]);

  const latestRecord = sortedRecords[0];

  async function handleAddRecord(record: GrowthRecord) {
    try {
      await createGrowthRecord(childId, record);
      setShowForm(false);
    } catch { /* Shared API banner reports errors. */ }
  }

  async function handleEditRecord(record: GrowthRecord) {
    try { await updateGrowthRecord(record); setEditingRecord(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  async function handleDeleteRecord() {
    if (!deletingRecord) {
      return;
    }

    try { await deleteGrowthRecord(deletingRecord.id); setDeletingRecord(null); }
    catch { /* Shared API banner reports errors. */ }
  }

  /*
   * Jika belum ada pengukuran,
   * tampilkan empty state.
   */
  if (!latestRecord) {
    return (
      <>
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Pertumbuhan
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Catatan pengukuran pertumbuhan anak.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
            >
              <Plus className="h-4 w-4" />
              Catat Pengukuran
            </button>
          </div>

          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              Belum ada pengukuran
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Belum terdapat data pengukuran pertumbuhan
              anak.
            </p>
          </div>
        </section>

        {showForm && (
          <GrowthRecordForm
            childId={childId}
            onSubmit={handleAddRecord}
            onClose={() => setShowForm(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Pertumbuhan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pemantauan hasil pengukuran pertumbuhan anak.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-800"
          >
            <Plus className="h-4 w-4" />
            Catat Pengukuran
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Assessment */}
          {assessment && <GrowthAssessmentCard assessment={assessment} />}

          {/* Current measurement */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MeasurementCard
              label="Berat Badan"
              value={latestRecord.weight}
              unit="kg"
            />

            <MeasurementCard
              label="Tinggi Badan"
              value={latestRecord.height}
              unit="cm"
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-4 w-4" />

                <span className="text-xs font-medium">
                  Pengukuran Terakhir
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-900">
                {formatDate(latestRecord.recordedAt)}
              </p>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <UserRound className="h-3.5 w-3.5" />

                {latestRecord.recordedBy}
              </div>
            </div>
          </div>

          {/* Chart */}
          <GrowthChart records={records} dateOfBirth={dateOfBirth} gender={gender} />

          {/* History */}
          <GrowthHistory
            records={sortedRecords}
            onEdit={setEditingRecord}
            onDelete={setDeletingRecord}
          />
        </div>
      </section>

      {/* Tambah */}
      {showForm && (
        <GrowthRecordForm
          childId={childId}
          onSubmit={handleAddRecord}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit */}
      {editingRecord && (
        <GrowthRecordForm
          childId={childId}
          record={editingRecord}
          onSubmit={handleEditRecord}
          onClose={() => setEditingRecord(null)}
        />
      )}

      {/* Hapus */}
      {deletingRecord && (
        <DeleteGrowthDialog
          record={deletingRecord}
          onCancel={() => setDeletingRecord(null)}
          onConfirm={handleDeleteRecord}
        />
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Assessment                                                                 */
/* -------------------------------------------------------------------------- */

function GrowthAssessmentCard({
  assessment,
}: {
  assessment: GrowthAssessment;
}) {
  const isNormal = assessment.status === "Normal";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isNormal
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-amber-200 bg-amber-50/70"
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isNormal
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {isNormal ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <ClipboardCheck className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">
                Assessment Pertumbuhan
              </h3>

              <GrowthBadge status={assessment.status} />
            </div>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {assessment.summary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {assessment.indicators.map((indicator) => (
            <IndicatorCard
              key={indicator.type}
              indicator={indicator}
            />
          ))}
        </div>

        <div className="border-t border-slate-200/70 pt-4">
          <p className="text-xs leading-5 text-slate-500">
            {assessment.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

function IndicatorCard({
  indicator,
}: {
  indicator: GrowthIndicator;
}) {
  const isNormal = indicator.status === "Normal";

  return (
    <div className="rounded-xl border border-white/80 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">
          {indicator.type}
        </p>

        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            isNormal
              ? "bg-emerald-500"
              : "bg-amber-500"
          }`}
        />
      </div>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-xl font-bold text-slate-900">
          {indicator.value}
        </span>

        <span className="mb-0.5 text-xs text-slate-400">
          {indicator.unit}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {indicator.interpretation}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Measurement                                                                */
/* -------------------------------------------------------------------------- */

function MeasurementCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </span>

        <span className="mb-1 text-sm text-slate-400">
          {unit}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chart                                                                      */
/* -------------------------------------------------------------------------- */

function GrowthChart({
  records,
  dateOfBirth,
  gender,
}: {
  records: GrowthRecord[];
  dateOfBirth: string;
  gender: "Laki-laki" | "Perempuan";
}) {
  /*
   * Grafik harus berjalan dari waktu paling lama
   * ke waktu paling baru.
   */
  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(a.recordedAt).getTime() -
      new Date(b.recordedAt).getTime(),
  );

  if (sortedRecords.length < 2) {
    return (
      <div className="rounded-2xl border border-slate-200 p-5">
        <div>
          <h3 className="font-semibold text-slate-900">
            Riwayat Pertumbuhan
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Grafik akan tersedia setelah terdapat minimal
            dua pengukuran.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div>
        <h3 className="font-semibold text-slate-900">
          Riwayat Pertumbuhan
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Perubahan berat dan tinggi berdasarkan pengukuran
          yang tercatat.
        </p>
      </div>

      <div className="mt-6 space-y-8">
        <GrowthLineChart
          title="Berat Badan"
          unit="kg"
          records={sortedRecords}
          valueKey="weight"
          dateOfBirth={dateOfBirth}
          gender={gender}
        />

        <GrowthLineChart
          title="Tinggi Badan"
          unit="cm"
          records={sortedRecords}
          valueKey="height"
          dateOfBirth={dateOfBirth}
          gender={gender}
        />
      </div>
    </div>
  );
}

function GrowthLineChart({
  title,
  unit,
  records,
  valueKey,
  dateOfBirth,
  gender,
}: {
  title: string;
  unit: string;
  records: GrowthRecord[];
  valueKey: "weight" | "height";
  dateOfBirth: string;
  gender: "Laki-laki" | "Perempuan";
}) {
  const width = 760;
  const height = 220;

  const padding = {
    top: 20,
    right: 20,
    bottom: 35,
    left: 45,
  };

  const referenceValues = records.map((record) =>
    whoMedianAtAge(dateOfBirth, record.recordedAt, gender, valueKey),
  );
  const values = records.map(
    (record) => record[valueKey],
  );

  const minValue = Math.min(...values, ...referenceValues);
  const maxValue = Math.max(...values, ...referenceValues);

  const range =
    maxValue - minValue === 0
      ? 1
      : maxValue - minValue;

  const pointFor = (value: number, index: number) => {
    const x =
      padding.left +
      (index / (records.length - 1)) *
        (width - padding.left - padding.right);

    const y =
      padding.top +
      (1 -
        (value - minValue) / range) *
        (height -
          padding.top -
          padding.bottom);

    return {
      x,
      y,
      value,
    };
  };
  const points = records.map((record, index) => ({
    ...pointFor(record[valueKey], index),
    date: record.recordedAt,
  }));
  const referencePoints = referenceValues.map((value, index) => pointFor(value, index));

  const path = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`,
    )
    .join(" ");
  const referencePath = referencePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-800">
          {title}
        </h4>

        <span className="text-xs text-slate-400">
          {unit}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 bg-blue-600" />Median acuan WHO (perkiraan)</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 bg-black" />Pengukuran anak</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[600px] w-full"
        >
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-slate-200"
          />

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="currentColor"
            className="text-slate-200"
          />

          <path
            d={referencePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={path}
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={`${point.date}-${point.value}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                className="fill-white stroke-slate-700"
                strokeWidth="2"
              />

              {(index % 3 === 0 || index === points.length - 1) && <text
                x={point.x}
                y={height - 12}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {formatShortDate(point.date)}
              </text>}
            </g>
          ))}

          <text
            x={10}
            y={padding.top + 4}
            className="fill-slate-400 text-[10px]"
          >
            {maxValue}
          </text>

          <text
            x={10}
            y={height - padding.bottom}
            className="fill-slate-400 text-[10px]"
          >
            {minValue}
          </text>
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* History                                                                    */
/* -------------------------------------------------------------------------- */

function GrowthHistory({
  records,
  onEdit,
  onDelete,
}: {
  records: GrowthRecord[];
  onEdit: (record: GrowthRecord) => void;
  onDelete: (record: GrowthRecord) => void;
}) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900">
          Riwayat Pengukuran
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Daftar seluruh pengukuran yang tercatat.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[800px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Tanggal
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Berat
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Tinggi
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Catatan
              </th>

              <th className="px-4 py-3 text-xs font-semibold text-slate-500">
                Dicatat Oleh
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-t border-slate-100"
              >
                <td className="px-4 py-4 text-sm font-medium text-slate-700">
                  {formatDate(record.recordedAt)}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {record.weight} kg
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {record.height} cm
                </td>

                <td className="max-w-xs px-4 py-4 text-sm text-slate-500">
                  {record.notes || "-"}
                </td>

                <td className="px-4 py-4 text-sm text-slate-600">
                  {record.recordedBy}
                </td>

                <td className="px-4 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(record)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Dialog                                                              */
/* -------------------------------------------------------------------------- */

function DeleteGrowthDialog({
  record,
  onCancel,
  onConfirm,
}: {
  record: GrowthRecord;
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
            Hapus pengukuran?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Data pengukuran tanggal{" "}
            <span className="font-medium text-slate-700">
              {formatDate(record.recordedAt)}
            </span>{" "}
            akan dihapus dan tidak dapat dikembalikan.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">
                  Berat
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {record.weight} kg
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Tinggi
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {record.height} cm
                </p>
              </div>
            </div>
          </div>
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const WHO_MEDIAN_REFERENCE = {
  Perempuan: {
    height: [[12,74.0],[24,85.7],[36,95.1],[48,102.7],[60,109.4],[72,115.1]],
    weight: [[12,8.9],[24,11.5],[36,13.9],[48,16.1],[60,18.2],[72,20.2]],
  },
  "Laki-laki": {
    height: [[12,75.7],[24,87.1],[36,96.1],[48,103.3],[60,110.0],[72,116.0]],
    weight: [[12,9.6],[24,12.2],[36,14.3],[48,16.3],[60,18.3],[72,20.5]],
  },
} as const;

function whoMedianAtAge(
  dateOfBirth: string,
  recordedAt: string,
  gender: "Laki-laki" | "Perempuan",
  measure: "weight" | "height",
) {
  const [birthYear, birthMonth, birthDay] = dateOfBirth.split("-").map(Number);
  const [year, month, day] = recordedAt.split("-").map(Number);
  let age = (year - birthYear) * 12 + month - birthMonth;
  if (day < birthDay) age -= 1;
  const anchors = WHO_MEDIAN_REFERENCE[gender][measure];
  if (age <= anchors[0][0]) return anchors[0][1];
  for (let index = 1; index < anchors.length; index += 1) {
    const [rightAge, rightValue] = anchors[index];
    const [leftAge, leftValue] = anchors[index - 1];
    if (age <= rightAge) {
      const ratio = (age - leftAge) / (rightAge - leftAge);
      return leftValue + ratio * (rightValue - leftValue);
    }
  }
  return anchors[anchors.length - 1][1];
}

function GrowthBadge({
  status,
}: {
  status: "Normal" | "Perlu Perhatian";
}) {
  const isNormal = status === "Normal";

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        isNormal
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

