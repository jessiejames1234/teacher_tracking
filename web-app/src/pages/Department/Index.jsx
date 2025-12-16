// src/pages/Department/Index.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ dept_name: "", dean_id: "" });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/departments`);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({ dept_name: "", dean_id: "" });
    setError("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to create department");
      else {
        await loadDepartments();
        closeModal();
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "dept_id", label: "ID" },
    { key: "dept_name", label: "Department" },
    { key: "dean_id", label: "Dean (user_id)" },
  ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Department Management</h2>
        <button className="btn btn-success" onClick={openModal}>Add Department</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table columns={columns} data={departments} loading={loading} emptyText="No departments found" />

      <Modal show={showModal} title="Add Department" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Department Name</label>
            <input name="dept_name" value={form.dept_name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Dean (user id, optional)</label>
            <input name="dean_id" value={form.dean_id} onChange={handleChange} className="form-control" />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
