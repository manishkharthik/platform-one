import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get("userRole") || "PARTICIPANT";

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        questions: {
          where: {
            targetRole: userRole as "PARTICIPANT" | "VOLUNTEER",
          },
        },
        bookings: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, start, end, location, minTier, participantCapacity, volunteerCapacity, questions } = body;

    // Validate required fields
    if (!name || !start || !end || !location) {
      return NextResponse.json(
        { error: "Missing required fields: name, start, end, location" },
        { status: 400 }
      );
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: {
        name,
        start: new Date(start),
        end: new Date(end),
        location,
        minTier: minTier || "BRONZE",
        participantCapacity: participantCapacity || 25,
        volunteerCapacity: volunteerCapacity || 5,
      },
    });

    // Delete old questions and create new ones if provided
    if (questions) {
      await prisma.question.deleteMany({
        where: { eventId: id },
      });

      await prisma.question.createMany({
        data: (questions || []).map((q: any) => ({
          text: q.text,
          type: q.type,
          options: q.options || [],
          targetRole: q.targetRole,
          eventId: id,
        })),
      });
    }

    // Return updated event with questions
    const updatedEvent = await prisma.event.findUnique({
      where: { id },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Delete bookings first (due to foreign key constraint)
    if (event.bookings.length > 0) {
      await prisma.booking.deleteMany({
        where: { eventId: id },
      });
    }

    // Delete questions
    await prisma.question.deleteMany({
      where: { eventId: id },
    });

    // Delete event
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}