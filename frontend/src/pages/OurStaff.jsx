
import React, { useEffect, useState, useRef } from 'react';


function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || null;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function OurStaff({ token }) {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // modal states
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null); // staff item
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef(null);

  // ---------- API helpers ----------
  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/roles`, {
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch roles');
      }
      const data = await res.json();
      setRoles(data.roles || []);
      return data.roles || [];
    } catch (err) {
      console.error('fetchRoles', err);
      setRoles([]);
      return [];
    }
  };

  const fetchStaff = async (search = '', role = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/staff`);
      if (search) url.searchParams.set('search', search);
      if (role) url.searchParams.set('role', role);
      const res = await fetch(url.toString(), {
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server ${res.status}`);
      }
      const data = await res.json();
      setStaff(data.staff || data.data || []);
    } catch (err) {
      console.error('fetchStaff', err);
      setError(err.message || 'Network Error');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchRoles();
      await fetchStaff();
    })();
    
  }, [token]);

  // ---------- search debounce ----------
  const handleSearchChange = (v) => {
    setQuery(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchStaff(v.trim(), roleFilter);
    }, 350);
  };

  // ---------- open add
  const openAdd = async () => {
    await fetchRoles();
    setShowAdd(true);
  };

  // ---------- open edit ----------
  const openEdit = async (item) => {
    await fetchRoles();
    setEditing(item);
  };

  // ---------- delete flow using pretty modal ----------
  const promptDelete = (item) => {
    setDeleteTarget({ id: item._id || item.id, name: item.name || item.email || 'this record' });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/staff/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Server ${res.status}`);
      }
      setStaff(prev => prev.filter(s => (s._id || s.id) !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('delete staff', err);
      alert('Failed to delete: ' + (err.message || 'server error'));
    } finally {
      setDeleting(false);
    }
  };

  // ---------- handle filter button ----------
  const handleFilterClick = () => {
    fetchStaff(query.trim(), roleFilter);
  };

  // ---------- Add/Update handlers 
  const handleCreated = (newStaff) => {
    if (!newStaff) {
      fetchStaff();
      setShowAdd(false);
      return;
    }
    const item = {
      _id: newStaff._id || newStaff.id,
      name: newStaff.name,
      email: newStaff.email,
      phone: newStaff.phone,
      joiningDate: newStaff.joiningDate || newStaff.createdAt,
      role: newStaff.role || null,
      avatar: newStaff.avatar || newStaff.avatarUrl || ''
    };
    setStaff(prev => [item, ...prev]);
    setShowAdd(false);
  };

  
  const handleUpdated = (updatedStaff) => {
  
    if (!updatedStaff) {
      fetchStaff();
      setEditing(null);
      return;
    }
    
    setStaff(prev => prev.map(s => {
      if ((s._id || s.id) === (updatedStaff._id || updatedStaff.id)) {
        return {
          ...s,
          name: updatedStaff.name || s.name,
          email: updatedStaff.email || s.email,
          phone: updatedStaff.phone || s.phone,
          joiningDate: updatedStaff.joiningDate || s.joiningDate,
          role: updatedStaff.role || s.role,
          avatar: updatedStaff.avatar || s.avatar
        };
      }
      return s;
    }));
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">All Staff</h2>
        <button onClick={openAdd} className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow">+ Add Staff</button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="flex gap-3 mb-4">
          <input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name/email/phone"
            className="flex-1 p-2 border rounded"
          />

          <select className="p-2 border rounded" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>

          <button onClick={handleFilterClick} className="bg-green-600 text-white px-3 py-2 rounded">Filter</button>
          <button onClick={() => { setQuery(''); setRoleFilter(''); fetchStaff(); }} className="px-3 py-2 border rounded">Reset</button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500">Loading staff...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left">NAME</th>
                  <th className="p-3 text-left">EMAIL</th>
                  <th className="p-3 text-left">CONTACT</th>
                  <th className="p-3 text-left">JOINING DATE</th>
                  <th className="p-3 text-left">ROLE</th>
                  <th className="p-3 text-left">STATUS</th>
                  <th className="p-3 text-left">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s._id || s.id} className="border-b">
                    <td className="p-3 flex items-center gap-3">
                      <img className="w-8 h-8 rounded-full" src={s.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || 'User')}`} alt="" />
                      <span>{s.name}</span>
                    </td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3">{s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : '-'}</td>
                    <td className="p-3 font-semibold">
                      {s.role?.name || "-"}
                    </td>

                    <td className="p-3"><span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs">Active</span></td>
                    <td className="p-3">
                      <button title="View" className="p-2 mr-2" onClick={() => alert(JSON.stringify(s, null, 2))}>🔍</button>
                      <button title="Edit" className="p-2 mr-2" onClick={() => openEdit(s)}>✏️</button>
                      <button title="Delete" className="p-2" onClick={() => promptDelete(s)}>🗑️</button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No staff yet. Click “Add Staff” to create one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddStaffModalInline
          roles={roles}
          token={token}
          onClose={() => setShowAdd(false)}
          onCreated={handleCreated}
        />
      )}

      {editing && <EditStaffModal staffItem={editing} roles={roles} token={getToken()} onClose={() => setEditing(null)} onSaved={handleUpdated} />}

      {deleteTarget && (
        <DeleteConfirmInline
          open={!!deleteTarget}
          name={deleteTarget.name}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

/* ============================
   Inline Add / Edit / Delete modals
   These are self-contained so the page works without importing other components.
   ============================ */

// Add staff modal (simple, sends FormData multipart POST /api/staff)
function AddStaffModalInline({ roles = [], token, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', joiningDate: '', roleId: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('phone', form.phone);
      if (form.joiningDate) fd.append('joiningDate', form.joiningDate);
      if (form.roleId) fd.append('roleId', form.roleId);
      if (file) fd.append('avatar', file);

      const res = await fetch(`${API_BASE}/staff`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: fd
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || `Server ${res.status}`);
      onCreated && onCreated(data.staff || data);
    } catch (err) {
      console.error('Add staff error', err);
      alert('Failed to add staff: ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form className="ml-auto w-full md:w-2/5 bg-white p-6 overflow-auto h-full rounded-l-2xl shadow-2xl z-50" onSubmit={submit} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Add Staff</h3>
            <p className="text-sm text-slate-500">Add staff information from here</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full">✕</button>
        </div>

        <div className="grid gap-3">
          <label className="text-sm">Staff Image</label>
          <div className="border-2 border-dashed border-slate-200 p-4 rounded">
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0])} />
            <p className="text-xs text-slate-400 mt-2">Drag or choose images (.jpeg, .webp, .png)</p>
          </div>

          <input className="p-3 border rounded" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input className="p-3 border rounded" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input className="p-3 border rounded" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <input className="p-3 border rounded" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <input type="date" className="p-3 border rounded" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} />
          <select className="p-3 border rounded" value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })} required>
            <option value="">Select role</option>
            {roles.map(r => <option key={r._id} value={r._1d || r._id}>{r.name}</option>)}
          </select>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 p-3 border rounded">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 p-3 bg-emerald-600 text-white rounded">{loading ? 'Adding...' : 'Add Staff'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Edit staff modal (PUT /api/staff/:id with FormData)
// Important: onSaved(null) will trigger parent to re-fetch list
function EditStaffModal({ staffItem, roles = [], token, onClose, onSaved }) {
  const [name, setName] = useState(staffItem.name || '');
  const [email, setEmail] = useState(staffItem.email || '');
  const [phone, setPhone] = useState(staffItem.phone || '');
  const [joiningDate, setJoiningDate] = useState(staffItem.joiningDate ? (staffItem.joiningDate.split && staffItem.joiningDate.split('T')[0]) || '' : '');
  const [roleId, setRoleId] = useState(staffItem.role?._id || (staffItem.role && staffItem.role.id) || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(staffItem.name || '');
    setEmail(staffItem.email || '');
    setPhone(staffItem.phone || '');
    setJoiningDate(staffItem.joiningDate ? (staffItem.joiningDate.split && staffItem.joiningDate.split('T')[0]) || '' : '');
    setRoleId(staffItem.role?._id || (staffItem.role && staffItem.role.id) || '');
    setAvatarFile(null);
  }, [staffItem]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setAvatarFile(f);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('joiningDate', joiningDate);
      if (roleId) fd.append('roleId', roleId);
      if (avatarFile) fd.append('avatar', avatarFile);

      const headers = {};
      const tk = token || getToken();
      if (tk) headers['Authorization'] = 'Bearer ' + tk;

      const res = await fetch(`${API_BASE}/staff/${staffItem._id || staffItem.id}`, {
        method: 'PUT',
        headers, // do NOT set content-type for FormData
        body: fd
      });

      // Always re-fetch list after success to show canonical server data
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.message || 'Update failed');

      // Instead of trying to trust the PUT response structure, signal parent to re-fetch
      onSaved && onSaved(null);  // <= THIS TRIGGERS fetchStaff() in parent
      onClose && onClose();
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="ml-auto w-full md:w-2/5 bg-white p-6 rounded-l-2xl shadow-2xl z-50">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">Edit Staff</h3>
            <p className="text-sm text-slate-500">Edit staff details</p>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <label>Avatar (optional)</label>
          <div className="border-2 border-dashed p-3 rounded">
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="p-3 border rounded" />
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="p-3 border rounded" />
          <input type="date" value={joiningDate} onChange={e => setJoiningDate(e.target.value)} className="p-3 border rounded" />

          <select value={roleId} onChange={e => setRoleId(e.target.value)} className="p-3 border rounded">
            <option value="">Select role</option>
            {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 p-3 border rounded">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 p-3 bg-emerald-600 text-white rounded">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete confirm modal inline
function DeleteConfirmInline({ open, name, loading, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-[92%] max-w-xl p-6 z-60">
        <button onClick={onCancel} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full p-1">✕</button>

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7L5 7M10 11v6m4-6v6M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">Are You Sure! Want to Delete ?</h3>
          <p className="text-sm text-slate-500 text-center">Do you really want to delete {name || 'this record'}? You can't view this in your list anymore if you delete!</p>

          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} className="flex-1 py-2 border rounded-md bg-white text-slate-700 hover:bg-slate-50">No, Keep It</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
              {loading ? 'Deleting...' : 'Yes, Delete It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
