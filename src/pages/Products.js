import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { api } from "../lib/api";
import { Trash2, UploadCloud, Plus, X, Video as VideoIcon } from "lucide-react";
import toast from "react-hot-toast";
const selectStyles = {
    control: (base) => ({
        ...base,
        borderColor: "#FBE4E9",
        borderRadius: "0.5rem",
        minHeight: "42px",
        fontSize: "14px",
        boxShadow: "none",
        "&:hover": { borderColor: "#C4275C" },
    }),
    multiValue: (base) => ({ ...base, backgroundColor: "#FBE4E9" }),
    multiValueLabel: (base) => ({ ...base, color: "#211A1D" }),
};
export default function Products() {
    const qc = useQueryClient();
    const [form, setForm] = useState({ name: "", price: "", description: "", stock: "10" });
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [files, setFiles] = useState([]);
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data,
    });
    const categoryOptions = useMemo(() => categories.map((c) => ({
        value: c._id,
        label: c.parent ? `— ${c.name}` : c.name,
    })), [categories]);
    const { data } = useQuery({
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
                fd.append("sizes", JSON.stringify(sizes.filter((s) => s.label && s.price).map((s) => ({ label: s.label, price: Number(s.price) }))));
            }
            files.forEach((f) => fd.append("media", f));
            return api.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
        },
        onSuccess: () => {
            toast.success("Product added — visible on the site now.");
            resetForm();
            qc.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Couldn't add product."),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: () => {
            toast.success("Product removed.");
            qc.invalidateQueries({ queryKey: ["products"] });
        },
    });
    const addSizeRow = () => setSizes((s) => [...s, { label: "", price: "" }]);
    const updateSizeRow = (i, key, value) => setSizes((s) => s.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)));
    const removeSizeRow = (i) => setSizes((s) => s.filter((_, idx) => idx !== i));
    const onFilesPicked = (fileList) => {
        if (!fileList)
            return;
        setFiles((prev) => [...prev, ...Array.from(fileList)]);
    };
    const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));
    return (_jsxs("div", { children: [_jsx("h1", { className: "font-display text-[26px] text-brand-ink mb-1", children: "Products" }), _jsx("p", { className: "text-[14px] text-[#8a7a7d] mb-8", children: "Upload items against one or more categories so customers can find them." }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    if (!form.name || !form.price)
                        return toast.error("Add a name and price first.");
                    if (!selectedCategories.length)
                        return toast.error("Select at least one category.");
                    createMutation.mutate();
                }, className: "bg-white border border-brand-blush rounded-2xl p-5 flex flex-col gap-4 mb-8", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx("input", { placeholder: "Product name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), className: "border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink" }), _jsx("input", { placeholder: "Price (NGN)", type: "number", value: form.price, onChange: (e) => setForm({ ...form, price: e.target.value }), className: "border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink" })] }), _jsxs("div", { children: [_jsxs("label", { className: "text-[12.5px] text-brand-ink font-medium mb-1 block", children: ["Categories ", _jsx("span", { className: "text-[#8a7a7d] font-normal", children: "(pick as many as apply)" })] }), _jsx(Select, { isMulti: true, styles: selectStyles, options: categoryOptions, value: selectedCategories, onChange: (v) => setSelectedCategories(v), placeholder: "Search categories..." })] }), _jsx("input", { placeholder: "Stock", type: "number", value: form.stock, onChange: (e) => setForm({ ...form, stock: e.target.value }), className: "border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink w-40" }), _jsx("textarea", { placeholder: "Description", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink", rows: 3 }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("label", { className: "text-[12.5px] text-brand-ink font-medium", children: ["Sizes ", _jsx("span", { className: "text-[#8a7a7d] font-normal", children: "(optional \u2014 leave empty for a single price)" })] }), _jsxs("button", { type: "button", onClick: addSizeRow, className: "flex items-center gap-1 text-[12.5px] text-brand-pink font-medium", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), " Add size"] })] }), sizes.length > 0 && (_jsx("div", { className: "flex flex-col gap-2", children: sizes.map((row, i) => (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { placeholder: "e.g. Small Bouquet 15 Roses", value: row.label, onChange: (e) => updateSizeRow(i, "label", e.target.value), className: "flex-1 border border-brand-blush rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-brand-pink" }), _jsx("input", { placeholder: "Price", type: "number", value: row.price, onChange: (e) => updateSizeRow(i, "price", e.target.value), className: "w-32 border border-brand-blush rounded-lg px-3 py-2 text-[13.5px] outline-none focus:border-brand-pink" }), _jsx("button", { type: "button", onClick: () => removeSizeRow(i), className: "text-[#c8b8bb] hover:text-brand-pink", children: _jsx(X, { className: "w-4 h-4" }) })] }, i))) }))] }), _jsxs("label", { className: "flex items-center gap-2 border border-dashed border-brand-blush rounded-lg px-3 py-3 text-[13px] text-[#8a7a7d] cursor-pointer hover:border-brand-pink transition-colors", children: [_jsx(UploadCloud, { className: "w-4 h-4" }), "Click to add product images or a short video (add as many as you like)", _jsx("input", { type: "file", multiple: true, accept: "image/*,video/*", className: "hidden", onChange: (e) => onFilesPicked(e.target.files) })] }), files.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: files.map((f, i) => (_jsxs("div", { className: "relative w-16 h-16 rounded-lg overflow-hidden border border-brand-blush bg-brand-blush", children: [f.type.startsWith("video/") ? (_jsx("div", { className: "w-full h-full flex items-center justify-center text-brand-pink", children: _jsx(VideoIcon, { className: "w-5 h-5" }) })) : (_jsx("img", { src: URL.createObjectURL(f), alt: "", className: "w-full h-full object-cover" })), _jsx("button", { type: "button", onClick: () => removeFile(i), className: "absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center", children: _jsx(X, { className: "w-2.5 h-2.5" }) })] }, i))) })), _jsx("p", { className: "text-[11.5px] text-[#8a7a7d] -mt-2", children: "Images and videos up to 40MB each. The storefront shows images first in a carousel, then plays any video." }), _jsx("button", { type: "submit", disabled: createMutation.isPending, className: "bg-brand-pink text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-brand-pinkDark transition-colors disabled:opacity-60", children: createMutation.isPending ? "Adding..." : "Add product" })] }), _jsx("div", { className: "grid grid-cols-4 gap-4", children: data?.items?.map((p) => (_jsxs("div", { className: "bg-white border border-brand-blush rounded-2xl overflow-hidden", children: [_jsxs("div", { className: "aspect-square bg-brand-blush relative", children: [p.images?.[0] && _jsx("img", { src: p.images[0], alt: p.name, className: "w-full h-full object-cover" }), p.videos?.length > 0 && (_jsxs("span", { className: "absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1", children: [_jsx(VideoIcon, { className: "w-2.5 h-2.5" }), " video"] }))] }), _jsxs("div", { className: "p-3", children: [_jsx("p", { className: "text-[13px] font-medium text-brand-ink truncate", children: p.name }), _jsx("p", { className: "text-[12px] text-[#8a7a7d] truncate", children: p.categories?.map((c) => c.name).join(", ") }), _jsxs("div", { className: "flex items-center justify-between mt-2", children: [_jsxs("span", { className: "text-[13px] font-medium text-brand-ink", children: ["\u20A6", p.price?.toLocaleString()] }), _jsx("button", { onClick: () => deleteMutation.mutate(p._id), className: "text-[#c8b8bb] hover:text-brand-pink", children: _jsx(Trash2, { className: "w-3.5 h-3.5" }) })] })] })] }, p._id))) })] }));
}
