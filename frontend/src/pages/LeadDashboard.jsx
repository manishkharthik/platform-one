import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

const ScoreBadge = ({ score }) => {
  const color =
    score >= 80
      ? "bg-green-900 text-green-300"
      : score >= 60
      ? "bg-yellow-900 text-yellow-300"
      : "bg-red-900 text-red-300";
  return <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>{score}</span>;
};

const StatusBadge = ({ status }) => {
  const colors = {
    new: "bg-blue-900 text-blue-300",
    contacted: "bg-purple-900 text-purple-300",
    replied: "bg-yellow-900 text-yellow-300",
    qualified: "bg-green-900 text-green-300",
    "meeting booked": "bg-emerald-900 text-emerald-300",
    rejected: "bg-gray-800 text-gray-400",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || colors.new}`}>
      {status}
    </span>
  );
};

export default function LeadDashboard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.getLeads(campaignId).then(setLeads);
  }, [campaignId]);

  const filtered = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">🪝 Leads</h1>
            <p className="text-gray-400">
              {leads.length} discovered · {leads.filter((l) => l.icp_score >= 60).length} qualified
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href={api.exportCSV(campaignId)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              ⬇ Export CSV
            </a>
            <button
              onClick={() => navigate("/integrations")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              🔗 Integrations
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {["all", "new", "contacted", "replied", "qualified", "meeting booked", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === s ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Score</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Source</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => navigate(`/leads/${lead.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{lead.company_name}</div>
                    <div className="text-gray-400 text-xs truncate max-w-xs">
                      {lead.company_description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={lead.icp_score} />
                  </td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{lead.contact_title}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{lead.source}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-blue-400 text-sm">View →</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
