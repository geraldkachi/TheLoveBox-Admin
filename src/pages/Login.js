import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import toast from "react-hot-toast";
export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setAuth(data.token, { name: data.name, email: data.email, role: data.role });
            navigate("/");
        }
        catch (err) {
            toast.error(err?.response?.data?.message || "Couldn't sign in. Check your details.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-brand-cream flex items-center justify-center px-4", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsx("p", { className: "font-display text-[28px] text-brand-ink text-center mb-1", children: "The Love Box" }), _jsx("p", { className: "text-[13px] text-brand-gold text-center uppercase tracking-wide mb-8", children: "Admin & vendor portal" }), _jsxs("form", { onSubmit: submit, className: "bg-white border border-brand-blush rounded-2xl p-7 flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-brand-ink font-medium mb-1 block", children: "Email" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@theloveboxgifts.com", className: "w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[13px] text-brand-ink font-medium mb-1 block", children: "Password" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors" })] }), _jsx("button", { disabled: loading, className: "mt-2 bg-brand-pink text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-brand-pinkDark transition-colors disabled:opacity-60", children: loading ? "Signing in..." : "Sign in" }), _jsxs("p", { className: "text-[13px] text-center text-[#8a7a7d]", children: ["New here?", " ", _jsx(Link, { to: "/register", className: "text-brand-pink font-medium", children: "Create an account" })] })] })] }) }));
}
