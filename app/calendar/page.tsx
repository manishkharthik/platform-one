"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  Calendar,
  ArrowRight,
  AlertCircle,
  Grid3x3,
  List,
} from "lucide-react";
import EventDetailModal from "./components/EventDetailModal";
import UserDropdown from "../components/UserDropdown";
import UserSidebar from "../components/UserSidebar";

type CalendarEvent = {
  id: string;
  name: string;
  start: string;
  end: string;
  location: string;
  minTier: string;
};

type FilterType = "all" | "booked";
type ViewType = "month" | "week";

// Mock user data - In production, this would come from authentication context
// Using the first seed user from the database (walter@participant.com)
const MOCK_USER = {
  id: "", // Will be set from localStorage or hardcoded after first login
  name: "Walter Sullivan",
  role: "PARTICIPANT" as "PARTICIPANT" | "VOLUNTEER",
};

// Placeholder - should be replaced with actual authentication
// For now, we'll fetch the first participant user from the database
// const getUserId = async () => {
//   try {
//     const response = await fetch("/api/users?role=PARTICIPANT&take=1");
//     if (response.ok) {
//       const users = await response.json();
//       if (users[0]) return users[0].id;
//     }
//   } catch (error) {
//     console.error("Failed to fetch user:", error);
//   }
//   return "";
// };

// Categories no longer displayed in UI but kept for reference
// const categories = [
//   {
//     name: "Workshops",
//     color: "bg-orange-100 text-orange-700",
//     dotColor: "bg-orange-500",
//   },
//   {
//     name: "Counseling",
//     color: "bg-blue-100 text-blue-700",
//     dotColor: "bg-blue-500",
//   },
//   {
//     name: "Community",
//     color: "bg-green-100 text-green-700",
//     dotColor: "bg-green-500",
//   },
//   {
//     name: "Volunteering",
//     color: "bg-purple-100 text-purple-700",
//     dotColor: "bg-purple-500",
//   },
// ];

export default function Home() {
  // const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 18)); // January 18, 2026
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("Participant");
  const [totalBookedHours, setTotalBookedHours] = useState<number>(0);
  const [numberOfEventsBooked, setNumberOfEventsBooked] = useState<number>(0);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [bookedEventIds, setBookedEventIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewType, setViewType] = useState<ViewType>("month");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchUserAndEvents();
  }, []);

  const fetchUserAndEvents = async () => {
    try {
      setLoading(true);
      // Fetch first participant user
      const userResponse = await fetch("/api/users?role=PARTICIPANT&take=1");
      if (userResponse.ok) {
        const users = await userResponse.json();
        if (users[0]) {
          const currentUserId = users[0].id;
          setUserId(currentUserId);
          setUserName(users[0].name);

          // Fetch user's bookings
          const bookingsResponse = await fetch(
            `/api/bookings?userId=${currentUserId}`
          );
          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();

            // Calculate total booked hours and count events
            let totalHours = 0;
            const bookedIds = new Set<string>();

            bookingsData.forEach((booking: { eventId: string; event: { start: string; end: string } }) => {
              bookedIds.add(booking.eventId);
              const eventStart = new Date(booking.event.start);
              const eventEnd = new Date(booking.event.end);
              const hours =
                (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
              totalHours += hours;
            });

            setTotalBookedHours(Math.round(totalHours * 10) / 10); // Round to 1 decimal
            setNumberOfEventsBooked(bookingsData.length);
            setBookedEventIds(bookedIds);
          }
        }
      }

      // Fetch events
      const eventsResponse = await fetch("/api/events");
      if (eventsResponse.ok) {
        const data = await eventsResponse.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error("Failed to fetch events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // const handleBookingsClick = () => {
  //   router.push("/bookings");
  // };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
  };

  const handleBookingSuccess = async () => {
    setSuccessMessage("Successfully booked the event!");
    
    // Refresh events and update booked events list
    try {
      // Fetch updated bookings
      if (userId) {
        const bookingsResponse = await fetch(`/api/bookings?userId=${userId}`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const bookedIds = new Set<string>();
          let totalHours = 0;
          
          bookingsData.forEach((booking: { eventId: string; event: { start: string; end: string } }) => {
            bookedIds.add(booking.eventId);
            const eventStart = new Date(booking.event.start);
            const eventEnd = new Date(booking.event.end);
            const hours =
              (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
            totalHours += hours;
          });
          
          setBookedEventIds(bookedIds);
          setTotalBookedHours(Math.round(totalHours * 10) / 10); // Round to 1 decimal
          setNumberOfEventsBooked(bookingsData.length);
        }
      }
      
      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
    
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleUnbookSuccess = async () => {
    setSuccessMessage("Successfully cancelled your booking!");
    
    // Refresh events and update booked events list
    try {
      // Fetch updated bookings
      if (userId) {
        const bookingsResponse = await fetch(`/api/bookings?userId=${userId}`);
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          const bookedIds = new Set<string>();
          let totalHours = 0;
          
          bookingsData.forEach((booking: { eventId: string; event: { start: string; end: string } }) => {
            bookedIds.add(booking.eventId);
            const eventStart = new Date(booking.event.start);
            const eventEnd = new Date(booking.event.end);
            const hours =
              (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60 * 60);
            totalHours += hours;
          });
          
          setBookedEventIds(bookedIds);
          setTotalBookedHours(Math.round(totalHours * 10) / 10); // Round to 1 decimal
          setNumberOfEventsBooked(bookingsData.length);
        }
      }
      
      // Refresh events
      fetchEvents();
    } catch (error) {
      console.error("Error refreshing bookings:", error);
    }
    
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Generate calendar days for the current month
  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startingDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0, so subtract 1 and handle Sunday
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days = [];
    
    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = adjustedStart - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
      });
    }
    
    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
      });
    }
    
    // Add next month's days to fill the grid
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6 rows × 7 days
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentDate);

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      const matchesDate = (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
      
      if (!matchesDate) return false;
      
      // Apply filter based on selected filter type
      if (filterType === "booked") {
        if (!bookedEventIds.has(event.id)) return false;
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  const getCategoryColor = (eventName: string) => {
    // Simple categorization based on event name keywords
    const name = eventName.toLowerCase();
    if (name.includes("workshop")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (name.includes("counseling") || name.includes("session")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (name.includes("community") || name.includes("park")) return "bg-green-100 text-green-700 border-green-200";
    if (name.includes("volunteer")) return "bg-purple-100 text-purple-700 border-purple-200";
    return "bg-gray-100 text-gray-700 border-gray-200"; // default
  };

  // Helper functions for date manipulation
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const monthStart = startDate.toLocaleString("en-US", { month: "short", day: "numeric" });
    const monthEnd = endDate.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${monthStart} - ${monthEnd}`;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleString("en-US", { month: "long", year: "numeric" });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  };

  const getEventsInRange = (startDate: Date, endDate: Date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      const matchesDateRange = eventStart <= endDate && eventEnd >= startDate;
      
      if (!matchesDateRange) return false;
      
      // Apply filter based on selected filter type
      if (filterType === "booked") {
        if (!bookedEventIds.has(event.id)) return false;
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          event.name.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Week View Component
  type WeekViewProps = {
    currentDate: Date;
    getWeekStart: (date: Date) => Date;
    getEventsInRange: (startDate: Date, endDate: Date) => CalendarEvent[];
    handleEventClick: (eventId: string) => void;
    getCategoryColor: (eventName: string) => string;
  };

  const WeekView = ({
    currentDate,
    getWeekStart,
    getEventsInRange,
    handleEventClick,
    getCategoryColor,
  }: WeekViewProps) => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });

    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);
    const rangeEvents = getEventsInRange(weekStart, weekEnd);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Week Header */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="col-span-1 border-r border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-600">TIME</p>
          </div>
          {weekDays.map((date, index) => {
            const isToday =
              date.toDateString() === new Date().toDateString();
            return (
              <div
                key={index}
                className={`col-span-1 p-3 text-center border-r border-gray-200 ${
                  isToday ? "bg-red-50" : ""
                }`}
              >
                <p className="text-xs font-semibold text-gray-600">
                  {date.toLocaleString("en-US", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-bold ${
                    isToday ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Week Grid */}
        <div className="overflow-x-auto flex-1">
          <div 
            className="grid border-collapse"
            style={{
              gridTemplateColumns: `60px repeat(7, 1fr)`,
              gridAutoRows: '80px',
            }}
          >
            {/* Time Labels */}
            <div className="border-r border-gray-200 bg-gray-50">
              {hoursOfDay.map((hour) => (
                <div
                  key={`time-${hour}`}
                  className="border-b border-gray-100 h-20 p-2 text-xs text-gray-500 font-semibold flex items-start"
                >
                  {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((date, dayIndex) => {
              const dayStartTime = new Date(date);
              dayStartTime.setHours(0, 0, 0, 0);
              const dayEndTime = new Date(date);
              dayEndTime.setHours(23, 59, 59, 999);

              const dayEvents = rangeEvents.filter((event) => {
                const eventStart = new Date(event.start);
                return eventStart.toDateString() === date.toDateString();
              });

              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={`day-${dayIndex}`}
                  className={`border-r border-gray-200 relative ${
                    isToday ? "bg-red-50" : ""
                  }`}
                  style={{
                    gridColumn: dayIndex + 2,
                    gridRow: `1 / ${hoursOfDay.length + 1}`,
                  }}
                >
                  {/* Hour slot backgrounds */}
                  {hoursOfDay.map((hour) => (
                    <div
                      key={`slot-${hour}`}
                      className="border-b border-gray-100 h-20 hover:bg-red-50 transition-colors"
                    />
                  ))}

                  {/* Events positioned absolutely */}
                  {dayEvents.map((event) => {
                    const eventStart = new Date(event.start);
                    const eventEnd = new Date(event.end);
                    const startHour = eventStart.getHours();
                    const startMinute = eventStart.getMinutes();
                    const endHour = eventEnd.getHours();
                    const endMinute = eventEnd.getMinutes();

                    const duration = endHour - startHour;
                    const topOffset = (startHour * 80) + (startMinute / 60) * 80;
                    const height = (duration * 80) + ((endMinute - startMinute) / 60) * 80;

                    return (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event.id)}
                        className={`absolute left-0.5 right-0.5 px-1.5 py-1 rounded border ${getCategoryColor(
                          event.name
                        )} font-semibold cursor-pointer hover:shadow-lg transition-all overflow-hidden text-xs m-0.5`}
                        style={{
                          top: `${topOffset}px`,
                          height: `${Math.max(30, height)}px`,
                          zIndex: 10,
                        }}
                        title={`${event.name} - Click to sign up`}
                      >
                        <div className="flex flex-col items-start justify-center h-full">
                          <span className="font-semibold line-clamp-3 break-words">
                            {event.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="flex h-screen bg-gray-50">
      <UserSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        totalBookedHours={totalBookedHours}
        numberOfEventsBooked={numberOfEventsBooked}
        userName={userName}
        userRole="PARTICIPANT"
      />

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
              <div>
                <p className="text-xs text-gray-500">
                  Calendar / Browse Events
                </p>
                <h2 className="text-lg font-bold text-gray-900">
                  {viewType === "month"
                    ? formatMonthYear(currentDate)
                    : viewType === "week"
                    ? formatDateRange(getWeekStart(currentDate), getWeekEnd(currentDate))
                    : formatDayName(currentDate)}
                </h2>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <button
                onClick={handleToday}
                className="px-4 py-2 text-slate-900 font-bold hover:bg-slate-100 rounded-lg"
              >
                TODAY
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar - Toggleable */}
              {searchOpen && (
                <div className="relative animate-in fade-in duration-200">
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onBlur={() => {
                      if (searchQuery === "") {
                        setSearchOpen(false);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-64"
                  />
                </div>
              )}
              
              {/* Search Icon Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Search events"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
              
              <UserDropdown
                userName={userName}
                userRole="PARTICIPANT"
              />
            </div>
          </div>
        </header>

        {/* Success Message */}
        {successMessage && (
          <div className="mx-8 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-green-800">
              {successMessage}
            </p>
          </div>
        )}

        {/* Filter and View Toggle Section */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Show Events Filter */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Show:</span>
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === "all"
                      ? "bg-slate-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Events
                </button>
                <button
                  onClick={() => setFilterType("booked")}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === "booked"
                      ? "bg-slate-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Booked Events
                </button>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                <span className="text-sm font-semibold text-gray-700">View:</span>
                <div className="flex gap-2 bg-white rounded-lg border border-gray-300 p-1.5">
                  <button
                    onClick={() => setViewType("month")}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                      viewType === "month"
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title="Month view"
                  >
                    <div className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4" />
                      <span>Month</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewType("week")}
                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                      viewType === "week"
                        ? "bg-slate-900 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    title="Week view"
                  >
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" />
                      <span>Week</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Help Banner */}
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-900">Click events to sign up</p>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid / Views */}
        <div className="flex-1 overflow-auto p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <p className="mt-4 text-gray-600">Loading events...</p>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold mb-2">No events available</p>
                <p className="text-sm text-gray-400">Check back later for upcoming events to sign up for.</p>
              </div>
            </div>
          ) : (
            <>
              {/* MONTH VIEW */}
              {viewType === "month" && (
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
                                onClick={() => handleEventClick(event.id)}
                                className={`text-xs px-2 py-1 rounded border ${getCategoryColor(
                                  event.name
                                )} font-semibold cursor-pointer hover:shadow-md transition-all group relative line-clamp-3`}
                                title={`${event.name} - Click to sign up`}
                              >
                                <div className="flex items-start gap-1 gap-y-0.5">
                                  <span className="flex-1 break-words whitespace-normal leading-tight">
                                    {event.name}
                                  </span>
                                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* WEEK VIEW */}
              {viewType === "week" && (
                <WeekView
                  currentDate={currentDate}
                  getWeekStart={getWeekStart}
                  getEventsInRange={getEventsInRange}
                  handleEventClick={handleEventClick}
                  getCategoryColor={getCategoryColor}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Event Detail Modal */}
      {userId && (
        <EventDetailModal
          isOpen={isModalOpen}
          eventId={selectedEventId}
          userId={userId}
          userRole={MOCK_USER.role}
          onClose={handleCloseModal}
          onBookingSuccess={handleBookingSuccess}
          onUnbookSuccess={handleUnbookSuccess}
        />
      )}
    </div>
  );
}
