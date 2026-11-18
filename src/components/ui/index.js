import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { STATUS } from "../../lib/format";
const VARIANTS = {
    primary: "bg-ribbon-600 text-white hover:bg-ribbon-700 shadow-[0_8px_20px_-10px_rgba(212,37,143,0.7)]",
    dark: "bg-ink text-white hover:bg-ink-soft",
    ghost: "border border-line bg-white text-ink hover:border-ink/30",
    danger: "bg-red-600 text-white hover:bg-red-700",
    subtle: "text-ink-soft hover:bg-petal-100 hover:text-ink",
};
export function Button({ variant = "primary", loading, className = "", children, size = "md", ...props }) {
    const sz = size === "sm" ? "px-3 py-1.5 text-[13.5px]" : "px-4 py-2.5 text-[14.5px]";
    return (_jsxs("button", { ...props, disabled: props.disabled || loading, className: `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 ${sz} ${VARIANTS[variant]} ${className}`, children: [loading && _jsx(Loader2, { className: "h-4 w-4 animate-spin" }), children] }));
}
/* ---------------- Field ---------------- */
export function Field({ label, error, hint, htmlFor, children }) {
    return (_jsxs("div", { children: [_jsx("label", { htmlFor: htmlFor, className: "label", children: label }), children, error ? _jsx("p", { className: "mt-1.5 text-[13px] font-medium text-red-600", role: "alert", children: error }) : hint ? _jsx("p", { className: "mt-1.5 text-[12.5px] text-ink-muted", children: hint }) : null] }));
}
/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange, label, disabled }) {
    return (_jsx("button", { type: "button", role: "switch", "aria-checked": checked, "aria-label": label, disabled: disabled, onClick: () => onChange(!checked), className: `relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-ribbon-600" : "bg-zinc-300"}`, children: _jsx(motion.span, { layout: true, transition: { type: "spring", stiffness: 600, damping: 35 }, className: `h-5 w-5 rounded-full bg-white shadow ${checked ? "ml-[22px]" : "ml-0.5"}` }) }));
}
/* ---------------- Badges ---------------- */
export function StatusBadge({ status }) {
    const s = STATUS[status] || { label: status, tone: "bg-zinc-100 text-zinc-700 ring-zinc-200", dot: "bg-zinc-400" };
    return (_jsxs("span", { className: `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-medium ring-1 ring-inset ${s.tone}`, children: [_jsx("span", { className: `h-1.5 w-1.5 rounded-full ${s.dot}` }), s.label] }));
}
export function Pill({ children, tone = "petal" }) {
    const t = tone === "zinc" ? "bg-zinc-100 text-zinc-700" : tone === "green" ? "bg-emerald-50 text-emerald-800" : "bg-petal-100 text-ribbon-700";
    return _jsx("span", { className: `inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${t}`, children: children });
}
/* ---------------- Page header ---------------- */
export function PageHeader({ title, sub, actions }) {
    return (_jsxs("div", { className: "mb-8 flex flex-wrap items-end justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-[28px] font-bold tracking-[-0.02em]", children: title }), sub && _jsx("p", { className: "mt-1 text-[15px] text-ink-muted", children: sub })] }), actions && _jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })] }));
}
/* ---------------- Empty / skeleton ---------------- */
export function EmptyState({ icon: Icon, title, body, action }) {
    return (_jsxs("div", { className: "flex flex-col items-center px-6 py-16 text-center", children: [_jsx("div", { className: "mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-petal-100 text-ribbon-600", children: _jsx(Icon, { className: "h-6 w-6" }) }), _jsx("p", { className: "text-[17px] font-semibold", children: title }), _jsx("p", { className: "mt-1 max-w-sm text-[14.5px] text-ink-muted", children: body }), action && _jsx("div", { className: "mt-5", children: action })] }));
}
export const Skeleton = ({ className = "" }) => _jsx("div", { className: `animate-pulse rounded-lg bg-petal-100/80 ${className}` });
/* ---------------- Overlay helpers ---------------- */
function useEscape(open, onClose) {
    useEffect(() => {
        if (!open)
            return;
        const h = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [open, onClose]);
}
export function Drawer({ open, onClose, title, sub, children, footer, width = "max-w-xl", }) {
    useEscape(open, onClose);
    return (_jsx(AnimatePresence, { children: open && (_jsxs(_Fragment, { children: [_jsx(motion.div, { className: "fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose }), _jsxs(motion.aside, { role: "dialog", "aria-modal": "true", "aria-label": title, className: `fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col bg-white shadow-pop`, initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" }, transition: { type: "spring", stiffness: 380, damping: 40 }, children: [_jsxs("div", { className: "flex items-start justify-between gap-4 border-b border-line px-6 py-5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-[19px] font-semibold tracking-tight", children: title }), sub && _jsx("p", { className: "mt-0.5 text-[13.5px] text-ink-muted", children: sub })] }), _jsx("button", { onClick: onClose, className: "rounded-full p-2 hover:bg-petal-100", "aria-label": "Close", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto px-6 py-6", children: children }), footer && _jsx("div", { className: "flex items-center justify-end gap-2 border-t border-line bg-canvas px-6 py-4", children: footer })] })] })) }));
}
export function Modal({ open, onClose, children }) {
    useEscape(open, onClose);
    return (_jsx(AnimatePresence, { children: open && (_jsx(motion.div, { className: "fixed inset-0 z-[60] grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, onClick: onClose, children: _jsx(motion.div, { role: "dialog", "aria-modal": "true", onClick: (e) => e.stopPropagation(), initial: { opacity: 0, scale: 0.95, y: 10 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96, y: 6 }, transition: { type: "spring", stiffness: 450, damping: 32 }, className: "w-full max-w-md rounded-2xl bg-white p-6 shadow-pop", children: children }) })) }));
}
const ConfirmCtx = createContext(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);
export function ConfirmProvider({ children }) {
    const [opts, setOpts] = useState(null);
    const resolver = useRef();
    const confirm = useCallback((o) => {
        setOpts(o);
        return new Promise((res) => (resolver.current = res));
    }, []);
    const close = (v) => {
        resolver.current?.(v);
        setOpts(null);
    };
    return (_jsxs(ConfirmCtx.Provider, { value: confirm, children: [children, _jsx(Modal, { open: !!opts, onClose: () => close(false), children: opts && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex gap-4", children: [opts.danger && (_jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600", children: _jsx(AlertTriangle, { className: "h-5 w-5" }) })), _jsxs("div", { children: [_jsx("p", { className: "text-[17px] font-semibold", children: opts.title }), opts.body && _jsx("p", { className: "mt-1.5 text-[14.5px] leading-relaxed text-ink-muted", children: opts.body })] })] }), _jsxs("div", { className: "mt-6 flex justify-end gap-2", children: [_jsx(Button, { variant: "ghost", onClick: () => close(false), children: "Cancel" }), _jsx(Button, { variant: opts.danger ? "danger" : "primary", onClick: () => close(true), autoFocus: true, children: opts.confirmLabel || "Confirm" })] })] })) })] }));
}
/* ---------------- Search input ---------------- */
export function useDebounced(value, ms = 300) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return v;
}
