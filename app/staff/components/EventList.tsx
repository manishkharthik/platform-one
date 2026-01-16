import { Clock, MapPin, UserCheck } from "lucide-react";
import { Event, Category } from "../types";

type EventListProps = {
  events: Event[];
  categories: Category[];
  selectedDay: number | null;
  monthName: string;
};

export default function EventList({
  events,
  categories,
  selectedDay,
  monthName,
}: EventListProps) {
  const displayEvents = selectedDay ? events : events.slice(0, 5);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {selectedDay ? `Events on ${monthName} ${selectedDay}` : "Upcoming Events"}
          </h3>
          <p className="text-sm text-gray-500">
            {selectedDay
              ? `${events.length} event${events.length !== 1 ? "s" : ""} scheduled`
              : "Next events"}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {displayEvents.map((event) => {
          const category = categories.find((c) => c.value === event.category);
          return (
            <div
              key={event.id}
              className="p-3 border border-gray-200 rounded-lg hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-900">{event.title}</h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full ${category?.color}`}
                >
                  {category?.name}
                </span>
              </div>
              {event.time && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Clock className="w-3 h-3" />
                  {event.time}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </div>
              )}
              {event.capacity && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <UserCheck className="w-3 h-3" />
                  {event.registered}/{event.capacity} registered
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}