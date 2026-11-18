import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Plus, Search, Tags, Pencil, Trash2, ChevronRight } from "lucide-react";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { Button, Drawer, EmptyState, Field, PageHeader, Pill, Skeleton, Toggle, useConfirm } from "../components/ui";
const blank = { name: "", parent: "", isGiftType: false };
export default function Categories() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const [tab, setTab] = useState("occasions");
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState(new Set());
    const [drawer, setDrawer] = useState({ open: false, editing: null });
    const [form, setForm] = useState(blank);
    const [errors, setErrors] = useState({});
    const { data: categories = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data,
    });
    const occasions = categories.filter((c) => !c.parent && !c.isGiftType);
    const giftTypes = categories.filter((c) => c.isGiftType);
    const childrenOf = useMemo(() => {
        const m = new Map();
        categories.forEach((c) => c.parent && m.set(c.parent, [...(m.get(c.parent) || []), c]));
        return m;
    }, [categories]);
    const term = search.trim().toLowerCase();
    const match = (c) => c.name.toLowerCase().includes(term);
    const openCreate = (parent = "") => {
        setForm({ ...blank, parent, isGiftType: tab === "gifts" && !parent });
        setErrors({});
        setDrawer({ open: true, editing: null });
    };
    const openEdit = (c) => {
        setForm({ name: c.name, parent: c.parent || "", isGiftType: c.isGiftType });
        setErrors({});
        setDrawer({ open: true, editing: c });
    };
    const save = useMutation({
        mutationFn: () => {
            const body = { name: form.name.trim(), parent: form.parent || null, isGiftType: form.isGiftType };
            return drawer.editing ? api.put(`/categories/${drawer.editing._id}`, body) : api.post("/categories", body);
        },
        onSuccess: (res) => {
            toast.success(msg(res, "Saved"));
            qc.invalidateQueries({ queryKey: ["categories"] });
            if (form.parent)
                setExpanded((s) => new Set(s).add(form.parent));
            setDrawer({ open: false, editing: null });
        },
        onError: (e) => {
            setErrors(fieldErrors(e));
            toast.error(errorMessage(e, "Couldn't save the category."));
        },
    });
    const remove = useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: (res) => {
            toast.success(msg(res, "Category deleted"));
            qc.invalidateQueries({ queryKey: ["categories"] });
        },
        onError: (e) => toast.error(errorMessage(e, "Couldn't delete the category."), { duration: 6000 }),
    });
    const askDelete = async (c) => {
        if (await confirm({ title: `Delete “${c.name}”?`, body: "Customers won't be able to browse it any more. Categories that still hold products or subcategories can't be deleted.", confirmLabel: "Delete", danger: true }))
            remove.mutate(c._id);
    };
    const Row = ({ c, depth = 0 }) => {
        const kids = childrenOf.get(c._id) || [];
        const open = expanded.has(c._id) || (!!term && kids.some(match));
        return (_jsxs(_Fragment, { children: [_jsxs("div", { className: `group flex items-center gap-2 border-t border-line px-4 py-2.5 hover:bg-petal-50/60 ${depth ? "pl-12" : ""}`, children: [depth === 0 && kids.length > 0 ? (_jsx("button", { onClick: () => setExpanded((s) => { const n = new Set(s); n.has(c._id) ? n.delete(c._id) : n.add(c._id); return n; }), className: "rounded-md p-1 hover:bg-petal-100", "aria-label": open ? "Collapse" : "Expand", "aria-expanded": open, children: _jsx(ChevronRight, { className: `h-4 w-4 transition-transform ${open ? "rotate-90" : ""}` }) })) : _jsx("span", { className: "w-6" }), _jsx("span", { className: `flex-1 text-[14.5px] ${depth ? "text-ink-soft" : "font-semibold"}`, children: c.name }), depth === 0 && kids.length > 0 && _jsx(Pill, { tone: "zinc", children: kids.length }), _jsxs("div", { className: "flex gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100", children: [depth === 0 && !c.isGiftType && _jsx("button", { onClick: () => openCreate(c._id), className: "rounded-lg p-1.5 text-ink-muted hover:bg-petal-100 hover:text-ink", title: "Add subcategory", "aria-label": `Add subcategory to ${c.name}`, children: _jsx(Plus, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => openEdit(c), className: "rounded-lg p-1.5 text-ink-muted hover:bg-petal-100 hover:text-ink", title: "Edit", "aria-label": `Edit ${c.name}`, children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => askDelete(c), className: "rounded-lg p-1.5 text-ink-muted hover:bg-red-50 hover:text-red-600", title: "Delete", "aria-label": `Delete ${c.name}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] })] }), _jsx(AnimatePresence, { initial: false, children: open && kids.length > 0 && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden bg-canvas/50", children: kids.filter((k) => !term || match(k) || match(c)).map((k) => _jsx(Row, { c: k, depth: 1 }, k._id)) })) })] }));
    };
    const list = (tab === "occasions" ? occasions : giftTypes).filter((c) => !term || match(c) || (childrenOf.get(c._id) || []).some(match));
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Categories", sub: "Occasions shape the store's menus. Gift types let customers filter by what's inside.", actions: _jsxs(Button, { onClick: () => openCreate(), children: [_jsx(Plus, { className: "h-4 w-4" }), " New ", tab === "gifts" ? "gift type" : "occasion"] }) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4", children: [_jsx("div", { className: "flex rounded-xl border border-line p-1 text-[13.5px]", children: [["occasions", `Occasions (${occasions.length})`], ["gifts", `Gift types (${giftTypes.length})`]].map(([k, l]) => (_jsx("button", { onClick: () => setTab(k), className: `rounded-lg px-3 py-1.5 font-medium ${tab === k ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`, children: l }, k))) }), _jsxs("div", { className: "relative w-full max-w-xs", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" }), _jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search categories", className: "input pl-9", "aria-label": "Search categories" })] })] }), isError ? (_jsx(EmptyState, { icon: Tags, title: "Couldn't load categories", body: errorMessage(error), action: _jsx(Button, { onClick: () => refetch(), children: "Try again" }) })) : isLoading ? (_jsx("div", { className: "flex flex-col gap-2 p-4", children: Array.from({ length: 6 }).map((_, i) => _jsx(Skeleton, { className: "h-10" }, i)) })) : !list.length ? (_jsx(EmptyState, { icon: Tags, title: term ? "Nothing matches" : "No categories yet", body: term ? "Try another word." : "Create your first one to start organising the store." })) : (list.map((c) => _jsx(Row, { c: c }, c._id)))] }), _jsx(Drawer, { open: drawer.open, onClose: () => setDrawer({ open: false, editing: null }), title: drawer.editing ? `Edit “${drawer.editing.name}”` : form.parent ? "New subcategory" : form.isGiftType ? "New gift type" : "New occasion", width: "max-w-md", footer: _jsxs(_Fragment, { children: [_jsx(Button, { variant: "ghost", onClick: () => setDrawer({ open: false, editing: null }), children: "Cancel" }), _jsx(Button, { onClick: () => save.mutate(), loading: save.isPending, disabled: form.name.trim().length < 2, children: drawer.editing ? "Save changes" : "Create" })] }), children: _jsxs("form", { onSubmit: (e) => { e.preventDefault(); save.mutate(); }, className: "flex flex-col gap-5", children: [_jsx(Field, { label: "Name", htmlFor: "cat-name", error: errors.name, children: _jsx("input", { id: "cat-name", autoFocus: true, value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), placeholder: "e.g. Milestone Birthdays", className: `input ${errors.name ? "input-error" : ""}` }) }), !form.isGiftType && (_jsx(Field, { label: "Sits under", htmlFor: "cat-parent", error: errors.parent, hint: "Leave as top-level to show it in the main Occasions menu.", children: _jsxs("select", { id: "cat-parent", value: form.parent, onChange: (e) => setForm({ ...form, parent: e.target.value }), className: "input", children: [_jsx("option", { value: "", children: "Top-level occasion" }), occasions.filter((o) => o._id !== drawer.editing?._id).map((o) => _jsx("option", { value: o._id, children: o.name }, o._id))] }) })), !form.parent && (_jsxs("div", { className: "flex items-center justify-between gap-4 rounded-2xl border border-line p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[14px] font-semibold", children: "Gift type" }), _jsx("p", { className: "text-[12.5px] text-ink-muted", children: "e.g. Flowers, Cakes, Perfumes \u2014 used as a filter, not a menu." })] }), _jsx(Toggle, { label: "Gift type", checked: form.isGiftType, onChange: (v) => setForm({ ...form, isGiftType: v, parent: "" }) })] }))] }) })] }));
}
