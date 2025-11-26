
import React, { useState } from "react";

const RAW_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API_BASE = RAW_BASE.replace(/\/+$/, "") + "/api";

export default function AddStaffModal({ roles = [], token, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    joiningDate: "",
    role: "", 
  });

  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // handle file
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setAvatar(f);
  };

  // simple validation
  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.email.trim()) return "Email is required";
    if (!form.password || form.password.length < 6)
      return "Password must be at least 6 characters";
    if (!form.role) return "Select a role";
    return null;
  };

  // Submit handler
  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("phone", form.phone);
      fd.append("joiningDate", form.joiningDate);
      fd.append("role", form.role); // FIXED: backend expects "role"

      if (avatar) fd.append("avatar", avatar);

      const headers = {};
      if (token) headers["Authorization"] = "Bearer " + token;

      const res = await fetch(`${API_BASE}/staff`, {
        method: "POST",
        headers,
        body: fd,
      });

      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        console.warn("JSON parse failed", e);
      }

      if (!res.ok)
        throw new Error(data?.message || `Failed (${res.status})`);

      const created = data.user || data.staff || data;

      if (onCreated) onCreated(created);

      // reset fields
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        joiningDate: "",
        role: "",
      });
      setAvatar(null);

      onClose && onClose();
    } catch (err) {
      console.error("AddStaff error:", err);
      setError(err.message || "Failed to create staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>

      <form
        onSubmit={submit}
        className="ml-auto w-full md:w-2/5 bg-white p-6 h-full overflow-auto rounded-l-2xl shadow-xl z-50"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-semibold">Add Staff</h2>
            <p className="text-sm text-slate-500">
              Fill the staff details below
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Avatar Upload */}
        <label className="text-sm font-medium">Avatar</label>
        <div className="border border-dashed rounded p-3 mb-3">
          <input type="file" accept="image/*" onChange={handleFile} />
          {avatar && <p className="text-xs mt-1">{avatar.name}</p>}
        </div>

        {/* Inputs */}
        <input
          className="p-3 border rounded w-full mb-3"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="p-3 border rounded w-full mb-3"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="p-3 border rounded w-full mb-3"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <input
          className="p-3 border rounded w-full mb-3"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <label className="text-sm font-medium">Joining Date</label>
        <input
          className="p-3 border rounded w-full mb-3"
          type="date"
          value={form.joiningDate}
          onChange={(e) =>
            setForm({ ...form, joiningDate: e.target.value })
          }
        />

        {/* Role Select */}
        <select
          className="p-3 border rounded w-full mb-3"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="">Select Role</option>
          {roles.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-3 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 p-3 bg-emerald-600 text-white rounded"
          >
            {loading ? "Creating..." : "Add Staff"}
          </button>
        </div>
      </form>
    </div>
  );
}
