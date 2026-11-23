import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { STATUS } from "../../lib/format";

/* ---------------- Button ---------------- */
type Variant = "primary" | "dark" | "ghost" | "danger" | "subtle";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-[0_8px_20px_-10px_rgba(212,37,143,0.7)]",
  dark: "bg-ink text-white hover:bg-ink-soft",
  ghost: "border border-line bg-white text-ink hover:border-ink/30",
  danger: "bg-red-600 text-white hover:bg-red-700",
  subtle: "text-ink-soft hover:bg-cream-100 hover:text-ink",
};

export function Button({
  variant = "primary", loading, className = "", children, size = "md", ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "px-3 py-1.5 text-[13.5px]" : "px-4 py-2.5 text-[14.5px]";
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 ${sz} ${VARIANTS[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------------- Field ---------------- */
export function Field({ label, error, hint, htmlFor, children }: { label: string; error?: string; hint?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-[13px] font-medium text-red-600" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-[12.5px] text-ink-muted">{hint}</p> : null}
    </div>
  );
}

/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-primary-600" : "bg-zinc-300"}`}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={`h-5 w-5 rounded-full bg-white shadow ${checked ? "ml-[22px]" : "ml-0.5"}`} />
    </button>
  );
}

/* ---------------- Badges ---------------- */
export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, tone: "bg-zinc-100 text-zinc-700 ring-zinc-200", dot: "bg-zinc-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-medium ring-1 ring-inset ${s.tone}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function Pill({ children, tone = "petal" }: { children: React.ReactNode; tone?: "petal" | "zinc" | "green" }) {
  const t = tone === "zinc" ? "bg-zinc-100 text-zinc-700" : tone === "green" ? "bg-emerald-50 text-emerald-800" : "bg-cream-100 text-primary-700";
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${t}`}>{children}</span>;
}

/* ---------------- Page header ---------------- */
export function PageHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-ink-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------------- Empty / skeleton ---------------- */
export function EmptyState({ icon: Icon, title, body, action }: { icon: any; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-primary-600">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-[14.5px] text-ink-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export const Skeleton = ({ className = "" }: { className?: string }) => <div className={`animate-pulse rounded-lg bg-cream-100/80 ${className}`} />;

/* ---------------- Overlay helpers ---------------- */
function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
}

export function Drawer({
  open, onClose, title, sub, children, footer, width = "max-w-xl",
}: { open: boolean; onClose: () => void; title: string; sub?: string; children: React.ReactNode; footer?: React.ReactNode; width?: string }) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col bg-white shadow-pop`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <p className="text-[19px] font-semibold tracking-tight">{title}</p>
                {sub && <p className="mt-0.5 text-[13.5px] text-ink-muted">{sub}</p>}
              </div>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-cream-100" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas px-6 py-4">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Confirm dialog (promise-based) ---------------- */
interface ConfirmOptions {
  title: string;
  body?: string;
  confirmLabel?: string;
  danger?: boolean;
}
const ConfirmCtx = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>();
  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    return new Promise<boolean>((res) => (resolver.current = res));
  }, []);
  const close = (v: boolean) => {
    resolver.current?.(v);
    setOpts(null);
  };
  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Modal open={!!opts} onClose={() => close(false)}>
        {opts && (
          <>
            <div className="flex gap-4">
              {opts.danger && (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                </span>
              )}
              <div>
                <p className="text-[17px] font-semibold">{opts.title}</p>
                {opts.body && <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-muted">{opts.body}</p>}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => close(false)}>Cancel</Button>
              <Button variant={opts.danger ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
                {opts.confirmLabel || "Confirm"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </ConfirmCtx.Provider>
  );
}

/* ---------------- Search input ---------------- */
export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
