"use client";

import Link from "next/link";
import { Calendar, LayoutGrid, ClipboardList, MessageSquare, Users, Plus, ShieldCheck } from "lucide-react";

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
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  categories,
  setShowCreateModal,
}: SidebarProps) {
  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-black">AdminPanel</span>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold">
            WA
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">Walter Admin</div>
            <div className="text-xs text-gray-500 uppercase font-medium">Staff</div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2 text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-bold">Create Event</span>
        </button>
      </div>

      <nav className="flex-1 px-2">
        <Link
          href="/staff"
          className="w-full flex items-center gap-3 px-4 py-3 bg-slate-900 text-white rounded-lg transition-colors mb-1"
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="font-semibold">Dashboard</span>
        </Link>

        <Link
          href="/staffcalendar"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
        >
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Calendar</span>
        </Link>

        <Link
          href="/staffattendance"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="font-semibold">Attendance</span>
        </Link>

        <Link
          href="/staffparticipants"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1"
        >
          <Users className="w-5 h-5" />
          <span className="font-semibold">Participants</span>
        </Link>

        <Link
          href="/staffreports"
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">Reports</span>
        </Link>

        <div className="mt-8 px-2">
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
      </nav>
    </aside>
  );
}