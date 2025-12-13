import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function FloorManagement() {
  const navigate = useNavigate();
  const [floors, setFloors] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    building_id: "",
    floor_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // TABLE COLUMNS for Table.jsx
  const columns = [
    { key: "floor_id", label: "ID" },
    { key: "building_name", label: "Building" },
    { key: "floor_number", label: "Floor Number" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchBuildings();
    fetchFloors();
  }, [navigate]);

  const fetchBuildings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/buildings`);
      setBuildings(await res.json());
    } catch (err) {
      setError("Failed to load buildings");
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/floors`);
      setFloors(await res.json());
    } catch (err) {
      setError("Failed to load floors");
    }
  };

  const openModal = () => {
    setForm({
      building_id: buildings[0]?.building_id || "",
      floor_number: "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/floors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to create floor");
      else {
        fetchFloors();
        closeModal();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <h2 className="mb-0">Floor Management</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add New Floor
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table
        columns={columns}
        data={floors}
        pageSize={10}
        loading={loading}
        emptyText="No floors found"
      />

      <Modal
        show={showModal}
        title="Add New Floor"
        size="md"
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          {/* Building */}
          <div className="mb-3">
            <label className="form-label">Building</label>
            <select
              name="building_id"
              value={form.building_id}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Select building</option>
              {buildings.map((b) => (
                <option key={b.building_id} value={b.building_id}>
                  {b.building_name}
                </option>
              ))}
            </select>
          </div>

          {/* Floor Number */}
          <div className="mb-3">
            <label className="form-label">Floor Number</label>
            <input
              type="number"
              name="floor_number"
              className="form-control"
              value={form.floor_number}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn btn-success" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Floor"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
