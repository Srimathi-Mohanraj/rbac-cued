import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const showMsg = (text, type = 'error') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 6000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    if (!email) {
      showMsg('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        showMsg(json.message || `Request failed (${res.status})`);
        return;
      }

      showMsg(json.message || 'If the account exists, a reset link was sent to the email.', 'success');
      // optional: navigate to login after short delay
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.error('Forgot password error:', err);
      showMsg('Server error — please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-1">Forgot Password</h2>
          <p className="text-sm text-slate-500 mb-4">Enter your email and we’ll send a reset link.</p>

          {msg && (
            <div className={`mb-4 p-3 rounded ${msg.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full mt-1 p-3 border rounded-lg" placeholder="you@company.com" required />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => navigate('/login')} className="px-4 py-3 border rounded-lg">Back to login</button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          Remembered your password? <button onClick={() => navigate('/login')} className="text-emerald-600 underline">Login</button>
        </div>
      </div>
    </div>
  );
}
