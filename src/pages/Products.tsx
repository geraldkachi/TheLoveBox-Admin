import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { api } from "../lib/api";
import { Trash2, UploadCloud, Plus, X, Video as VideoIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  parent: string | null;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  videos: string[];
  categories: { _id: string; name: string }[];
  stock: number;
}

interface SizeRow {
  label: string;
  price: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: "#FBE4E9",
    borderRadius: "0.5rem",
    minHeight: "42px",
    fontSize: "14px",
    boxShadow: "none",
    "&:hover": { borderColor: "#C4275C" },
  }),
  multiValue: (base: any) => ({ ...base, backgroundColor: "#FBE4E9" }),
  multiValueLabel: (base: any) => ({ ...base, color: "#211A1D" }),
};

export default function Products() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", price: "", description: "", stock: "10" });
  const [selectedCategories, setSelectedCategories] = useState<{ value: string; label: string }[]>([]);
  const [sizes, setSizes] = useState<SizeRow[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c._id,
        label: c.parent ? `— ${c.name}` : c.name,
      })),
    [categories]
  );

  const { data } = useQuery<{ items: Product[] }>({
    queryKey: ["products"],
    queryFn: async () => (await api.get("/products?limit=50")).data,
  });

  const resetForm = () => {
    setForm({ name: "", price: "", description: "", stock: "10" });
    setSelectedCategories([]);
    setSizes([]);
    setFiles([]);
  };

  const createMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append("categories", JSON.stringify(selectedCategories.map((c) => c.value)));
      if (sizes.length) {
        fd.append(
          "sizes",
          JSON.stringify(sizes.filter((s) => s.label && s.price).map((s) => ({ label: s.label, price: Number(s.price) })))
        );
      }
      files.forEach((f) => fd.append("media", f));
      return api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      toast.success("Product added — visible on the site now.");
      resetForm();
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || "Couldn't add product."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success("Product removed.");
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addSizeRow = () => setSizes((s) => [...s, { label: "", price: "" }]);
  const updateSizeRow = (i: number, key: keyof SizeRow, value: string) =>
    setSizes((s) => s.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
  const removeSizeRow = (i: number) => setSizes((s) => s.filter((_, idx) => idx !== i));

  const onFilesPicked = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };
  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div>
      <h1 className="font-display text-[26px] text-brand-ink mb-1">Products</h1>
      <p className="text-[14px] text-[#8a7a7d] mb-8">Upload items against one or more categories so customers can find them.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name || !form.price) return toast.error("Add a name and price first.");
          if (!selectedCategories.length) return toast.error("Select at least one category.");
          createMutation.mutate();
        }}
        className="bg-white border border-brand-blush rounded-2xl p-5 flex flex-col gap-4 mb-8"
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink"
          />
          <input
            placeholder="Price (NGN)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink"
          />
        </div>

        <div>
          <label className="text-[12.5px] text-brand-ink font-medium mb-1 block">
            Categories <span className="text-[#8a7a7d] font-normal">(pick as many as apply)</span>
          </label>
          <Select
            isMulti
            styles={selectStyles}
            options={categoryOptions}
            value={selectedCategories}
            onChange={(v) => setSelectedCategories(v as any)}
            placeholder="Search categories..."
          />
        </div>

        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink w-40"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink"
          rows={3}
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] text-brand-ink font-medium">
              Sizes <span className="text-[#8a7a7d] font-normal">(optional — leave empty for a single price)</span>
            </label>
            <button type="button" onClick={addSizeRow} className="flex items-center gap-1 text-[12.5px] text-brand-pink font-medium">
              <Plus className="w-3.5 h-3.5" /> Add size
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="flex flex-col gap-2">
              {sizes.map((row, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="e.g. Small Bouquet 15 Roses"
                    value={row.label}
                    onChange={(e) => updateSizeRow(i, "label", e.target.value)}
                    className="flex-1 border border-brand-blush rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-brand-pink"
                  />
                  <input
                    placeholder="Price"
                    type="number"
                    value={row.price}
                    onChange={(e) => updateSizeRow(i, "price", e.target.value)}
                    className="w-32 border border-brand-blush rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-brand-pink"
                  />
                  <button type="button" onClick={() => removeSizeRow(i)} className="text-[#c8b8bb] hover:text-brand-pink">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 border border-dashed border-brand-blush rounded-lg px-3 py-3 text-[13px] text-[#8a7a7d] cursor-pointer hover:border-brand-pink transition-colors">
          <UploadCloud className="w-4 h-4" />
          Click to add product images or a short video (add as many as you like)
          <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => onFilesPicked(e.target.files)} />
        </label>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-blush bg-brand-blush">
                {f.type.startsWith("video/") ? (
                  <div className="w-full h-full flex items-center justify-center text-brand-pink">
                    <VideoIcon className="w-5 h-5" />
                  </div>
                ) : (
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11.5px] text-[#8a7a7d] -mt-2">
          Images and videos up to 40MB each. The storefront shows images first in a carousel, then plays any video.
        </p>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-brand-pink text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-brand-pinkDark transition-colors disabled:opacity-60"
        >
          {createMutation.isPending ? "Adding..." : "Add product"}
        </button>
      </form>

      <div className="grid grid-cols-4 gap-4">
        {data?.items?.map((p) => (
          <div key={p._id} className="bg-white border border-brand-blush rounded-2xl overflow-hidden">
            <div className="aspect-square bg-brand-blush relative">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
              {p.videos?.length > 0 && (
                <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <VideoIcon className="w-2.5 h-2.5" /> video
                </span>
              )}
            </div>
            <div className="p-3">
              <p className="text-[13px] font-medium text-brand-ink truncate">{p.name}</p>
              <p className="text-[12px] text-[#8a7a7d] truncate">
                {p.categories?.map((c) => c.name).join(", ")}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[13px] font-medium text-brand-ink">₦{p.price?.toLocaleString()}</span>
                <button onClick={() => deleteMutation.mutate(p._id)} className="text-[#c8b8bb] hover:text-brand-pink">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
