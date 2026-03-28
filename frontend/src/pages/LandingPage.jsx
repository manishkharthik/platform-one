import { useNavigate } from "react-router-dom";
import { Zap, Target, Mail } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "ICP Extraction",
    desc: "Upload a product doc and let AI extract your Ideal Customer Profile automatically.",
  },
  {
    icon: Zap,
    title: "Live Lead Discovery",
    desc: "TinyFish agents crawl ProductHunt, Crunchbase, HN, and GitHub in parallel to find high-intent leads.",
  },
  {
    icon: Mail,
    title: "Auto Email Sequences",
    desc: "3-step cold email sequences are drafted and scored for every qualifying lead.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const hasProduct = !!localStorage.getItem("fishhook_product");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-bold text-gray-900 text-base tracking-tight">FishHook</span>
        </div>
        <div className="flex items-center gap-3">
          {hasProduct && (
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => navigate(hasProduct ? "/dashboard" : "/products/new")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            {hasProduct ? "Open app →" : "Get started →"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-16">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "#e8f0fe", color: "#1a56db" }}
        >
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
          AI-Powered B2B Lead Generation
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight max-w-2xl mb-5">
          Find your buyers.<br />
          <span className="text-blue-600">Automatically.</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl mb-10 leading-relaxed">
          Upload your product doc, and FishHook discovers high-intent leads across the web, scores them against your ICP, and drafts personalised cold emails — in minutes.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/products/new")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm"
          >
            Create your first product →
          </button>
          {hasProduct && (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition"
            >
              Go to dashboard
            </button>
          )}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-3 gap-6 max-w-3xl w-full">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-gray-100 p-6 text-left shadow-sm"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={17} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-5 text-center text-xs text-gray-400">
        FishHook · TinyFish $2M Pre-Accelerator
      </footer>
    </div>
  );
}
