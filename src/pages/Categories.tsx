import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus, Trash2 } from "lucide-react";
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
    <div>
      <h1 className="font-display text-[26px] text-brand-ink mb-1">Categories</h1>
      <p className="text-[14px] text-[#8a7a7d] mb-8">
        Add occasions and gift types here — they show up on the website immediately.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate();
        }}
        className="bg-white border border-brand-blush rounded-2xl p-5 flex flex-wrap items-end gap-3 mb-8"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="text-[12.5px] text-brand-ink font-medium mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Milestone Birthdays"
            className="w-full border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="text-[12.5px] text-brand-ink font-medium mb-1 block">Parent category</label>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value)}
            className="w-full border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink"
          >
            <option value="">None (top-level)</option>
            {parents.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-brand-ink pb-2">
          <input type="checkbox" checked={isGiftType} onChange={(e) => setIsGiftType(e.target.checked)} />
          Gift type filter
        </label>
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-brand-pink text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-brand-pinkDark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </form>

      <div className="bg-white border border-brand-blush rounded-2xl divide-y divide-brand-blush">
        {categories.map((c) => (
          <div key={c._id} className="flex items-center justify-between px-5 py-3">
            <div>
              <span className="text-[14px] text-brand-ink">{c.name}</span>
              {!c.parent && <span className="ml-2 text-[11px] text-brand-gold uppercase tracking-wide">Top-level</span>}
              {c.isGiftType && <span className="ml-2 text-[11px] text-brand-pink uppercase tracking-wide">Gift type</span>}
            </div>
            <button
              onClick={() => deleteMutation.mutate(c._id)}
              className="text-[#c8b8bb] hover:text-brand-pink transition-colors"
              aria-label={`Delete ${c.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
