// src/pages/ClassSchedule/Index.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

const DAY_OPTIONS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export default function ClassScheduleManagement() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [offerings, setOfferings] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    room_id: "",
    offering_id: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
  });

  // Columns for shared Table.jsx – same info as your old table
  const columns = [
    { key: "schedule_id", label: "ID" },
    { key: "day_of_week", label: "Day" },
    {
      key: "time",
      label: "Time",
      render: (s) =>
        `${s.start_time?.slice(0, 5) || ""} - ${s.end_time?.slice(0, 5) || ""}`,
    },
    { key: "room_name", label: "Room" },
    {
      key: "subject",
      label: "Subject / Section",
      render: (s) =>
        `${s.subject_code} - ${s.subject_name} (${s.section_name})`,
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    loadAll();
  }, [navigate]);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");

      const [sRes, rRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/class-schedules`),
        fetch(`${API_BASE}/api/rooms`),
        fetch(`${API_BASE}/api/offerings`),
      ]);

      const sData = await sRes.json();
      const rData = await rRes.json();
      const oData = await oRes.json();

      setSchedules(Array.isArray(sData) ? sData : []);
      setRooms(Array.isArray(rData) ? rData : []);
      setOfferings(Array.isArray(oData) ? oData : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load schedules data");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm({
      room_id: rooms[0]?.room_id || "",
      offering_id: offerings[0]?.offering_id || "",
      day_of_week: "monday",
      start_time: "",
      end_time: "",
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
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/class-schedules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create class schedule");
      } else {
        await loadAll();
        closeModal();
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Class Schedule Management</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add New Schedule
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table
        columns={columns}
        data={schedules}
        pageSize={10}
        loading={loading}
        emptyText="No schedules found"
      />

      <Modal
        show={showModal}
        title="Add New Class Schedule"
        size="md"
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Room</label>
            <select
              name="room_id"
              value={form.room_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select room</option>
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Subject Offering</label>
            <select
              name="offering_id"
              value={form.offering_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select offering</option>
              {offerings.map((o) => (
                <option key={o.offering_id} value={o.offering_id}>
                  {/* adjust these fields if your API returns different names */}
                  {o.subject_code} - {o.section_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Day of Week</label>
            <select
              name="day_of_week"
              value={form.day_of_week}
              onChange={handleChange}
              className="form-select"
              required
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={form.start_time}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">End Time</label>
            <input
              type="time"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              className="form-control"
              required
            />
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
              {loading ? "Saving..." : "Save Schedule"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
