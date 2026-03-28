import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

const statusConfig = {
  running: { label: "RUNNING", class: "bg-green-100 text-green-700" },
  complete: { label: "COMPLETE", class: "bg-gray-100 text-gray-600" },
  pending: { label: "PENDING", class: "bg-yellow-100 text-yellow-700" },
  paused: { label: "PAUSED", class: "bg-orange-100 text-orange-700" },
};

function CampaignCard({ campaign, onClick }) {
  const status = statusConfig[campaign.status] || statusConfig.pending;
  const replyPct = campaign.sent_count > 0
    ? ((campaign.replied_count / campaign.sent_count) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="pt-0.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${status.class}`}>
            {status.label}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{campaign.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>📅 {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span>
            {campaign.target_industry && <span>👥 Targeting {campaign.target_industry}</span>}
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <Stat label="LEADS" value={campaign.lead_count || 0} />
          <Stat label="SENT" value={campaign.sent_count || 0} />
          <Stat label="REPLIED" value={`${replyPct}%`} highlight />
          <button
            onClick={onClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
          >
            View leads →
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${highlight ? "text-blue-600" : "text-gray-800"}`}>{value}</div>
      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function CampaignsPage() {
  const navigate = useNavigate();
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listCampaigns(product.id).then((data) => {
      setCampaigns(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const running = campaigns.filter((c) => c.status === "running").length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <input
            className="flex-1 max-w-xs bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Search campaigns..."
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
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Manage your automated outbound engine. Monitor real-time performance and optimize lead conversion flows.
              </p>
            </div>
            {running > 0 && (
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Active Now</div>
                <div className="text-2xl font-bold text-blue-600">{running} Running</div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
              <div className="text-4xl mb-3">🪝</div>
              <h3 className="font-semibold text-gray-700 text-lg mb-1">Create your first campaign</h3>
              <p className="text-gray-400 text-sm mb-5">Define your target audience and let FishHook find your buyers.</p>
              <button
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                onClick={() => navigate("/campaigns/new")}
              >
                + Create campaign
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  onClick={() => navigate(`/campaigns/${c.id}/leads`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
