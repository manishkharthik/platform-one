"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./sidebar";
import Header from "./components/Header";
import CalendarGrid from "./components/CalendarGrid";
import EventList from "./components/EventList";
import AttendanceTable from "./components/AttendanceTable";
import AIAssistant from "./components/AIAssistant";
import { CalendarUtils } from "./utils/calendar";
import { Event, Attendee } from "./types";
import {
  INITIAL_EVENTS,
  CATEGORIES,
  ATTENDANCE_ROWS,
  MONTH_NAMES,
} from "./constants";
import { getCategoryFromName } from "@/lib/eventColors";

export default function StaffPortalPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceTab, setAttendanceTab] = useState<"participants" | "volunteers">("participants");
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>(ATTENDANCE_ROWS);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();

      const transformedEvents: Event[] = data.map((event: any, index: number) => {
        const startDate = new Date(event.start);
        const bookingCount = event.bookings?.length || 0;

        const participantCount =
          event.bookings?.filter((b: any) => b.roleAtBooking === "PARTICIPANT").length || 0;
        const volunteerCount =
          event.bookings?.filter((b: any) => b.roleAtBooking === "VOLUNTEER").length || 0;

        return {
          id: index + 1,
          title: event.name,
          date: startDate.getDate(),
          month: startDate.getMonth() + 1,
          year: startDate.getFullYear(),
          category: getCategoryFromName(event.name),
          location: event.location,
          time: startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          capacity: event.participantCapacity + event.volunteerCapacity,
          registered: bookingCount,
          registeredParticipants: participantCount,
          registeredVolunteers: volunteerCount,
          participantCapacity: event.participantCapacity,
          volunteerCapacity: event.volunteerCapacity,
          dbId: event.id,
        };
      });

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents(INITIAL_EVENTS);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Check authorization on mount
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "STAFF") {
      router.push("/");
      return;
    }
    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  // Fetch events from database on mount
  useEffect(() => {
    if (!isAuthorized) return;

    fetchEvents();
  }, [isAuthorized]);

  // Fetch attendees when selected event changes
  useEffect(() => {
    if (!selectedEvent) {
      setAttendees([]);
      return;
    }

    const fetchAttendees = async () => {
      try {
        setIsLoadingAttendees(true);
        const response = await fetch(
          `/api/events/${selectedEvent}/attendees?role=${
            attendanceTab === "participants" ? "PARTICIPANT" : "VOLUNTEER"
          }`
        );
        if (!response.ok) throw new Error("Failed to fetch attendees");
        const data = await response.json();

        // Transform attendee data to match component expectations
        const transformedAttendees: Attendee[] = data.map((attendee: any, index: number) => ({
          id: index + 1,
          name: attendee.name,
          email: attendee.email,
          tier: attendee.tier || "Basic",
          dietary: attendee.dietary || "None",
          referral: attendee.referral || "Unknown",
          lastSeen: "Just now",
          status: "Checked In",
        }));

        setAttendees(transformedAttendees);
      } catch (error) {
        console.error("Error fetching attendees:", error);
        setAttendees([]);
      } finally {
        setIsLoadingAttendees(false);
      }
    };

    fetchAttendees();
  }, [selectedEvent, attendanceTab]);

  const calendarDays = CalendarUtils.getDaysInMonth(currentDate);
  const monthName = MONTH_NAMES[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const getEventsForDay = (day: number, month: number, year: number) => {
    return events.filter(
      (event) => event.date === day && event.month === month + 1 && event.year === year
    );
  };

  const selectedDayEvents = selectedDay
    ? getEventsForDay(selectedDay, currentDate.getMonth(), currentDate.getFullYear())
    : [];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean, month: number, year: number) => {
    if (!isCurrentMonth) {
      setCurrentDate(new Date(year, month, 1));
    }
    setSelectedDay(day);
  };

  const handleEditEvent = (eventId: string, event: Event) => {
    router.push(`/staff/create-event?id=${event.dbId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete event");
      }

      // Remove event from state
      setEvents(events.filter((e) => e.dbId !== eventId));
      setSelectedEvent(null);
      setSelectedDay(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete event. Please try again.";
      console.error("Error deleting event:", error);
      alert(errorMessage);
    }
  };


  // Get selected event title for display
  const getSelectedEventTitle = () => {
    if (!selectedEvent) return undefined;
    const event = events.find((e) => e.dbId === selectedEvent);
    return event?.title;
  };

  const shouldShowCategories = true; // Show categories on main staff dashboard
  
  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authorized, this shouldn't render (redirected above)
  if (!isAuthorized) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={shouldShowCategories ? CATEGORIES : []}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          monthName={monthName}
          year={year}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section className="grid lg:grid-cols-3 gap-8">
            <CalendarGrid
              calendarDays={calendarDays}
              monthName={monthName}
              year={year}
              selectedDay={selectedDay}
              events={events}
              categories={CATEGORIES}
              onDayClick={handleDayClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

          <EventList
            events={selectedDayEvents}
            categories={CATEGORIES}
            selectedDay={selectedDay}
            monthName={monthName}
            selectedEvent={selectedEvent}
            onEventSelect={setSelectedEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </section>

        <AIAssistant onEventCreated={fetchEvents} />

        <AttendanceTable
          attendees={attendees}
          activeTab={attendanceTab}
          onTabChange={setAttendanceTab}
          isLoading={isLoadingAttendees}
          selectedEventTitle={getSelectedEventTitle()}
          />
        </div>
      </main>
    </div>
  );
}
