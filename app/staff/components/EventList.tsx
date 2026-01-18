import { Clock, MapPin, UserCheck } from "lucide-react";
import { Event, Category } from "../types";

type EventListProps = {
  events: Event[];
  categories: Category[];
  selectedDay: number | null;
  monthName: string;
  selectedEvent?: string | null;
  onEventSelect?: (eventId: string) => void;
};

export default function EventList({
  events,
  categories,
  selectedDay,
  monthName,
  selectedEvent,
  onEventSelect,
}: EventListProps) {
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
              : "Select a day to view events"}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            {selectedDay ? "No events scheduled for this day" : "Select a day to view events"}
          </div>
        ) : (
          events.map((event) => {
          const category = categories.find((c) => c.value === event.category);
          const isSelected = selectedEvent === event.dbId;
          return (
            <div
              key={event.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? "border-slate-900 bg-slate-50"
                  : "border-gray-200 hover:border-slate-300"
              }`}
              onClick={() => onEventSelect?.(event.dbId || "")}
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
                <div className="space-y-2">
                  {event.participantCapacity !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <UserCheck className="w-3 h-3" />
                      Participants: {event.registeredParticipants || 0}/{event.participantCapacity}
                    </div>
                  )}
                  {event.volunteerCapacity !== undefined && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <UserCheck className="w-3 h-3" />
                      Volunteers: {event.registeredVolunteers || 0}/{event.volunteerCapacity}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}