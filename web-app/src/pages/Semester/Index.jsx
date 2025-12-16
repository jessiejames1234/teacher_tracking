// src/pages/Semester/Index.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function SemesterManagement(){
  const [semesters,setSemesters]=useState([]);
  const [showModal,setShowModal]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [form,setForm]=useState({ session_id:'', term:'', start_date:'', end_date:'' });

  useEffect(()=>{ loadAll(); }, []);
  const loadAll = async ()=>{ try{ setLoading(true); const res = await fetch(`${API_BASE}/api/semesters`); const data = await res.json(); setSemesters(Array.isArray(data)?data:[]);}catch(err){console.error(err); setError('Failed to load semesters');}finally{setLoading(false);} };

  const openModal = ()=>{ setForm({ session_id:'', term:'', start_date:'', end_date:''}); setError(''); setShowModal(true); };
  const closeModal = ()=> setShowModal(false);
  const handleChange = (e)=>{ const {name,value}=e.target; setForm(p=>({...p,[name]:value})); };

  const handleSubmit = async (e)=>{ e.preventDefault(); setLoading(true); setError(''); try{ const res = await fetch(`${API_BASE}/api/semesters`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)}); const data = await res.json(); if(!res.ok) setError(data.error||'Failed to create semester'); else { await loadAll(); closeModal(); } }catch(err){console.error(err); setError('Network error'); }finally{setLoading(false);} };

  const columns = [ { key:'semester_id', label:'ID' }, { key:'term', label:'Term' }, { key:'start_date', label:'Start' }, { key:'end_date', label:'End' } ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Semester Management</h2>
        <button className="btn btn-success" onClick={openModal}>Add Semester</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table columns={columns} data={semesters} loading={loading} emptyText="No semesters found" />

      <Modal show={showModal} title="Add Semester" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Term</label>
            <input name="term" value={form.term} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Start Date</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">End Date</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} className="form-control" required />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>{loading?'Saving...':'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
