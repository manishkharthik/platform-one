import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        start: true,
        end: true,
        location: true,
        minTier: true,
        participantCapacity: true,
        volunteerCapacity: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            roleAtBooking: true,
          },
        },
      },
      orderBy: {
        start: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, start, end, location, minTier, participantCapacity, volunteerCapacity, questions } = body;

    // Validate required fields
    if (!name || !start || !end || !location) {
      return NextResponse.json(
        { error: "Missing required fields: name, start, end, location" },
        { status: 400 }
      );
    }

    // Get the first staff user (or you can implement proper staff identification)
    const staffUser = await prisma.user.findFirst({
      where: { role: "STAFF" },
    });

    if (!staffUser) {
      return NextResponse.json(
        { error: "No staff user found to create event" },
        { status: 400 }
      );
    }

    // Create event with questions
    const event = await prisma.event.create({
      data: {
        name,
        start: new Date(start),
        end: new Date(end),
        location,
        minTier: minTier || "BRONZE",
        participantCapacity: participantCapacity || 25,
        volunteerCapacity: volunteerCapacity || 5,
        createdById: staffUser.id,
        questions: {
          create: (questions || []).map((q: any) => ({
            text: q.text,
            type: q.type,
            options: q.options || [],
            targetRole: q.targetRole,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
