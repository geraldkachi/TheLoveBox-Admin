import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import toast from "react-hot-toast";
const statuses = ["pending_payment", "paid", "processing", "out_for_delivery", "delivered", "cancelled"];
export default function Orders() {
    const qc = useQueryClient();
    const { data } = useQuery({
        queryKey: ["orders"],
        queryFn: async () => (await api.get("/orders?limit=50")).data,
    });
    const updateStatus = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status }),
        onSuccess: () => {
            toast.success("Order status updated.");
            qc.invalidateQueries({ queryKey: ["orders"] });
        },
    });
    return (_jsxs("div", { children: [_jsx("h1", { className: "font-display text-[26px] text-brand-ink mb-1", children: "Orders" }), _jsx("p", { className: "text-[14px] text-[#8a7a7d] mb-8", children: "Update status here \u2014 customers see it live on their tracking page." }), _jsx("div", { className: "bg-white border border-brand-blush rounded-2xl overflow-hidden", children: _jsxs("table", { className: "w-full text-[13.5px]", children: [_jsx("thead", { children: _jsxs("tr", { className: "text-left text-[#8a7a7d] border-b border-brand-blush", children: [_jsx("th", { className: "px-5 py-3 font-medium", children: "Order" }), _jsx("th", { className: "px-5 py-3 font-medium", children: "Customer" }), _jsx("th", { className: "px-5 py-3 font-medium", children: "Total" }), _jsx("th", { className: "px-5 py-3 font-medium", children: "Status" })] }) }), _jsx("tbody", { children: data?.items?.map((o) => (_jsxs("tr", { className: "border-b border-brand-blush last:border-0", children: [_jsx("td", { className: "px-5 py-3 text-brand-ink font-medium", children: o.orderNumber }), _jsx("td", { className: "px-5 py-3", children: o.customer?.name }), _jsxs("td", { className: "px-5 py-3", children: ["\u20A6", o.total?.toLocaleString()] }), _jsx("td", { className: "px-5 py-3", children: _jsx("select", { value: o.status, onChange: (e) => updateStatus.mutate({ id: o._id, status: e.target.value }), className: "border border-brand-blush rounded-lg px-2 py-1 text-[13px] outline-none focus:border-brand-pink", children: statuses.map((s) => (_jsx("option", { value: s, children: s.replace(/_/g, " ") }, s))) }) })] }, o._id))) })] }) })] }));
}
