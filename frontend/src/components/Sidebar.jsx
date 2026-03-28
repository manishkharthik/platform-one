import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Megaphone, BarChart2, Settings, HelpCircle, LogOut } from "lucide-react";

export default function Sidebar({ unreadCount = 0 }) {
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/leads", icon: Users, label: "Leads" },
    { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
    { to: "/analytics", icon: BarChart2, label: "Analytics" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside
      className="flex flex-col h-screen w-[220px] shrink-0 text-sm"
      style={{ background: "#1a2035" }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="text-white font-bold text-base tracking-tight">FishHook</span>
        </div>
        <div className="text-[10px] font-semibold tracking-widest mt-0.5" style={{ color: "#4d5b73" }}>
          LEAD GEN ENGINE
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
            {label === "Leads" && unreadCount > 0 && (
              <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all">
          <HelpCircle size={16} />
          <span>Help Center</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-all"
          onClick={() => { localStorage.removeItem("fishhook_product"); navigate("/"); }}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
