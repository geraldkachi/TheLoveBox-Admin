import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Package, Tags, ClipboardList, TrendingUp, DollarSign } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
        queryFn: async () => (await api.get("/orders?limit=50")).data, // fetch more for graph
    });
    // Mock Data for Graph (Replace with real order data parsing later)
    const graphData = [
        { name: 'Mon', revenue: 45000 },
        { name: 'Tue', revenue: 52000 },
        { name: 'Wed', revenue: 38000 },
        { name: 'Thu', revenue: 65000 },
        { name: 'Fri', revenue: 89000 },
        { name: 'Sat', revenue: 120000 },
        { name: 'Sun', revenue: 95000 },
    ];
    const totalRevenue = orders?.items?.reduce((sum, order) => {
        return order.status === "paid" || order.status === "delivered" ? sum + order.total : sum;
    }, 0) || 0;
    const stats = [
        { label: "Total Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
        { label: "Products", value: products?.total ?? "—", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Orders", value: orders?.total ?? "—", icon: ClipboardList, color: "text-brand-pink", bg: "bg-[#FDF1F4]" },
        { label: "Categories", value: categories?.length ?? "—", icon: Tags, color: "text-amber-600", bg: "bg-amber-50" },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-[#FCF8F5] pb-12", children: [_jsxs("div", { className: "mb-10", children: [_jsx("h1", { className: "font-display text-[32px] font-medium text-[#2C2523] tracking-tight mb-2", children: "Dashboard" }), _jsx("p", { className: "text-[15px] text-[#8A7A7D] max-w-xl", children: "Here's what's happening at The Love Box today." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: stats.map(({ label, value, icon: Icon, color, bg }) => (_jsxs("div", { className: "bg-white border border-[#F2E8E3] rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center gap-4", children: [_jsx("div", { className: `w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`, children: _jsx(Icon, { className: "w-6 h-6" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[13px] text-[#8A7A7D] font-medium mb-1", children: label }), _jsx("p", { className: "text-[24px] font-semibold text-[#2C2523]", children: value })] })] }, label))) }), _jsxs("div", { className: "bg-white border border-[#F2E8E3] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-[18px] font-semibold text-[#2C2523]", children: "Revenue Overview" }), _jsx("p", { className: "text-[13px] text-[#8A7A7D]", children: "Daily performance over the last 7 days" })] }), _jsxs("div", { className: "flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-[13px] font-medium", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), " +12.5%"] })] }), _jsx("div", { className: "h-[300px] w-full", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: graphData, margin: { top: 10, right: 0, left: 0, bottom: 0 }, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "colorRev", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#C4275C", stopOpacity: 0.2 }), _jsx("stop", { offset: "95%", stopColor: "#C4275C", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#F2E8E3" }), _jsx(XAxis, { dataKey: "name", axisLine: false, tickLine: false, tick: { fill: '#8A7A7D', fontSize: 12 }, dy: 10 }), _jsx(YAxis, { axisLine: false, tickLine: false, tick: { fill: '#8A7A7D', fontSize: 12 }, tickFormatter: (val) => `₦${val / 1000}k` }), _jsx(Tooltip, { contentStyle: { borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }, formatter: (value) => [
                                            typeof value === 'number' ? `₦${value.toLocaleString()}` : `₦0`,
                                            'Revenue'
                                        ] }), _jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "#C4275C", strokeWidth: 3, fillOpacity: 1, fill: "url(#colorRev)" })] }) }) })] })] }));
}
