import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Package, Tags, ClipboardList } from "lucide-react";
export default function Dashboard() {
    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => (await api.get("/categories")).data,
    });
    const { data: products } = useQuery({
        queryKey: ["products", "count"],
        queryFn: async () => (await api.get("/products?limit=1")).data,
    });
    const { data: orders } = useQuery({
        queryKey: ["orders", "count"],
        queryFn: async () => (await api.get("/orders?limit=1")).data,
    });
    const stats = [
        { label: "Categories", value: categories?.length ?? "—", icon: Tags },
        { label: "Products", value: products?.total ?? "—", icon: Package },
        { label: "Orders", value: orders?.total ?? "—", icon: ClipboardList },
    ];
    return (_jsxs("div", { children: [_jsx("h1", { className: "font-display text-[26px] text-brand-ink mb-1", children: "Hello, welcome back" }), _jsx("p", { className: "text-[14px] text-[#8a7a7d] mb-8", children: "Here's what's happening at The Love Box." }), _jsx("div", { className: "grid grid-cols-3 gap-4", children: stats.map(({ label, value, icon: Icon }) => (_jsxs("div", { className: "bg-white border border-brand-blush rounded-2xl p-5", children: [_jsx(Icon, { className: "w-5 h-5 text-brand-pink mb-3" }), _jsx("p", { className: "text-[26px] font-medium text-brand-ink", children: value }), _jsx("p", { className: "text-[13px] text-[#8a7a7d]", children: label })] }, label))) })] }));
}
