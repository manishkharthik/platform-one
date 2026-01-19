"use client";

import { useState } from "react";
import { Sparkles, Send } from "lucide-react";

type EventDetails = {
  title: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
  participantCapacity: number | null;
  volunteerCapacity: number | null;
  minTier: string | null;
};

type ListedEvent = {
  id: string;
  name: string;
  start: string; // ISO from API
  end: string;   // ISO from API
  location: string | null;
  minTier: string | null;
  participantCapacity: number | null;
  volunteerCapacity: number | null;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  details?: EventDetails;
  events?: ListedEvent[];
};

type AIAssistantProps = {
  onEventCreated?: () => void | Promise<void>;
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatDetail = (label: string, value: string | number | null) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between text-xs text-gray-500">
      <span>{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
};

export default function AIAssistant({ onEventCreated }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      content:
        "Describe the event and I will add it to the calendar. Include dates, times, and location.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: createId(), role: "user", content: message },
    ]);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const response = await fetch("/api/ai/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, timezone }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create event.");
      }

      const assistantMessage: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: data.assistantMessage || "All set.",
        details: data.details || undefined,
        events: data.events || undefined, // ✅ render list events
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.created) {
        await onEventCreated?.();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create event.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: "Something went wrong. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">AI Event Assistant</h3>
          <p className="text-sm text-gray-500">
            Chat in natural language and I&apos;ll schedule events for you.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-400">
          <Sparkles className="h-4 w-4" />
          LLM
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 max-h-64 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl px-4 py-3 text-sm shadow-sm ${
              message.role === "user"
                ? "ml-auto max-w-[75%] bg-slate-900 text-white"
                : "mr-auto max-w-[80%] bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <p>{message.content}</p>

            {/* ✅ existing details rendering */}
            {message.details && (
              <div className="mt-3 space-y-1">
                {formatDetail("Title", message.details.title)}
                {formatDetail("Start", message.details.startDate)}
                {formatDetail("Start Time", message.details.startTime)}
                {formatDetail("End", message.details.endDate)}
                {formatDetail("End Time", message.details.endTime)}
                {formatDetail("Location", message.details.location)}
                {formatDetail("Participant Cap", message.details.participantCapacity)}
                {formatDetail("Volunteer Cap", message.details.volunteerCapacity)}
                {formatDetail("Tier", message.details.minTier)}
              </div>
            )}

            {/* ✅ NEW: list events rendering */}
            {message.events && message.events.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.events.map((e) => (
                  <div
                    key={e.id}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-gray-800">{e.name}</div>
                      <div className="text-[10px] text-gray-400">{e.id}</div>
                    </div>

                    <div className="mt-1 space-y-1 text-gray-600">
                      <div>Start: {formatDateTime(e.start)}</div>
                      <div>End: {formatDateTime(e.end)}</div>
                      {e.location ? <div>Location: {e.location}</div> : null}
                      {e.minTier ? <div>Min Tier: {e.minTier}</div> : null}
                      {e.participantCapacity ? (
                        <div>Participant Cap: {e.participantCapacity}</div>
                      ) : null}
                      {e.volunteerCapacity ? (
                        <div>Volunteer Cap: {e.volunteerCapacity}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && <div className="text-xs text-gray-400">Working on it...</div>}
      </div>

      {error && <p className="mt-3 text-xs text-rose-500">{error}</p>}

      <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g. Schedule a volunteer training on Oct 12 from 2:00-4:00 PM at Main Hall for 30 participants and 10 volunteers."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send className="h-4 w-4" />
          {isLoading ? "Creating..." : "Create with AI"}
        </button>
      </form>

      <p className="mt-3 text-xs text-gray-400">
        Tip: include start/end dates, times, and a location for the fastest
        creation.
      </p>
    </section>
  );
}