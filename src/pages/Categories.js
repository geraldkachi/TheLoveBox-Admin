import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
export default function Categories() {
    const qc = useQueryClient();
    const [name, setName] = useState("");
    const [parent, setParent] = useState("");
    const [isGiftType, setIsGiftType] = useState(false);
    const { data: categories = [] } = useQuery({
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
        onError: (e) => toast.error(e?.response?.data?.message || "Couldn't add category."),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            toast.success("Category removed.");
            qc.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (e) => toast.error(e?.response?.data?.message || "Couldn't delete category."),
    });
    return (_jsxs("div", { children: [_jsx("h1", { className: "font-display text-[26px] text-brand-ink mb-1", children: "Categories" }), _jsx("p", { className: "text-[14px] text-[#8a7a7d] mb-8", children: "Add occasions and gift types here \u2014 they show up on the website immediately." }), _jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    if (name.trim())
                        createMutation.mutate();
                }, className: "bg-white border border-brand-blush rounded-2xl p-5 flex flex-wrap items-end gap-3 mb-8", children: [_jsxs("div", { className: "flex-1 min-w-[200px]", children: [_jsx("label", { className: "text-[12.5px] text-brand-ink font-medium mb-1 block", children: "Name" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Milestone Birthdays", className: "w-full border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink" })] }), _jsxs("div", { className: "min-w-[180px]", children: [_jsx("label", { className: "text-[12.5px] text-brand-ink font-medium mb-1 block", children: "Parent category" }), _jsxs("select", { value: parent, onChange: (e) => setParent(e.target.value), className: "w-full border border-brand-blush rounded-lg px-3 py-2 text-[14px] outline-none focus:border-brand-pink", children: [_jsx("option", { value: "", children: "None (top-level)" }), parents.map((p) => (_jsx("option", { value: p._id, children: p.name }, p._id)))] })] }), _jsxs("label", { className: "flex items-center gap-2 text-[13px] text-brand-ink pb-2", children: [_jsx("input", { type: "checkbox", checked: isGiftType, onChange: (e) => setIsGiftType(e.target.checked) }), "Gift type filter"] }), _jsxs("button", { type: "submit", className: "flex items-center gap-1.5 bg-brand-pink text-white rounded-full px-4 py-2 text-[13px] font-medium hover:bg-brand-pinkDark transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), " Add category"] })] }), _jsx("div", { className: "bg-white border border-brand-blush rounded-2xl divide-y divide-brand-blush", children: categories.map((c) => (_jsxs("div", { className: "flex items-center justify-between px-5 py-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[14px] text-brand-ink", children: c.name }), !c.parent && _jsx("span", { className: "ml-2 text-[11px] text-brand-gold uppercase tracking-wide", children: "Top-level" }), c.isGiftType && _jsx("span", { className: "ml-2 text-[11px] text-brand-pink uppercase tracking-wide", children: "Gift type" })] }), _jsx("button", { onClick: () => deleteMutation.mutate(c._id), className: "text-[#c8b8bb] hover:text-brand-pink transition-colors", "aria-label": `Delete ${c.name}`, children: _jsx(Trash2, { className: "w-4 h-4" }) })] }, c._id))) })] }));
}
