import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Filter, Download, Send, X, ChevronRight, Bot, RefreshCw, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

// ── Email status pill ─────────────────────────────────────────────────────
const statusPills = {
  not_sent: "bg-gray-100 text-gray-500",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  opened: "bg-teal-100 text-teal-700",
  clicked: "bg-teal-100 text-teal-700",
  replied: "bg-green-100 text-green-700 font-bold",
  bounced: "bg-red-100 text-red-600",
};
const statusLabels = {
  not_sent: "Not sent",
  approved: "Approved",
  sent: "Sent",
  opened: "Opened",
  clicked: "Clicked",
  replied: "Replied ●",
  bounced: "Bounced",
};

function ScorePill({ score }) {
  const cls = score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cls}`}>{score}</span>;
}

function SourceBadge({ source }) {
  const map = { producthunt: "PH", crunchbase: "CB", hn_hiring: "HN", github: "GH", mock: "—" };
  return (
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
      {map[source] || source}
    </span>
  );
}

// ── Lead Detail Panel ─────────────────────────────────────────────────────
function LeadDetail({ lead, onClose, onAction }) {
  const [emails, setEmails] = useState([]);
  const [simulating, setSimulating] = useState(false);
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    api.getLead(lead.id).then((d) => setEmails(d.emails || []));
  }, [lead.id]);

  const mainEmail = emails.find((e) => e.sequence_step === 1);

  const handleSend = async () => {
    setSending(true);
    await api.sendEmail(lead.id);
    onAction();
  };

  const handleApprove = async () => {
    setApproving(true);
    await api.approveEmail(lead.id);
    onAction();
  };

  const handleSimulateReply = async () => {
    setSimulating(true);
    await api.simulateReply(lead.id);
    setSimulating(false);
    onAction();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
            {lead.company_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{lead.company_name}</div>
            <div className="text-xs text-gray-400">{lead.contact_title || "—"}</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Company info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800">{lead.company_name}</span>
            <ScorePill score={lead.icp_score} />
          </div>
          <p className="text-sm text-gray-500">{lead.company_description}</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mt-2">
            {lead.industry && <span>🏭 {lead.industry}</span>}
            {lead.company_size && <span>👥 {lead.company_size}</span>}
            {lead.funding_stage && <span>💰 {lead.funding_stage}</span>}
            {lead.location && <span>📍 {lead.location}</span>}
          </div>
          <div className="mt-2 p-2.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 italic">
            "{lead.icp_reasoning}"
          </div>
        </div>

        {/* Email thread */}
        {mainEmail && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Email Thread</h4>
            <div className="space-y-3">
              {/* Sent email */}
              <div className={`p-3.5 rounded-xl text-sm ${mainEmail.is_sent ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-700">You → {lead.company_name}</span>
                  {mainEmail.sent_at && <span className="text-xs text-gray-400">{new Date(mainEmail.sent_at).toLocaleDateString()}</span>}
                </div>
                <p className="font-medium text-gray-800 text-xs mb-1">{mainEmail.subject}</p>
                <p className="text-gray-600 text-xs whitespace-pre-wrap line-clamp-4">{mainEmail.body}</p>
              </div>

              {/* Reply */}
              {mainEmail.reply_content && (
                <div className="p-3.5 rounded-xl bg-white border-l-4 border-green-400 border border-gray-200 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{lead.company_name} replied</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        mainEmail.reply_classification === "Interested" ? "bg-green-100 text-green-700" :
                        mainEmail.reply_classification === "Objection" ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {mainEmail.reply_classification}
                      </span>
                    </div>
                    {mainEmail.replied_at && <span className="text-xs text-gray-400">{new Date(mainEmail.replied_at).toLocaleDateString()}</span>}
                  </div>
                  <p className="text-gray-700 text-xs">{mainEmail.reply_content}</p>
                </div>
              )}

              {/* AI draft reply */}
              {mainEmail.reply_draft && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Bot size={12} className="text-blue-500" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">AI Draft Generated</span>
                    <button className="ml-auto text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
                      <RefreshCw size={10} /> Re-generate
                    </button>
                  </div>
                  <p className="text-gray-700 text-xs whitespace-pre-wrap">{mainEmail.reply_draft}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 p-4 space-y-2">
        {lead.email_status === "not_sent" && (
          <div className="flex gap-2">
            <button onClick={handleApprove} disabled={approving} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition disabled:opacity-50">
              {approving ? "Approving..." : "✓ Approve email"}
            </button>
            <button onClick={handleSend} disabled={sending} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
              {sending ? "Sending..." : "Send now →"}
            </button>
          </div>
        )}
        {lead.email_status === "approved" && (
          <button onClick={handleSend} disabled={sending} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
            {sending ? "Sending..." : "Send approved email →"}
          </button>
        )}
        {(lead.email_status === "sent" || lead.email_status === "opened") && (
          <button onClick={handleSimulateReply} disabled={simulating} className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition">
            {simulating ? "Simulating..." : "💬 Simulate Reply (Demo)"}
          </button>
        )}
        {lead.email_status === "sent" && (
          <div className="flex gap-2">
            <button onClick={() => api.simulateOpen(lead.id).then(onAction)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg">
              Simulate Open
            </button>
            <button onClick={() => api.simulateClick(lead.id).then(onAction)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg">
              Simulate Click
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Chat Panel ─────────────────────────────────────────────────────────
function AIChatPanel({ campaignId, leads }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Use AI to help with your leads. Try: \"Select all leads with score above 80\" or \"How many have replied?\"" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const tableState = leads.map((l) => ({ company: l.company_name, score: l.icp_score, status: l.email_status, source: l.source }));
      const result = await api.chatWithLeads(campaignId, msg, tableState);
      setMessages((m) => [...m, { role: "ai", text: result.message || "Done." }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col">
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-blue-500" />
          <span className="font-semibold text-gray-800 text-sm">Lead AI Assistant</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Use AI to help with your leads</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
            m.role === "ai" ? "bg-gray-50 text-gray-700" : "bg-blue-600 text-white ml-4"
          }`}>
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 space-y-2">
        <div className="flex gap-1.5">
          <button onClick={() => setInput("Analyse this lead")} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">Analyse this lead</button>
          <button onClick={() => setInput("Summarise results")} className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">Summarise</button>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={send} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function LeadsPage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [activeLead, setActiveLead] = useState(null);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  const loadLeads = () => {
    api.getLeads(campaignId).then((data) => { setLeads(Array.isArray(data) ? data : []); setLoading(false); });
    api.getCampaign(campaignId).then(setCampaign);
  };

  useEffect(() => { loadLeads(); }, [campaignId]);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (l.company_name || "").toLowerCase().includes(q) ||
      (l.contact_title || "").toLowerCase().includes(q) ||
      (l.company_description || "").toLowerCase().includes(q);
  });

  const toggleSelect = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((l) => l.id)));
  };

  const sendSelected = async () => {
    setSending(true);
    await Promise.all([...selected].map((id) => api.sendEmail(id)));
    setSelected(new Set());
    setSending(false);
    loadLeads();
  };

  const repliedCount = leads.filter((l) => l.email_status === "replied").length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar unreadCount={repliedCount} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Search leads, companies or signers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-gray-600"><Filter size={18} /></button>
            <a href={api.exportCSV(campaignId)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-lg transition">
              <Download size={15} /> Export
            </a>
            {selected.size > 0 && (
              <button
                onClick={sendSelected}
                disabled={sending}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <Send size={14} /> {sending ? "Sending..." : `Send to ${selected.size}`}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Centre: table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Breadcrumb */}
            <div className="px-5 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Marketing / Leads Pipeline</div>
                <h1 className="text-lg font-bold text-gray-900">Active Leads</h1>
                {campaign && <p className="text-xs text-gray-400">Found 1,340 qualified leads based on recent intent data</p>}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
                + Add New Lead
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading leads...</div>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="w-10 px-4 py-3">
                        <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Person</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Why this lead</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Source</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setActiveLead(lead)}
                        className={`border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors ${
                          lead.email_status === "replied" ? "border-l-4 border-l-green-400" : ""
                        } ${selected.has(lead.id) ? "bg-blue-50" : "bg-white"}`}
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} className="rounded" />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-gray-800">{lead.contact_name || "—"}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{lead.contact_title}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-gray-900">{lead.company_name}</div>
                          <div className="text-xs text-gray-400 mt-0.5 max-w-[180px] truncate">{lead.company_description}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div title={lead.icp_reasoning}>
                            <ScorePill score={lead.icp_score} />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <p className="text-xs text-gray-500 truncate" title={lead.icp_reasoning}>{lead.icp_reasoning}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <SourceBadge source={lead.source} />
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs ${statusPills[lead.email_status] || statusPills.not_sent}`}>
                            {statusLabels[lead.email_status] || "Not sent"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-gray-100 bg-white px-5 py-3 flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                Engage Action
              </button>
              <div className="text-xs text-gray-400">
                🤖 <span className="font-semibold text-gray-600">{leads.length}</span> AI Leads Analysed this Year
              </div>
            </div>
          </div>

          {/* Right: AI Chat */}
          {!activeLead && <AIChatPanel campaignId={campaignId} leads={leads} />}
        </div>
      </div>

      {/* Lead detail panel */}
      {activeLead && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setActiveLead(null)} />
          <LeadDetail
            lead={activeLead}
            onClose={() => setActiveLead(null)}
            onAction={() => { loadLeads(); setActiveLead(null); }}
          />
        </>
      )}
    </div>
  );
}
