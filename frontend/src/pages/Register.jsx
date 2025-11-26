import React, { useState } from "react";
import { useNavigate } from "react-router-dom";



const rawBase = process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_URL || "http://localhost:5000";
const normalizedBase = rawBase.replace(/\/+$/, ""); // remove trailing slash(es)
const API_BASE = normalizedBase.endsWith("/api") ? normalizedBase : `${normalizedBase}/api`;

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);

    if (!name || !email || !password) {
      showMsg("Please fill all fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // read JSON safely
      let json = {};
      try { json = await res.json(); } catch (err) { /* ignore parse error */ }

      if (!res.ok) {
        // server provided message?
        showMsg(json.message || `Register failed (${res.status})`);
        return;
      }

      // success path: if server returns token, store and redirect
      if (json.token) {
        localStorage.setItem("token", json.token);
        localStorage.setItem("user", JSON.stringify(json.user || {}));
        navigate("/dashboard", { replace: true });
        return;
      }

      // fallback message and redirect to login
      showMsg("Account created. Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 1200);

    } catch (err) {
      console.error("Register error:", err);
      showMsg("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-1">Create Account</h2>
          <p className="text-sm text-slate-500 mb-4">Create your admin account.</p>

          {msg && (
            <div className={`mb-4 p-3 rounded ${msg.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="text-sm font-medium">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-3 border rounded-lg" placeholder="Your full name" required />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                     className="w-full mt-1 p-3 border rounded-lg" placeholder="you@company.com" required />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                     className="w-full mt-1 p-3 border rounded-lg" placeholder="Choose a strong password" required />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg">
                {loading ? "Creating..." : "Create account"}
              </button>
              <button type="button" onClick={() => navigate('/login')} className="px-4 py-3 border rounded-lg">Back to login</button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <button onClick={() => navigate('/login')} className="text-emerald-600 underline">Login</button>
        </div>
      </div>
    </div>
  );
}
