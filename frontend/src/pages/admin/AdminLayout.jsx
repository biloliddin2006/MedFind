
import Brand from "../../components/Brand";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_BASE_URL || "https://medfind-0woa.onrender.com/api"
).replace(/\/$/, "");

const TOKEN_KEY = "medfind_access_token";

function readRole(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(
      atob(normalized + "=".repeat((4 - normalized.length % 4) % 4))
    );

    return String(
      decoded.role ??
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded.roles?.[0] ??
      ""
    ).toLowerCase();
  } catch {
    return "";
  }
}

const navigation = [
  { label: "Dashboard", path: "/admin" },
  { label: "Patients", path: "/admin/patients" },
  { label: "Doctors", path: "/admin/doctors" },
  { label: "Clinics", path: "/admin/clinics" },
  { label: "Clinic Requests", path: "/admin/clinic-requests" },
  { label: "Pharmacies", path: "/admin/pharmacies" },
  { label: "Pharmacy Requests", path: "/admin/pharmacy-requests" },
  { label: "Doctor Assignments", path: "/admin/doctor-assignments" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || ""
  );
  const [email, setEmail] = useState("admin@medfind.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const isAdmin = Boolean(token) && readRole(token) === "admin";

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setLoginLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || result.title || "Не удалось войти."
        );
      }

      const newToken = result.accessToken ?? result.token;

      if (!newToken) {
        throw new Error("Backend не вернул access token.");
      }

      if (readRole(newToken) !== "admin") {
        throw new Error("У этой учётной записи нет роли Admin.");
      }

      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setPassword("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    navigate("/admin", { replace: true });
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm"
        >
          <Brand />

          <h1 className="mt-4 text-3xl font-bold text-brand-900">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Войди с учётной записью администратора.
          </p>

          <label className="mt-6 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
            required
          />

          <label className="mt-4 block text-sm font-medium">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
            required
          />

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="mt-6 w-full rounded-xl bg-brand-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loginLoading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 md:grid md:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r">
        <div className="px-5 py-4 md:border-b md:border-slate-200">
          <Brand />
        </div>

        <nav aria-label="Administration" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:flex-1 md:space-y-1 md:p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-teal-50 text-teal-900" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex gap-2 border-t border-slate-200 px-4 py-3 md:flex-col">
          <button type="button" onClick={() => navigate("/")} className="rounded-md px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100">
            Back to website
          </button>
          <button type="button" onClick={logout} className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-8">
          <p className="text-sm font-semibold text-slate-800">Administration</p>
          <span className="text-sm text-slate-500">Administrator</span>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <Outlet context={{ token }} />
        </div>
      </div>
    </div>
  );
}
