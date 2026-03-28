import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, FileText, ArrowLeft } from "lucide-react";
import { api } from "../api/client";

export default function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [productName, setProductName] = useState("");
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canAnalyse = files.length > 0 || description.trim().length >= 50;

  const addFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) => {
      if (f.size > 10 * 1024 * 1024) { setError(`${f.name} exceeds 10MB limit`); return false; }
      return true;
    });
    setFiles((prev) => [...prev, ...valid]);
    setError(null);
  };

  const removeFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleAnalyse = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.analyzeDocuments(files, description || null);
      if (result.icp) {
        sessionStorage.setItem("fishhook_icp_draft", JSON.stringify({ ...result.icp, productName }));
        navigate("/confirm-icp");
      } else {
        setError(result.detail || "Analysis failed. Please try again.");
      }
    } catch {
      setError("Analysis failed. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="px-8 py-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-bold text-gray-900 text-base">Fishhook</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-8 pt-8">
        <div className="w-full max-w-[560px]">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Tell us about your product</h1>
          <p className="text-gray-500 text-sm mb-7">We'll analyse it to find your ideal customers.</p>

          {/* Product Name */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Product Name
            </label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
              placeholder="e.g. Acme Analytics Engine"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>

          {/* Upload Documents */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Upload Documents
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.docx,.pptx"
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
              <Upload className="mx-auto mb-2 text-blue-500" size={28} />
              <p className="text-sm text-gray-600 font-medium">Drop product pitch decks or PDFs here</p>
              <p className="text-xs text-gray-400 mt-1">MAX SIZE 20MB</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                    <FileText size={14} className="text-gray-400" />
                    <span className="flex-1 text-gray-700 truncate">{f.name}</span>
                    <span className="text-gray-400 text-xs">{(f.size / 1024).toFixed(0)}KB</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text description */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Or Describe Your Product
            </label>
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white resize-none h-28"
              placeholder="Explain what your product does, who it's for, and the core problems it solves..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {description.length > 0 && description.length < 50 && (
              <p className="text-xs text-gray-400 mt-1">{50 - description.length} more characters needed</p>
            )}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleAnalyse}
            disabled={!canAnalyse || loading || !productName.trim()}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Reading your product documents...
              </>
            ) : (
              <>Analyse product →</>
            )}
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-8 py-5 text-xs text-gray-400">
        <span className="font-semibold text-gray-500">STEP 01 OF 03</span>
        <span className="mx-2">—</span>
        Product Definition
      </div>
    </div>
  );
}
