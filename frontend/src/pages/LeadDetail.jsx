import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function LeadDetail() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [emails, setEmails] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getLead(leadId).then((data) => {
      setLead(data.lead);
      setEmails(data.emails);
    });
  }, [leadId]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    await api.regenerateEmail(leadId);
    const data = await api.getLead(leadId);
    setEmails(data.emails);
    setRegenerating(false);
  };

  const handleStatus = async (status) => {
    await api.updateStatus(leadId, status);
    setLead({ ...lead, status });
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const activeEmail = emails.find((e) => e.sequence_step === activeStep);
  const scoreColor =
    lead.icp_score >= 80
      ? "text-green-400"
      : lead.icp_score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 text-sm">
          ← Back
        </button>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Company card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold">{lead.company_name}</h2>
              <span className={`text-2xl font-bold ${scoreColor}`}>{lead.icp_score}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">{lead.company_description}</p>
            <div className="mt-3 space-y-1 text-sm text-gray-400">
              <div>📍 {lead.location || "Unknown"}</div>
              <div>💼 {lead.company_size || "Unknown size"}</div>
              <div>💰 {lead.funding_stage || "Unknown stage"}</div>
              <div>🏷 {lead.source}</div>
            </div>
            <div className="mt-3 p-3 bg-gray-800 rounded-lg text-sm text-gray-300 italic">
              "{lead.icp_reasoning}"
            </div>
          </div>

          {/* Actions card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <h3 className="font-semibold mb-3">Best contact</h3>
            <div className="text-blue-300 font-medium">{lead.contact_title}</div>

            <h3 className="font-semibold mt-5 mb-3">Update status</h3>
            <div className="flex flex-wrap gap-2">
              {["new", "contacted", "replied", "qualified", "meeting booked", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    lead.status === s ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {lead.company_url && (
              <a
                href={lead.company_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 block text-blue-400 hover:text-blue-300 text-sm"
              >
                🔗 {lead.company_url}
              </a>
            )}
          </div>
        </div>

        {/* Email editor */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Email Sequence</h3>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-50"
            >
              {regenerating ? "Regenerating..." : "🔄 Regenerate"}
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setActiveStep(step)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  activeStep === step ? "bg-blue-600" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                {step === 1 ? "Initial" : step === 2 ? "Follow-up 1" : "Follow-up 2"}
              </button>
            ))}
          </div>

          {activeEmail ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Subject</label>
                <input
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  defaultValue={activeEmail.subject}
                  key={`subject-${activeEmail.id}`}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Body</label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-48 font-mono text-sm"
                  defaultValue={activeEmail.body}
                  key={`body-${activeEmail.id}`}
                />
              </div>
              <button
                onClick={() => copy(`Subject: ${activeEmail.subject}\n\n${activeEmail.body}`)}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded-lg text-sm"
              >
                {copied ? "✅ Copied!" : "📋 Copy Email"}
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              No email for this step — score too low for drafting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
