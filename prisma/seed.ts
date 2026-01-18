import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.answer.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.question.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log("👥 Creating users...");
  const participant1 = await prisma.user.create({
    data: {
      name: "Walter Sullivan",
      email: "walter@participant.com",
      password: "123456",
      role: "PARTICIPANT",
      tier: "GOLD",
    },
  });

  const participant2 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@participant.com",
      password: "123456",
      role: "PARTICIPANT",
      tier: "SILVER",
    },
  });

  const volunteer1 = await prisma.user.create({
    data: {
      name: "Mike Chen",
      email: "mike@volunteer.com",
      password: "123456",
      role: "VOLUNTEER",
      tier: "PLATINUM",
    },
  });

  const volunteer2 = await prisma.user.create({
    data: {
      name: "Lisa Wong",
      email: "lisa@volunteer.com",
      password: "123456",
      role: "VOLUNTEER",
      tier: "GOLD",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@staff.com",
      password: "123456",
      role: "STAFF",
      tier: "PLATINUM",
    },
  });

  console.log(`✅ Created ${5} users`);

  // Create Events for January 2026
  console.log("📅 Creating events...");
  
  const workshopEvent1 = await prisma.event.create({
    data: {
      name: "Introduction to Community Service",
      start: new Date("2026-01-06T14:00:00"),
      end: new Date("2026-01-06T16:00:00"),
      location: "Main Hall A",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "What interests you most about community service?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
          {
            text: "Dietary restrictions?",
            type: "SELECT",
            options: ["None", "Vegetarian", "Vegan", "Halal", "Gluten-Free"],
            targetRole: "PARTICIPANT",
          },
          {
            text: "How did you hear about this workshop?",
            type: "SELECT",
            options: ["Social Media", "Email", "Friend", "Website"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const communityEvent = await prisma.event.create({
    data: {
      name: "Community Park Cleanup",
      start: new Date("2026-01-08T09:00:00"),
      end: new Date("2026-01-08T12:00:00"),
      location: "Central Park",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "What is your T-shirt size?",
            type: "SELECT",
            options: ["XS", "S", "M", "L", "XL", "XXL"],
            targetRole: "VOLUNTEER",
          },
          {
            text: "Do you have any experience with outdoor volunteering?",
            type: "SELECT",
            options: ["Yes", "No", "Some"],
            targetRole: "VOLUNTEER",
          },
          {
            text: "Which areas would you like to help with?",
            type: "MULTISELECT",
            options: ["Trash Collection", "Gardening", "Path Maintenance", "Sign Installation"],
            targetRole: "VOLUNTEER",
          },
        ],
      },
    },
  });

  const counselingEvent = await prisma.event.create({
    data: {
      name: "Mental Wellness Counseling Session",
      start: new Date("2026-01-13T15:00:00"),
      end: new Date("2026-01-13T16:30:00"),
      location: "Counseling Center Room 201",
      minTier: "SILVER",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Is this your first counseling session with us?",
            type: "SELECT",
            options: ["Yes", "No"],
            targetRole: "PARTICIPANT",
          },
          {
            text: "What topics would you like to discuss?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
          {
            text: "Preferred counselor gender?",
            type: "SELECT",
            options: ["Male", "Female", "No Preference"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const orientationEvent = await prisma.event.create({
    data: {
      name: "New Volunteer Orientation Hub",
      start: new Date("2026-01-14T10:00:00"),
      end: new Date("2026-01-14T12:00:00"),
      location: "Conference Room B",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "What motivated you to volunteer?",
            type: "TEXT",
            options: [],
            targetRole: "VOLUNTEER",
          },
          {
            text: "Which volunteer areas interest you?",
            type: "MULTISELECT",
            options: ["Education", "Healthcare", "Environment", "Community Development", "Youth Programs"],
            targetRole: "VOLUNTEER",
          },
        ],
      },
    },
  });

  const workshopEvent2 = await prisma.event.create({
    data: {
      name: "Leadership Skills Workshop",
      start: new Date("2026-01-16T13:00:00"),
      end: new Date("2026-01-16T17:00:00"),
      location: "Training Center",
      minTier: "GOLD",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Current leadership role (if any)?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
          {
            text: "Years of leadership experience?",
            type: "SELECT",
            options: ["0-1 years", "1-3 years", "3-5 years", "5+ years"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const serviceEvent = await prisma.event.create({
    data: {
      name: "Food Distribution Service",
      start: new Date("2026-01-21T08:00:00"),
      end: new Date("2026-01-21T14:00:00"),
      location: "Community Center Downtown",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Do you have food handling certification?",
            type: "SELECT",
            options: ["Yes", "No", "In Progress"],
            targetRole: "VOLUNTEER",
          },
          {
            text: "Preferred shift?",
            type: "SELECT",
            options: ["Morning (8AM-11AM)", "Afternoon (11AM-2PM)", "Full Day"],
            targetRole: "VOLUNTEER",
          },
        ],
      },
    },
  });

  const participantOrientation = await prisma.event.create({
    data: {
      name: "New Participant Orientation",
      start: new Date("2026-01-23T14:00:00"),
      end: new Date("2026-01-23T16:00:00"),
      location: "Main Auditorium",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "What are your goals with our program?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
          {
            text: "How did you hear about us?",
            type: "SELECT",
            options: ["Social Media", "Friend/Family", "Online Search", "Community Event", "Other"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const volunteeringEvent = await prisma.event.create({
    data: {
      name: "Youth Mentorship Volunteering",
      start: new Date("2026-01-23T10:00:00"),
      end: new Date("2026-01-23T13:00:00"),
      location: "Youth Center",
      minTier: "SILVER",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Experience working with youth?",
            type: "SELECT",
            options: ["Extensive", "Some", "None"],
            targetRole: "VOLUNTEER",
          },
          {
            text: "Age groups you're comfortable working with?",
            type: "MULTISELECT",
            options: ["6-10 years", "11-14 years", "15-18 years"],
            targetRole: "VOLUNTEER",
          },
        ],
      },
    },
  });

  const weekendWorkshop = await prisma.event.create({
    data: {
      name: "Weekend Digital Literacy Workshop",
      start: new Date("2026-01-25T09:00:00"),
      end: new Date("2026-01-25T12:00:00"),
      location: "Computer Lab 3",
      minTier: "BRONZE",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Current computer skill level?",
            type: "SELECT",
            options: ["Beginner", "Intermediate", "Advanced"],
            targetRole: "PARTICIPANT",
          },
          {
            text: "Which topics interest you most?",
            type: "MULTISELECT",
            options: ["Basic Computing", "Internet Safety", "Email", "Social Media", "Office Software"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const mentorshipCall = await prisma.event.create({
    data: {
      name: "Career Mentorship Call",
      start: new Date("2026-01-28T16:00:00"),
      end: new Date("2026-01-28T17:30:00"),
      location: "Virtual - Zoom Link TBA",
      minTier: "SILVER",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "What is your career field or interest area?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
          {
            text: "Specific topics you'd like to discuss?",
            type: "MULTISELECT",
            options: ["Career Change", "Skill Development", "Job Search", "Networking", "Work-Life Balance"],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  const staffMeeting = await prisma.event.create({
    data: {
      name: "Monthly Community Review Meeting",
      start: new Date("2026-01-31T18:00:00"),
      end: new Date("2026-01-31T20:00:00"),
      location: "Board Room",
      minTier: "GOLD",
      participantCapacity: 25,
      volunteerCapacity: 5,
      createdById: staff1.id,
      questions: {
        create: [
          {
            text: "Any topics you'd like to raise?",
            type: "TEXT",
            options: [],
            targetRole: "PARTICIPANT",
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${11} events with questions`);

  // Create some sample bookings
  console.log("📝 Creating sample bookings...");
  
  await prisma.booking.create({
    data: {
      userId: participant2.id,
      eventId: workshopEvent1.id,
      roleAtBooking: "PARTICIPANT",
      answers: {
        create: [
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: workshopEvent1.id, text: { contains: "interests you" } } }))!.id,
            value: "I want to give back to my community and make a positive impact",
          },
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: workshopEvent1.id, text: { contains: "Dietary" } } }))!.id,
            value: "Vegetarian",
          },
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: workshopEvent1.id, text: { contains: "hear about" } } }))!.id,
            value: "Friend",
          },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      userId: volunteer1.id,
      eventId: communityEvent.id,
      roleAtBooking: "VOLUNTEER",
      answers: {
        create: [
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: communityEvent.id, text: { contains: "T-shirt" } } }))!.id,
            value: "L",
          },
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: communityEvent.id, text: { contains: "experience" } } }))!.id,
            value: "Yes",
          },
          {
            questionId: (await prisma.question.findFirst({ where: { eventId: communityEvent.id, text: { contains: "areas" } } }))!.id,
            value: JSON.stringify(["Trash Collection", "Gardening"]),
          },
        ],
      },
    },
  });

  console.log(`✅ Created ${2} sample bookings`);

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   Users: ${await prisma.user.count()}`);
  console.log(`   Events: ${await prisma.event.count()}`);
  console.log(`   Questions: ${await prisma.question.count()}`);
  console.log(`   Bookings: ${await prisma.booking.count()}`);
  console.log(`   Answers: ${await prisma.answer.count()}`);
  console.log("\n💡 Test users (all use password: 123456):");
  console.log(`   Participant: walter@participant.com / 123456 (Walter Sullivan - GOLD)`);
  console.log(`   Participant: sarah@participant.com / 123456 (Sarah Johnson - SILVER)`);
  console.log(`   Volunteer: mike@volunteer.com / 123456 (Mike Chen - PLATINUM)`);
  console.log(`   Volunteer: lisa@volunteer.com / 123456 (Lisa Wong - GOLD)`);
  console.log(`   Staff: admin@staff.com / 123456 (Admin User - PLATINUM)`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
