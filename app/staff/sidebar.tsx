"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ClipboardList, Users, Plus, ShieldCheck } from "lucide-react";

type Category = {
  name: string;
  color: string;
  dotColor: string;
  value: "workshops" | "counseling" | "community" | "volunteering";
};

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: Category[];
  adminName?: string;
  adminRole?: string;
};

export default function Sidebar({
  sidebarOpen,
  categories,
  adminName = "Admin",
  adminRole = "Staff",
}: SidebarProps) {
  const pathname = usePathname();
  
  const isDashboardActive = pathname === "/staff";
  const isAttendanceActive = pathname === "/staffattendance";
  const isParticipantsActive = pathname === "/staffparticipants";
  const isVolunteersActive = pathname === "/staffvolunteers";

  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200">
        <Link href="/staff" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-black">PlatformOne</span>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold text-white">
            {adminName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">{adminName}</div>
            <div className="text-xs text-gray-600 uppercase font-semibold">{adminRole}</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Link
          href="/staff/create-event"
          className="w-full flex items-center justify-center gap-2 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-bold">Create Event</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <Link
          href="/staff"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isDashboardActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="font-semibold">Dashboard</span>
        </Link>

        <Link
          href="/staffattendance"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isAttendanceActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="font-semibold">Attendance</span>
        </Link>

        <Link
          href="/staffparticipants"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isParticipantsActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">Manage Users</span>
        </Link>

        <Link
          href="/staffvolunteers"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-6 ${
            isVolunteersActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">Manage Volunteers</span>
        </Link>

        {categories.length > 0 && (
          <div className="px-4 py-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.name} className="w-full flex items-center gap-3 py-2 px-2">
                  <div className={`w-3 h-3 rounded-full ${cat.dotColor}`} />
                  <span className="text-sm text-gray-700 font-medium">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>© 2026 Platform One</p>
      </div>
    </aside>
  );
}