import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Mail, Phone, Reply } from "lucide-react";
import { api, errorMessage } from "../lib/api";
import { timeAgo, dateTime } from "../lib/format";
import { Button, EmptyState, PageHeader, Skeleton } from "../components/ui";
export default function Messages() {
    const [openId, setOpenId] = useState(null);
    const { data = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ["inquiries"],
        queryFn: async () => (await api.get("/contact")).data,
    });
    return (_jsxs("div", { children: [_jsx(PageHeader, { title: "Messages", sub: "Questions and corporate briefs sent from the store's contact page." }), _jsx("div", { className: "card overflow-hidden", children: isError ? (_jsx(EmptyState, { icon: Mail, title: "Couldn't load messages", body: errorMessage(error), action: _jsx(Button, { onClick: () => refetch(), children: "Try again" }) })) : isLoading ? (_jsx("div", { className: "flex flex-col gap-2 p-4", children: [0, 1, 2].map((i) => _jsx(Skeleton, { className: "h-16" }, i)) })) : !data.length ? (_jsx(EmptyState, { icon: Mail, title: "No messages yet", body: "When someone writes in from the contact page, it lands here." })) : (_jsx("ul", { children: data.map((m) => {
                        const open = openId === m._id;
                        return (_jsxs("li", { className: "border-t border-line first:border-t-0", children: [_jsxs("button", { onClick: () => setOpenId(open ? null : m._id), className: "flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-petal-50/60", "aria-expanded": open, children: [_jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-petal-100 font-semibold text-ribbon-700", children: m.name.charAt(0).toUpperCase() }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsxs("span", { className: "flex items-baseline justify-between gap-3", children: [_jsx("span", { className: "font-semibold", children: m.name }), _jsx("span", { className: "shrink-0 text-[12.5px] text-ink-muted", title: dateTime(m.createdAt), children: timeAgo(m.createdAt) })] }), _jsx("span", { className: `block text-[14px] text-ink-soft ${open ? "" : "truncate"}`, children: m.message })] })] }), _jsx(AnimatePresence, { initial: false, children: open && (_jsx(motion.div, { initial: { height: 0, opacity: 0 }, animate: { height: "auto", opacity: 1 }, exit: { height: 0, opacity: 0 }, className: "overflow-hidden", children: _jsxs("div", { className: "flex flex-wrap gap-2 px-5 pb-4 pl-[76px]", children: [_jsxs("a", { href: `mailto:${m.email}?subject=${encodeURIComponent("Re: your message to The Love Box")}`, className: "inline-flex items-center gap-2 rounded-xl bg-ink px-3.5 py-2 text-[13.5px] font-semibold text-white hover:bg-ink-soft", children: [_jsx(Reply, { className: "h-4 w-4" }), " Reply by email"] }), _jsxs("span", { className: "inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-[13.5px]", children: [_jsx(Mail, { className: "h-4 w-4 text-ink-muted" }), m.email] }), m.phone && _jsxs("a", { href: `tel:${m.phone}`, className: "inline-flex items-center gap-2 rounded-xl border border-line px-3.5 py-2 text-[13.5px]", children: [_jsx(Phone, { className: "h-4 w-4 text-ink-muted" }), m.phone] })] }) })) })] }, m._id));
                    }) })) })] }));
}
