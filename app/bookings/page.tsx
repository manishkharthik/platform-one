"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import UserSidebar from "../components/UserSidebar";
import UserDropdown from "../components/UserDropdown";

interface Event {
  id: string;
  name: string;
  start: string;
  end: string;
  location: string;
  minTier: string;
}

interface Booking {
  id: string;
  userId: string;
  eventId: string;
  roleAtBooking: "PARTICIPANT" | "VOLUNTEER";
  createdAt: string;
  event: Event;
}

interface BookingsByStatus {
  upcoming: Booking[];
  completed: Booking[];
}

export default function BookingsParticipantPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingsByStatus>({
    upcoming: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Participant");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalBookedHours, setTotalBookedHours] = useState<number>(0);
  const [numberOfEventsBooked, setNumberOfEventsBooked] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchUserAndBookings = async () => {
      try {
        setLoading(true);
        // Fetch first participant user
        const userResponse = await fetch("/api/users?role=PARTICIPANT&take=1");
        if (userResponse.ok) {
          const users = await userResponse.json();
          if (users[0]) {
            const currentUserId = users[0].id;
            setUserId(currentUserId);
            setUserName(users[0].name || "Participant");

            // Fetch bookings for this user
            const bookingsResponse = await fetch(
              `/api/bookings?userId=${currentUserId}`
            );
            if (bookingsResponse.ok) {
              const bookingsData = await bookingsResponse.json();
              const now = new Date();

              // Separate into upcoming and completed
              const upcoming = bookingsData.filter(
                (booking: Booking) => new Date(booking.event.start) > now
              );
              const completed = bookingsData.filter(
                (booking: Booking) => new Date(booking.event.start) <= now
              );

              // Sort upcoming by start time (earliest first)
              upcoming.sort(
                (a: Booking, b: Booking) =>
                  new Date(a.event.start).getTime() -
                  new Date(b.event.start).getTime()
              );

              setBookings({
                upcoming,
                completed,
              });

              // Calculate total booked hours and count events
              let totalHours = 0;
              bookingsData.forEach((booking: Booking) => {
                const eventStart = new Date(booking.event.start);
                const eventEnd = new Date(booking.event.end);
                const hours =
                  (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
                totalHours += hours;
              });

              setTotalBookedHours(Math.round(totalHours * 10) / 10); // Round to 1 decimal
              setNumberOfEventsBooked(bookingsData.length);
            } else {
              setError("Failed to fetch bookings");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An error occurred while loading bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndBookings();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-SG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filterBookings = (bookingsList: Booking[]) => {
    if (!searchQuery.trim()) {
      return bookingsList;
    }
    const query = searchQuery.toLowerCase();
    return bookingsList.filter(
      (booking) =>
        booking.event.name.toLowerCase().includes(query) ||
        booking.event.location.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <UserSidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          totalBookedHours={totalBookedHours}
          numberOfEventsBooked={numberOfEventsBooked}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        totalBookedHours={totalBookedHours}
        numberOfEventsBooked={numberOfEventsBooked}
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
            <div>
              <p className="text-xs text-gray-500">
                Calendar / My Bookings
              </p>
              <h2 className="text-lg font-bold text-gray-900">
                My Bookings
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white w-72"
              />
              <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            <UserDropdown
              userName={userName}
              userRole="PARTICIPANT"
            />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mt-2">View your upcoming and completed events</p>
            </div>
            <Link
              href="/calendar"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Browse Events
            </Link>
          </div>
        </div>



        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
          </div>
        )}

        {bookings.upcoming.length === 0 && bookings.completed.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring events to make your first booking!
            </p>
            <Link
              href="/calendar"
              className="inline-block px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <>
            {/* Upcoming Events */}
            {filterBookings(bookings.upcoming).length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Upcoming Events
                </h2>
                <div className="grid gap-4">
                  {filterBookings(bookings.upcoming).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-green-500"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.event.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Role: {booking.roleAtBooking}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          Upcoming
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            {formatDate(booking.event.start)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-sm">{booking.event.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        Ends: {formatDate(booking.event.end)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Events */}
            {filterBookings(bookings.completed).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Completed Events
                </h2>
                <div className="grid gap-4">
                  {filterBookings(bookings.completed).map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-gray-400 opacity-75"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.event.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Role: {booking.roleAtBooking}
                          </p>
                        </div>
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-sm">
                            {formatDate(booking.event.start)}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <svg
                            className="w-5 h-5 mr-2 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-sm">{booking.event.location}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600">
                        Ended: {formatDate(booking.event.end)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </main>
    </div>
  );
}
