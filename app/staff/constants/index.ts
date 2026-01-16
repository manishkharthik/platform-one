import { Category, Event, Attendee } from "../types";

export const INITIAL_EVENTS: Event[] = [
  { id: 1, title: "Staff Meeting", date: 6, month: 7, year: 2026, category: "workshops", location: "Main Hall", time: "10:00 AM", capacity: 30, registered: 25 },
  { id: 2, title: "Volunteer Training", date: 8, month: 7, year: 2026, category: "community", location: "Room 203", time: "2:00 PM", capacity: 20, registered: 18 },
  { id: 3, title: "Counseling Prep", date: 13, month: 7, year: 2026, category: "counseling", location: "Zoom", time: "9:00 AM", capacity: 15, registered: 12 },
  { id: 4, title: "Service Sync", date: 14, month: 7, year: 2026, category: "workshops", location: "Conference Room", time: "3:00 PM", capacity: 25, registered: 20 },
  { id: 5, title: "Outreach Review", date: 16, month: 7, year: 2026, category: "community", location: "Main Hall", time: "11:00 AM", capacity: 40, registered: 35 },
  { id: 6, title: "Volunteer Briefing", date: 21, month: 7, year: 2026, category: "volunteering", location: "Room 101", time: "4:00 PM", capacity: 50, registered: 45 },
  { id: 7, title: "Participant Check-in", date: 23, month: 7, year: 2026, category: "counseling", location: "Lobby", time: "1:00 PM", capacity: 30, registered: 28 },
  { id: 8, title: "Staff Orientation", date: 25, month: 7, year: 2026, category: "workshops", location: "Auditorium", time: "10:00 AM", capacity: 60, registered: 55 },
  { id: 9, title: "Community Showcase", date: 31, month: 7, year: 2026, category: "community", location: "Main Hall", time: "6:00 PM", capacity: 100, registered: 85 },
];

export const CATEGORIES: Category[] = [
  { name: "Workshops", color: "bg-orange-100 text-orange-700", dotColor: "bg-orange-500", value: "workshops" },
  { name: "Counseling", color: "bg-blue-100 text-blue-700", dotColor: "bg-blue-500", value: "counseling" },
  { name: "Community", color: "bg-green-100 text-green-700", dotColor: "bg-green-500", value: "community" },
  { name: "Volunteering", color: "bg-purple-100 text-purple-700", dotColor: "bg-purple-500", value: "volunteering" },
];

export const ATTENDANCE_ROWS: Attendee[] = [
  { id: 1, name: "John Doe", email: "john.doe@example.com", tier: "Gold", dietary: "Vegetarian", referral: "Social Media Ad", lastSeen: "2 hrs ago", status: "Checked In" },
  { id: 2, name: "Alice Smith", email: "alice.smith@studio.com", tier: "Silver", dietary: "None", referral: "Friend referral", lastSeen: "Yesterday", status: "Expected" },
  { id: 3, name: "Sarah Chen", email: "sarah.chen@design.co", tier: "Platinum", dietary: "Gluten-free", referral: "Newsletter", lastSeen: "10 mins ago", status: "On-site" },
  { id: 4, name: "Mark Brown", email: "mark.brown@lab.com", tier: "Basic", dietary: "None", referral: "Word of mouth", lastSeen: "3 days ago", status: "No-show" },
  { id: 5, name: "Riley Lee", email: "riley.lee@flow.io", tier: "Gold", dietary: "Vegan", referral: "Conference", lastSeen: "Just now", status: "Checked In" },
  { id: 6, name: "Emma Wilson", email: "emma.wilson@team.org", tier: "Basic", dietary: "None", referral: "LinkedIn", lastSeen: "5 hrs ago", status: "Expected" },
];

export const TIER_STYLES = {
  Gold: "bg-amber-100 text-amber-700",
  Silver: "bg-slate-100 text-slate-700",
  Platinum: "bg-indigo-100 text-indigo-700",
  Basic: "bg-gray-100 text-gray-700",
};

export const STATUS_STYLES = {
  "Checked In": "text-emerald-600",
  Expected: "text-blue-600",
  "No-show": "text-rose-600",
  "On-site": "text-amber-600",
};

export const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];