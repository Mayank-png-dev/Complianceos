import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Login failed";
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(145deg,_#f4f8f3_0%,_#dceee2_45%,_#eef6ef_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden bg-[linear-gradient(160deg,_#0f3d2e_0%,_#1d6b52_55%,_#8ed0a7_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/80">ComplianceOS</p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold leading-tight">
              Keep every client’s GST work visible, timely, and under control.
            </h1>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-emerald-50/80">From login to alerts, your compliance pipeline stays in one place.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">Sign in to your workspace</h2>
            <p className="mt-3 text-sm text-slate-500">Use your registered email and password to continue.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
                  placeholder="ca@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500 focus:bg-white"
                  placeholder="Enter your password"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Need an account?{" "}
              <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
