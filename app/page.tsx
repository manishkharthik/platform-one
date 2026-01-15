"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Menu,
  Plus,
  LayoutGrid,
  Calendar,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

type Event = {
  id: number;
  title: string;
  date: number;
  category: "workshops" | "counseling" | "community" | "volunteering";
};

const events: Event[] = [
  { id: 1, title: "Call with Coord.", date: 6, category: "workshops" },
  { id: 2, title: "Community Park", date: 8, category: "community" },
  { id: 3, title: "Counseling Session", date: 13, category: "counseling" },
  { id: 4, title: "Orientation Hub", date: 14, category: "workshops" },
  { id: 5, title: "Layout Review", date: 16, category: "workshops" },
  { id: 6, title: "Service Layout", date: 21, category: "community" },
  { id: 7, title: "Participant Orientation", date: 23, category: "counseling" },
  { id: 8, title: "Volunteering", date: 23, category: "volunteering" },
  { id: 9, title: "Weekend Workshop", date: 25, category: "workshops" },
  { id: 10, title: "Mentorship Call", date: 28, category: "counseling" },
  { id: 11, title: "Staff Meeting", date: 31, category: "community" },
];

const categories = [
  {
    name: "Workshops",
    color: "bg-orange-100 text-orange-700",
    dotColor: "bg-orange-500",
  },
  {
    name: "Counseling",
    color: "bg-blue-100 text-blue-700",
    dotColor: "bg-blue-500",
  },
  {
    name: "Community",
    color: "bg-green-100 text-green-700",
    dotColor: "bg-green-500",
  },
  {
    name: "Volunteering",
    color: "bg-purple-100 text-purple-700",
    dotColor: "bg-purple-500",
  },
];

const categoryStyles = {
  workshops: "bg-orange-100 text-orange-700 border-orange-200",
  counseling: "bg-blue-100 text-blue-700 border-blue-200",
  community: "bg-green-100 text-green-700 border-green-200",
  volunteering: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function Home() {
  const [currentMonth] = useState("January 2025");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // January 2025 calendar data (starting with December 30, 2024 to fill the grid)
  const calendarDays = [
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true },
    { day: 16, isCurrentMonth: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true },
    { day: 31, isCurrentMonth: true },
    { day: 1, isCurrentMonth: false },
    { day: 2, isCurrentMonth: false },
  ];

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return events.filter((event) => event.date === day);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-black">PlatformOne</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Walter Sullivan</div>
              <div className="text-xs text-gray-500 uppercase font-medium">
                Participant
              </div>
            </div>
          </div>
        </div>

        {/* New Request Button */}
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="font-bold">New Request</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-1">
            <LayoutGrid className="w-5 h-5" />
            <span className="font-semibold">Bookings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-lg transition-colors mb-1">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Calendar</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
            <MessageSquare className="w-5 h-5" />
            <span className="font-semibold">Messages</span>
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              12
            </span>
          </button>

          {/* My Bookings */}
          <div className="mt-6 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              My Bookings
            </h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Booked</span>
                <span className="font-bold">14 hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold">2 events</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-4 px-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wide">
              Categories
            </h3>
            <div className="space-y-2">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${category.dotColor}`}
                  ></div>
                  <span className="text-sm text-gray-700 font-medium">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold">{currentMonth}</h1>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-lg">
                TODAY
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-semibold uppercase text-xs tracking-wide">
                  Unity Hub
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {daysOfWeek.map((day, index) => {
                const isWeekend = day === "SAT" || day === "SUN";
                return (
                  <div
                    key={index}
                    className={`px-4 py-3 text-center text-xs font-bold uppercase ${
                      isWeekend ? "text-orange-500" : "text-gray-500"
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayData, index) => {
                const dayEvents = getEventsForDay(
                  dayData.day,
                  dayData.isCurrentMonth
                );

                return (
                  <div
                    key={index}
                    className={`min-h-[120px] border-r border-b border-gray-100 p-3 cursor-pointer transition-colors ${
                      !dayData.isCurrentMonth ? "bg-gray-50" : ""
                    } hover:bg-red-50 `}
                  >
                    <div
                      className={`text-base font-bold mb-2 ${
                        dayData.isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {dayData.day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-2 py-1 rounded border ${
                            categoryStyles[event.category]
                          } font-semibold truncate cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
