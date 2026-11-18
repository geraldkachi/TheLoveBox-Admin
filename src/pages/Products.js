import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Search, Package, Pencil, Trash2, Star, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { api, errorMessage, msg } from "../lib/api";
import { naira } from "../lib/format";
import { Button, EmptyState, PageHeader, Pill, Skeleton, Toggle, useConfirm, useDebounced } from "../components/ui";
import ProductEditor from "./ProductEditor";
const SITE = import.meta.env.VITE_SITE_URL || "https://the-love-box-customer.vercel.app";
const LIMIT = 20;
export default function Products() {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [editor, setEditor] = useState({ open: false, id: null });
    const q = useDebounced(search.trim());
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["products", q, status, page],
        queryFn: async () => (await api.get("/products/manage/list", { params: { search: q || undefined, status, page, limit: LIMIT } })).data,
        placeholderData: (p) => p,
    });
    const patch = useMutation({
        mutationFn: ({ id, body }) => api.put(`/products/${id}`, body),
        onMutate: async ({ id, body }) => {
            // optimistic toggle
            const key = ["products", q, status, page];
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData(key);
            if (prev)
                qc.setQueryData(key, { ...prev, items: prev.items.map((p) => (p._id === id ? { ...p, ...body } : p)) });
            return { prev, key };
        },
        onSuccess: (res) => toast.success(msg(res, "Product updated")),
        onError: (e, _v, ctx) => {
            if (ctx?.prev)
                qc.setQueryData(ctx.key, ctx.prev);
            toast.error(errorMessage(e, "Couldn't update the product."));
        },
        onSettled: () => qc.invalidateQueries({ queryKey: ["products"] }),
    });
    const remove = useMutation({
        mutationFn: (id) => api.delete(`/products/${id}`),
        onSuccess: (res) => {
            toast.success(msg(res, "Product deleted"));
            qc.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (e) => toast.error(errorMessage(e, "Couldn't delete the product.")),
    });
    const askDelete = async (p) => {
        if (await confirm({ title: `Delete “${p.name}”?`, body: "It disappears from the store and its photos are removed. Past orders keep their details.", confirmLabel: "Delete product", danger: true })) {
            remove.mutate(p._id);
        }
    };
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Products", sub: data ? `${data.total} product${data.total === 1 ? "" : "s"} in your catalogue` : "Your catalogue", actions: _jsxs(Button, { onClick: () => setEditor({ open: true, id: null }), children: [_jsx(Plus, { className: "h-4 w-4" }), " New product"] }) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-3 border-b border-line p-4", children: [_jsxs("div", { className: "relative w-full max-w-xs", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" }), _jsx("input", { value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); }, placeholder: "Search products", className: "input pl-9", "aria-label": "Search products" })] }), _jsx("div", { className: "flex rounded-xl border border-line p-1 text-[13.5px]", children: ["all", "active", "inactive"].map((s) => (_jsx("button", { onClick: () => { setStatus(s); setPage(1); }, className: `rounded-lg px-3 py-1.5 font-medium capitalize ${status === s ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`, children: s === "inactive" ? "Hidden" : s === "active" ? "Visible" : "All" }, s))) })] }), isError ? (_jsx(EmptyState, { icon: Package, title: "Couldn't load products", body: errorMessage(error), action: _jsx(Button, { onClick: () => refetch(), children: "Try again" }) })) : isLoading ? (_jsx("div", { className: "flex flex-col gap-2 p-4", children: Array.from({ length: 6 }).map((_, i) => _jsx(Skeleton, { className: "h-16" }, i)) })) : !data?.items.length ? (_jsx(EmptyState, { icon: Package, title: q ? "No products match" : "Add your first product", body: q ? "Try a different name." : "Upload photos, set a price and pick its occasions. It goes live straight away.", action: !q && _jsxs(Button, { onClick: () => setEditor({ open: true, id: null }), children: [_jsx(Plus, { className: "h-4 w-4" }), " New product"] }) })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[820px] text-[14px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-[12.5px] text-ink-muted", children: [_jsx("th", { className: "px-5 py-3 font-medium", children: "Product" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Price" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Stock" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Visible" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Pick" }), _jsx("th", { className: "px-5 py-3" })] }) }), _jsx("tbody", { children: data.items.map((p) => (_jsxs("tr", { className: "group border-t border-line hover:bg-petal-50/60", children: [_jsx("td", { className: "px-5 py-3", children: _jsxs("button", { onClick: () => setEditor({ open: true, id: p._id }), className: "flex items-center gap-3 text-left", children: [_jsx("img", { src: p.images?.[0] || "/brand/logo-mark.png", alt: "", className: "h-12 w-12 rounded-xl bg-petal-100 object-cover" }), _jsxs("span", { className: "min-w-0", children: [_jsx("span", { className: "block max-w-[280px] truncate font-semibold group-hover:text-ribbon-700", children: p.name }), _jsx("span", { className: "block max-w-[280px] truncate text-[12.5px] text-ink-muted", children: p.categories?.map((c) => c.name).join(", ") || "No category" })] })] }) }), _jsxs("td", { className: "px-3 py-3 tabular-nums", children: [_jsx("span", { className: "font-medium", children: naira(p.price) }), !!p.sizes?.length && _jsx("span", { className: "ml-1.5", children: _jsxs(Pill, { tone: "zinc", children: [p.sizes.length, " sizes"] }) })] }), _jsx("td", { className: "px-3 py-3", children: p.stock <= 0 ? _jsx(Pill, { tone: "zinc", children: "Sold out" }) : p.stock <= 3 ? _jsxs("span", { className: "font-medium text-amber-700", children: [p.stock, " left"] }) : _jsx("span", { className: "tabular-nums", children: p.stock }) }), _jsx("td", { className: "px-3 py-3", children: _jsx(Toggle, { label: `Show ${p.name} on store`, checked: p.isActive, onChange: (v) => patch.mutate({ id: p._id, body: { isActive: v } }) }) }), _jsx("td", { className: "px-3 py-3", children: _jsx("button", { onClick: () => patch.mutate({ id: p._id, body: { isFeatured: !p.isFeatured } }), "aria-label": p.isFeatured ? "Remove from curator's picks" : "Add to curator's picks", "aria-pressed": p.isFeatured, className: "rounded-lg p-1.5 hover:bg-petal-100", children: _jsx(Star, { className: `h-[18px] w-[18px] ${p.isFeatured ? "fill-ribbon-400 text-ribbon-500" : "text-ink-muted"}` }) }) }), _jsx("td", { className: "px-5 py-3", children: _jsxs("div", { className: "flex justify-end gap-1", children: [_jsx("a", { href: `${SITE}/product/${p.slug}`, target: "_blank", rel: "noreferrer", className: "rounded-lg p-2 text-ink-muted hover:bg-petal-100 hover:text-ink", title: "View on store", "aria-label": "View on store", children: _jsx(ExternalLink, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => setEditor({ open: true, id: p._id }), className: "rounded-lg p-2 text-ink-muted hover:bg-petal-100 hover:text-ink", title: "Edit", "aria-label": `Edit ${p.name}`, children: _jsx(Pencil, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => askDelete(p), className: "rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600", title: "Delete", "aria-label": `Delete ${p.name}`, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) })] }, p._id))) })] }) })), data && data.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between border-t border-line px-5 py-3 text-[13.5px] text-ink-muted", children: [_jsxs("span", { children: ["Page ", data.page, " of ", data.pages] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", disabled: page <= 1, onClick: () => setPage(page - 1), "aria-label": "Previous page", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", disabled: page >= data.pages, onClick: () => setPage(page + 1), "aria-label": "Next page", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }))] }), _jsx(ProductEditor, { open: editor.open, productId: editor.id, onClose: () => setEditor({ open: false, id: null }) })] }));
}
