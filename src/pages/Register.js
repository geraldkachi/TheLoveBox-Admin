import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import AuthLayout from "../components/AuthLayout";
import { Button, Field } from "../components/ui";
export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const submit = async (e) => {
        e.preventDefault();
        if (form.password.length < 8)
            return setErrors({ password: "Password must be at least 8 characters." });
        setLoading(true);
        setErrors({});
        try {
            const res = await api.post("/auth/register", { ...form, role: "admin" });
            const d = res.data;
            setAuth(d.token, { name: d.name, email: d.email, role: d.role });
            toast.success(msg(res, "Account created"), {
                description: d.role === "admin" ? "You're the studio admin." : "You've joined as a vendor. An admin can change your access.",
            });
            navigate("/");
        }
        catch (err) {
            setErrors(fieldErrors(err));
            toast.error(errorMessage(err, "Couldn't create your account."));
        }
        finally {
            setLoading(false);
        }
    };
    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
    return (_jsx(AuthLayout, { title: "Create a studio account", sub: "The first account becomes the admin. Everyone after joins as a vendor.", children: _jsxs("form", { onSubmit: submit, className: "flex flex-col gap-4", noValidate: true, children: [_jsx(Field, { label: "Full name", htmlFor: "name", error: errors.name, children: _jsx("input", { id: "name", value: form.name, onChange: set("name"), className: `input ${errors.name ? "input-error" : ""}` }) }), _jsx(Field, { label: "Email", htmlFor: "email", error: errors.email, children: _jsx("input", { id: "email", type: "email", value: form.email, onChange: set("email"), className: `input ${errors.email ? "input-error" : ""}` }) }), _jsx(Field, { label: "Password", htmlFor: "password", error: errors.password, hint: "At least 8 characters.", children: _jsx("input", { id: "password", type: "password", autoComplete: "new-password", value: form.password, onChange: set("password"), className: `input ${errors.password ? "input-error" : ""}` }) }), _jsx(Button, { type: "submit", loading: loading, className: "mt-2 py-3", children: "Create account" }), _jsxs("p", { className: "text-center text-[14px] text-ink-muted", children: ["Already have an account? ", _jsx(Link, { to: "/login", className: "font-semibold text-ribbon-700 hover:underline", children: "Sign in" })] })] }) }));
}
