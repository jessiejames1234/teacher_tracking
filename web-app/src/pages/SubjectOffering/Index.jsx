// src/pages/SubjectOffering/Index.jsx
import { useEffect, useState } from "react";
import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function SubjectOfferingManagement(){
  const [offerings,setOfferings]=useState([]);
  const [semesters,setSemesters]=useState([]);
  const [sections,setSections]=useState([]);
  const [subjects,setSubjects]=useState([]);
  const [teachers,setTeachers]=useState([]);
  const [showModal,setShowModal]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]='';

  const [form,setForm]=useState({ semester_id:'', section_id:'', subject_id:'', user_id:'' });

  useEffect(()=>{ loadAll(); }, []);
  const loadAll = async ()=>{ try{ setLoading(true); const [oRes, semRes, secRes, subjRes, tRes] = await Promise.all([fetch(`${API_BASE}/api/subject-offerings`), fetch(`${API_BASE}/api/semesters`), fetch(`${API_BASE}/api/sections`), fetch(`${API_BASE}/api/subjects`), fetch(`${API_BASE}/api/teachers`)]); const oData=await oRes.json(); const semData=await semRes.json(); const secData=await secRes.json(); const subjData=await subjRes.json(); const tData=await tRes.json(); setOfferings(Array.isArray(oData)?oData:[]); setSemesters(Array.isArray(semData)?semData:[]); setSections(Array.isArray(secData)?secData:[]); setSubjects(Array.isArray(subjData)?subjData:[]); setTeachers(Array.isArray(tData)?tData:[]);}catch(err){console.error(err); setError('Failed to load offerings');}finally{setLoading(false);} };

  const openModal = ()=>{ setForm({ semester_id: semesters[0]?.semester_id || '', section_id: sections[0]?.section_id || '', subject_id: subjects[0]?.subject_id || '', user_id: '' }); setError(''); setShowModal(true); };
  const closeModal = ()=> setShowModal(false);
  const handleChange = (e)=>{ const {name,value}=e.target; setForm(p=>({...p,[name]:value})); };

  const handleSubmit = async (e)=>{ e.preventDefault(); setLoading(true); setError(''); try{ const res = await fetch(`${API_BASE}/api/subject-offerings`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form)}); const data=await res.json(); if(!res.ok) setError(data.error||'Failed to create offering'); else { await loadAll(); closeModal(); } }catch(err){console.error(err); setError('Network error'); }finally{setLoading(false);} };

  const columns = [ { key:'offering_id', label:'ID' }, { key:'term', label:'Term' }, { key:'section_name', label:'Section' }, { key:'subject_code', label:'Subject Code' }, { key:'subject_name', label:'Subject' }, { key:'user_id', label:'Teacher ID' } ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Subject Offerings</h2>
        <button className="btn btn-success" onClick={openModal}>Add Offering</button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table columns={columns} data={offerings} loading={loading} emptyText="No offerings found" />

      <Modal show={showModal} title="Add Subject Offering" onClose={closeModal}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Semester</label>
            <select name="semester_id" value={form.semester_id} onChange={handleChange} className="form-select" required>
              <option value="">Select semester</option>
              {semesters.map(s=> (<option key={s.semester_id} value={s.semester_id}>{s.term} ({s.start_date} - {s.end_date})</option>))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Section</label>
            <select name="section_id" value={form.section_id} onChange={handleChange} className="form-select" required>
              <option value="">Select section</option>
              {sections.map(s=> (<option key={s.section_id} value={s.section_id}>{s.section_name}</option>))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Subject</label>
            <select name="subject_id" value={form.subject_id} onChange={handleChange} className="form-select" required>
              <option value="">Select subject</option>
              {subjects.map(s=> (<option key={s.subject_id} value={s.subject_id}>{s.subject_code} - {s.subject_name}</option>))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Teacher</label>
            <select name="user_id" value={form.user_id} onChange={handleChange} className="form-select">
              <option value="">(unassigned)</option>
              {teachers.map(t=> (<option key={t.user_id} value={t.user_id}>{t.last_name}, {t.first_name}</option>))}
            </select>
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
