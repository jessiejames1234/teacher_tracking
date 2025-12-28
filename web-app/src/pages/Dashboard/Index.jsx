import { useState, useEffect, useMemo } from 'react';
import 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) || `http://${window.location.hostname}:3000`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/dashboard/full`);
      if (!res.ok) throw new Error(`Server ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load dashboard full data', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const summary = data?.summary ?? null;

  const attendanceChart = useMemo(() => {
    const at = summary?.attendance_today ?? { present: 0, absent: 0, late: 0 };
    return {
      labels: ['Present', 'Absent', 'Late'],
      datasets: [{
        label: 'Today',
        data: [at.present, at.absent, at.late],
        backgroundColor: ['#198754', '#dc3545', '#ffc107'],
      }]
    };
  }, [summary]);

  const entityChart = useMemo(() => {
    const s = summary ?? {};
    return {
      labels: ['Departments', 'Programs', 'Subjects', 'Rooms'],
      datasets: [{
        label: 'Counts',
        data: [s.total_departments || 0, s.total_programs || 0, s.total_subjects || 0, s.total_rooms || 0],
        backgroundColor: ['#0d6efd', '#6f42c1', '#20c997', '#fd7e14'],
      }]
    };
  }, [summary]);

  if (loading) return <div className="container mt-4">Loading dashboard...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;
  if (!data || !summary) return null;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Dashboard</h3>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => load()}>Refresh</button>
        </div>
      </div>

      <div className="row gx-3 gy-3">
        {[
          { label: 'Departments', value: summary.total_departments },
          { label: 'Programs', value: summary.total_programs },
          { label: 'Sections', value: summary.total_sections },
          { label: 'Semesters', value: summary.total_semesters },
        ].map((c, i) => (
          <div key={`card-top-${i}`} className="col-sm-6 col-md-3">
            <div className="card p-3 h-100">
              <div className="h6 text-muted">{c.label}</div>
              <div className="display-6">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row gx-3 gy-3 mt-2">
        {[
          { label: 'Subjects', value: summary.total_subjects },
          { label: 'Offerings', value: summary.total_offerings },
          { label: 'Rooms', value: summary.total_rooms },
          { label: 'Active Teachers', value: summary.total_teachers },
        ].map((c, i) => (
          <div key={`card-mid-${i}`} className="col-sm-6 col-md-3">
            <div className="card p-3 h-100">
              <div className="h6 text-muted">{c.label}</div>
              <div className="display-6">{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mt-4">
        <div className="col-lg-6 mb-3">
          <div className="card p-3 h-100">
            <h5>Attendance Today</h5>
            <Bar data={attendanceChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="col-lg-6 mb-3">
          <div className="card p-3 h-100">
            <h5>Entity Counts</h5>
            <Doughnut data={entityChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-12">
          <div className="card p-3">
            <h5>Recent Attendance</h5>
            <div className="table-responsive">
              <table className="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Room</th>
                    <th>Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(data.recent_attendance) && data.recent_attendance.map((r) => (
                    <tr key={`att-${r.attendance_id}`}>
                      <td>{r.date}</td>
                      <td>{r.last_name}, {r.first_name}</td>
                      <td>{r.subject_code} {r.subject_name}</td>
                      <td>{r.room_name}</td>
                      <td>{r.flag_in_name || r.flag_check_id || r.flag_out_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
