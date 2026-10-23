import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Child } from "../../types/child";
import { formatAge } from "../../utils/formatAge";

interface ChildrenTableProps {
  children: Child[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export default function ChildrenTable({ children, page, pageSize, total, onPageChange }: ChildrenTableProps) {
  const navigate = useNavigate();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead><tr className="border-b border-slate-200 bg-slate-50">
            {["Anak", "Umur", "Gender", "Kesehatan", "Kondisi", "Pengasuh"].map((heading) => <th key={heading} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{heading}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {children.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Tidak ada data anak yang sesuai.</td></tr> : children.map((child) => (
              <tr
                key={child.id}
                role="link"
                tabIndex={0}
                aria-label={`Lihat data ${child.name}`}
                onClick={() => navigate(`/children/${child.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/children/${child.id}`);
                  }
                }}
                className="cursor-pointer transition hover:bg-violet-50/60 focus:bg-violet-50 focus:outline-none"
              >
                <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">{child.name.charAt(0)}</div><div><p className="text-sm font-semibold text-slate-900">{child.name}</p><p className="mt-0.5 text-xs text-slate-400">{child.code}</p></div></div></td>
                <td className="px-5 py-4 text-sm text-slate-600">{formatAge(child.dateOfBirth)}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{child.gender}</td>
                <td className="px-5 py-4">{child.health === "Normal" ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Normal</span> : child.health === "Penting" ? <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"><span className="h-1.5 w-1.5 rounded-full bg-rose-500" />Penting</span> : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Perlu perhatian</span>}</td>
                <td className="px-5 py-4">{child.condition === "Normal" ? <span className="text-sm text-slate-600">Normal</span> : <span className="inline-flex rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">Disabilitas</span>}</td>
                <td className="px-5 py-4 text-sm text-slate-600">{child.caregiver || <span className="text-slate-400">Belum ditentukan</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">Menampilkan <span className="font-medium text-slate-700">{firstItem}-{lastItem}</span> dari <span className="font-medium text-slate-700">{total}</span> anak</p>
        <div className="flex items-center gap-1">
          <button type="button" title="Halaman sebelumnya" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-current={page === number ? "page" : undefined} onClick={() => onPageChange(number)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-medium ${page === number ? "bg-violet-700 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{number}</button>)}
          <button type="button" title="Halaman berikutnya" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
