import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";

export default function AgentFeed() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [done, setDone] = useState(false);
  const [leadCount, setLeadCount] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    const source = api.streamEvents(campaignId);
    source.onmessage = (e) => {
      const msg = e.data;
      if (msg === "__DONE__") {
        setDone(true);
        source.close();
        return;
      }
      if (msg === "ping") return;
      setMessages((prev) => [...prev, msg]);
      if (msg.includes("score:")) setLeadCount((c) => c + 1);
    };
    return () => source.close();
  }, [campaignId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🪝 Agent Activity</h1>
            <p className="text-gray-400 text-sm">{leadCount} leads discovered so far</p>
          </div>
          {done && (
            <button
              className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
              onClick={() => navigate(`/campaigns/${campaignId}/leads`)}
            >
              View Leads →
            </button>
          )}
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 h-[500px] overflow-y-auto font-mono text-sm space-y-1">
          {messages.map((msg, i) => (
            <div key={i} className="text-gray-300">{msg}</div>
          ))}
          {!done && <div className="text-blue-400 animate-pulse">▌</div>}
          <div ref={bottomRef} />
        </div>

        {done && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-700 rounded-xl text-green-300 text-center">
            ✅ Pipeline complete — your leads are ready
          </div>
        )}
      </div>
    </div>
  );
}
