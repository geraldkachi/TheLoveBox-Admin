import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, errorMessage, fieldErrors, msg } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import AuthLayout from "../components/AuthLayout";
import { Button, Field } from "../components/ui";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return setErrors({ password: "Password must be at least 8 characters." });
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
    } catch (err) {
      setErrors(fieldErrors(err));
      toast.error(errorMessage(err, "Couldn't create your account."));
    } finally {
      setLoading(false);
    }
  };
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <AuthLayout title="Create a studio account" sub="The first account becomes the admin. Everyone after joins as a vendor.">
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Field label="Full name" htmlFor="name" error={errors.name}><input id="name" value={form.name} onChange={set("name")} className={`input ${errors.name ? "input-error" : ""}`} /></Field>
        <Field label="Email" htmlFor="email" error={errors.email}><input id="email" type="email" value={form.email} onChange={set("email")} className={`input ${errors.email ? "input-error" : ""}`} /></Field>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters."><input id="password" type="password" autoComplete="new-password" value={form.password} onChange={set("password")} className={`input ${errors.password ? "input-error" : ""}`} /></Field>
        <Button type="submit" loading={loading} className="mt-2 py-3">Create account</Button>
        <p className="text-center text-[14px] text-ink-muted">
          Already have an account? <Link to="/login" className="font-semibold text-primary-700 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
