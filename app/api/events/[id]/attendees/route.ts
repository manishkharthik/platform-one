import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; 
    const eventId = id;

    const bookings = await prisma.booking.findMany({
      where: { eventId },
      include: { user: true },
    });

    type BookingWithUser = (typeof bookings)[number];

    const attendees = bookings.map((booking: BookingWithUser) => ({
      id: booking.id,
      userId: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
      role: booking.user.role,
      tier: booking.user.tier,
    }));

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}