import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import AuthLayout from "../components/AuthLayout";
import { Button, Field } from "../components/ui";
export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { token, setAuth } = useAuthStore();
    const navigate = useNavigate();
    const from = useLocation().state?.from || "/";
    if (token)
        return _jsx(Navigate, { to: "/", replace: true });
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            const res = await api.post("/auth/login", form);
            const d = res.data;
            if (!["admin", "vendor"].includes(d.role)) {
                toast.error("This account doesn't have studio access. Use the customer site instead.");
                return;
            }
            setAuth(d.token, { name: d.name, email: d.email, role: d.role });
            toast.success(msg(res, "Welcome back"));
            navigate(from, { replace: true });
        }
        catch (err) {
            setErrors(fieldErrors(err));
            toast.error(errorMessage(err, "Couldn't sign in. Check your details."));
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(AuthLayout, { title: "Sign in to the studio", sub: "Manage orders, products and categories.", children: _jsxs("form", { onSubmit: submit, className: "flex flex-col gap-4", noValidate: true, children: [_jsx(Field, { label: "Email", htmlFor: "email", error: errors.email, children: _jsx("input", { id: "email", type: "email", autoComplete: "email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), className: `input ${errors.email ? "input-error" : ""}` }) }), _jsx(Field, { label: "Password", htmlFor: "password", error: errors.password, children: _jsxs("div", { className: "relative", children: [_jsx("input", { id: "password", type: show ? "text" : "password", autoComplete: "current-password", value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }), className: `input pr-11 ${errors.password ? "input-error" : ""}` }), _jsx("button", { type: "button", onClick: () => setShow((s) => !s), className: "absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:text-ink", "aria-label": show ? "Hide password" : "Show password", children: show ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }) }), _jsx(Button, { type: "submit", loading: loading, className: "mt-2 py-3", children: "Sign in" }), _jsxs("p", { className: "text-center text-[14px] text-ink-muted", children: ["New to the team? ", _jsx(Link, { to: "/register", className: "font-semibold text-ribbon-700 hover:underline", children: "Create an account" })] })] }) }));
}
