import Link from "next/link";
import {
  Calendar,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                PlatformOne
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                How it works
              </Link>
              <Link
                href="#about"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                About
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/calendar"
                className="px-5 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/calendar"
                className="px-5 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                Event Management Made Simple
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
              Consolidate All Your <span className="text-red-500">Events</span>{" "}
              in One Place
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Streamline event coordination for volunteers, participants, and
              staff. Manage bookings, schedules, and communications seamlessly
              across your organization.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/calendar"
                className="px-8 py-4 bg-red-500 text-white rounded-lg font-bold text-lg hover:bg-red-600 transition-colors text-center"
              >
                Start Organizing
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold text-lg hover:border-gray-400 transition-colors text-center"
              >
                See How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600 font-medium">
                  Organizations
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">15K+</div>
                <div className="text-sm text-gray-600 font-medium">
                  Events Managed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600 font-medium">
                  Active Users
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              {/* Mini Calendar Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h3 className="font-bold text-lg text-gray-900">
                    Upcoming Events
                  </h3>
                  <span className="text-sm text-gray-500">January 2025</span>
                </div>

                {/* Sample Events */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">06</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        Workshop Session
                      </div>
                      <div className="text-xs text-gray-600">
                        10:00 AM - 2:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">13</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        Volunteer Orientation
                      </div>
                      <div className="text-xs text-gray-600">
                        9:00 AM - 11:00 AM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">21</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        Community Meetup
                      </div>
                      <div className="text-xs text-gray-600">
                        3:00 PM - 5:00 PM
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">25</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">
                        Staff Training
                      </div>
                      <div className="text-xs text-gray-600">
                        1:00 PM - 4:00 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-white border-y border-gray-200 py-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for organizations coordinating volunteers,
              participants, and staff
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Unified Calendar
              </h3>
              <p className="text-gray-600 leading-relaxed">
                View all events, workshops, and meetings in one central
                calendar. Never miss an important date.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multi-Role Management
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Separate views and permissions for volunteers, participants, and
                staff members.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Easy Booking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Streamline event registration and booking process for all
                participants.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Team Communication
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Keep everyone connected with integrated messaging for all
                stakeholders.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Time Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor volunteer hours and staff time with built-in tracking
                tools.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-red-300 transition-colors">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Real-time Updates
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Instant notifications for schedule changes, new events, and
                important updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-12 lg:p-16 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Event Management?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations already using PlatformOne to
            coordinate their events seamlessly.
          </p>
          <Link
            href="/calendar"
            className="inline-block px-8 py-4 bg-white text-red-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                PlatformOne
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 PlatformOne. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Privacy
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Terms
              </Link>
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
