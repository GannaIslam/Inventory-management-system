import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const result = await login(form.username, form.password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Left – Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight mb-2">
              Inventra
            </h1>
            <p className="text-slate-500 text-sm">
              See your growth and get support!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164E63] focus:border-transparent transition-all"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#164E63] focus:border-transparent transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                </button>
              </div>
            </div>


            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Right – Dark panel with decorative charts */}
      <div className="hidden lg:flex flex-1 bg-[#164E63] items-center justify-center relative overflow-hidden">
        {/* Decorative squares */}
        <div className="absolute top-10 right-12 w-8 h-8 bg-cyan-400/30 rounded-sm rotate-12" />
        <div className="absolute top-20 right-28 w-5 h-5 bg-cyan-300/20 rounded-sm rotate-45" />
        <div className="absolute bottom-20 left-10 w-6 h-6 bg-cyan-400/20 rounded-sm rotate-6" />

        {/* Mock chart cards */}
        <div className="relative z-10 flex flex-col gap-5 px-10 w-full max-w-sm">
          {/* Line chart card */}
          <div className="bg-white rounded-2xl shadow-xl p-5">
            <p className="text-xs font-semibold text-slate-500 mb-3">
              Revenue Growth
            </p>
            <svg viewBox="0 0 260 80" className="w-full">
              <polyline
                points="0,70 40,55 80,60 120,40 160,45 200,25 260,15"
                fill="none"
                stroke="#84CC16"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <line
                x1="0"
                y1="40"
                x2="260"
                y2="10"
                stroke="#EF4444"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
              <line
                x1="0"
                y1="55"
                x2="260"
                y2="25"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
              <text x="215" y="8" fontSize="9" fill="#EF4444">
                Resistance
              </text>
              <text x="220" y="23" fontSize="9" fill="#94A3B8">
                Support
              </text>
            </svg>
          </div>

          {/* Donut chart card */}
          <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 ml-auto w-44">
            <svg viewBox="0 0 60 60" className="w-16 h-16">
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="8"
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#0F172A"
                strokeWidth="8"
                strokeDasharray={`${0.59 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                strokeDashoffset={2 * Math.PI * 24 * 0.25}
              />
              <circle
                cx="30"
                cy="30"
                r="24"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="8"
                strokeDasharray={`${0.28 * 2 * Math.PI * 24} ${2 * Math.PI * 24}`}
                strokeDashoffset={-2 * Math.PI * 24 * 0.34}
              />
              <text
                x="30"
                y="34"
                textAnchor="middle"
                fontSize="11"
                fontWeight="bold"
                fill="#0F172A"
              >
                59%
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
