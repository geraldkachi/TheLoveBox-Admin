import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus, Trash2, Tag, Layers } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  parent: string | null;
  isGiftType: boolean;
}

export default function Categories() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [isGiftType, setIsGiftType] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const parents = categories.filter((c) => !c.parent);

  const createMutation = useMutation({
    mutationFn: () => api.post("/categories", { name, parent: parent || null, isGiftType }),
    onSuccess: () => {
      toast.success("Category added — it's now live on the site.");
      setName("");
      setParent("");
      setIsGiftType(false);
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Couldn't add category."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success("Category removed.");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Couldn't delete category."),
  });

  return (
    // Ambient warm background for the "morning" feel
    <div className="min-h-screen bg-[#FCF8F5] pb-12">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="font-display text-[32px] font-medium text-[#2C2523] tracking-tight mb-2">
          Categories
        </h1>
        <p className="text-[15px] text-[#8A7A7D] max-w-xl leading-relaxed">
          Organize your storefront. Add occasions and gift types here to build your collections.
        </p>
      </div>

      {/* Add Category Form - Floating Card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate();
        }}
        className="bg-white/80 backdrop-blur-xl border border-[#F2E8E3] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-end gap-6 mb-12 relative overflow-hidden"
      >
        {/* Subtle decorative gradient blob inside the form */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FBE4E9]/30 to-transparent rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="flex-[2] w-full">
          <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
            Category Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Milestone Birthdays"
            className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] placeholder-[#B0A2A5] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300"
          />
        </div>

        <div className="flex-1 w-full">
          <label className="text-[13px] text-[#5C4F51] font-semibold tracking-wide uppercase mb-2 block">
            Parent
          </label>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full bg-[#FCF8F5] border border-[#F2E8E3] rounded-xl px-4 py-3 text-[15px] text-[#2C2523] outline-none focus:border-brand-pink focus:bg-white focus:ring-4 focus:ring-[#FBE4E9] transition-all duration-300 appearance-none"
          >
            <option value="">None (Top-level)</option>
            {parents.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 pb-3 md:pb-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 border border-[#D1C5C7] rounded bg-[#FCF8F5] group-hover:border-brand-pink transition-colors">
              <input
                type="checkbox"
                checked={isGiftType}
                onChange={(e) => setIsGiftType(e.target.checked)}
                className="peer sr-only"
              />
              <div className="absolute inset-0 bg-brand-pink rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <span className="text-[14px] text-[#5C4F51] font-medium">Gift Filter</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || !name.trim()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink to-[#A61D47] text-white rounded-xl px-6 py-3 text-[14px] font-semibold shadow-[0_4px_14px_rgba(196,39,92,0.3)] hover:shadow-[0_6px_20px_rgba(196,39,92,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          <Plus className="w-4 h-4" /> 
          {createMutation.isPending ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c._id}
            className="group relative bg-white border border-[#F2E8E3] rounded-2xl p-5 flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-brand-blush transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-medium text-[#2C2523] mb-1 group-hover:text-brand-pink transition-colors">
                  {c.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {!c.parent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A3854B] bg-[#FDF8EE] px-2 py-0.5 rounded-md border border-[#F2E8D1] uppercase tracking-wider">
                      <Layers className="w-3 h-3" /> Top-level
                    </span>
                  )}
                  {c.isGiftType && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-pink bg-[#FDF1F4] px-2 py-0.5 rounded-md border border-[#FBE4E9] uppercase tracking-wider">
                      <Tag className="w-3 h-3" /> Gift Type
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (window.confirm(`Delete "${c.name}"?`)) {
                    deleteMutation.mutate(c._id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="text-[#D1C5C7] hover:text-red-500 bg-transparent hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white border border-dashed border-[#F2E8E3] rounded-3xl">
            <p className="text-[#8A7A7D]">No categories yet. Create your first one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}