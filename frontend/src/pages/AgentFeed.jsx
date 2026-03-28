import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

function classify(msg) {
  if (msg.includes("[LEAD_IDENTIFIED]") || msg.includes("LEAD_IDENTIFIED")) return "lead";
  if (msg.includes("[CONNECTION") || msg.includes("[INITIALIZING") || msg.includes("🚀") || msg.includes("[SCRAPING")) return "system";
  if (msg.includes("⚠️") || msg.includes("failed") || msg.includes("error")) return "warn";
  if (msg.includes("✅") || msg.includes("🎉")) return "success";
  return "default";
}

const colors = {
  lead: "#4ade80",
  system: "#60a5fa",
  warn: "#fbbf24",
  success: "#34d399",
  default: "#94a3b8",
};

function LogLine({ msg, ts }) {
  const type = classify(msg);
  return (
    <div className="flex items-start gap-3 font-mono text-xs leading-relaxed">
      <span className="text-gray-600 shrink-0 pt-0.5">{ts}</span>
      <span style={{ color: colors[type] }}>{msg}</span>
    </div>
  );
}

const PHASES = ["Discovering leads", "Enriching", "Drafting emails", "Done"];

export default function AgentFeed() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [done, setDone] = useState(false);
  const [leadCount, setLeadCount] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const bottomRef = useRef(null);
  const startTime = useRef(Date.now());

  const ts = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d.getMilliseconds().toString().padStart(2, "0").slice(0, 2)}`;
  };

  useEffect(() => {
    const source = api.streamEvents(campaignId);
    source.onmessage = (e) => {
      const msg = e.data;
      if (msg === "__DONE__") { setDone(true); setPhaseIdx(3); source.close(); return; }
      if (msg === "ping") return;
      setLogs((prev) => [...prev, { msg, ts: ts() }]);
      if (msg.includes("score:") || msg.includes("[LEAD_IDENTIFIED]")) setLeadCount((c) => c + 1);
      if (msg.includes("Enriching") || msg.includes("Scoring")) setPhaseIdx(1);
      if (msg.includes("Drafting") || msg.includes("email")) setPhaseIdx(2);
    };
    source.onerror = () => source.close();
    return () => source.close();
  }, [campaignId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => navigate(`/campaigns/${campaignId}/leads`), 2500);
      return () => clearTimeout(t);
    }
  }, [done]);

  const progress = done ? 100 : Math.min(95, phaseIdx * 30 + (leadCount * 2));

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#080d1a" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-base">🪝 Fishhook</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-semibold uppercase tracking-wide">Agent Active</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col px-8 py-4">
        {/* Stats row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-5xl font-bold text-white mb-1">{leadCount} leads found</div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-1.5 w-64 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-gray-500 text-xs font-mono">{PHASES[phaseIdx]}</span>
            </div>
          </div>
          <div className="text-right font-mono text-xs space-y-1">
            <div className="text-gray-500">ENGINE_LATENCY: <span className="text-gray-400">424ms</span></div>
            <div className="text-gray-500">THREADS_ACTIVE: <span className="text-green-400">56</span></div>
          </div>
        </div>

        {/* Terminal log */}
        <div
          className="flex-1 min-h-0 overflow-y-auto rounded-xl p-4 space-y-1"
          style={{ background: "#0d1220", maxHeight: "420px" }}
        >
          {logs.map((entry, i) => (
            <LogLine key={i} msg={entry.msg} ts={entry.ts} />
          ))}
          {!done && (
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-gray-600">{ts()}</span>
              <span className="text-blue-400 animate-pulse">▌</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm rounded-lg transition"
              onClick={() => navigate("/dashboard")}
            >
              Stop Engine
            </button>
            <div className="flex -space-x-1">
              {["#3b82f6", "#10b981", "#f59e0b"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-gray-900" style={{ background: c }} />
              ))}
            </div>
          </div>
          {(done || leadCount > 0) && (
            <button
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              onClick={() => navigate(`/campaigns/${campaignId}/leads`)}
            >
              View Leads →
            </button>
          )}
        </div>

        {done && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center text-green-400 text-sm font-medium">
            ✅ Pipeline complete — redirecting to leads in 2 seconds...
          </div>
        )}
      </main>
    </div>
  );
}
