import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

const STEP_UPLOAD = "upload";
const STEP_REVIEW = "review";

export default function ICPSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(STEP_UPLOAD);
  const [uploading, setUploading] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    company_description: "",
    target_industry: "",
    target_company_size: "10-200",
    target_job_titles: [],
    target_keywords: [],
  });
  const [titleInput, setTitleInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const result = await api.uploadDocument(file);
      if (result.icp) {
        const icp = result.icp;
        setForm({
          name: "",
          company_description: icp.company_description || "",
          target_industry: icp.target_industry || "",
          target_company_size: icp.target_company_size || "10-200",
          target_job_titles: icp.target_job_titles || [],
          target_keywords: icp.target_keywords || [],
        });
        setStep(STEP_REVIEW);
      } else {
        setUploadError(result.detail || "Failed to extract ICP from document");
      }
    } catch (e) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const addTag = (field, input, setInput) => {
    if (!input.trim()) return;
    setForm((f) => ({ ...f, [field]: [...f[field], input.trim()] }));
    setInput("");
  };

  const removeTag = (field, idx) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  };

  const handleLaunch = async () => {
    setLaunching(true);
    const campaign = await api.createCampaign(form);
    await api.runCampaign(campaign.id);
    navigate(`/campaigns/${campaign.id}/feed`);
  };

  if (step === STEP_UPLOAD) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
        <div className="w-full max-w-xl space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white">🪝 FishHook</h1>
            <p className="text-gray-400 mt-1">
              Upload your product doc. We'll figure out who to find.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
              dragOver
                ? "border-blue-500 bg-blue-500/10"
                : "border-gray-700 hover:border-gray-500"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.md"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {uploading ? (
              <div className="space-y-3">
                <div className="text-4xl animate-bounce">🤖</div>
                <p className="text-gray-300 font-medium">Reading your document...</p>
                <p className="text-gray-500 text-sm">Extracting your ICP with OpenAI</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-4xl">📄</div>
                <p className="text-gray-300 font-medium">
                  Drop your pitch deck, one-pager, or product doc
                </p>
                <p className="text-gray-500 text-sm">PDF, TXT, or Markdown · Max 10MB</p>
                <button className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium">
                  Browse files
                </button>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {uploadError}
            </div>
          )}

          <div className="text-center">
            <button
              className="text-gray-500 hover:text-gray-300 text-sm underline"
              onClick={() => setStep(STEP_REVIEW)}
            >
              Skip upload — fill in manually instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP_REVIEW — show extracted ICP for confirmation/editing
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
            ✅ ICP extracted — review and edit before launching
          </div>
          <h2 className="text-2xl font-bold">Confirm your ICP</h2>
        </div>

        <div className="space-y-4">
          <input
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Campaign name (e.g. Q2 Outbound)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-24"
            placeholder="What does your product do?"
            value={form.company_description}
            onChange={(e) => setForm({ ...form, company_description: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="Target industry"
              value={form.target_industry}
              onChange={(e) => setForm({ ...form, target_industry: e.target.value })}
            />
            <select
              className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              value={form.target_company_size}
              onChange={(e) => setForm({ ...form, target_company_size: e.target.value })}
            >
              <option value="1-10">1–10 employees</option>
              <option value="10-50">10–50 employees</option>
              <option value="10-200">10–200 employees</option>
              <option value="50-500">50–500 employees</option>
            </select>
          </div>

          {/* Job Titles */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Target job titles</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. CTO, VP Marketing"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag("target_job_titles", titleInput, setTitleInput)}
              />
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                onClick={() => addTag("target_job_titles", titleInput, setTitleInput)}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.target_job_titles.map((t, i) => (
                <span key={i} className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {t}
                  <button onClick={() => removeTag("target_job_titles", i)} className="text-blue-400 hover:text-white">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Keywords</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="e.g. content marketing, B2B SaaS"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTag("target_keywords", keywordInput, setKeywordInput)}
              />
              <button
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                onClick={() => addTag("target_keywords", keywordInput, setKeywordInput)}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.target_keywords.map((k, i) => (
                <span key={i} className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {k}
                  <button onClick={() => removeTag("target_keywords", i)} className="text-green-400 hover:text-white">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
              onClick={() => setStep(STEP_UPLOAD)}
            >
              ← Re-upload
            </button>
            <button
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold text-lg transition disabled:opacity-50"
              onClick={handleLaunch}
              disabled={launching || !form.name || !form.company_description}
            >
              {launching ? "Launching agents..." : "🚀 Find My Leads"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
