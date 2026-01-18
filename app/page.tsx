"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ShieldCheck,
  Users,
  ArrowRight,
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  Loader,
} from "lucide-react";

const roles = [
  {
    id: "participant-volunteer",
    title: "Participant / Volunteer",
    description: "Book sessions, volunteer, and track your involvement.",
    accent: "from-orange-400 via-red-400 to-pink-500",
    icon: Users,
  },
  {
    id: "staff",
    title: "Staff",
    description: "Approve requests, manage calendars, and message teams.",
    accent: "from-emerald-400 via-teal-400 to-cyan-500",
    icon: ShieldCheck,
  },
] as const;

type RoleId = (typeof roles)[number]["id"];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<RoleId>("participant-volunteer");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((item) => item.id === role),
    [role]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const accessCode = formData.get("accessCode") as string;

      // Call authentication endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          accessCode: role === "staff" ? accessCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Store auth token and user data
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      // Store user information
      if (data.user) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
      }
      
      // Ensure userRole is stored (this is critical for the volunteer bug fix)
      if (data.userRole) {
        localStorage.setItem("userRole", data.userRole);
      } else if (data.user) {
        // Fallback: if userRole is not in response, try to fetch it
        console.warn("userRole not in login response, fetching from user endpoint");
        try {
          const userResponse = await fetch(`/api/users/${data.user.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.role) {
              localStorage.setItem("userRole", userData.role);
            }
          }
        } catch (err) {
          console.error("Failed to fetch user role:", err);
        }
      }

      // Route based on user's actual role from database
      if (data.userRole === "STAFF") {
        router.push("/staff");
      } else {
        // PARTICIPANT or VOLUNTEER
        router.push("/calendar");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-10 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute left-1/3 top-1/3 h-80 w-80 rounded-full bg-pink-500/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                PlatformOne
              </p>
              <h1 className="text-2xl font-semibold">Unified Access</h1>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Sign in to the right space, every time.
            </h2>
            <p className="max-w-xl text-lg text-white/70">
              Choose your role to personalize your workspace. Participants stay
              on track; staff keep everything moving.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roles.map((item) => {
              const Icon = item.icon;
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRole(item.id)}
                  aria-pressed={isActive}
                  className={`group relative overflow-hidden rounded-2xl border px-5 py-6 text-left transition ${
                    isActive
                      ? "border-white/30 bg-white/10 shadow-xl"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                  disabled={isLoading}
                >
                  <div
                    className={`absolute inset-0 opacity-0 transition group-hover:opacity-60 ${
                      isActive ? "opacity-80" : ""
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-30`}
                    />
                  </div>
                  <div className="relative space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{item.title}</p>
                      <p className="text-sm text-white/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>
              First time? Ask your coordinator for the participant link or a
              staff invite code.
            </span>
          </div>
        </div>

        <div className="mt-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-lg lg:mt-0">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Log in
            </p>
            <h3 className="text-2xl font-semibold">
              {selectedRole?.title} access
            </h3>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-white/80">
              Email address
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <Mail className="h-4 w-4 text-white/50" />
                <input
                  type="email"
                  name="email"
                  placeholder="you@organization.org"
                  autoComplete="email"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </label>

            <label className="block text-sm font-medium text-white/80">
              Password
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                <Lock className="h-4 w-4 text-white/50" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                  required
                  disabled={isLoading}
                />
              </div>
            </label>

            {role === "staff" && (
              <label className="block text-sm font-medium text-white/80">
                Staff access code
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                  <KeyRound className="h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    name="accessCode"
                    placeholder="STAFF-2025"
                    className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
                    disabled={isLoading}
                  />
                </div>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Continue as {selectedRole?.title}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              className="text-left hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70 hover:text-white disabled:opacity-50"
              disabled={isLoading}
            >
              Need help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
