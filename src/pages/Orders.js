import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, PackageOpen, Phone, Mail, MapPin, Gift, Trash2, Copy, CalendarDays } from "lucide-react";
import { api, errorMessage, msg } from "../lib/api";
import { naira, dateTime, shortDate, STATUS, STATUS_ORDER } from "../lib/format";
import { useAuthStore } from "../lib/authStore";
import { Button, Drawer, EmptyState, PageHeader, Skeleton, StatusBadge, useConfirm, useDebounced } from "../components/ui";
const LIMIT = 15;
export default function Orders() {
    const [params, setParams] = useSearchParams();
    const status = params.get("status") || "";
    const page = Number(params.get("page") || 1);
    const openId = params.get("open");
    const [search, setSearch] = useState("");
    const q = useDebounced(search.trim());
    const setParam = (k, v) => {
        const next = new URLSearchParams(params);
        if (v)
            next.set(k, v);
        else
            next.delete(k);
        if (k !== "page" && k !== "open")
            next.delete("page");
        setParams(next, { replace: true });
    };
    useEffect(() => {
        if (q)
            setParam("page");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ["orders", status, page, q],
        queryFn: async () => (await api.get("/orders", { params: { status: status || undefined, page, limit: LIMIT, search: q || undefined } })).data,
        placeholderData: (p) => p,
    });
    const counts = data?.statusCounts || {};
    const all = Object.values(counts).reduce((a, b) => a + b, 0);
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Orders", sub: "Update statuses as gifts move from the studio to the door. Customers see every change on their tracking page." }), _jsx("div", { className: "mb-4 flex gap-1 overflow-x-auto pb-1 no-scrollbar", role: "tablist", children: [{ key: "", label: "All", count: all }, ...STATUS_ORDER.map((s) => ({ key: s, label: STATUS[s].label, count: counts[s] || 0 }))].map((t) => (_jsxs("button", { role: "tab", "aria-selected": status === t.key, onClick: () => setParam("status", t.key), className: "relative shrink-0 rounded-xl px-3.5 py-2 text-[14px] font-medium", children: [status === t.key && _jsx(motion.span, { layoutId: "order-tab", className: "absolute inset-0 rounded-xl bg-white shadow-card ring-1 ring-line", transition: { type: "spring", stiffness: 500, damping: 40 } }), _jsxs("span", { className: `relative flex items-center gap-2 ${status === t.key ? "text-ink" : "text-ink-muted hover:text-ink"}`, children: [t.label, _jsx("span", { className: `rounded-md px-1.5 text-[12px] tabular-nums ${status === t.key ? "bg-petal-100 text-ribbon-700" : "bg-line/70"}`, children: t.count })] })] }, t.key || "all"))) }), _jsxs("div", { className: "card overflow-hidden", children: [_jsx("div", { className: "flex items-center gap-3 border-b border-line p-4", children: _jsxs("div", { className: "relative w-full max-w-sm", children: [_jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" }), _jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search order number, name, email or phone", className: "input pl-9", "aria-label": "Search orders" })] }) }), isError ? (_jsx(EmptyState, { icon: PackageOpen, title: "Couldn't load orders", body: errorMessage(error), action: _jsx(Button, { onClick: () => refetch(), children: "Try again" }) })) : isLoading ? (_jsx("div", { className: "flex flex-col gap-2 p-4", children: Array.from({ length: 6 }).map((_, i) => _jsx(Skeleton, { className: "h-12" }, i)) })) : !data?.items.length ? (_jsx(EmptyState, { icon: PackageOpen, title: q || status ? "No orders match" : "No orders yet", body: q || status ? "Try a different search or status." : "New orders show up here the moment a customer checks out." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[720px] text-[14px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-[12.5px] text-ink-muted", children: [_jsx("th", { className: "px-5 py-3 font-medium", children: "Order" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Customer" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Placed" }), _jsx("th", { className: "px-3 py-3 font-medium", children: "Status" }), _jsx("th", { className: "px-5 py-3 text-right font-medium", children: "Total" })] }) }), _jsx("tbody", { children: data.items.map((o) => (_jsxs("tr", { onClick: () => setParam("open", o._id), className: "cursor-pointer border-t border-line transition-colors hover:bg-petal-50", children: [_jsxs("td", { className: "px-5 py-3.5", children: [_jsx("p", { className: "font-semibold tabular-nums", children: o.orderNumber }), _jsxs("p", { className: "text-[12.5px] text-ink-muted", children: [o.items.length, " item", o.items.length > 1 ? "s" : ""] })] }), _jsxs("td", { className: "px-3 py-3.5", children: [_jsx("p", { className: "font-medium", children: o.customer.name }), _jsx("p", { className: "text-[12.5px] text-ink-muted", children: o.customer.phone })] }), _jsx("td", { className: "px-3 py-3.5 text-ink-soft", children: dateTime(o.createdAt) }), _jsx("td", { className: "px-3 py-3.5", children: _jsx(StatusBadge, { status: o.status }) }), _jsx("td", { className: "px-5 py-3.5 text-right font-semibold tabular-nums", children: naira(o.total) })] }, o._id))) })] }) })), data && data.pages > 1 && (_jsxs("div", { className: "flex items-center justify-between border-t border-line px-5 py-3 text-[13.5px] text-ink-muted", children: [_jsxs("span", { children: ["Page ", data.page, " of ", data.pages, ", ", data.total, " orders"] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", disabled: page <= 1, onClick: () => setParam("page", String(page - 1)), "aria-label": "Previous page", children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", disabled: page >= data.pages, onClick: () => setParam("page", String(page + 1)), "aria-label": "Next page", children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }))] }), _jsx(OrderDrawer, { id: openId, onClose: () => setParam("open") })] }));
}
function OrderDrawer({ id, onClose }) {
    const qc = useQueryClient();
    const confirm = useConfirm();
    const isAdmin = useAuthStore((s) => s.user?.role === "admin");
    const [nextStatus, setNextStatus] = useState("");
    const [note, setNote] = useState("");
    const { data: order, isLoading, isError, error } = useQuery({
        queryKey: ["order", id],
        queryFn: async () => (await api.get(`/orders/${id}`)).data,
        enabled: !!id,
    });
    useEffect(() => {
        if (order)
            setNextStatus(order.status);
        setNote("");
    }, [order]);
    const update = useMutation({
        mutationFn: () => api.patch(`/orders/${id}/status`, { status: nextStatus, note: note.trim() || undefined }),
        onSuccess: (res) => {
            toast.success(msg(res, "Order updated"));
            setNote("");
            qc.invalidateQueries({ queryKey: ["orders"] });
            qc.invalidateQueries({ queryKey: ["order", id] });
            qc.invalidateQueries({ queryKey: ["overview"] });
        },
        onError: (e) => toast.error(errorMessage(e, "Couldn't update the order.")),
    });
    const remove = useMutation({
        mutationFn: () => api.delete(`/orders/${id}`),
        onSuccess: (res) => {
            toast.success(msg(res, "Order deleted"));
            qc.invalidateQueries({ queryKey: ["orders"] });
            onClose();
        },
        onError: (e) => toast.error(errorMessage(e, "Couldn't delete the order.")),
    });
    const askDelete = async () => {
        if (await confirm({ title: `Delete ${order?.orderNumber}?`, body: "The customer will no longer be able to track it. This can't be undone.", confirmLabel: "Delete order", danger: true }))
            remove.mutate();
    };
    return (_jsx(Drawer, { open: !!id, onClose: onClose, title: order?.orderNumber || "Order", sub: order ? `Placed ${dateTime(order.createdAt)}` : undefined, footer: order && isAdmin ? (_jsxs(Button, { variant: "subtle", onClick: askDelete, loading: remove.isPending, className: "mr-auto text-red-600 hover:bg-red-50 hover:text-red-700", children: [_jsx(Trash2, { className: "h-4 w-4" }), " Delete order"] })) : undefined, children: isLoading ? (_jsx("div", { className: "flex flex-col gap-3", children: [0, 1, 2, 3].map((i) => _jsx(Skeleton, { className: "h-20" }, i)) })) : isError ? (_jsx("p", { className: "text-red-600", children: errorMessage(error) })) : order ? (_jsxs("div", { className: "flex flex-col gap-7", children: [_jsxs("section", { className: "rounded-2xl bg-petal-50 p-4", children: [_jsxs("div", { className: "mb-3 flex items-center justify-between", children: [_jsx("p", { className: "text-[14px] font-semibold", children: "Status" }), _jsx(StatusBadge, { status: order.status })] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: STATUS_ORDER.map((s) => (_jsx("button", { onClick: () => setNextStatus(s), className: `rounded-lg px-2.5 py-1.5 text-[13px] font-medium ring-1 ring-inset transition ${nextStatus === s ? "bg-ink text-white ring-ink" : "bg-white text-ink-soft ring-line hover:ring-ink/30"}`, children: STATUS[s].label }, s))) }), _jsx("input", { value: note, onChange: (e) => setNote(e.target.value), placeholder: "Note for the customer (optional), e.g. Rider: Musa, 0803\u2026", className: "input mt-3", maxLength: 300 }), _jsx(Button, { className: "mt-3 w-full", onClick: () => update.mutate(), loading: update.isPending, disabled: nextStatus === order.status && !note.trim(), children: nextStatus === order.status ? "Add note" : `Mark as ${STATUS[nextStatus]?.label.toLowerCase()}` })] }), _jsxs("section", { children: [_jsx("p", { className: "mb-3 text-[14px] font-semibold", children: "Customer" }), _jsxs("ul", { className: "flex flex-col gap-2.5 text-[14px]", children: [_jsx("li", { className: "font-medium", children: order.customer.name }), _jsxs("li", { className: "flex items-center gap-2 text-ink-soft", children: [_jsx(Phone, { className: "h-4 w-4 text-ink-muted" }), _jsx("a", { href: `tel:${order.customer.phone}`, className: "hover:underline", children: order.customer.phone })] }), _jsxs("li", { className: "flex items-center gap-2 text-ink-soft", children: [_jsx(Mail, { className: "h-4 w-4 text-ink-muted" }), _jsx("a", { href: `mailto:${order.customer.email}`, className: "hover:underline", children: order.customer.email })] }), _jsxs("li", { className: "flex items-start gap-2 text-ink-soft", children: [_jsx(MapPin, { className: "mt-0.5 h-4 w-4 shrink-0 text-ink-muted" }), _jsx("span", { className: "flex-1", children: order.deliveryAddress }), _jsx("button", { onClick: () => { navigator.clipboard?.writeText(order.deliveryAddress); toast.success("Address copied"); }, className: "rounded-md p-1 hover:bg-petal-100", "aria-label": "Copy address", children: _jsx(Copy, { className: "h-3.5 w-3.5" }) })] }), order.deliveryDate && _jsxs("li", { className: "flex items-center gap-2 text-ink-soft", children: [_jsx(CalendarDays, { className: "h-4 w-4 text-ink-muted" }), "Deliver on ", shortDate(order.deliveryDate)] })] }), order.giftMessage && (_jsxs("div", { className: "mt-4 rounded-xl border border-dashed border-ribbon-300 bg-white p-4", children: [_jsxs("p", { className: "mb-1 flex items-center gap-1.5 text-[12.5px] font-semibold text-ribbon-700", children: [_jsx(Gift, { className: "h-3.5 w-3.5" }), " Card message"] }), _jsx("p", { className: "font-script text-[28px] leading-tight", children: order.giftMessage })] }))] }), _jsxs("section", { children: [_jsx("p", { className: "mb-3 text-[14px] font-semibold", children: "Items" }), _jsx("ul", { className: "flex flex-col gap-3", children: order.items.map((it, i) => (_jsxs("li", { className: "flex items-center gap-3", children: [_jsx("img", { src: it.image || "/brand/logo-mark.png", alt: "", className: "h-14 w-12 rounded-lg bg-petal-100 object-cover" }), _jsxs("div", { className: "min-w-0 flex-1 text-[14px]", children: [_jsx("p", { className: "truncate font-medium", children: it.name }), _jsxs("p", { className: "text-ink-muted", children: [it.size !== "Standard" ? `${it.size}, ` : "", it.qty, " \u00D7 ", naira(it.price)] })] }), _jsx("p", { className: "text-[14px] font-semibold tabular-nums", children: naira(it.price * it.qty) })] }, i))) }), _jsxs("dl", { className: "mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-[14px]", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-ink-muted", children: "Subtotal" }), _jsx("dd", { className: "tabular-nums", children: naira(order.subtotal) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("dt", { className: "text-ink-muted", children: "Delivery" }), _jsx("dd", { className: "tabular-nums", children: order.deliveryFee ? naira(order.deliveryFee) : "Free" })] }), order.discount > 0 && _jsxs("div", { className: "flex justify-between text-leaf", children: [_jsxs("dt", { children: ["Discount ", order.promoCode && `(${order.promoCode})`] }), _jsxs("dd", { className: "tabular-nums", children: ["\u2212", naira(order.discount)] })] }), _jsxs("div", { className: "flex justify-between pt-1 text-[16px] font-semibold", children: [_jsx("dt", { children: "Total" }), _jsx("dd", { className: "tabular-nums", children: naira(order.total) })] }), order.paystackReference && _jsxs("div", { className: "flex justify-between text-[12.5px] text-ink-muted", children: [_jsx("dt", { children: "Paystack ref" }), _jsx("dd", { className: "tabular-nums", children: order.paystackReference })] })] })] }), _jsxs("section", { children: [_jsx("p", { className: "mb-3 text-[14px] font-semibold", children: "History" }), _jsx("ol", { className: "relative ml-1.5 border-l border-line", children: [...order.trackingHistory].reverse().map((h, i) => (_jsxs("li", { className: "mb-4 ml-5 last:mb-0", children: [_jsx("span", { className: `absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? "bg-ribbon-600" : "bg-zinc-300"}` }), _jsx("p", { className: "text-[14px] font-medium", children: h.note || STATUS[h.status]?.label || h.status }), _jsxs("p", { className: "text-[12.5px] text-ink-muted", children: [STATUS[h.status]?.label, ", ", dateTime(h.at)] })] }, i))) })] })] })) : null }));
}
