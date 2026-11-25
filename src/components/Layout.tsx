import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { LayoutGrid, Tags, Package, ClipboardList, Mail, Gift, Percent, LogOut, Menu, X, ExternalLink, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "../lib/authStore";
import { api } from "../lib/api";

const nav = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/products", label: "Products", icon: Package },
  { to: "/curate", label: "Curate a gift", icon: Gift },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/discounts", label: "Discounts", icon: Percent },
  { to: "/messages", label: "Messages", icon: Mail },
];

const SITE = import.meta.env.VITE_SITE_URL || "https://the-love-box-customer.vercel.app";

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/brand/logo-mark.png" alt="" className="h-9 w-auto" />
      {!compact && (
        <div className="leading-none">
          <p className="font-script text-[28px] leading-none">The love box</p>
          <p className="mt-0.5 text-[11.5px] font-semibold text-primary-600">Studio</p>
        </div>
      )}
    </div>
  );
}

function NavItems({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {nav.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} title={collapsed ? label : undefined} className="relative">
          {({ isActive }) => (
            <span className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] font-medium transition-colors ${collapsed ? "justify-center" : ""} ${isActive ? "text-primary-700" : "text-ink-soft hover:bg-canvas hover:text-ink"}`}>
              {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-cream-100" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <Icon className="relative h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="relative">{label}</span>}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
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

  const UserCard = ({ compact }: { compact?: boolean }) => (
    <div className={`flex items-center gap-3 rounded-2xl border border-line p-2.5 ${compact ? "justify-center border-0 p-0" : ""}`}>
      {!compact && (
        <>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-600 text-[14px] font-semibold text-white">{user?.name?.charAt(0).toUpperCase() || "A"}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold">{user?.name}</p>
            <p className="truncate text-[12.5px] capitalize text-ink-muted">{user?.role}</p>
          </div>
        </>
      )}
      <button onClick={signOut} className="rounded-lg p-2 text-ink-muted hover:bg-red-50 hover:text-red-600" title="Sign out" aria-label="Sign out">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <motion.aside animate={{ width: collapsed ? 84 : 256 }} transition={{ type: "spring", stiffness: 400, damping: 40 }} className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-white px-4 py-5 lg:flex">
        <div className={`mb-8 flex items-center ${collapsed ? "justify-center" : "justify-between"} px-1`}>
          <Brand compact={collapsed} />
        </div>
        <NavItems collapsed={collapsed} />
        <div className="mt-auto flex flex-col gap-3">
          <a href={SITE} target="_blank" rel="noreferrer" className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink ${collapsed ? "justify-center" : ""}`} title="View store">
            <ExternalLink className="h-[18px] w-[18px]" /> {!collapsed && "View store"}
          </a>
          <button onClick={() => setCollapsed((c) => !c)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink-soft hover:bg-canvas hover:text-ink ${collapsed ? "justify-center" : ""}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <><PanelLeftClose className="h-[18px] w-[18px]" /> Collapse</>}
          </button>
          <UserCard compact={collapsed} />
        </div>
      </motion.aside>

      {/* Mobile top bar + drawer */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur lg:hidden">
          <Brand />
          <button onClick={() => setMobile(true)} className="rounded-xl p-2 hover:bg-cream-100" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        </header>
        <AnimatePresence>
          {mobile && (
            <>
              <motion.div className="fixed inset-0 z-40 bg-ink/35 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
              <motion.aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white p-5 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 400, damping: 40 }}>
                <div className="mb-8 flex items-center justify-between"><Brand /><button onClick={() => setMobile(false)} className="rounded-xl p-2 hover:bg-cream-100" aria-label="Close menu"><X className="h-5 w-5" /></button></div>
                <NavItems onNavigate={() => setMobile(false)} />
                <div className="mt-auto"><UserCard /></div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-8 lg:py-10">
          {/* <AnimatePresence mode="wait"> */}
          <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}>
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <Outlet />
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
