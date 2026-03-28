import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Plus, X } from "lucide-react";
import TagInput from "../components/TagInput";
import { api } from "../api/client";

export default function ConfirmICP() {
  const navigate = useNavigate();
  const draft = JSON.parse(sessionStorage.getItem("fishhook_icp_draft") || "{}");

  const [productName] = useState(draft.productName || "");
  const [form, setForm] = useState({
    description: draft.description || "",
    value_proposition: draft.value_proposition || "",
    pain_points: draft.pain_points || [],
    target_industries: draft.target_industries || [],
    target_company_size: draft.target_company_size || "",
    target_job_titles: draft.target_job_titles || [],
    buying_signals: draft.buying_signals || [],
    keywords: draft.keywords || [],
    competitors: draft.competitors || [],
  });
  const [saving, setSaving] = useState(false);
  const [signalInput, setSignalInput] = useState("");

  const addSignal = () => {
    if (!signalInput.trim()) return;
    setForm((f) => ({ ...f, buying_signals: [...f.buying_signals, signalInput.trim()] }));
    setSignalInput("");
  };

  const removeSignal = (idx) =>
    setForm((f) => ({ ...f, buying_signals: f.buying_signals.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    const product = await api.createProduct({ name: productName, ...form });
    localStorage.setItem("fishhook_product", JSON.stringify({ id: product.id, name: product.name, description: product.description }));
    sessionStorage.removeItem("fishhook_icp_draft");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-8 py-5 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-bold text-gray-900">Fishhook</span>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-8 pb-16">
        {/* Success banner */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl mb-6 text-sm">
          <CheckCircle size={16} className="text-green-500 shrink-0" />
          <div>
            <span className="font-semibold text-green-800">Analysis Complete</span>
            <span className="text-green-700"> — We've successfully generated your Ideal Customer Profile based on your input.</span>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Here's what we found</h1>
        <p className="text-gray-500 text-sm mb-7">Review and edit your Ideal Customer Profile to ensure our lead generation targets the right high-intent prospects.</p>

        {/* Product Description */}
        <Section title="Product Description">
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none h-20"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Section>

        {/* Value Proposition */}
        <Section title="Value Proposition">
          <input
            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            value={form.value_proposition}
            onChange={(e) => setForm({ ...form, value_proposition: e.target.value })}
          />
        </Section>

        {/* Market & Targeting */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-4">Market & Targeting</h3>

          <div className="space-y-4">
            {/* Pain Points */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pain Points</label>
              <TagInput
                tags={form.pain_points}
                onChange={(v) => setForm({ ...form, pain_points: v })}
                placeholder="Add pain point..."
                color="purple"
              />
            </div>

            {/* Industries + Company Size */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Industries</label>
                <TagInput
                  tags={form.target_industries}
                  onChange={(v) => setForm({ ...form, target_industries: v })}
                  placeholder="e.g. SaaS"
                  color="blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Company Size</label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="e.g. 11-200 employees"
                  value={form.target_company_size}
                  onChange={(e) => setForm({ ...form, target_company_size: e.target.value })}
                />
              </div>
            </div>

            {/* Target Job Titles */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Job Titles</label>
              <TagInput
                tags={form.target_job_titles}
                onChange={(v) => setForm({ ...form, target_job_titles: v })}
                placeholder="e.g. Head of Sales"
                color="blue"
              />
            </div>

            {/* Buying Signals */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Buying Signals</label>
              <div className="space-y-2 mb-2">
                {form.buying_signals.map((signal, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <span className="flex-1 text-gray-700">{signal}</span>
                    <button onClick={() => removeSignal(i)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  placeholder="e.g. Recently raised funding"
                  value={signalInput}
                  onChange={(e) => setSignalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSignal()}
                />
                <button onClick={addSignal} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <button
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => navigate("/")}
          >
            Cancel and reset
          </button>
          <button
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save product →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">{title}</h3>
      {children}
    </div>
  );
}
