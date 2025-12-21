// src/pages/user/Index.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

 export default function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    contact_no: "",
    role_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Small kebab (three-dots) menu used in the Actions column
  function KebabMenu({ onEdit, onToggle, onArchive }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      const onDocClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    return (
      <div ref={ref} className="position-relative d-inline-block">
        <button
          type="button"
          className="btn btn-light btn-sm"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          style={{ width: 36, height: 36, padding: 0, borderRadius: 6 }}
        >
          {/* vertical ellipsis */}
          <span style={{ fontSize: 18, lineHeight: '36px' }}>⋮</span>
        </button>

        {open && (
          <div className="card" style={{ position: 'absolute', right: 0, top: '110%', zIndex: 250 }}>
            <div className="list-group list-group-flush">
              <button type="button" className="list-group-item list-group-item-action" onClick={() => { setOpen(false); onEdit(); }}>Edit</button>
              <button type="button" className="list-group-item list-group-item-action" onClick={() => { setOpen(false); onToggle(); }}>Toggle</button>
              <button type="button" className="list-group-item list-group-item-action text-danger" onClick={() => { setOpen(false); onArchive(); }}>Archive</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Columns for Table
  const columns = [
    {
      key: "avatar",
      label: "Image",
      render: (u) => {
        const initials = `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase();
        return (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#19875422",
              color: "#198754",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {initials || "U"}
          </div>
        );
      },
    },
    {
      key: "name",
      label: "Name",
      render: (u) => `${u.first_name} ${u.last_name}`,
    },
    {
      key: "school_id",
      label: "School ID",
      render: (u) => u.school_id || "N/A",
    },
    { key: "email", label: "Email" },
    { key: "contact_no", label: "Contact" },
    { key: "role_name", label: "Role" },
    {
      key: "status",
      label: "Status",
      render: (u) => (
        <span
          className={`badge ${
            u.status === 1 ? "bg-success" : "bg-secondary"
          }`}
        >
          {u.status === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (u) => (
        <KebabMenu onEdit={() => handleEdit(u)} onToggle={() => handleToggleActive(u)} onArchive={() => handleArchive(u)} />
      ),
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchUsers();
    fetchRoles();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/roles`);
      const data = await res.json();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      contact_no: "",
      role_id: roles[0]?.role_id || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user");
      } else {
        await fetchUsers();
        closeModal();
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // Temporary action handlers
  const handleEdit = (user) => {
    console.log("Edit user (temp):", user);
    // later you can open modal pre-filled, etc.
  };

  const handleToggleActive = (user) => {
    console.log("Toggle active (temp):", user);
    // temporary local toggle example
    setUsers((prev) =>
      prev.map((u) =>
        u.user_id === user.user_id
          ? { ...u, status: u.status === 1 ? 0 : 1 }
          : u
      )
    );
  };

  const handleArchive = (user) => {
    console.log("Archive (temp):", user);
    // later you can call an API / update archive flag
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">User Management</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add New User
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {/* Users table with pagination */}
      <Table
        columns={columns}
        data={users}
        pageSize={10}
        loading={loading}
        emptyText="No users found"
      />

      {/* Reusable Modal */}
      <Modal
        show={showModal}
        title="Add New User"
        size="md"
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact No</label>
            <input
              type="text"
              name="contact_no"
              value={form.contact_no}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select role</option>
              {roles.map((r) => (
                <option key={r.role_id} value={r.role_id}>
                  {r.role_name}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
