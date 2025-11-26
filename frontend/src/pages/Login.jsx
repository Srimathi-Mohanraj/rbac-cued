import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api"; 

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const showMsg = (text, type = "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!email || !password) {
      showMsg("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      // use api.post so base URL is centrally managed
      const json = await api.post('/auth/login', { email, password }).catch(err => {
        // if server returned structured response, err.body may exist
        if (err && err.body && err.body.message) throw new Error(err.body.message);
        throw err;
      });

      // success
      localStorage.setItem("token", json.token);
      localStorage.setItem("user", JSON.stringify(json.user || {}));

      onLogin && onLogin({ token: json.token, user: json.user });

      navigate('/dashboard', {
        replace: true,
        state: { toast: { id: 'login-success', message: 'Login Success!', type: 'success', duration: 3000 } }
      });

    } catch (err) {
      console.error("Login error:", err);
      showMsg(err.message || "Server error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 p-6">
      <div className="w-full max-w-md mt-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-2">Admin Login</h2>
          <p className="text-sm text-gray-500 mb-6">Login to continue to your dashboard.</p>

          {msg && (
            <div className={`mb-4 p-3 text-sm rounded ${msg.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input type="email" className="w-full mt-1 p-3 border rounded-lg" placeholder="admin@example.com"
                     value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="w-full mt-1 p-3 border rounded-lg" placeholder="Enter password"
                     value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition">
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <Link to="/forgot" className="text-blue-600 hover:underline">Forgot password?</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
