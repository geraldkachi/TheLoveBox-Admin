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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.token, { name: data.name, email: data.email, role: data.role });
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't sign in. Check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="font-display text-[28px] text-brand-ink text-center mb-1">The Love Box</p>
        <p className="text-[13px] text-brand-gold text-center uppercase tracking-wide mb-8">
          Admin & vendor portal
        </p>
        <form onSubmit={submit} className="bg-white border border-brand-blush rounded-2xl p-7 flex flex-col gap-4">
          <div>
            <label className="text-[13px] text-brand-ink font-medium mb-1 block">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@theloveboxgifts.com"
              className="w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors"
            />
          </div>
          <div>
            <label className="text-[13px] text-brand-ink font-medium mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-brand-blush rounded-lg px-3.5 py-2.5 text-[14px] outline-none focus:border-brand-pink transition-colors"
            />
          </div>
          <button
            disabled={loading}
            className="mt-2 bg-brand-pink text-white rounded-full py-2.5 text-[14px] font-medium hover:bg-brand-pinkDark transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-[13px] text-center text-[#8a7a7d]">
            New here?{" "}
            <Link to="/register" className="text-brand-pink font-medium">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
