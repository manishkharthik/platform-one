import { useState } from "react";
import { useNavigate } from "react-router-dom";

const IntegrationCard = ({ icon, name, description, connected, onConnect }) => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex items-start justify-between gap-4">
    <div className="flex items-start gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-white">{name}</h3>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
        {connected && (
          <span className="mt-2 inline-block text-xs text-green-400 bg-green-900/30 border border-green-700 px-2 py-1 rounded-full">
            ✓ Connected
          </span>
        )}
      </div>
    </div>
    <button
      onClick={onConnect}
      className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${
        connected
          ? "bg-gray-700 text-gray-400 cursor-default"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
      disabled={connected}
    >
      {connected ? "Connected" : "Connect"}
    </button>
  </div>
);

export default function Integrations() {
  const navigate = useNavigate();
  const [gmailConnected, setGmailConnected] = useState(false);
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackPreview, setSlackPreview] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6 text-sm"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-gray-400 mt-1">
            Connect your tools to close the loop from discovery to booked meeting.
          </p>
        </div>

        <div className="space-y-4">
          <IntegrationCard
            icon="📧"
            name="Gmail"
            description="Send approved email sequences directly from your Gmail account. Track opens, clicks, and replies automatically."
            connected={gmailConnected}
            onConnect={() => setGmailConnected(true)}
          />

          <IntegrationCard
            icon="💬"
            name="Slack"
            description="Get notified in Slack when a lead replies. See the reply snippet and jump straight to the lead."
            connected={slackConnected}
            onConnect={() => {
              setSlackConnected(true);
              setSlackPreview(true);
            }}
          />

          {slackPreview && (
            <div className="ml-4 p-4 bg-gray-800 rounded-xl border border-gray-700 font-mono text-sm">
              <div className="text-green-400 font-bold mb-2">🪝 FishHook · #sales-alerts</div>
              <div className="text-white">
                <span className="text-yellow-400">New reply from</span>{" "}
                <span className="font-bold">Jasper AI</span>
              </div>
              <div className="text-gray-300 mt-1 italic">
                "Hey, this is actually really relevant timing for us — can you send over more info?"
              </div>
              <div className="mt-2">
                <span className="text-blue-400 underline cursor-pointer">View lead →</span>
              </div>
            </div>
          )}

          <IntegrationCard
            icon="📐"
            name="Linear"
            description="Auto-create a Linear task when a lead hits 'qualified' status. Flows straight into your engineering workflow."
            connected={false}
            onConnect={() => {}}
          />

          <IntegrationCard
            icon="🔗"
            name="HubSpot"
            description="Push qualified leads and all interaction history into HubSpot when they hit 'meeting booked'."
            connected={false}
            onConnect={() => {}}
          />
        </div>

        {/* Mock pipeline view */}
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Pipeline</h2>
          <p className="text-gray-400 text-sm mb-4">
            Once a meeting is booked, leads graduate into your deal pipeline.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: "Meeting Booked", count: 3, color: "border-emerald-700 text-emerald-300" },
              { label: "Demo Done", count: 1, color: "border-blue-700 text-blue-300" },
              { label: "Proposal Sent", count: 1, color: "border-yellow-700 text-yellow-300" },
              { label: "Closed Won", count: 0, color: "border-green-700 text-green-300" },
              { label: "Closed Lost", count: 0, color: "border-red-700 text-red-300" },
            ].map((stage) => (
              <div
                key={stage.label}
                className={`bg-gray-900 rounded-xl border ${stage.color} p-3 text-center`}
              >
                <div className={`text-2xl font-bold ${stage.color.split(" ")[1]}`}>
                  {stage.count}
                </div>
                <div className="text-gray-400 text-xs mt-1">{stage.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
