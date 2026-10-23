import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Tags, Package, ClipboardList, LogOut, Menu, ChevronLeft } from "lucide-react";
import { useAuthStore } from "../lib/authStore";
const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
    { to: "/categories", label: "Categories", icon: Tags },
    { to: "/products", label: "Products", icon: Package },
    { to: "/orders", label: "Orders", icon: ClipboardList },
];
export default function Layout() {
    const { user, logout } = useAuthStore();
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
    // Background matches the Categories/Products pages
    _jsxs("div", { className: "flex h-screen w-full overflow-hidden bg-[#FCF8F5]", children: [_jsxs("aside", { className: `
          ${isCollapsed ? "w-[88px]" : "w-[260px]"} 
          bg-white border-r border-[#F2E8E3] flex flex-col transition-all duration-300 ease-in-out shrink-0 h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        `, children: [_jsxs("div", { className: "px-6 py-8 flex items-center justify-between shrink-0", children: [!isCollapsed && (_jsxs("div", { className: "overflow-hidden whitespace-nowrap", children: [_jsx("p", { className: "font-display text-[22px] font-medium text-[#2C2523] tracking-tight", children: "The Love Box" }), _jsx("p", { className: "text-[11px] text-brand-pink tracking-widest uppercase font-semibold mt-1", children: "Admin" })] })), _jsx("button", { onClick: () => setIsCollapsed(!isCollapsed), className: `p-2 rounded-xl text-[#8A7A7D] hover:text-[#2C2523] hover:bg-[#FCF8F5] transition-all duration-200 ${isCollapsed ? "mx-auto" : ""}`, children: isCollapsed ? _jsx(Menu, { className: "w-5 h-5" }) : _jsx(ChevronLeft, { className: "w-5 h-5" }) })] }), _jsx("nav", { className: "flex-1 px-4 py-2 flex flex-col gap-1.5 overflow-y-auto mt-4", children: navItems.map(({ to, label, icon: Icon, end }) => (_jsx(NavLink, { to: to, end: end, title: isCollapsed ? label : undefined, className: ({ isActive }) => `group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14.5px] font-medium transition-all duration-300 ${isActive
                                ? "bg-[#FDF1F4] text-brand-pink shadow-[0_2px_10px_rgba(196,39,92,0.05)]"
                                : "text-[#5C4F51] hover:bg-[#FCF8F5] hover:text-[#2C2523]"} ${isCollapsed ? "justify-center px-0" : ""}`, children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(Icon, { className: `w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-brand-pink" : "text-[#8A7A7D]"}` }), !isCollapsed && _jsx("span", { className: "whitespace-nowrap", children: label }), !isCollapsed && isActive && (_jsx("div", { className: "ml-auto w-1.5 h-1.5 rounded-full bg-brand-pink" }))] })) }, to))) }), _jsx("div", { className: `p-4 mb-2 mx-2 bg-[#FCF8F5]/50 rounded-2xl flex flex-col shrink-0 border border-[#F2E8E3] ${isCollapsed ? "items-center px-0 mx-4" : ""}`, children: !isCollapsed ? (_jsxs("div", { className: "flex items-center gap-3 w-full p-1", children: [_jsx("div", { className: "w-9 h-9 rounded-full bg-gradient-to-br from-brand-pink to-[#A61D47] flex items-center justify-center text-white font-semibold text-sm shadow-sm shrink-0", children: user?.name?.charAt(0).toUpperCase() || "A" }), _jsxs("div", { className: "flex flex-col overflow-hidden", children: [_jsx("p", { className: "text-[13.5px] font-semibold text-[#2C2523] truncate capitalize", children: user?.name || "Admin" }), _jsx("p", { className: "text-[12px] text-[#8A7A7D] truncate capitalize", children: user?.role || "Vendor" })] }), _jsx("button", { onClick: logout, title: "Sign out", className: "ml-auto p-2 text-[#8A7A7D] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0", children: _jsx(LogOut, { className: "w-4 h-4" }) })] })) : (_jsx("button", { onClick: logout, title: "Sign out", className: "p-2 text-[#8A7A7D] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all", children: _jsx(LogOut, { className: "w-5 h-5 shrink-0" }) })) })] }), _jsx("main", { className: "flex-1 overflow-y-auto h-full relative", children: _jsx("div", { className: "max-w-[1400px] mx-auto p-6 md:p-10", children: _jsx(Outlet, {}) }) })] }));
}
