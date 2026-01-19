import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

const ALLOWED_TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const;

type AssistantAction =
  | "create"
  | "update"
  | "delete"
  | "get"
  | "list"
  | "unknown";

type ExtractedEvent = {
  title: string | null;
  startDate: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:mm
  endDate: string | null;
  endTime: string | null;
  location: string | null;
  participantCapacity: number | string | null;
  volunteerCapacity: number | string | null;
  minTier: (typeof ALLOWED_TIERS)[number] | string | null;
};

type DateRange = {
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null; // YYYY-MM-DD (inclusive day)
};

type AssistantPlan = {
  action: AssistantAction;

  // If user pasted an event id
  eventId: string | null;

  // If user describes the event ("volunteer event on 21 jan")
  query: string | null;

  // For create/update: extracted details (nullable fields ok)
  event: ExtractedEvent | null;

  // If user asks for "who is attending/volunteering"
  includeParticipants: boolean | null;
  includeVolunteers: boolean | null;

  // For list filters like "next 10 days", "first week of January"
  range: DateRange | null;
};

type NormalizedEvent = {
  title: string | null;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  location: string | null;
  participantCapacity: number | null;
  volunteerCapacity: number | null;
  minTier: (typeof ALLOWED_TIERS)[number] | null;
};

const ensureString = (value: unknown) => {
  if (typeof value !== "string") return null;
  const t = value.trim();
  return t.length ? t : null;
};

const ensureDate = (value: unknown) => {
  const s = ensureString(value);
  if (!s) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

const ensureTime = (value: unknown) => {
  const s = ensureString(value);
  if (!s) return null;
  return /^\d{2}:\d{2}$/.test(s) ? s : null;
};

const ensureNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(1, Math.round(parsed));
};

const ensureTier = (value: unknown) => {
  const tier = ensureString(value)?.toUpperCase();
  if (!tier) return null;
  return ALLOWED_TIERS.includes(tier as any) ? (tier as any) : null;
};

const buildLocalDate = (date: string, time: string) => {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
};

const startOfDay = (date: string) => buildLocalDate(date, "00:00");
const endOfDay = (date: string) => buildLocalDate(date, "23:59");

function normalizeEvent(e: ExtractedEvent): NormalizedEvent {
  return {
    title: ensureString(e.title),
    startDate: ensureDate(e.startDate),
    startTime: ensureTime(e.startTime),
    endDate: ensureDate(e.endDate),
    endTime: ensureTime(e.endTime),
    location: ensureString(e.location),
    participantCapacity: ensureNumber(e.participantCapacity),
    volunteerCapacity: ensureNumber(e.volunteerCapacity),
    minTier: ensureTier(e.minTier),
  };
}

// --------- Event matching helpers ----------

// Try to find events by "query" (title keyword) and optional day filter
async function findCandidates(query: string, date?: string | null) {
  const where: any = {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { location: { contains: query, mode: "insensitive" } },
    ],
  };

  if (date) {
    where.start = { gte: startOfDay(date), lte: endOfDay(date) };
  }

  return prisma.event.findMany({
    where,
    orderBy: { start: "asc" },
    take: 5,
    select: {
      id: true,
      name: true,
      start: true,
      end: true,
      location: true,
      minTier: true,
      participantCapacity: true,
      volunteerCapacity: true,
    },
  });
}

// Fetch event + optionally bookings/user (participants/volunteers live in Booking)
async function getEventWithPeople(
  eventId: string,
  includeParticipants: boolean,
  includeVolunteers: boolean
) {
  if (!includeParticipants && !includeVolunteers) {
    return prisma.event.findUnique({ where: { id: eventId } });
  }

  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      bookings: {
        include: {
          user: true,
          confirmations: true,
        },
      },
    },
  });
}

function missingForCreate(n: NormalizedEvent) {
  const required = [
    "title",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
  ] as const;
  return required.filter((k) => !n[k]);
}

// --------- People formatting (from Booking) ----------
function bookingStatus(booking: any): "CONFIRMED" | "DECLINED" | "PENDING" {
  const statuses = (booking?.confirmations ?? []).map((c: any) => c.status);
  if (statuses.includes("CONFIRMED")) return "CONFIRMED";
  if (statuses.includes("DECLINED")) return "DECLINED";
  return "PENDING";
}

function formatPeopleFromBookings(
  event: any,
  includeParticipants: boolean,
  includeVolunteers: boolean
) {
  const bookings = event?.bookings ?? [];

  const participants = bookings.filter(
    (b: any) => b.roleAtBooking === "PARTICIPANT"
  );
  const volunteers = bookings.filter(
    (b: any) => b.roleAtBooking === "VOLUNTEER"
  );

  const fmt = (arr: any[]) =>
    arr
      .map((b) => {
        const name = b?.user?.name ?? b?.user?.email ?? "Unknown";
        const status = bookingStatus(b);
        return `${name} (${status})`;
      })
      .filter(Boolean);

  const lines: string[] = [];

  if (includeParticipants) {
    lines.push(
      participants.length
        ? `Participants (${participants.length}):\n- ${fmt(participants).join(
            "\n- "
          )}`
        : "Participants: none found."
    );
  }

  if (includeVolunteers) {
    lines.push(
      volunteers.length
        ? `Volunteers (${volunteers.length}):\n- ${fmt(volunteers).join(
            "\n- "
          )}`
        : "Volunteers: none found."
    );
  }

  return lines.join("\n\n");
}

// --------- Gemini call (plan) ----------
async function getPlanFromGemini(opts: {
  apiKey: string;
  model: string;
  timezone: string;
  referenceDate: string;
  message: string;
}) {
  const { apiKey, model, timezone, referenceDate, message } = opts;

  const systemPrompt = `You are an assistant for staff managing events.

Return ONLY valid JSON matching this schema:
{
  "action": "create" | "update" | "delete" | "get" | "list" | "unknown",
  "eventId": string|null,
  "query": string|null,
  "event": {
    "title": string|null,
    "startDate": string|null,
    "startTime": string|null,
    "endDate": string|null,
    "endTime": string|null,
    "location": string|null,
    "participantCapacity": number|string|null,
    "volunteerCapacity": number|string|null,
    "minTier": "BRONZE"|"SILVER"|"GOLD"|"PLATINUM"|null
  } | null,
  "includeParticipants": boolean|null,
  "includeVolunteers": boolean|null,
  "range": {
    "startDate": string|null,
    "endDate": string|null
  } | null
}

Rules:
- Use timezone ${timezone}. Reference date is ${referenceDate}.
- Dates must be YYYY-MM-DD and times HH:mm (24h).

Title rules (IMPORTANT):
- If the user explicitly provides a title/name, use it as title.
- If the user does NOT provide a title but provides enough context (purpose/type, audience, topic, location/time), you MAY generate a concise, human-friendly title (3–8 words) that accurately reflects the request.
  Examples:
  - "volunteer training on Feb 2..." => "Volunteer Training"
  - "career talk with Google..." => "Google Career Talk"
  - "blood donation drive at UTown..." => "Blood Donation Drive"
- If the request is too vague to name safely (e.g. "schedule something tomorrow"), set title to null.

Listing rules:
- If the user asks to list events in a time window (e.g. "next 10 days", "first week of January", "between Jan 5 and Jan 20"),
  set action="list" and fill "range" with startDate and endDate in YYYY-MM-DD.
- For "next N days", startDate should be today's date (in the given timezone) and endDate should be today's date + N days.
- For "first week of January", use Jan 1 to Jan 7 (inclusive) of the relevant year based on referenceDate.
- If user also gives a keyword filter (e.g. "volunteer"), put it into "query".

Other extraction rules:
- Do NOT invent details like date/time/location/capacities/tier; use null if missing/ambiguous.
- If user wants delete/update/get but no eventId is given, put a short identifier phrase into query (e.g. "volunteer event on 21 jan").
- If user asks "who is participating/attending/who is coming", set includeParticipants=true.
- If user asks "who is volunteering", set includeVolunteers=true.
`;

  const planSchema = {
    type: "object",
    additionalProperties: false,
    required: [
      "action",
      "eventId",
      "query",
      "event",
      "includeParticipants",
      "includeVolunteers",
      "range",
    ],
    properties: {
      action: {
        type: "string",
        enum: ["create", "update", "delete", "get", "list", "unknown"],
      },
      eventId: { type: ["string", "null"] },
      query: { type: ["string", "null"] },
      includeParticipants: { type: ["boolean", "null"] },
      includeVolunteers: { type: ["boolean", "null"] },
      range: {
        type: ["object", "null"],
        additionalProperties: false,
        required: ["startDate", "endDate"],
        properties: {
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
        },
      },
      event: {
        type: ["object", "null"],
        additionalProperties: false,
        required: [
          "title",
          "startDate",
          "startTime",
          "endDate",
          "endTime",
          "location",
          "participantCapacity",
          "volunteerCapacity",
          "minTier",
        ],
        properties: {
          title: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          startTime: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          endTime: { type: ["string", "null"] },
          location: { type: ["string", "null"] },
          participantCapacity: { type: ["number", "string", "null"] },
          volunteerCapacity: { type: ["number", "string", "null"] },
          minTier: {
            type: ["string", "null"],
            enum: ["BRONZE", "SILVER", "GOLD", "PLATINUM", null],
          },
        },
      },
    },
  };

  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      // if you get "Unknown name systemInstruction", change to system_instruction
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
        responseJsonSchema: planSchema,
      },
    }),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data?.error?.message || "Gemini request failed");
  }

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).join("") ??
    null;

  if (!text) throw new Error("Empty Gemini response");
  return JSON.parse(text) as AssistantPlan;
}

// --------- Route ----------
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const message = ensureString(body?.message);
    const timezone = ensureString(body?.timezone) || "UTC";
    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const referenceDate = new Date().toISOString();

    const plan = await getPlanFromGemini({
      apiKey,
      model,
      timezone,
      referenceDate,
      message,
    });

    // LIST (supports date range + keyword query)
    if (plan.action === "list") {
      const q = plan.query?.trim() || null;

      const startDate = plan.range?.startDate
        ? ensureDate(plan.range.startDate)
        : null;
      const endDate = plan.range?.endDate ? ensureDate(plan.range.endDate) : null;

      const where: any = {};

      if (q) {
        where.OR = [
          { name: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
        ];
      }

      if (startDate && endDate) {
        where.start = { gte: startOfDay(startDate), lte: endOfDay(endDate) };
      } else if (startDate) {
        where.start = { gte: startOfDay(startDate) };
      } else if (endDate) {
        where.start = { lte: endOfDay(endDate) };
      }

      const events = await prisma.event.findMany({
        where: Object.keys(where).length ? where : undefined,
        orderBy: { start: "asc" },
        take: 50,
        select: {
          id: true,
          name: true,
          start: true,
          end: true,
          location: true,
          minTier: true,
          participantCapacity: true,
          volunteerCapacity: true,
        },
      });

      return NextResponse.json({
        action: "list",
        events,
        assistantMessage: events.length
          ? `Here are ${events.length} events.`
          : "No events found.",
      });
    }

    // Resolve target event for get/update/delete (by id or by query)
    let targetId = plan.eventId;

    if (
      !targetId &&
      plan.query &&
      (plan.action === "get" ||
        plan.action === "update" ||
        plan.action === "delete")
    ) {
      const maybeDate = plan.event?.startDate ?? null;
      const candidates = await findCandidates(plan.query, maybeDate);

      if (candidates.length === 0) {
        return NextResponse.json({
          action: plan.action,
          needsClarification: true,
          assistantMessage: `I couldn't find an event matching "${plan.query}". Try "list events" or include the exact title/date.`,
        });
      }

      if (candidates.length > 1) {
        return NextResponse.json({
          action: plan.action,
          needsClarification: true,
          candidates,
          assistantMessage:
            "I found multiple matches. Reply with the eventId you mean:\n" +
            candidates.map((e) => `- ${e.id}: ${e.name}`).join("\n"),
        });
      }

      targetId = candidates[0].id;
    }

    // GET (info + participants/volunteers when asked)
    if (plan.action === "get") {
      if (!targetId) {
        return NextResponse.json({
          action: "get",
          needsClarification: true,
          assistantMessage:
            "Which event? Provide an eventId or describe it more specifically (title + date).",
        });
      }

      const wantsPeople =
        Boolean(plan.includeParticipants) || Boolean(plan.includeVolunteers);

      // Treat "who is coming/attending/joining/showing up" as BOTH groups unless explicitly scoped.
      const comingPhrase =
        /who('?s|\s+is)\s+(coming|attending|joining|showing\s+up)/i.test(
          message
        );

      const explicitlyParticipantsOnly =
        /\bparticipants?\b|\battendees?\b/i.test(message) &&
        !/\bvolunteers?\b/i.test(message);

      const explicitlyVolunteersOnly =
        /\bvolunteers?\b/i.test(message) &&
        !/\bparticipants?\b|\battendees?\b/i.test(message);

      let includeParticipants = Boolean(plan.includeParticipants);
      let includeVolunteers = Boolean(plan.includeVolunteers);

      if (comingPhrase && !explicitlyParticipantsOnly && !explicitlyVolunteersOnly) {
        includeParticipants = true;
        includeVolunteers = true;
      }

      if (!wantsPeople && comingPhrase) {
        includeParticipants = true;
        includeVolunteers = true;
      }

      const event = await getEventWithPeople(
        targetId,
        includeParticipants,
        includeVolunteers
      );

      if (!event) {
        return NextResponse.json({ error: "Event not found." }, { status: 404 });
      }

      return NextResponse.json({
        action: "get",
        event,
        assistantMessage:
          includeParticipants || includeVolunteers
            ? formatPeopleFromBookings(event, includeParticipants, includeVolunteers)
            : "Here are the event details.",
      });
    }

    // DELETE
    if (plan.action === "delete") {
      if (!targetId) {
        return NextResponse.json({
          action: "delete",
          needsClarification: true,
          assistantMessage:
            "Which event should I delete? Provide an eventId or include title + date.",
        });
      }

      await prisma.event.delete({ where: { id: targetId } });

      return NextResponse.json({
        action: "delete",
        deleted: true,
        eventId: targetId,
        assistantMessage: "Deleted the event. Refresh the browser to see the updated calendar.",
      });
    }

    // CREATE
    if (plan.action === "create") {
      if (!plan.event) {
        return NextResponse.json({
          action: "create",
          needsClarification: true,
          assistantMessage:
            "Please include the event title, start/end date and time, and optionally location.",
        });
      }

      const normalized = normalizeEvent(plan.event);
      const missing = missingForCreate(normalized);

      if (missing.length) {
        return NextResponse.json({
          action: "create",
          created: false,
          needsClarification: true,
          missingFields: missing,
          details: normalized,
          assistantMessage: `I can create the event once I have: ${missing.join(
            ", "
          )}.`,
        });
      }

      const start = buildLocalDate(normalized.startDate!, normalized.startTime!);
      const end = buildLocalDate(normalized.endDate!, normalized.endTime!);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return NextResponse.json({
          action: "create",
          created: false,
          needsClarification: true,
          assistantMessage: "The date/time format looks invalid.",
        });
      }
      if (end <= start) {
        return NextResponse.json({
          action: "create",
          created: false,
          needsClarification: true,
          assistantMessage: "End time must be after the start time.",
        });
      }

      const staffUser =
        (await prisma.user.findFirst({ where: { role: "STAFF" } })) ||
        (await prisma.user.create({
          data: {
            name: "Staff Admin",
            email: `staff-${Date.now()}@platformone.local`,
            role: "STAFF",
          },
        }));

      const event = await prisma.event.create({
        data: {
          name: normalized.title!,
          start,
          end,
          location: normalized.location || "TBD",
          minTier: normalized.minTier || "BRONZE",
          participantCapacity: normalized.participantCapacity || 25,
          volunteerCapacity: normalized.volunteerCapacity || 5,
          createdById: staffUser.id,
        },
      });

      return NextResponse.json({
        action: "create",
        created: true,
        event,
        details: normalized,
        assistantMessage: `Created "${event.name}".`,
      });
    }

    // UPDATE
    if (plan.action === "update") {
      if (!targetId) {
        return NextResponse.json({
          action: "update",
          needsClarification: true,
          assistantMessage:
            "Which event should I edit? Provide an eventId or include title + date.",
        });
      }
      if (!plan.event) {
        return NextResponse.json({
          action: "update",
          needsClarification: true,
          assistantMessage:
            "Tell me what you want to change (time/date/location/capacity/tier).",
        });
      }

      const normalized = normalizeEvent(plan.event);

      // Only update fields the user actually provided (non-null)
      const data: any = {};
      if (normalized.title) data.name = normalized.title;
      if (normalized.location) data.location = normalized.location;
      if (normalized.minTier) data.minTier = normalized.minTier;
      if (normalized.participantCapacity)
        data.participantCapacity = normalized.participantCapacity;
      if (normalized.volunteerCapacity)
        data.volunteerCapacity = normalized.volunteerCapacity;

      // If they touched time/date, require full set for safety
      const touchedTime =
        normalized.startDate ||
        normalized.startTime ||
        normalized.endDate ||
        normalized.endTime;

      if (touchedTime) {
        const missing: string[] = [];
        if (!normalized.startDate) missing.push("startDate");
        if (!normalized.startTime) missing.push("startTime");
        if (!normalized.endDate) missing.push("endDate");
        if (!normalized.endTime) missing.push("endTime");

        if (missing.length) {
          return NextResponse.json({
            action: "update",
            needsClarification: true,
            missingFields: missing,
            details: normalized,
            assistantMessage: `To update date/time, I still need: ${missing.join(
              ", "
            )}.`,
          });
        }

        const start = buildLocalDate(normalized.startDate!, normalized.startTime!);
        const end = buildLocalDate(normalized.endDate!, normalized.endTime!);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return NextResponse.json({
            action: "update",
            needsClarification: true,
            assistantMessage: "The date/time format looks invalid.",
          });
        }
        if (end <= start) {
          return NextResponse.json({
            action: "update",
            needsClarification: true,
            assistantMessage: "End time must be after the start time.",
          });
        }

        data.start = start;
        data.end = end;
      }

      if (Object.keys(data).length === 0) {
        return NextResponse.json({
          action: "update",
          needsClarification: true,
          assistantMessage:
            "I couldn't find anything to update. Tell me what field to change.",
        });
      }

      const updated = await prisma.event.update({
        where: { id: targetId },
        data,
      });

      return NextResponse.json({
        action: "update",
        updated: true,
        event: updated,
        assistantMessage: `Updated "${updated.name}".`,
      });
    }

    return NextResponse.json({
      action: "unknown",
      needsClarification: true,
      assistantMessage:
        "I’m not sure what you want. Try: create, edit, delete, list events, or show event details.",
    });
  } catch (error) {
    console.error("AI event assistant error:", error);
    return NextResponse.json(
      { error: "Failed to process request." },
      { status: 500 }
    );
  }
}