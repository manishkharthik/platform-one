import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Clock, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

export default function Dashboard() {
  const navigate = useNavigate();
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");
  const [campaigns, setCampaigns] = useState([]);
  const [command, setCommand] = useState("");

  useEffect(() => {
    api.listCampaigns(product.id).then((data) => {
      setCampaigns(Array.isArray(data) ? data : []);
    }).catch(() => {});
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

          {hasCampaigns ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Performance Spotlight</div>
                <p className="text-xl font-bold text-gray-900">Your campaign conversion is up 22% this week.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                  Analyze me
                </button>
              </div>
              <div className="bg-gray-900 rounded-xl p-5 text-white">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Next Milestone</div>
                <p className="text-lg font-bold">Reach 10k total sent leads</p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>8,490/10,000</span>
                  </div>
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: "84.9%" }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
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

        {/* Command bar */}
        <div className="border-t border-gray-100 bg-white px-6 py-3 flex items-center gap-3">
          <input
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400"
            placeholder="Type a command (e.g. /new-campaign)"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded font-mono">⌘K</kbd>
        </div>
      </div>
    </div>
  );
}
