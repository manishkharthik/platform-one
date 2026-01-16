import { ChevronLeft, ChevronRight } from "lucide-react";
import { Event, Category } from "../types";
import { CalendarDay } from "../utils/calendar";
import { DAYS_OF_WEEK } from "../constants";

type CalendarGridProps = {
  calendarDays: CalendarDay[];
  monthName: string;
  year: number;
  selectedDay: number | null;
  events: Event[];
  categories: Category[];
  onDayClick: (day: number, isCurrentMonth: boolean, month: number, year: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

export default function CalendarGrid({
  calendarDays,
  monthName,
  year,
  selectedDay,
  events,
  categories,
  onDayClick,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const getEventsForDay = (day: number, month: number, year: number) => {
    return events.filter(
      (event) => event.date === day && event.month === month + 1 && event.year === year
    );
  };

  const getCategoryColor = (category: Event["category"]) => {
    const cat = categories.find((c) => c.value === category);
    return cat?.dotColor || "bg-slate-900";
  };

  return (
    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Calendar Overview</h3>
          <p className="text-sm text-gray-500">
            Track staff activity and event flow. Click a day to view events.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-900 min-w-[120px] text-center">
            {monthName} {year}
          </span>
          <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-gray-400 font-semibold mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 relative">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDay(day.day, day.month, day.year);
          const isSelected = selectedDay === day.day && day.isCurrentMonth;
          return (
            <button
              key={`${day.day}-${index}`}
              onClick={() => onDayClick(day.day, day.isCurrentMonth, day.month, day.year)}
              className={`h-16 rounded-lg border p-2 text-xs transition-all ${
                day.isCurrentMonth
                  ? "bg-white text-gray-900 border-gray-100 hover:border-slate-300"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              } ${isSelected ? "ring-2 ring-slate-900 border-slate-900" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{day.day}</span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] bg-slate-900 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {dayEvents.length}
                  </span>
                )}
              </div>
              <div className="mt-1 flex gap-1 flex-wrap">
                {dayEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className={`w-2 h-2 rounded-full ${getCategoryColor(event.category)}`}
                  ></span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}