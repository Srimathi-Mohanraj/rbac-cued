
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("token");

const request = async (url, method = "GET", body = null) => {
  const token = getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) options.headers["Authorization"] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${url}`, options);

  // If login failed, parse error properly
  if (!res.ok) {
    let err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }

  return res.json();
};

// --------------------------
// API functions
// --------------------------
export const getRoles = () => request("/roles");
export const getStaff = () => request("/staff");
export const addStaff = (data) => request("/staff", "POST", data);
export const updateStaff = (id, data) => request(`/staff/${id}`, "PUT", data);
export const deleteStaff = (id) => request(`/staff/${id}`, "DELETE");

// LOGIN
export const loginUser = (email, password) =>
  request("/auth/login", "POST", { email, password });

// --------------------------
//  DEFAULT EXPORT (REQUIRED)
// --------------------------
const api = {
  getRoles,
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  loginUser,
  getToken,
};

export default api;
