import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";


export default function ProfileMenu({ user = {}, onLogout, darkMode = false, setDarkMode = () => {} }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const avatarUrl =
    user.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || "User")}&background=10B981&color=fff`;

  const handleLogout = () => {
    setOpen(false);
    if (onLogout) onLogout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {/* Small "Light/Dark" visual - keep it small, but actual toggle lives in dropdown */}
        <div className="hidden sm:flex items-center text-sm text-slate-600 dark:text-slate-300 mr-2">
          <span className="px-2 py-1 rounded-full bg-white/30 dark:bg-slate-700">🌓</span>
        </div>

        {/* avatar */}
        <div className="relative">
          <img src={avatarUrl} alt={user?.name || "User avatar"} className="w-9 h-9 rounded-full border" />
          {/* small status dot */}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
      </button>

      {/* dropdown */}
      <div
        className={`origin-top-right right-0 mt-2 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transform transition-all ${
          open ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
        }`}
        style={{ position: "absolute", top: "calc(100% + 8px)", zIndex: 60 }}
      >
        <div className="py-2 px-3 border-b border-slate-100 dark:border-slate-700">
          <div className="text-sm font-semibold">{user?.name || "Demo User"}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{user?.email || ""}</div>
        </div>

        <div className="py-1">
          <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="text-slate-400">📊</span>
            Dashboard
          </Link>

          <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="text-slate-400">⚙️</span>
            Edit Profile
          </Link>

          {/* Dark mode toggle inside menu (single control) */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">🌓</span>
              <div className="text-sm">Theme</div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${darkMode ? "bg-indigo-600" : "bg-slate-300"}`}
              aria-label="Toggle theme"
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow transform ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 mt-2" />

          <button onClick={handleLogout} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
            <span className="text-red-500">⎋</span>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
