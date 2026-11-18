import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, Tags, Package, ClipboardList, Mail, LogOut, Menu, X, ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../lib/authStore";
import { api } from "../lib/api";
const nav = [
    { to: "/", label: "Overview", icon: LayoutGrid, end: true },
    { to: "/orders", label: "Orders", icon: ClipboardList },
    { to: "/products", label: "Products", icon: Package },
    { to: "/categories", label: "Categories", icon: Tags },
    { to: "/messages", label: "Messages", icon: Mail },
];
const SITE = import.meta.env.VITE_SITE_URL || "https://the-love-box-customer.vercel.app";
function Brand({ compact }) {
    return (_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: "/brand/logo-mark.png", alt: "", className: "h-9 w-auto" }), !compact && (_jsxs("div", { className: "leading-none", children: [_jsx("p", { className: "font-script text-[28px] leading-none", children: "The love box" }), _jsx("p", { className: "mt-0.5 text-[11.5px] font-semibold text-ribbon-600", children: "Studio" })] }))] }));
}
function NavItems({ collapsed, onNavigate }) {
    return (_jsx("nav", { className: "flex flex-col gap-1", "aria-label": "Main", children: nav.map(({ to, label, icon: Icon, end }) => (_jsx(NavLink, { to: to, end: end, onClick: onNavigate, title: collapsed ? label : undefined, className: "relative", children: ({ isActive }) => (_jsxs("span", { className: `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${isActive ? "text-ribbon-700" : "text-ink-soft hover:bg-canvas hover:text-ink"}`, children: [isActive && _jsx(motion.span, { layoutId: "nav-pill", className: "absolute inset-0 rounded-xl bg-petal-100", transition: { type: "spring", stiffness: 500, damping: 40 } }), _jsx(Icon, { className: "relative h-[18px] w-[18px] shrink-0" }), !collapsed && _jsx("span", { className: "relative", children: label })] })) }, to))) }));
}
export default function Layout() {
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(() => localStorage.getItem("tlb_nav_collapsed") === "1");
    const [mobile, setMobile] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => setMobile(false), [location.pathname]);
    useEffect(() => localStorage.setItem("tlb_nav_collapsed", collapsed ? "1" : "0"), [collapsed]);
    const signOut = () => {
        api.post("/auth/logout").catch(() => null);
        logout();
        toast.success("You've been signed out.");
        navigate("/login");
    };
    const UserCard = ({ compact }) => (_jsxs("div", { className: `flex items-center gap-3 rounded-2xl border border-line p-2.5 ${compact ? "justify-center border-0 p-0" : ""}`, children: [!compact && (_jsxs(_Fragment, { children: [_jsx("span", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ribbon-600 text-[14px] font-semibold text-white", children: user?.name?.charAt(0).toUpperCase() || "A" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "truncate text-[14px] font-semibold", children: user?.name }), _jsx("p", { className: "truncate text-[12.5px] capitalize text-ink-muted", children: user?.role })] })] })), _jsx("button", { onClick: signOut, className: "rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600", title: "Sign out", "aria-label": "Sign out", children: _jsx(LogOut, { className: "h-4 w-4" }) })] }));
    return (_jsxs("div", { className: "flex min-h-screen", children: [_jsxs(motion.aside, { animate: { width: collapsed ? 84 : 256 }, transition: { type: "spring", stiffness: 400, damping: 40 }, className: "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white px-4 py-5 lg:flex", children: [_jsx("div", { className: `mb-8 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-1`, children: _jsx(Brand, { compact: collapsed }) }), _jsx(NavItems, { collapsed: collapsed }), _jsxs("div", { className: "mt-auto flex flex-col gap-3", children: [_jsxs("a", { href: SITE, target: "_blank", rel: "noreferrer", className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink ${collapsed ? "justify-center" : ""}`, title: "View store", children: [_jsx(ExternalLink, { className: "h-[18px] w-[18px]" }), " ", !collapsed && "View store"] }), _jsx("button", { onClick: () => setCollapsed((c) => !c), className: `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink ${collapsed ? "justify-center" : ""}`, "aria-label": collapsed ? "Expand sidebar" : "Collapse sidebar", children: collapsed ? _jsx(PanelLeftOpen, { className: "h-[18px] w-[18px]" }) : _jsxs(_Fragment, { children: [_jsx(PanelLeftClose, { className: "h-[18px] w-[18px]" }), " Collapse"] }) }), _jsx(UserCard, { compact: collapsed })] })] }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden", children: [_jsx(Brand, {}), _jsx("button", { onClick: () => setMobile(true), className: "rounded-xl p-2 hover:bg-petal-100", "aria-label": "Open menu", children: _jsx(Menu, { className: "h-5 w-5" }) })] }), _jsx(AnimatePresence, { children: mobile && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 z-40 bg-ink/35 lg:hidden", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: () => setMobile(false) }), _jsxs(motion.aside, { className: "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-5 lg:hidden", initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" }, transition: { type: "spring", stiffness: 400, damping: 40 }, children: [_jsxs("div", { className: "mb-8 flex items-center justify-between", children: [_jsx(Brand, {}), _jsx("button", { onClick: () => setMobile(false), className: "rounded-xl p-2 hover:bg-petal-100", "aria-label": "Close menu", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx(NavItems, { onNavigate: () => setMobile(false) }), _jsx("div", { className: "mt-auto", children: _jsx(UserCard, {}) })] })] })) }), _jsx("main", { className: "mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-8 lg:py-10", children: _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.18 }, children: _jsx(Outlet, {}) }, location.pathname) }) })] })] }));
}
