import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Plus, Mail, Send, MousePointerClick, Reply, Zap, CheckCircle, MailOpen, Calendar } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

const EMAIL_STATS = [
  { label: "Emails Sent", value: "8,490", change: "+12%", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Open Rate", value: "38.4%", change: "+4.2%", icon: Mail, color: "text-green-600", bg: "bg-green-50" },
  { label: "Qualified Leads", value: "147", change: "+18%", icon: MousePointerClick, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Replies", value: "312", change: "+22%", icon: Reply, color: "text-orange-600", bg: "bg-orange-50" },
];

const RECENT_ACTIVITY = [
  { icon: MailOpen, color: "text-green-500", bg: "bg-green-50", text: "Sarah Chen at Stripe opened your Step 1 email", time: "2m ago" },
  { icon: Reply, color: "text-blue-500", bg: "bg-blue-50", text: "Marcus Webb at Notion replied to your sequence", time: "14m ago" },
  { icon: Zap, color: "text-purple-500", bg: "bg-purple-50", text: "FishHook found 24 new leads from ProductHunt", time: "1h ago" },
  { icon: Calendar, color: "text-orange-500", bg: "bg-orange-50", text: "Meeting booked with Priya Sharma at Linear", time: "2h ago" },
  { icon: Send, color: "text-gray-500", bg: "bg-gray-100", text: "Step 2 emails sent to 38 leads in SaaS Tools campaign", time: "3h ago" },
  { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", text: "James Park at Figma marked as qualified", time: "5h ago" },
];

const TOP_LEADS = [
  { name: "Sarah Chen", company: "Stripe", title: "Head of Growth", score: 94, status: "replied", statusColor: "bg-blue-100 text-blue-700" },
  { name: "Marcus Webb", company: "Notion", title: "VP Marketing", score: 91, status: "meeting booked", statusColor: "bg-green-100 text-green-700" },
  { name: "Priya Sharma", company: "Linear", title: "Director of Sales", score: 88, status: "meeting booked", statusColor: "bg-green-100 text-green-700" },
  { name: "James Park", company: "Figma", title: "Growth Lead", score: 85, status: "qualified", statusColor: "bg-purple-100 text-purple-700" },
  { name: "Elena Torres", company: "Vercel", title: "CMO", score: 82, status: "contacted", statusColor: "bg-yellow-100 text-yellow-700" },
];

const PIPELINE = [
  { stage: "Leads Found", count: 1240, pct: 100, color: "bg-gray-200" },
  { stage: "Contacted", count: 847, pct: 68, color: "bg-blue-400" },
  { stage: "Opened", count: 531, pct: 43, color: "bg-blue-500" },
  { stage: "Replied", count: 312, pct: 25, color: "bg-purple-500" },
  { stage: "Qualified", count: 147, pct: 12, color: "bg-orange-500" },
  { stage: "Meeting Booked", count: 41, pct: 3, color: "bg-green-500" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCampaigns().then((data) => {
      setCampaigns(Array.isArray(data) ? data : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hasCampaigns = campaigns.length > 0;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <input
            className="flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Search..."
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              onClick={() => navigate("/campaigns/new")}
            >
              <Plus size={15} />
              Create campaign
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600"><Bell size={18} /></button>
            <button className="p-2 text-gray-400 hover:text-gray-600"><Clock size={18} /></button>
            <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {product.name?.[0]?.toUpperCase() || "U"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back. Here's what's happening with your outbound engine.
            </p>
          </div>

          {/* Email analytics stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {EMAIL_STATS.map(({ label, value, change, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
                  <div className={`${bg} p-1.5 rounded-lg`}>
                    <Icon size={14} className={color} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-xs text-green-600 font-medium mt-0.5">{change} this week</div>
              </div>
            ))}
          </div>

          {/* Middle row: Pipeline funnel + Recent activity */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Pipeline funnel */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Pipeline Funnel</div>
              <div className="space-y-2.5">
                {PIPELINE.map(({ stage, count, pct, color }) => (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{stage}</span>
                      <span className="text-gray-400">{count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent activity */}
            <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Recent Activity</div>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map(({ icon: Icon, color, bg, text, time }, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`${bg} p-1.5 rounded-lg shrink-0 mt-0.5`}>
                      <Icon size={13} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 leading-snug">{text}</p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top leads table */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Top Leads This Week</div>
              <button
                className="text-xs text-blue-600 font-semibold hover:underline"
                onClick={() => navigate("/leads")}
              >
                View all →
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 font-semibold uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left pb-2">Name</th>
                  <th className="text-left pb-2">Company</th>
                  <th className="text-left pb-2">Title</th>
                  <th className="text-left pb-2">Score</th>
                  <th className="text-left pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {TOP_LEADS.map(({ name, company, title, score, status, statusColor }) => (
                  <tr key={name} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-sm font-semibold text-gray-900">{name}</td>
                    <td className="py-2.5 text-sm text-gray-600">{company}</td>
                    <td className="py-2.5 text-sm text-gray-500">{title}</td>
                    <td className="py-2.5">
                      <span className="text-sm font-bold text-gray-900">{score}</span>
                      <span className="text-xs text-gray-400">/100</span>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && !hasCampaigns && (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
              <div className="text-4xl mb-3">🪝</div>
              <h3 className="font-semibold text-gray-700 text-lg mb-1">Get started with FishHook</h3>
              <p className="text-gray-400 text-sm mb-5">Create your first campaign to start generating leads.</p>
              <button
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                onClick={() => navigate("/campaigns/new")}
              >
                + Create campaign
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
