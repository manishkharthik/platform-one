import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Password validation - compare plain text passwords
// TODO: In production, use bcrypt or similar for secure password hashing/verification
async function validatePassword(
  plainPassword: string,
  storedPassword: string
): Promise<boolean> {
  return plainPassword === storedPassword;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, accessCode } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Staff role requires access code
    if (role === "staff" && !accessCode) {
      return NextResponse.json(
        { error: "Staff access code is required" },
        { status: 400 }
      );
    }

    // Verify staff access code if provided
    if (role === "staff" && accessCode) {
      const STAFF_ACCESS_CODE = "123456";
      if (accessCode !== STAFF_ACCESS_CODE) {
        return NextResponse.json(
          { error: "Invalid staff access code" },
          { status: 401 }
        );
      }
    }

    // Find user by email (including password for validation)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify role matches what's in database
    if (role === "staff" && user.role !== "STAFF") {
      return NextResponse.json(
        { error: "You are not authorized as staff" },
        { status: 403 }
      );
    }

    if (
      role === "participant-volunteer" &&
      (user.role !== "PARTICIPANT" && user.role !== "VOLUNTEER")
    ) {
      return NextResponse.json(
        { error: "You are not authorized as a participant or volunteer" },
        { status: 403 }
      );
    }

    // Validate password against database
    const passwordMatch = await validatePassword(password, user.password || "");
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use JWT or similar)
    // TODO: Replace with proper JWT token generation
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        userRole: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
