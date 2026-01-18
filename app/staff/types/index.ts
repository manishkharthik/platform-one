export type CategoryValue = "workshops" | "counseling" | "community" | "volunteering";

export type Event = {
  id: number;
  title: string;
  date: number;
  month: number;
  year: number;
  category: CategoryValue;
  location?: string;
  time?: string;
  capacity?: number;
  registered?: number;
  registeredParticipants?: number;
  registeredVolunteers?: number;
  participantCapacity?: number;
  volunteerCapacity?: number;
  dbId?: string; // Database ID for fetching attendees
};

export type AttendanceStatus = "Checked In" | "Expected" | "No-show" | "On-site";

export type Attendee = {
  id: number;
  name: string;
  email: string;
  tier: "Gold" | "Silver" | "Platinum" | "Basic";
  dietary: string;
  referral: string;
  lastSeen: string;
  status: AttendanceStatus;
};

export type Category = {
  name: string;
  color: string;
  dotColor: string;
  value: CategoryValue;
};

export type NewEventForm = {
  title: string;
  startDate: string;
  location: string;
  capacity: string;
  category: CategoryValue;
  time: string;
};
