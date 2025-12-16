// src/pages/Program/Index.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ program_name: "", dept_id: "", head_id: "" });

  useEffect(() => { loadAll(); }, []);
  const loadAll = async () => {
    try {
      setLoading(true); setError("");
      const [pRes, dRes] = await Promise.all([fetch(`${API_BASE}/api/programs`), fetch(`${API_BASE}/api/departments`)]);
      const pData = await pRes.json(); const dData = await dRes.json();
      setPrograms(Array.isArray(pData)?pData:[]);
      setDepartments(Array.isArray(dData)?dData:[]);
    } catch (err) {
      console.error(err); setError("Failed to load programs");
    } finally { setLoading(false); }
  };

  const openModal = () => { setForm({ program_name: "", dept_id: departments[0]?.dept_id || "", head_id: "" }); setError(""); setShowModal(true); };
  const closeModal = () => setShowModal(false);
  const handleChange = (e) => { const { name, value } = e.target; setForm(p=>({...p,[name]:value})); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/programs`,{ method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)});
      const data = await res.json(); if(!res.ok) setError(data.error||'Failed to create program'); else { await loadAll(); closeModal(); }
    } catch(err){ console.error(err); setError('Network error'); } finally{ setLoading(false); }
  };

  const columns = [ { key: 'program_id', label: 'ID' }, { key: 'program_name', label: 'Program' }, { key:'dept_name', label:'Department' } ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Program Management</h2>
        <button className="btn btn-success" onClick={openModal}>Add Program</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table columns={columns} data={programs} loading={loading} emptyText="No programs found" />

      <Modal show={showModal} title="Add Program" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Program Name</label>
            <input name="program_name" value={form.program_name} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Department</label>
            <select name="dept_id" value={form.dept_id} onChange={handleChange} className="form-select" required>
              <option value="">Select department</option>
              {departments.map(d=> (<option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Head (user id, optional)</label>
            <input name="head_id" value={form.head_id} onChange={handleChange} className="form-control" />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>{loading? 'Saving...':'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
