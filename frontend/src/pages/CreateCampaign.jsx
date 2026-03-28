import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Bell, Clock, User, Sparkles, ChevronRight, Save } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TagInput from "../components/TagInput";
import { api } from "../api/client";

const STEPS = ["Define", "Message", "Launch"];

// ── Step 1 ──────────────────────────────────────────────────────────────────
function StepDefine({ form, setForm, onNext }) {
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");

  const sizeOptions = ["1–50", "51–200", "201+"];
  const fundingOptions = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Bootstrapped"];
  const goalOptions = ["Demo Request", "Discovery Call", "Partnership", "Free Trial"];

  const toggleSize = (s) => {
    const cur = form.target_company_size || "";
    setForm({ ...form, target_company_size: cur === s ? "" : s });
  };
  const toggleFunding = (f) => {
    const cur = form.funding_stage || "";
    setForm({ ...form, funding_stage: cur === f ? "" : f });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Define your target</h2>
      <p className="text-gray-500 text-sm mb-6">Precision targeting determines the success of your outbound engine. Set your parameters below.</p>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Campaign Name">
            <input
              className="input"
              placeholder="e.g. Q4 Fintech Outbound"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Campaign Goal">
            <select
              className="input"
              value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}
            >
              {goalOptions.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Target Industries">
          <TagInput
            tags={form.target_industries}
            onChange={(v) => setForm({ ...form, target_industries: v })}
            placeholder="e.g. SaaS, FinTech"
          />
        </Field>

        <Field label="Company Size (Employees)">
          <div className="flex gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  form.target_company_size === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Job Titles">
          <TagInput
            tags={form.job_titles}
            onChange={(v) => setForm({ ...form, job_titles: v })}
            placeholder="e.g. VP of Sales, Head of Growth"
          />
        </Field>

        <Field label="Funding Stage">
          <div className="flex flex-wrap gap-2">
            {fundingOptions.map((f) => (
              <button
                key={f}
                onClick={() => toggleFunding(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  form.funding_stage === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Geography">
          <input
            className="input"
            placeholder="North America, EMEA..."
            value={form.geography}
            onChange={(e) => setForm({ ...form, geography: e.target.value })}
          />
        </Field>

        <Field label="Custom Intent Signal" hint="AI agent will specifically look for this signal when searching.">
          <div className="relative">
            <input
              className="input pr-28"
              placeholder="e.g. Companies hiring a Head of Content"
              value={form.custom_signal}
              onChange={(e) => setForm({ ...form, custom_signal: e.target.value })}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              AI Intent Scraper
            </span>
          </div>
        </Field>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <Save size={14} /> Save as draft
        </button>
        <button
          onClick={onNext}
          disabled={!form.name}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition"
        >
          Define messaging <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2 ──────────────────────────────────────────────────────────────────
function StepMessage({ form, setForm, onBack, onNext }) {
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");
  const [generating, setGenerating] = useState(false);
  const [fu1Open, setFu1Open] = useState(false);
  const [fu2Open, setFu2Open] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    const result = await api.generateEmail({
      product_description: product.description || form.company_description || "",
      campaign_goal: form.goal || "",
      target_job_titles: form.job_titles || [],
      target_industry: (form.target_industries || []).join(", "),
    });
    setForm({
      ...form,
      email_subject: result.subject || "",
      email_body: result.body || "",
      followup1_body: result.followup1_body || "",
      followup2_body: result.followup2_body || "",
    });
    setGenerating(false);
  };

  // Live preview text
  const previewBody = (form.email_body || "")
    .replace(/{{first_name}}/g, "Sarah")
    .replace(/{{company_name}}/g, "Acme Corp")
    .replace(/{{company_description}}/g, "a fast-growing SaaS startup")
    .replace(/{{pain_point}}/g, "manual lead generation")
    .replace(/{{custom_reason}}/g, "you recently launched a new product");

  return (
    <div className="flex gap-6 h-full">
      {/* Left: Editor */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Email Sequence</h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50"
          >
            <Sparkles size={14} />
            {generating ? "Writing..." : "Generate with AI"}
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Subject Line">
            <input
              className="input"
              placeholder="Quick question about {{company_name}}'s scaling strategy"
              value={form.email_subject || ""}
              onChange={(e) => setForm({ ...form, email_subject: e.target.value })}
            />
          </Field>

          <Field label="Quick Body">
            <textarea
              className="input resize-none h-44 font-mono text-xs"
              placeholder="Hi {{first_name}},\n\nI noticed..."
              value={form.email_body || ""}
              onChange={(e) => setForm({ ...form, email_body: e.target.value })}
            />
          </Field>
        </div>

        {/* Follow-up sequence */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700 text-sm">Follow-up Sequence</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add Step</button>
          </div>
          <div className="space-y-2">
            <Collapsible
              step="Step 1"
              label="Gentle Nudge"
              sublabel="Sends after 5 days"
              open={fu1Open}
              onToggle={() => setFu1Open(!fu1Open)}
            >
              <textarea
                className="input resize-none h-28 font-mono text-xs mt-2"
                placeholder="Hey {{first_name}}, just circling back..."
                value={form.followup1_body || ""}
                onChange={(e) => setForm({ ...form, followup1_body: e.target.value })}
              />
            </Collapsible>
            <Collapsible
              step="Step 2"
              label="Value Addition: Case Study"
              sublabel="Sends after 10 days"
              open={fu2Open}
              onToggle={() => setFu2Open(!fu2Open)}
            >
              <textarea
                className="input resize-none h-28 font-mono text-xs mt-2"
                placeholder="Last one from me — happy to close this thread if the timing isn't right."
                value={form.followup2_body || ""}
                onChange={(e) => setForm({ ...form, followup2_body: e.target.value })}
              />
            </Collapsible>
          </div>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Back: Target Audience</button>
          <div className="flex gap-3">
            <button className="text-sm text-gray-400 hover:text-gray-600">Save as Draft</button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Next: Schedule <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="w-80 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Live Preview
          </div>
          <div className="px-4 py-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">A</div>
              <div>
                <div className="text-xs font-semibold text-gray-800">Alex Carter</div>
                <div className="text-[10px] text-gray-400">alex@fishhook.ai</div>
              </div>
            </div>
            {form.email_subject && (
              <p className="text-xs font-semibold text-gray-800 mb-2">{form.email_subject.replace(/{{company_name}}/g, "Acme Corp")}</p>
            )}
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{previewBody || "Your email will appear here once generated..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 3 ──────────────────────────────────────────────────────────────────
function StepLaunch({ form, onBack, onLaunch, launching }) {
  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Ready to launch</h2>
      <p className="text-gray-500 text-sm mb-6">Review your campaign before we start finding leads.</p>

      <div className="space-y-3">
        <SummaryRow label="Campaign" value={form.name} />
        <SummaryRow label="Goal" value={form.goal} />
        <SummaryRow label="Industries" value={(form.target_industries || []).join(", ") || "—"} />
        <SummaryRow label="Company size" value={form.target_company_size || "—"} />
        <SummaryRow label="Job titles" value={(form.job_titles || []).join(", ") || "—"} />
        {form.funding_stage && <SummaryRow label="Funding stage" value={form.funding_stage} />}
        {form.geography && <SummaryRow label="Geography" value={form.geography} />}
        {form.custom_signal && <SummaryRow label="Intent signal" value={form.custom_signal} />}
      </div>

      <div className="mt-5 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
        <p>🔍 We expect to find approximately <strong>15–30 leads</strong> based on your criteria.</p>
        <p className="mt-1 text-blue-600">⏱ This usually takes 2–4 minutes.</p>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
        <button
          onClick={onLaunch}
          disabled={launching}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {launching ? "Launching..." : "🚀 Launch campaign"}
        </button>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  );
}

function Collapsible({ step, label, sublabel, open, onToggle, children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase">{step}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-400">{sublabel}</span>
        </div>
        <ChevronDown size={15} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-3 bg-white">{children}</div>}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="text-gray-800 font-semibold text-right max-w-xs truncate">{value || "—"}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CreateCampaign() {
  const navigate = useNavigate();
  const product = JSON.parse(localStorage.getItem("fishhook_product") || "{}");

  const [step, setStep] = useState(0);
  const [launching, setLaunching] = useState(false);
  const [form, setForm] = useState({
    name: "",
    goal: "Demo Request",
    target_industries: [],
    target_company_size: "",
    job_titles: [],
    funding_stage: "",
    geography: "",
    custom_signal: "",
    email_subject: "",
    email_body: "",
    followup1_body: "",
    followup2_body: "",
  });

  const handleLaunch = async () => {
    setLaunching(true);
    const campaign = await api.createCampaign({
      product_id: product.id,
      name: form.name,
      goal: form.goal,
      company_description: product.description,
      target_industry: (form.target_industries || []).join(", "),
      target_company_size: form.target_company_size,
      target_job_titles: form.job_titles,
      target_keywords: [],
      funding_stage: form.funding_stage,
      geography: form.geography,
      custom_signal: form.custom_signal,
      email_subject: form.email_subject,
      email_body: form.email_body,
      followup1_body: form.followup1_body,
      followup2_body: form.followup2_body,
    });
    await api.runCampaign(campaign.id);
    navigate(`/campaigns/${campaign.id}/feed`);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <span className="font-semibold text-gray-700">New Campaign</span>
          {/* Step indicator */}
          <div className="flex items-center gap-1 ml-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition ${
                    i === step
                      ? "bg-blue-600 text-white"
                      : i < step
                      ? "bg-green-100 text-green-700 cursor-pointer"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < step ? "✓" : i + 1} {s}
                </button>
                {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 text-gray-400"><Bell size={18} /></button>
            <button className="p-2 text-gray-400"><Clock size={18} /></button>
            <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {product.name?.[0]?.toUpperCase() || "U"}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-8 py-7">
          {step === 0 && <StepDefine form={form} setForm={setForm} onNext={() => setStep(1)} />}
          {step === 1 && <StepMessage form={form} setForm={setForm} onBack={() => setStep(0)} onNext={() => setStep(2)} />}
          {step === 2 && <StepLaunch form={form} onBack={() => setStep(1)} onLaunch={handleLaunch} launching={launching} />}
        </main>
      </div>
    </div>
  );
}

// Add input class globally for this file
const style = document.createElement("style");
style.textContent = `.input { width: 100%; border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.625rem 0.875rem; font-size: 0.875rem; color: #111827; background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
.input:focus { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,0.15); }
select.input { appearance: none; }`;
if (!document.head.querySelector("[data-fishhook-input]")) {
  style.setAttribute("data-fishhook-input", "1");
  document.head.appendChild(style);
}
