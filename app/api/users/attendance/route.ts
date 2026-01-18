import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role"); // "PARTICIPANT" or "VOLUNTEER"

    const where = role ? { role } : {};

    // Fetch users with their booking counts
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tier: true,
        createdAt: true,
        bookings: {
          select: {
            id: true,
            eventId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include booking count
    const usersWithBookings = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier,
      bookingCount: user.bookings.length,
      bookings: user.bookings,
    }));

    return NextResponse.json(usersWithBookings);
  } catch (error) {
    console.error("Error fetching users attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch users attendance" },
      { status: 500 }
    );
  }
}
