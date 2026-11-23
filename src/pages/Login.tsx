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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const from = (useLocation().state as any)?.from || "/";

  if (token) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
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
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, "Couldn't sign in. Check your details."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign in to the studio" sub="Manage orders, products and categories.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email" error={errors.email}>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`input ${errors.email ? "input-error" : ""}`} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <div className="relative">
            <input id="password" type={show ? "text" : "password"} autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`input pr-11 ${errors.password ? "input-error" : ""}`} />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-muted hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Button type="submit" loading={loading} className="mt-2 py-3">Sign in</Button>
        <p className="text-center text-[14px] text-ink-muted">
          New to the team? <Link to="/register" className="font-semibold text-primary-700 hover:underline">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
