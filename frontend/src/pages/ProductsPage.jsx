import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, Trash2, X, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

function TagField({ label, tags, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${colorMap[color] || colorMap.gray}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function DetailModal({ product, onClose, onSetActive, onDelete, activeId }) {
  const isActive = product.id === activeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900 truncate">{product.name}</h2>
              {isActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                  ACTIVE
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 shrink-0">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {product.value_proposition && <Field label="Value Proposition" value={product.value_proposition} />}
          {product.target_company_size && <Field label="Target Company Size" value={product.target_company_size} />}
          {product.pain_points?.length > 0 && <TagField label="Pain Points" tags={product.pain_points} color="purple" />}
          {product.target_industries?.length > 0 && <TagField label="Target Industries" tags={product.target_industries} color="blue" />}
          {product.target_job_titles?.length > 0 && <TagField label="Target Job Titles" tags={product.target_job_titles} color="blue" />}
          {product.buying_signals?.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Buying Signals</div>
              <div className="space-y-1.5">
                {product.buying_signals.map((s, i) => (
                  <div key={i} className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">{s}</div>
                ))}
              </div>
            </div>
          )}
          {product.keywords?.length > 0 && <TagField label="Keywords" tags={product.keywords} color="gray" />}
          {product.competitors?.length > 0 && <TagField label="Competitors" tags={product.competitors} color="gray" />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={() => onDelete(product.id)}
            className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <div className="flex-1" />
          {!isActive && (
            <button
              onClick={() => onSetActive(product)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Set as active
            </button>
          )}
          {isActive && (
            <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold">
              <CheckCircle size={15} />
              Active product
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, isActive, onClick }) {
  const industryTags = product.target_industries?.slice(0, 2) || [];

  return (
    <div
      className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md flex flex-col gap-3 ${
        isActive ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-100"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Package size={17} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate max-w-full">{product.name}</h3>
            {isActive && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                ACTIVE
              </span>
            )}
          </div>
          {product.description && (
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 wrap-break-word">{product.description}</p>
          )}
        </div>
      </div>

      {industryTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {industryTags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium truncate max-w-30">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="text-[11px] text-gray-400 mt-auto">
        Added {product.created_at ? new Date(product.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    try {
      setActiveId(JSON.parse(localStorage.getItem("fishhook_product") || "{}").id || null);
    } catch {}

    api.listProducts().then((data) => {
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSetActive = (product) => {
    localStorage.setItem("fishhook_product", JSON.stringify({ id: product.id, name: product.name, description: product.description }));
    setActiveId(product.id);
    setSelected(null);
  };

  const handleDelete = async (id) => {
    await api.deleteProduct(id);
    if (activeId === id) {
      localStorage.removeItem("fishhook_product");
      setActiveId(null);
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <h1 className="text-sm font-semibold text-gray-900 flex-1">Products</h1>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            onClick={() => navigate("/products/new")}
          >
            <Plus size={15} />
            Add product
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📦</div>
              <h3 className="font-semibold text-gray-700 mb-1">No products yet</h3>
              <p className="text-gray-400 text-sm mb-5">Add your first product to start generating leads.</p>
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
                onClick={() => navigate("/products/new")}
              >
                + Add product
              </button>
            </div>
          ) : (
            <>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                {products.length} {products.length === 1 ? "product" : "products"}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isActive={p.id === activeId}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {selected && (
        <DetailModal
          product={selected}
          activeId={activeId}
          onClose={() => setSelected(null)}
          onSetActive={handleSetActive}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
