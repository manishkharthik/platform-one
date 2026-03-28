import { useEffect, useState } from "react";
import { Mail, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

export default function Settings() {
  const [status, setStatus] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    api.getAuthStatus().then(setStatus).catch(() => {});

    // Check URL params for post-OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("gmail") === "connected") {
      api.getAuthStatus().then(setStatus);
      window.history.replaceState({}, "", "/settings");
    }
  }, []);

  const handleDisconnect = async () => {
    setDisconnecting(true);
    await api.disconnectGmail();
    setStatus((s) => ({ ...s, gmail: { connected: false, email: null } }));
    setDisconnecting(false);
  };

  const gmailConnected = status?.gmail?.connected;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your email integrations and account settings.</p>

        {/* Email Integrations */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-xl">
          <h2 className="font-semibold text-gray-800 mb-4">Email Integration</h2>
          <p className="text-sm text-gray-500 mb-5">
            Connect your Gmail account to send cold emails and replies directly from your own inbox.
          </p>

          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
                <Mail size={18} className="text-red-500" />
              </div>
              <div>
                <div className="font-medium text-gray-800 text-sm">Gmail</div>
                {gmailConnected ? (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5">
                    <CheckCircle size={11} />
                    <span>{status.gmail.email}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <XCircle size={11} />
                    <span>Not connected</span>
                  </div>
                )}
              </div>
            </div>

            {gmailConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            ) : (
              <button
                onClick={() => api.connectGmail()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <ExternalLink size={13} />
                Connect Gmail
              </button>
            )}
          </div>

          {!gmailConnected && (
            <p className="text-xs text-gray-400 mt-3">
              You need to connect Gmail before sending emails. FishHook will send from your own account so emails land in the primary inbox.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
