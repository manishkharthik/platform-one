"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BookOpen } from "lucide-react";

type UserSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  totalBookedHours?: number;
  numberOfEventsBooked?: number;
  userName?: string;
  userRole?: string;
};

export default function UserSidebar({
  sidebarOpen,
  totalBookedHours = 0,
  numberOfEventsBooked = 0,
  userName = "User",
  userRole = "Participant",
}: UserSidebarProps) {
  const pathname = usePathname();
  const isCalendarActive = pathname === "/calendar";
  const isBookingsActive = pathname === "/bookings";
  return (
    <aside
      className={`${
        sidebarOpen ? "w-64" : "w-0"
      } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-200">
        <Link href="/calendar" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-black">Platform One</span>
        </Link>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-xs font-semibold text-white">
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-gray-900 truncate">{userName}</div>
            <div className="text-xs text-gray-600 uppercase font-semibold">{userRole}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <Link
          href="/calendar"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
            isCalendarActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="font-semibold">Browse Events</span>
        </Link>

        <Link
          href="/bookings"
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-6 ${
            isBookingsActive
              ? "bg-slate-900 text-white font-semibold"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-semibold">My Bookings</span>
        </Link>

        {/* Statistics Section */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">Your Stats</p>
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-gray-600 font-medium mb-1">Total Booked Hours</p>
              <p className="text-lg font-bold text-slate-900">{totalBookedHours.toFixed(1)} hrs</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-gray-600 font-medium mb-1">Events Booked</p>
              <p className="text-lg font-bold text-slate-900">{numberOfEventsBooked}</p>
            </div>
          </div>
        </div>

        {/* Event Categories */}
        <div className="px-4 py-2">
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Categories</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">Workshops</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">Counseling</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-green-50 transition-colors">
              <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">Community</span>
            </div>
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-purple-50 transition-colors">
              <div className="w-3 h-3 rounded-full bg-purple-500 flex-shrink-0"></div>
              <span className="text-sm text-gray-700">Volunteering</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>© 2026 Platform One</p>
      </div>
    </aside>
  );
}
