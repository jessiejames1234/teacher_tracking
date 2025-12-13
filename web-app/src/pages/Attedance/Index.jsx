// src/pages/Attendance/Index.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Table from "../../components/Table.jsx";
import Modal from "../../components/Modal.jsx";

const API_BASE = "http://localhost:3000";

export default function AttendanceManagement() {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [ setError] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ======== TABLE COLUMNS ========
  const columns = [
    { key: "date", label: "Date" },

    {
      key: "teacher",
      label: "Teacher",
      render: (r) => `${r.last_name}, ${r.first_name}`,
    },

    {
      key: "subject",
      label: "Subject / Section",
      render: (r) => `${r.subject_code} - ${r.section_name}`,
    },

    { key: "room_name", label: "Room" },

    {
      key: "class_time",
      label: "Class Time",
      render: (r) =>
        `${formatTime(r.start_time)} - ${formatTime(r.end_time)}`,
    },

    {
      key: "time_in",
      label: "Time In",
      render: (r) => renderTimeWithFlag(r.time_in, r.flag_in_id),
    },

    {
      key: "time_check",
      label: "Time Check",
      render: (r) => renderTimeWithFlag(r.time_check, r.flag_check_id),
    },

    {
      key: "time_out",
      label: "Time Out",
      render: (r) => renderTimeWithFlag(r.time_out, r.flag_out_id),
    },

    {
      key: "action",
      label: "Action",
      render: (r) => (
        <button
          className="btn btn-success btn-sm"
          onClick={() => openViewModal(r)}
        >
          View
        </button>
      ),
    },
  ];

  // ==========================================
  // INIT
  // ==========================================
  useEffect(() => {
    if (!localStorage.getItem("token")) return navigate("/login");
    init();
  }, [navigate]);

  const init = async () => {
    try {
      setLoading(true);

      // generate this week's attendance
      await fetch(`${API_BASE}/api/attendance/generate-week`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      await fetchTeachers();
      await fetchRecords();
    } catch (err) {
      setError("Failed to initialize attendance");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCHERS
  // ==========================================
  const fetchTeachers = async () => {
    const res = await fetch(`${API_BASE}/api/teachers`);
    setTeachers(await res.json());
  };

  const buildUrl = (date, status, teacherId) => {
    let url = `${API_BASE}/api/attendance`;
    const params = [];
    if (date) params.push(`date=${date}`);
    if (status) params.push(`status=${encodeURIComponent(status)}`);
    if (teacherId) params.push(`teacher_id=${teacherId}`);
    if (params.length) url += "?" + params.join("&");
    return url;
  };

  const fetchRecords = async (date, status, teacherId) => {
    const url = buildUrl(date, status, teacherId);
    const res = await fetch(url);
    const data = await res.json();
    setRecords(Array.isArray(data) ? data : []);
  };

  const handleApplyFilter = () => {
    setLoading(true);
    fetchRecords(filterDate, filterStatus, filterTeacher)
      .catch(() => setError("Failed to load attendance"))
      .finally(() => setLoading(false));
  };

  const handleClearFilter = () => {
    setFilterDate("");
    setFilterStatus("");
    setFilterTeacher("");
    setLoading(true);

    fetchRecords()
      .catch(() => setError("Failed to load attendance"))
      .finally(() => setLoading(false));
  };

  // ==========================================
  // FORMATTING
  // ==========================================
  const formatTime = (value) => {
    if (!value) return "";
    const d = new Date(`1970-01-01T${value}`);
    if (isNaN(d)) return "";
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const am = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return `${h}:${m}${am}`;
  };

const FLAGS = {
  1: "NA",
  2: "present",
  3: "absent",
  4: "excuse",
  5: "late",
};

const renderTimeWithFlag = (time, flag) => {
  if (!flag) return "";

  // Only show actual time when status is "present" and we HAVE a time.
  if (flag === 2 && time) {
    return formatTime(time);
  }

  // For NA, absent, excuse, late → always show the word
  return FLAGS[flag] || "";
};


  // ==========================================
  // MODAL
  // ==========================================
  const openViewModal = (r) => {
    setSelectedRecord(r);
    setShowModal(true);
  };
  const closeViewModal = () => {
    setSelectedRecord(null);
    setShowModal(false);
  };

  return (
    <div className="container py-3">
      <h2>Teacher Attendance Records</h2>

      {/* FILTER BAR */}
      <div className="d-flex flex-wrap gap-3 mb-3">

        {/* Date */}
        <div>
          <label>Date</label>
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="NA">NA</option>
            <option value="present">present</option>
            <option value="absent">absent</option>
            <option value="excuse">excuse</option>
          </select>
        </div>

        {/* Teacher */}
        <div>
          <label>Teacher</label>
          <select
            className="form-select"
            value={filterTeacher}
            onChange={(e) => setFilterTeacher(e.target.value)}
          >
            <option value="">All</option>
            {teachers.map((t) => (
              <option key={t.user_id} value={t.user_id}>
                {t.last_name}, {t.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="d-flex align-items-end gap-2">
          <button className="btn btn-success" onClick={handleApplyFilter}>
            Apply
          </button>
          <button className="btn btn-secondary" onClick={handleClearFilter}>
            Clear
          </button>
        </div>
      </div>

      {/* TABLE */}
      <Table
        columns={columns}
        data={records}
        pageSize={10}
        loading={loading}
        emptyText="No attendance records found"
      />

      {/* VIEW MODAL */}
      <Modal
        show={showModal}
        title="Attendance Details"
        size="md"
        onClose={closeViewModal}
      >
        {selectedRecord && (
          <>
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th>Teacher</th>
                  <td>
                    {selectedRecord.last_name}, {selectedRecord.first_name}
                  </td>
                </tr>

                <tr>
                  <th>Subject</th>
                  <td>
                    {selectedRecord.subject_code} - {selectedRecord.subject_name}
                    ({selectedRecord.section_name})
                  </td>
                </tr>

                <tr>
                  <th>Date</th>
                  <td>{selectedRecord.date}</td>
                </tr>

                <tr>
                  <th>Class Time</th>
                  <td>
                    {formatTime(selectedRecord.start_time)} -{" "}
                    {formatTime(selectedRecord.end_time)}
                  </td>
                </tr>

                <tr>
                  <th>Time In</th>
                  <td>
                    {renderTimeWithFlag(
                      selectedRecord.time_in,
                      selectedRecord.flag_in_id
                    )}
                  </td>
                </tr>

                <tr>
                  <th>Time Check</th>
                  <td>
                    {renderTimeWithFlag(
                      selectedRecord.time_check,
                      selectedRecord.flag_check_id
                    )}
                  </td>
                </tr>

                <tr>
                  <th>Time Out</th>
                  <td>
                    {renderTimeWithFlag(
                      selectedRecord.time_out,
                      selectedRecord.flag_out_id
                    )}
                  </td>
                </tr>

                <tr>
                  <th>Location Logs</th>
                  <td>
                    In: {selectedRecord.latitude_in}, {selectedRecord.longitude_in}
                    <br />
                    Check: {selectedRecord.latitude_check},{" "}
                    {selectedRecord.longitude_check}
                    <br />
                    Out: {selectedRecord.latitude_out},{" "}
                    {selectedRecord.longitude_out}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-end">
              <button className="btn btn-secondary" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
