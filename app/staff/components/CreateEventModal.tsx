import { X } from "lucide-react";
import { NewEventForm, CategoryValue } from "../types";

type CreateEventModalProps = {
  isOpen: boolean;
  eventForm: NewEventForm;
  onClose: () => void;
  onChange: (field: keyof NewEventForm, value: string) => void;
  onSubmit: () => void;
};

export default function CreateEventModal({
  isOpen,
  eventForm,
  onClose,
  onChange,
  onSubmit,
}: CreateEventModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Create New Event</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
              Event Title
            </label>
            <input
              type="text"
              placeholder="Event Title"
              value={eventForm.title}
              onChange={(e) => onChange("title", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-2">Start Date</label>
              <input
                type="date"
                value={eventForm.startDate}
                onChange={(e) => onChange("startDate", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">Time</label>
              <input
                type="time"
                value={eventForm.time}
                onChange={(e) => onChange("time", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-2">Location</label>
              <input
                type="text"
                placeholder="Main Hall or Zoom"
                value={eventForm.location}
                onChange={(e) => onChange("location", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-2">Capacity</label>
              <input
                type="number"
                placeholder="50"
                value={eventForm.capacity}
                onChange={(e) => onChange("capacity", e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
              Category
            </label>
            <select
              value={eventForm.category}
              onChange={(e) => onChange("category", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="workshops">Workshops</option>
              <option value="counseling">Counseling</option>
              <option value="community">Community</option>
              <option value="volunteering">Volunteering</option>
            </select>
          </div>

          <button
            onClick={onSubmit}
            className="w-full rounded-lg bg-slate-900 text-white py-2 text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Create Event
          </button>
        </div>
      </div>
    </div>
  );
}