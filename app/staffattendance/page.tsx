"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Users, Menu } from "lucide-react";
import Sidebar from "../staff/sidebar";
import UserDropdown from "../components/UserDropdown";

type AttendanceUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  tier: string | null;
  bookingCount: number;
};

export default function StaffAttendancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"participants" | "volunteers">("participants");
  const [participants, setParticipants] = useState<AttendanceUser[]>([]);
  const [volunteers, setVolunteers] = useState<AttendanceUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch participants and volunteers
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);

        // Fetch participants
        const participantsRes = await fetch("/api/users/attendance?role=PARTICIPANT");
        if (participantsRes.ok) {
          const participantsData = await participantsRes.json();
          setParticipants(participantsData);
        }

        // Fetch volunteers
        const volunteersRes = await fetch("/api/users/attendance?role=VOLUNTEER");
        if (volunteersRes.ok) {
          const volunteersData = await volunteersRes.json();
          setVolunteers(volunteersData);
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  const currentData = activeTab === "participants" ? participants : volunteers;
  const roleLabel = activeTab === "participants" ? "Participant" : "Volunteer";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={[]}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            </div>
            <UserDropdown
              userName="Admin"
              userRole="ADMIN"
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-2xl px-6 pt-4">
              <button
                onClick={() => setActiveTab("participants")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "participants"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Participants
              </button>
              <button
                onClick={() => setActiveTab("volunteers")}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === "volunteers"
                    ? "text-slate-900 border-b-2 border-slate-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Volunteers
              </button>
            </div>

            {/* Content Section */}
            <section className="rounded-b-3xl rounded-t-none border border-t-0 border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900">
                  {activeTab === "participants" ? (
                    <Users className="h-5 w-5 text-white" />
                  ) : (
                    <ClipboardList className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {roleLabel} Overview
                  </h2>
                  <p className="text-sm text-gray-500">
                    View all {roleLabel.toLowerCase()}s and their event bookings
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
                    <p className="text-gray-600">Loading {roleLabel.toLowerCase()}s...</p>
                  </div>
                </div>
              ) : currentData.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No {roleLabel.toLowerCase()}s found</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                          Name
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                          Email
                        </th>
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 text-sm">
                          Tier
                        </th>
                        <th className="text-center px-4 py-3 font-semibold text-gray-700 text-sm">
                          Events Booked
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {user.name}
                            </p>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                              user.tier === "GOLD"
                                ? "bg-amber-100 text-amber-700"
                                : user.tier === "SILVER"
                                ? "bg-slate-100 text-slate-700"
                                : user.tier === "PLATINUM"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {user.tier || "N/A"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                              {user.bookingCount}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
