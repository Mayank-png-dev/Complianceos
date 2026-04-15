import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddClient from "./pages/AddClient";
import ClientDetail from "./pages/ClientDetail";

const isAuthenticated = () => Boolean(localStorage.getItem("token"));

const ProtectedRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

const AuthRoute = () => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const AppShell = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(195,232,216,0.45),_transparent_35%),linear-gradient(180deg,_#f8fcf7_0%,_#edf4ee_100%)]">
      <header className="border-b border-emerald-900/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Link to="/dashboard" className="text-2xl font-semibold tracking-tight text-slate-900">
              ComplianceOS
            </Link>
            <p className="text-sm text-slate-500">GST compliance workspace</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/clients/new"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Add Client
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients/new" element={<AddClient />} />
            <Route path="/clients/:id" element={<ClientDetail />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
