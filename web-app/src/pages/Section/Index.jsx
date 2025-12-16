// src/pages/Section/Index.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function SectionManagement() {
  const [sections, setSections] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ program_id: "", section_name: "" });

  useEffect(()=>{ loadAll(); }, []);
  const loadAll = async ()=>{
    try{ setLoading(true); setError(""); const [sRes,pRes]=await Promise.all([fetch(`${API_BASE}/api/sections`), fetch(`${API_BASE}/api/programs`)]); const sData=await sRes.json(); const pData=await pRes.json(); setSections(Array.isArray(sData)?sData:[]); setPrograms(Array.isArray(pData)?pData:[]);}catch(err){console.error(err); setError('Failed to load sections');}finally{setLoading(false);} };

  const openModal = ()=>{ setForm({ program_id: programs[0]?.program_id || '', section_name: ''}); setError(''); setShowModal(true);} ;
  const closeModal = ()=> setShowModal(false);
  const handleChange = (e)=>{ const {name,value}=e.target; setForm(p=>({...p,[name]:value})); };

  const handleSubmit = async (e)=>{ e.preventDefault(); setLoading(true); setError(''); try{ const res = await fetch(`${API_BASE}/api/sections`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)}); const data = await res.json(); if(!res.ok) setError(data.error||'Failed to create section'); else { await loadAll(); closeModal(); } }catch(err){console.error(err); setError('Network error'); }finally{setLoading(false);} };

  const columns = [ { key:'section_id', label:'ID' }, { key:'section_name', label:'Section' }, { key:'program_name', label:'Program' } ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Section Management</h2>
        <button className="btn btn-success" onClick={openModal}>Add Section</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table columns={columns} data={sections} loading={loading} emptyText="No sections found" />

      <Modal show={showModal} title="Add Section" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Program</label>
            <select name="program_id" value={form.program_id} onChange={handleChange} className="form-select" required>
              <option value="">Select program</option>
              {programs.map(p=> (<option key={p.program_id} value={p.program_id}>{p.program_name}</option>))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Section Name</label>
            <input name="section_name" value={form.section_name} onChange={handleChange} className="form-control" required />
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
