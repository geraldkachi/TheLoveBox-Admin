import { NavLink, Outlet } from "react-router-dom";
import { LayoutGrid, Tags, Package, ClipboardList, LogOut } from "lucide-react";
import { useAuthStore } from "../lib/authStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/products", label: "Products", icon: Package },
  { to: "/orders", label: "Orders", icon: ClipboardList },
];

export default function Layout() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-brand-cream">
      <aside className="w-64 bg-white border-r border-brand-blush flex flex-col">
        <div className="px-6 py-6 border-b border-brand-blush">
          <p className="font-display text-[20px] text-brand-ink">The Love Box</p>
          <p className="text-[12px] text-brand-gold tracking-wide uppercase">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  isActive
                    ? "bg-brand-pink text-white"
                    : "text-brand-ink hover:bg-brand-blush"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-brand-blush">
          <p className="text-[13px] font-medium text-brand-ink truncate">{user?.name}</p>
          <p className="text-[12px] text-[#8a7a7d] truncate mb-2">{user?.role}</p>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[13px] text-[#8a7a7d] hover:text-brand-pink transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
