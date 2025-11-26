
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Toast from "../components/Toast";
import ProfileMenu from "./ProfileMenu";

export default function DashboardLayout({ children, user, onLogout }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("rbac_dark")) || false;
    } catch {
      return false;
    }
  });

  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (location?.state?.toast) {
      const t = location.state.toast;
      setToasts((prev) => [...prev, t]);
      try {
        window.history.replaceState({}, document.title);
      } catch (e) {}
    }
  }, [location]);

  useEffect(() => {
    localStorage.setItem("rbac_dark", JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const menuItems = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard" },
    { label: "Catalog", icon: "📦", path: "/catalog" },
    { label: "Customers", icon: "👥", path: "/customers" },
    { label: "Orders", icon: "🧾", path: "/orders" },
    { label: "Our Staff", icon: "🧑‍💼", path: "/our-staff" },
    { label: "Settings", icon: "⚙️", path: "/settings" },
  ];

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen`}>
      <div className="min-h-screen flex bg-gradient-to-br from-cyan-50 via-white to-rose-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
        {/* TOASTS - top center */}
        <div className="fixed inset-x-0 top-6 flex justify-center pointer-events-none z-50">
          <div className="pointer-events-auto">
            {toasts.map((t) => (
              <div key={t.id} className="mb-3">
                <Toast id={t.id} message={t.message} type={t.type} duration={t.duration || 3500} onClose={removeToast} />
              </div>
            ))}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside
          className={`backdrop-blur-sm p-4 flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
          style={{
            background: "linear-gradient(180deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))",
          }}
        >
          <div className="h-16 flex items-center px-2">
            <div className={`flex items-center gap-2 ${collapsed ? "justify-center w-full" : ""}`}>
              {!collapsed && <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">RBAC DEMO</div>}

              <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                {collapsed ? "➡️" : "⬅️"}
              </button>
            </div>
          </div>

          <nav className="mt-4 flex-1 space-y-2">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-lg ${collapsed ? "justify-center" : ""} transition-colors text-slate-700 dark:text-slate-200 ${
                    active ? "bg-emerald-100 dark:bg-slate-700" : "hover:bg-emerald-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto p-2">
            <button onClick={onLogout} className="w-full bg-emerald-600 text-white py-2 rounded-lg shadow">
              Log Out
            </button>
          </div>
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <header className="h-16 flex items-center justify-between px-6 border-b bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm transition-colors">
            <div className="flex items-center gap-4">
              <button onClick={() => setCollapsed(!collapsed)} className="md:hidden p-2 bg-white rounded-lg shadow dark:bg-slate-800">
                ☰
              </button>

              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">RBAC Demo</h1>
                <div className="text-sm text-slate-500 dark:text-slate-300">
                  Welcome back, <strong>{user?.name || user?.email || "Admin"}</strong>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: keep only ProfileMenu (it will include the dark toggle) */}
            <div className="flex items-center gap-4">
              <ProfileMenu user={user} onLogout={onLogout} darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="p-8 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
