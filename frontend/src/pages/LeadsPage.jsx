import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
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

function ScorePill({ score, onClick }) {
  const cls = score >= 80 ? "bg-green-100 text-green-700" : score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";
  return (
    <span
      onClick={onClick}
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${cls} ${onClick ? "cursor-pointer hover:opacity-75 transition-opacity" : ""}`}
    >
      {score}
    </span>
  );
}

function SourceBadge({ source }) {
  const map = { producthunt: "PH", crunchbase: "CB", hn_hiring: "HN", github: "GH", mock: "—" };
  return (
    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
      {map[source] || source}
    </span>
  );
}

// ── Wayne campaign mock leads ─────────────────────────────────────────────
const WAYNE_MOCK_LEADS = [
  {
    id: "w1",
    company_name: "Helix AI",
    contact_name: "Marcus Chen",
    contact_title: "VP of Sales",
    company_description: "AI-powered revenue intelligence platform for mid-market SaaS.",
    industry: "SaaS",
    company_size: "51-200",
    funding_stage: "Series A",
    location: "San Francisco, CA",
    source: "crunchbase",
    icp_score: 92,
    icp_reasoning: "Strong ICP match: Series A SaaS, active outbound hiring, revenue-focused team.",
    email_status: "replied",
  },
  {
    id: "w2",
    company_name: "Cascade Labs",
    contact_name: "Priya Mehta",
    contact_title: "Head of Growth",
    company_description: "Compliance automation for fintech and healthcare companies.",
    industry: "Fintech",
    company_size: "11-50",
    funding_stage: "Seed",
    location: "New York, NY",
    source: "producthunt",
    icp_score: 87,
    icp_reasoning: "Fintech compliance niche with strong GTM motion, scaling sales team.",
    email_status: "replied",
  },
  {
    id: "w3",
    company_name: "Orion Compute",
    contact_name: "James Park",
    contact_title: "CTO",
    company_description: "GPU infrastructure-as-a-service for AI model training and inference.",
    industry: "Infrastructure",
    company_size: "11-50",
    funding_stage: "Pre-seed",
    location: "Austin, TX",
    source: "hn_hiring",
    icp_score: 81,
    icp_reasoning: "Technical buyer in AI infra — high intent based on HN hiring post.",
    email_status: "opened",
  },
  {
    id: "w4",
    company_name: "Pulsar Analytics",
    contact_name: "Sarah Kim",
    contact_title: "Director of Marketing",
    company_description: "Real-time customer analytics for e-commerce and D2C brands.",
    industry: "Analytics",
    company_size: "51-200",
    funding_stage: "Series A",
    location: "Seattle, WA",
    source: "crunchbase",
    icp_score: 78,
    icp_reasoning: "Marketing-led motion with active data tooling investment.",
    email_status: "sent",
  },
  {
    id: "w5",
    company_name: "Vanta Security",
    contact_name: "Tom Rivera",
    contact_title: "VP of Business Development",
    company_description: "Automated security compliance and trust management platform.",
    industry: "Security",
    company_size: "200-500",
    funding_stage: "Series B",
    location: "San Francisco, CA",
    source: "producthunt",
    icp_score: 74,
    icp_reasoning: "Large buyer with outbound team — compliance story resonates.",
    email_status: "sent",
  },
  {
    id: "w6",
    company_name: "Forge Platform",
    contact_name: "Aisha Johnson",
    contact_title: "Head of Partnerships",
    company_description: "Developer platform for building and deploying internal tools.",
    industry: "DevTools",
    company_size: "11-50",
    funding_stage: "Seed",
    location: "Remote",
    source: "github",
    icp_score: 69,
    icp_reasoning: "High GitHub engagement — dev-led growth with strong partnership potential.",
    email_status: "not_sent",
  },
  {
    id: "w7",
    company_name: "Strata Health",
    contact_name: "Lena Walsh",
    contact_title: "CEO",
    company_description: "AI-assisted clinical documentation for outpatient practices.",
    industry: "HealthTech",
    company_size: "11-50",
    funding_stage: "Seed",
    location: "Boston, MA",
    source: "producthunt",
    icp_score: 83,
    icp_reasoning: "Healthcare AI niche, founder-led sales, clear outbound intent.",
    email_status: "not_sent",
  },
  {
    id: "w8",
    company_name: "Loop Commerce",
    contact_name: "David Lee",
    contact_title: "Growth Lead",
    company_description: "Post-purchase experience platform for Shopify merchants.",
    industry: "E-commerce",
    company_size: "11-50",
    funding_stage: "Pre-seed",
    location: "Los Angeles, CA",
    source: "producthunt",
    icp_score: 65,
    icp_reasoning: "E-commerce pain point with clear outbound hook on returns flow.",
    email_status: "not_sent",
  },
];

// ── Mock email thread data ────────────────────────────────────────────────
const MOCK_THREADS = {
  w1: {
    subject: "Quick question about your go-to-market stack",
    sent: `Hi Marcus,\n\nCame across Helix AI on Crunchbase — congrats on the Series A. Impressive momentum.\n\nWe help mid-market SaaS teams like yours identify high-intent prospects before your competitors do. Given you're scaling outbound right now, thought it might be worth a quick chat.\n\n15 minutes this week?\n\nBest,\nAlex`,
    reply: `Hey Alex,\n\nGood timing — we're actually in the middle of evaluating our outbound tooling right now. Would love to see what you're working on.\n\nThursday at 2pm PT works for me.\n\nMarcus`,
  },
  w2: {
    subject: "FishHook × Cascade Labs — worth a look?",
    sent: `Hi Priya,\n\nSaw Cascade Labs on Product Hunt last week — the compliance angle for fintech is really smart.\n\nWe've been helping similar teams find warm leads before they even post a job req. Curious if that's a pain point on your side as you scale the sales team.\n\nOpen to a quick call?\n\nAlex`,
    reply: `Alex — yes, actually. We've been struggling to find quality pipeline outside of referrals.\n\nSend me a calendar link and I'll book time.\n\nPriya`,
  },
  w3: {
    subject: "Outbound for infrastructure teams — different approach",
    sent: `Hi James,\n\nNoticed Orion Compute on HN Hiring — building GPU infra for AI workloads is exactly the kind of company we love working with.\n\nMost outbound tools are built for SaaS sales, not technical buyers. We do things differently. Worth a look?\n\nAlex`,
    reply: null,
  },
  w7: {
    subject: "Partnership angle for Strata Health",
    sent: `Hi Lena,\n\nStrata Health's clinical doc product caught my attention — especially the partnerships-led motion you're running.\n\nWe help teams like yours identify integration partners and distribution channels before your competitors do. Relevant?\n\nAlex`,
    reply: null,
  },
};

function getMockThread(lead) {
  if (MOCK_THREADS[lead.id]) return MOCK_THREADS[lead.id];
  const firstName = lead.contact_name?.split(" ")[0] || lead.contact_name;
  return {
    subject: `Scaling outbound at ${lead.company_name}`,
    sent: `Hi ${firstName},\n\nCame across ${lead.company_name} and was genuinely impressed by what you're building.\n\nWe help companies in the ${lead.industry || "B2B"} space identify high-intent leads using AI — and given your growth stage, thought there might be a strong fit.\n\nWould you be open to a 15-minute call this week?\n\nBest,\nAlex`,
    reply: lead.email_status === "replied" || lead.email_status === "opened"
      ? `Hi Alex,\n\nThanks for reaching out — this is actually quite timely. We've been thinking about how to scale our pipeline without just throwing headcount at it.\n\nLet's find a time. What does your calendar look like?\n\n${firstName}`
      : null,
  };
}

// ── Email Chat Panel ──────────────────────────────────────────────────────
const chatStatusConfig = {
  not_sent:  { label: "Not sent",          color: "bg-gray-100 text-gray-500" },
  approved:  { label: "Ready to send",     color: "bg-blue-100 text-blue-700" },
  sent:      { label: "Awaiting response", color: "bg-purple-100 text-purple-700" },
  opened:    { label: "Response opened",   color: "bg-teal-100 text-teal-700" },
  clicked:   { label: "Response opened",   color: "bg-teal-100 text-teal-700" },
  replied:   { label: "New reply",         color: "bg-green-100 text-green-700 font-semibold" },
  bounced:   { label: "Bounced",           color: "bg-red-100 text-red-600" },
};

function EmailChatPanel({ lead, onClose }) {
  const thread = getMockThread(lead);
  const hasSent = lead.email_status !== "not_sent";
  const hasReply = lead.email_status === "replied" || lead.email_status === "opened";
  const isUnread = lead.email_status === "replied";
  const cfg = chatStatusConfig[lead.email_status] || chatStatusConfig.not_sent;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
            {lead.contact_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{lead.contact_name}</div>
            <div className="text-xs text-gray-400">{lead.contact_title} · {lead.company_name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Thread subject */}
      <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs text-gray-500 flex items-center gap-2">
        <span className="font-medium text-gray-700">{hasSent ? "Re: " : "Draft: "}{thread.subject}</span>
        {!hasSent && <span className="text-[10px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded">Not sent</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!hasSent && (
          /* Not sent state */
          <div className="flex flex-col items-end gap-1 opacity-50">
            <span className="text-[10px] text-gray-400 mr-1">You · Draft</span>
            <div className="max-w-[85%] bg-gray-200 text-gray-500 rounded-2xl rounded-tr-sm px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap shadow-sm">
              <p className="font-semibold mb-1 text-gray-400 text-[10px] uppercase tracking-wide">{thread.subject}</p>
              {thread.sent}
            </div>
            <span className="text-[10px] text-gray-400 mr-1 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
              Not sent
            </span>
          </div>
        )}

        {hasSent && (
          /* Outbound email — right aligned */
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] text-gray-400 mr-1">You · {lead.email_status === "sent" ? "Today" : "Mar 25"}</span>
            <div className="max-w-[85%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap shadow-sm">
              <p className="font-semibold mb-1 text-blue-100 text-[10px] uppercase tracking-wide">{thread.subject}</p>
              {thread.sent}
            </div>
            {lead.email_status === "sent" && (
              <span className="text-[10px] text-purple-500 mr-1 flex items-center gap-1">
                <span>✓</span> <span>Sent · awaiting reply</span>
              </span>
            )}
            {(lead.email_status === "opened" || lead.email_status === "clicked") && (
              <span className="text-[10px] text-teal-500 mr-1 flex items-center gap-1">
                <span>✓✓</span> <span>Opened</span>
              </span>
            )}
            {hasReply && (
              <span className="text-[10px] text-green-500 mr-1 flex items-center gap-1">
                <span>✓✓</span>
                {isUnread
                  ? <strong className="font-bold">Replied ●</strong>
                  : <span>Opened</span>
                }
              </span>
            )}
          </div>
        )}

        {hasReply && thread.reply && (
          /* Reply — left aligned */
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 ml-1">{lead.contact_name?.split(" ")[0]} · Today</span>
              {isUnread && (
                <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">Replied ●</span>
              )}
            </div>
            <div className={`max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap shadow-sm border ${
              isUnread ? "bg-green-50 border-green-200 text-gray-800" : "bg-white border-gray-200 text-gray-700"
            }`}>
              {thread.reply}
            </div>
            {!isUnread && (
              <span className="text-[10px] text-teal-500 ml-1">Opened</span>
            )}
          </div>
        )}

        {lead.email_status === "sent" && (
          <div className="flex justify-center">
            <span className="text-[10px] text-gray-300 bg-gray-50 px-3 py-1.5 rounded-full">Waiting for {lead.contact_name?.split(" ")[0]} to reply...</span>
          </div>
        )}
      </div>

      {/* Reply input (disabled for demo) */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2 items-center">
          <input
            disabled
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 placeholder-gray-300 cursor-not-allowed"
            placeholder={hasReply ? `Reply to ${lead.contact_name?.split(" ")[0]}...` : "Send your email first to start the conversation"}
          />
          <button disabled className="p-2.5 bg-gray-100 text-gray-300 rounded-xl cursor-not-allowed">
            <Send size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">Connect Gmail to send replies from this thread</p>
      </div>
    </div>
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
function AIChatPanel({ campaignId, leads, aiFilter, onFilter, onReset, onOpenChat }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Ask me about your leads. Try: \"Show leads above 80\", \"Filter replied\", or \"Open email for Helix AI\"." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (overrideMsg) => {
    const msg = (overrideMsg || input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setLoading(true);
    try {
      const tableState = leads.map((l) => ({ company: l.company_name, contact_title: l.contact_title, score: l.icp_score, status: l.email_status, source: l.source, industry: l.industry, funding_stage: l.funding_stage }));
      const result = await api.chatWithLeads(campaignId, msg, tableState);

      if (result.action === "filter" && result.filter) {
        onFilter(result.filter);
        setMessages((m) => [...m, { role: "ai", text: result.message || "Filter applied.", tag: "filter" }]);
      } else if (result.action === "email" && result.lead) {
        const target = leads.find((l) => l.company_name?.toLowerCase().includes(result.lead.toLowerCase()));
        if (target) {
          onOpenChat(target);
          setMessages((m) => [...m, { role: "ai", text: result.message || `Opening email thread for ${result.lead}.`, tag: "email" }]);
        } else {
          setMessages((m) => [...m, { role: "ai", text: `Couldn't find a lead matching "${result.lead}".` }]);
        }
      } else {
        setMessages((m) => [...m, { role: "ai", text: result.message || "Done." }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div className="w-72 shrink-0 bg-white border-l border-gray-100 flex flex-col">
      <div className="px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-blue-500" />
            <span className="font-semibold text-gray-800 text-sm">Lead AI Assistant</span>
          </div>
          {aiFilter && (
            <button
              onClick={onReset}
              className="text-[10px] px-2 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full font-medium transition"
            >
              ✕ Clear filter
            </button>
          )}
        </div>
        {aiFilter ? (
          <p className="text-xs text-amber-600 mt-0.5 font-medium">
            Filtering by {aiFilter.field} {aiFilter.op} {aiFilter.value}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">Use AI to help with your leads</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
              m.role === "ai" ? "bg-gray-50 text-gray-700" : "bg-blue-600 text-white ml-4"
            }`}>
              {m.text}
            </div>
            {m.tag === "filter" && (
              <button onClick={onReset} className="mt-1 text-[10px] text-amber-600 hover:text-amber-800 underline ml-1">
                Reset filter
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-50 rounded-xl px-3.5 py-2.5 text-xs text-gray-400 animate-pulse">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-100 space-y-2">
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => send("Show leads with score above 80")} className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">High score leads</button>
          <button onClick={() => send("Filter replied leads")} className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">Replied leads</button>
          <button onClick={() => send("Summarise results")} className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">Summarise</button>
          <button onClick={() => send("Which lead should I email first?")} className="py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-lg">Who to email?</button>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button onClick={() => send()} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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

  const [leads, setLeads] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [activeLead, setActiveLead] = useState(null);
  const [chatLead, setChatLead] = useState(null);
  const [whyLead, setWhyLead] = useState(null);
  const [search, setSearch] = useState("");
  const [aiFilter, setAiFilter] = useState(null);
  const [sending, setSending] = useState(false);

  const normaliseStatuses = (list) =>
    list.map((l) => l.email_status === "approved" ? { ...l, email_status: "sent" } : l);

  const loadLeads = () => {
    api.getCampaign(campaignId).then((c) => {
      setCampaign(c);
      if (c?.name?.toUpperCase() === "WAYNE") {
        setLeads(normaliseStatuses(WAYNE_MOCK_LEADS));
        setLoading(false);
      } else {
        api.getLeads(campaignId).then((data) => { setLeads(normaliseStatuses(Array.isArray(data) ? data : [])); setLoading(false); });
      }
    });
  };

  const openChat = (lead) => {
    if (lead.email_status === "replied") {
      const updated = { ...lead, email_status: "opened" };
      setLeads((prev) => prev.map((l) => l.id === lead.id ? updated : l));
      setChatLead(updated);
    } else {
      setChatLead(lead);
    }
  };

  useEffect(() => { loadLeads(); }, [campaignId]);
  useEffect(() => {
    if (!whyLead) return;
    const close = () => setWhyLead(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [whyLead]);

  const applyAiFilter = (f) => setAiFilter(f);
  const resetAiFilter = () => setAiFilter(null);

  const filtered = leads.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      if (!((l.company_name || "").toLowerCase().includes(q) ||
        (l.contact_title || "").toLowerCase().includes(q) ||
        (l.company_description || "").toLowerCase().includes(q))) return false;
    }
    if (aiFilter) {
      const { field, op, value } = aiFilter;
      const fieldVal = { score: l.icp_score, status: l.email_status, source: l.source, industry: l.industry, funding_stage: l.funding_stage }[field];
      if (op === "gte") return Number(fieldVal) >= Number(value);
      if (op === "lte") return Number(fieldVal) <= Number(value);
      if (op === "eq") return String(fieldVal ?? "").toLowerCase() === String(value).toLowerCase();
      if (op === "contains") return String(fieldVal ?? "").toLowerCase().includes(String(value).toLowerCase());
    }
    return true;
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
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">Active Leads</h1>
                  {aiFilter && (
                    <button onClick={resetAiFilter} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-full font-medium transition">
                      {aiFilter.field} {aiFilter.op} {aiFilter.value} <X size={11} />
                    </button>
                  )}
                </div>
                {campaign && <p className="text-xs text-gray-400">{aiFilter ? `Showing ${filtered.length} filtered leads` : "Found 1,340 qualified leads based on recent intent data"}</p>}
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
                        onClick={() => openChat(lead)}
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
                        <td className="px-4 py-3.5 relative" onClick={(e) => e.stopPropagation()}>
                          <ScorePill
                            score={lead.icp_score}
                            onClick={() => setWhyLead(whyLead?.id === lead.id ? null : lead)}
                          />
                          {whyLead?.id === lead.id && (
                            <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-3.5 text-xs text-gray-700 leading-relaxed">
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${lead.icp_score >= 80 ? "bg-green-100 text-green-700" : lead.icp_score >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                                  {lead.icp_score} ICP Score
                                </span>
                              </div>
                              <p>{lead.icp_reasoning || "No reasoning available."}</p>
                              <button
                                onClick={() => setWhyLead(null)}
                                className="mt-2.5 text-[10px] text-gray-400 hover:text-gray-600"
                              >
                                Dismiss
                              </button>
                            </div>
                          )}
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
          {!activeLead && <AIChatPanel campaignId={campaignId} leads={leads} aiFilter={aiFilter} onFilter={applyAiFilter} onReset={resetAiFilter} onOpenChat={openChat} />}
        </div>
      </div>

      {/* Email chat panel */}
      {chatLead && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setChatLead(null)} />
          <EmailChatPanel lead={chatLead} onClose={() => setChatLead(null)} />
        </>
      )}

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
