import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getApiErrorMessage } from "@/services/api";
import { TownXLogo } from "@/components/brand/TownXLogo";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("admin@townx.demo");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Sign in failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 grid place-items-center overflow-hidden bg-brand-50 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(234,88,12,0.12),_transparent_40%)]" />

      <div className="relative z-10 w-full max-w-[540px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="grid sm:grid-cols-[200px_1fr]">
          <aside className="flex flex-col items-center justify-center bg-gradient-to-b from-brand-700 to-brand-900 px-5 py-6 text-center text-white">
            <TownXLogo size={64} variant="full" className="rounded-xl" />
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-200">TOWN-X</p>
            <h1 className="font-display mt-1 text-lg font-semibold">Admin Console</h1>
            <p className="mt-1 text-xs text-white/70">Secure staff access</p>
          </aside>

          <form onSubmit={handleSubmit} className="space-y-3.5 px-5 py-6">
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">Sign in</h2>
              <p className="mt-0.5 text-xs text-ink-muted">Use your administrator credentials</p>
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
                required
              />
            </div>
            {error ? <p className="text-xs text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
