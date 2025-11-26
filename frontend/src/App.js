// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout
import DashboardLayout from './components/DashboardLayout';

// Pages (ensure these files exist in src/pages/)
import DashboardHome from './pages/DashboardHome';
import OurStaff from './pages/OurStaff';
import Catalog from './pages/Catalog';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Settings from './pages/Settings';

// Auth pages (make sure you created these files in src/pages/)
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });

  const handleLogin = ({ token: newToken, user: newUser }) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
    }
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    // Optionally validate token on mount
  }, [token]);

  // Public routes (when not authenticated)
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        {/* redirect any unknown public route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Authenticated app routes inside layout
  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<DashboardHome user={user} />} />
        <Route path="/our-staff" element={<OurStaff token={token} />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
