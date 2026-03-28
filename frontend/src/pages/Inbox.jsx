import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Archive, MoreHorizontal, RefreshCw, Send, ChevronDown, Bot } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
}

const classColors = {
  Interested: "bg-green-100 text-green-700",
  Objection: "bg-orange-100 text-orange-700",
  "Wrong person": "bg-gray-100 text-gray-500",
  "Out of office": "bg-gray-100 text-gray-500",
};

export default function Inbox() {
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getInbox().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setThreads(list);
      if (list.length > 0) setActive(list[0]);
    });
  }, []);

  const filtered = threads.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (t.contact_name || "").toLowerCase().includes(q) ||
      (t.company_name || "").toLowerCase().includes(q);
  });

  const handleSend = async () => {
    if (!reply.trim() || !active) return;
    setSending(true);
    // Mock send — just clear the reply box
    await new Promise((r) => setTimeout(r, 800));
    setReply("");
    setSending(false);
  };

  const unread = threads.filter((t) => !t.is_read).length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar unreadCount={unread} />
      <div className="flex-1 flex overflow-hidden">
        {/* Top search bar */}
        <div className="absolute top-0 left-[220px] right-0 bg-white border-b border-gray-100 px-5 py-3.5 z-10 flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-blue-400"
              placeholder="Search leads and conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 flex pt-[57px] overflow-hidden">
          {/* Left: conversation list */}
          <div className="w-[340px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Inbox</h2>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm p-8 text-center">
                  <Bot size={32} className="mb-3 text-gray-300" />
                  <p className="font-medium text-gray-500">No replies yet</p>
                  <p className="text-xs mt-1">Replies will appear here once leads respond to your emails.</p>
                </div>
              ) : (
                filtered.map((t) => (
                  <button
                    key={t.email_id}
                    onClick={() => setActive(t)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      active?.email_id === t.email_id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {!t.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${!t.is_read ? "ml-0" : "ml-3.5"}`}
                        style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                        {t.contact_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-sm truncate ${!t.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                            {t.contact_name}
                          </span>
                          <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(t.replied_at)}</span>
                        </div>
                        {t.reply_classification === "Interested" && (
                          <span className="inline-block text-[10px] font-semibold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full mb-1">HIGH INTENT</span>
                        )}
                        <p className="text-xs text-blue-600 font-medium truncate">{t.subject}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{t.reply_content?.slice(0, 70)}...</p>
                        {t.campaign_name && (
                          <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{t.campaign_name}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: thread view */}
          {active ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Thread header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-700">
                    {active.contact_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{active.contact_name}</span>
                      {active.reply_classification === "Interested" && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Decision Maker</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {active.contact_title && `${active.contact_title} · `}
                      {active.company_name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><Archive size={16} /></button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><MoreHorizontal size={16} /></button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
                    <Send size={13} /> Reply
                  </button>
                </div>
              </div>

              {/* Thread */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {/* Original email */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">ME</div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">You</span>
                      <span className="text-xs text-gray-400">{timeAgo(active.sent_at)}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mb-1">{active.subject}</p>
                    <p className="text-xs text-gray-600 whitespace-pre-wrap">{active.original_body?.slice(0, 400)}</p>
                  </div>
                </div>

                {/* Reply */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                    {active.contact_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 bg-white border border-gray-200 border-l-4 border-l-blue-400 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">{active.contact_name}</span>
                        {active.reply_classification && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${classColors[active.reply_classification] || "bg-gray-100 text-gray-500"}`}>
                            {active.reply_classification}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">{timeAgo(active.replied_at)}</span>
                    </div>
                    <p className="font-semibold text-sm text-gray-800 mb-1">{active.subject}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{active.reply_content}</p>
                  </div>
                </div>
              </div>

              {/* Reply composer */}
              <div className="border-t border-gray-100 px-6 py-4">
                {active.reply_draft && (
                  <div className="mb-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Bot size={12} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">AI Draft Generated</span>
                      </div>
                      <button className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
                        <RefreshCw size={10} /> Re-generate
                      </button>
                    </div>
                    <p className="text-xs text-gray-600">{active.reply_draft}</p>
                  </div>
                )}

                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    Re: {active.subject}
                  </div>
                  <textarea
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 resize-none h-24"
                    placeholder={active.reply_draft || "Write your reply..."}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-1.5 hover:bg-gray-100 rounded">B</button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">📎</button>
                    <button className="p-1.5 hover:bg-gray-100 rounded">😊</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setReply(active.reply_draft || ""); }}
                      className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={sending || (!reply.trim() && !active.reply_draft)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      <Send size={13} />
                      {sending ? "Sending..." : "Send Message →"}
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Pro tip: Press <kbd className="bg-gray-100 px-1 rounded font-mono">⌘↵</kbd> or <kbd className="bg-gray-100 px-1 rounded font-mono">Enter</kbd> to send
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
              <div className="text-center">
                <Bot size={40} className="mx-auto mb-3 text-gray-300" />
                <p>Select a conversation to view the thread</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
