import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Package, ChevronRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { api } from "../api/client";

function ProductCard({ product, isActive, onSelect }) {
  const industryTags = product.target_industries?.slice(0, 3) || [];
  const jobTags = product.target_job_titles?.slice(0, 2) || [];

  return (
    <div
      className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
        isActive ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-100"
      }`}
      onClick={() => onSelect(product)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
            <Package size={17} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
              {isActive && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
                  ACTIVE
                </span>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
      </div>

      {(industryTags.length > 0 || jobTags.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {industryTags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              {t}
            </span>
          ))}
          {jobTags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 text-[11px] text-gray-400">
        Added {product.created_at ? new Date(product.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </div>
    </div>
  );
}

function ProductDetail({ product, onSetActive }) {
  const isActive = (() => {
    try {
      return JSON.parse(localStorage.getItem("fishhook_product") || "{}").id === product.id;
    } catch {
      return false;
    }
  })();

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 h-full overflow-y-auto">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
          {product.description && (
            <p className="text-sm text-gray-500 mt-1">{product.description}</p>
          )}
        </div>
        {!isActive && (
          <button
            onClick={() => onSetActive(product)}
            className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Set as active
          </button>
        )}
        {isActive && (
          <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700">
            ACTIVE PRODUCT
          </span>
        )}
      </div>

      {product.value_proposition && (
        <Field label="Value Proposition" value={product.value_proposition} />
      )}

      {product.target_company_size && (
        <Field label="Target Company Size" value={product.target_company_size} />
      )}

      {product.pain_points?.length > 0 && (
        <TagField label="Pain Points" tags={product.pain_points} color="purple" />
      )}

      {product.target_industries?.length > 0 && (
        <TagField label="Target Industries" tags={product.target_industries} color="blue" />
      )}

      {product.target_job_titles?.length > 0 && (
        <TagField label="Target Job Titles" tags={product.target_job_titles} color="blue" />
      )}

      {product.buying_signals?.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Buying Signals</div>
          <div className="space-y-1.5">
            {product.buying_signals.map((s, i) => (
              <div key={i} className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {product.keywords?.length > 0 && (
        <TagField label="Keywords" tags={product.keywords} color="gray" />
      )}

      {product.competitors?.length > 0 && (
        <TagField label="Competitors" tags={product.competitors} color="gray" />
      )}
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

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const activeId = (() => {
    try {
      return JSON.parse(localStorage.getItem("fishhook_product") || "{}").id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    api.listProducts().then((data) => {
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      if (list.length > 0) {
        const active = list.find((p) => p.id === activeId) || list[0];
        setSelected(active);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSetActive = (product) => {
    localStorage.setItem("fishhook_product", JSON.stringify({ id: product.id, name: product.name, description: product.description }));
    setSelected({ ...product });
    setProducts((prev) => [...prev]);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-gray-900">Products</h1>
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            onClick={() => navigate("/products/new")}
          >
            <Plus size={15} />
            Add product
          </button>
        </header>

        <main className="flex-1 overflow-hidden flex gap-0">
          {/* Product list */}
          <div className="w-100 shrink-0 border-r border-gray-100 overflow-y-auto px-4 py-5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {products.length} {products.length === 1 ? "product" : "products"}
            </div>

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
              <div className="space-y-3">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isActive={p.id === activeId}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product detail */}
          <div className="flex-1 overflow-hidden p-5">
            {selected ? (
              <ProductDetail
                key={selected.id}
                product={selected}
                onSetActive={handleSetActive}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                Select a product to view details
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
