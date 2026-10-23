import {
  Bell,
  Bot,
  ClipboardCheck,
  HeartPulse,
  LayoutDashboard,
  PackageOpen,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Data Anak",
    href: "/children",
    icon: Users,
  },
  {
    name: "Data Pengasuh",
    href: "/caregivers",
    icon: Users,
  },
  {
    name: "Kebutuhan",
    href: "/needs",
    icon: PackageOpen,
  },
  {
    name: "Pengingat",
    href: "/reminders",
    icon: Bell,
  },
  {
    name: "Catatan",
    href: "/notes",
    icon: ClipboardCheck,
  },
  {
    name: "AI Assistant",
    href: "/ai",
    icon: Bot,
  },
];

export default function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-slate-50 lg:block">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-emerald-500 shadow-md shadow-violet-200">
            <HeartPulse className="h-5 w-5 text-white" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Rumah Kasih Ibu
            </p>

            <p className="text-[11px] text-slate-500">
              Tumbuh sehat, penuh kasih
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/"}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-violet-700 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4.5 w-4.5" />

                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t border-slate-100 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              AD
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                Admin
              </p>

              <p className="truncate text-xs text-slate-500">
                Pengurus
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}



