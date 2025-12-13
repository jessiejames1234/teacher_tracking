// src/pages/Building/Index.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function BuildingManagement() {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    building_name: "",
    location_description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // columns for Table.jsx – same data as your old table
  const columns = [
    { key: "building_id", label: "ID" },
    { key: "building_name", label: "Building Name" },
    { key: "location_description", label: "Location Description" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBuildings();
  }, [navigate]);

  const fetchBuildings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/buildings`);
      const data = await res.json();
      setBuildings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load buildings");
    }
  };

  const openModal = () => {
    setForm({ building_name: "", location_description: "" });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/buildings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create building");
      } else {
        await fetchBuildings();
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
        <h2 className="mb-0">Building Management</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add New Building
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table
        columns={columns}
        data={buildings}
        pageSize={10}
        loading={loading}
        emptyText="No buildings found"
      />

      <Modal
        show={showModal}
        title="Add New Building"
        size="md"
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Building Name</label>
            <input
              type="text"
              name="building_name"
              value={form.building_name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location Description</label>
            <textarea
              name="location_description"
              value={form.location_description}
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
              {loading ? "Saving..." : "Save Building"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
