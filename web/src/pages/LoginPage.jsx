import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ErrorBanner } from "../components/ui";

const DEMO = [
  ["admin@eggtrace.ai", "Admin"],
  ["farm@eggtrace.ai", "Farm"],
  ["inspector@eggtrace.ai", "Inspector"],
  ["logistics@eggtrace.ai", "Logistics"],
  ["buyer@eggtrace.ai", "Buyer"],
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@eggtrace.ai");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-4xl">🥚</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
            Egg<span className="text-brand-500">Trace</span> AI
          </h1>
          <p className="mt-1 text-sm text-slate-500">Egg batch traceability & quality records</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4 p-6">
          <ErrorBanner message={error} />
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <div className="border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Demo accounts (password: password123)</p>
            <div className="flex flex-wrap gap-1.5">
              {DEMO.map(([em, label]) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => { setEmail(em); setPassword("password123"); }}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
