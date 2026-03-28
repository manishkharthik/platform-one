import { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({ tags = [], onChange, placeholder = "Type and press Enter", color = "blue" }) {
  const [input, setInput] = useState("");

  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-600",
  };

  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput("");
  };

  const remove = (idx) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 min-h-[42px] flex flex-wrap gap-1.5 items-center">
      {tags.map((tag, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.blue}`}
        >
          {tag}
          <button onClick={() => remove(i)} className="hover:opacity-70">
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        className="flex-1 min-w-[120px] outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        placeholder={tags.length === 0 ? placeholder : ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !input && tags.length > 0) remove(tags.length - 1);
        }}
        onBlur={add}
      />
    </div>
  );
}
