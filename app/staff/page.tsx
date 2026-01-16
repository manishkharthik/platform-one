"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./components/Header";
import CalendarGrid from "./components/CalendarGrid";
import EventList from "./components/EventList";
import AttendanceTable from "./components/AttendanceTable";
import CreateEventModal from "./components/CreateEventModal";
import { CalendarUtils } from "./utils/calendar";
import { Event, NewEventForm } from "./types";
import {
  INITIAL_EVENTS,
  CATEGORIES,
  ATTENDANCE_ROWS,
  MONTH_NAMES,
} from "./constants";

export default function StaffPortalPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [attendanceTab, setAttendanceTab] = useState<"participants" | "volunteers">("participants");
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: "",
    startDate: "",
    location: "",
    capacity: "",
    category: "workshops",
    time: "",
  });

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

  const handleEventFormChange = (field: keyof NewEventForm, value: string) => {
    setNewEvent({ ...newEvent, [field]: value });
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate) return;
    
    const [year, month, day] = newEvent.startDate.split("-").map(Number);
    const event: Event = {
      id: events.length + 1,
      title: newEvent.title,
      date: day,
      month: month,
      year: year,
      category: newEvent.category,
      location: newEvent.location,
      time: newEvent.time,
      capacity: newEvent.capacity ? parseInt(newEvent.capacity) : undefined,
      registered: 0,
    };
    
    setEvents([...events, event]);
    setShowCreateModal(false);
    setNewEvent({
      title: "",
      startDate: "",
      location: "",
      capacity: "",
      category: "workshops",
      time: "",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        categories={CATEGORIES}
        setShowCreateModal={setShowCreateModal}
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
              events={selectedDayEvents.length > 0 ? selectedDayEvents : events}
              categories={CATEGORIES}
              selectedDay={selectedDay}
              monthName={monthName}
            />
          </section>

          <AttendanceTable
            attendees={ATTENDANCE_ROWS}
            activeTab={attendanceTab}
            onTabChange={setAttendanceTab}
          />
        </div>
      </main>

      <CreateEventModal
        isOpen={showCreateModal}
        eventForm={newEvent}
        onClose={() => setShowCreateModal(false)}
        onChange={handleEventFormChange}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}