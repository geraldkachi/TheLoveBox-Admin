import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../lib/authStore";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, role: "admin" });
      setAuth(data.token, { name: data.name, email: data.email, role: data.role });
      toast.success(`Welcome, ${data.name.split(" ")[0]}.`);
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-display text-[28px] text-brand-ink text-center mb-1">The Love Box</p>
        <p className="text-[13px] text-brand-gold text-center uppercase tracking-wide mb-8">
          Create your vendor account
        </p>
        <form onSubmit={submit} className="bg-white border border-brand-blush rounded-2xl p-7 flex flex-col gap-4">
          <div>
            <label className="text-[13px] text-brand-ink font-medium mb-1 block">Full name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
              className="w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] text-brand-ink font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@theloveboxgifts.com"
              className="w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] text-brand-ink font-medium mb-1 block">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              className="w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors"
            />
          </div>
          <button
            disabled={loading}
            className="mt-2 bg-brand-pink text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-brand-pinkDark transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
          <p className="text-[13px] text-center text-[#8a7a7d]">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-pink font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
