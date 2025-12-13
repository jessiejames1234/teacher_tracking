import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "../../components/Modal.jsx";
import Table from "../../components/Table.jsx";

const API_BASE = "http://localhost:3000";

export default function RoomManagement() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    building_id: "",
    floor_id: "",
    room_name: "",
    latitude: "",
    longitude: "",
    radius: "10",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const columns = [
    { key: "room_id", label: "ID" },
    { key: "room_name", label: "Room Name" },
    { key: "building_name", label: "Building" },
    { key: "floor_number", label: "Floor" },
    { key: "latitude", label: "Latitude" },
    { key: "longitude", label: "Longitude" },
    { key: "radius", label: "Radius (m)" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchBuildings();
    fetchFloors();
    fetchRooms();
  }, [navigate]);

  const fetchBuildings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/buildings`);
      setBuildings(await res.json());
    } catch {
      setError("Failed to load buildings");
    }
  };

  const fetchFloors = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/floors`);
      setFloors(await res.json());
    } catch {
      setError("Failed to load floors");
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      setRooms(await res.json());
    } catch {
      setError("Failed to load rooms");
    }
  };

  const openModal = () => {
    const defaultBuilding = buildings[0]?.building_id || "";
    const relatedFloors = floors.filter((f) => f.building_id === defaultBuilding);
    const defaultFloor = relatedFloors[0]?.floor_id || "";

    setForm({
      building_id: defaultBuilding,
      floor_id: defaultFloor,
      room_name: "",
      latitude: "",
      longitude: "",
      radius: "10",
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleBuildingChange = (e) => {
    const building_id = Number(e.target.value);
    const relatedFloors = floors.filter((f) => f.building_id === building_id);

    setForm((prev) => ({
      ...prev,
      building_id,
      floor_id: relatedFloors[0]?.floor_id || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        ...form,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
        radius: form.radius ? Number(form.radius) : null,
      };

      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) setError(data.error || "Failed to create room");
      else {
        fetchRooms();
        closeModal();
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const floorsForBuilding = floors.filter(
    (f) => f.building_id === Number(form.building_id)
  );

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between mb-3">
        <h2 className="mb-0">Room Management</h2>
        <button className="btn btn-success" onClick={openModal}>
          Add New Room
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <Table
        columns={columns}
        data={rooms}
        pageSize={10}
        loading={loading}
        emptyText="No rooms found"
      />

      <Modal
        show={showModal}
        title="Add New Room"
        size="md"
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit}>
          {/* Building */}
          <div className="mb-3">
            <label className="form-label">Building</label>
            <select
              className="form-select"
              name="building_id"
              value={form.building_id}
              onChange={handleBuildingChange}
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

          {/* Floor */}
          <div className="mb-3">
            <label className="form-label">Floor</label>
            <select
              className="form-select"
              name="floor_id"
              value={form.floor_id}
              onChange={handleChange}
              required
            >
              <option value="">Select floor</option>
              {floorsForBuilding.map((f) => (
                <option key={f.floor_id} value={f.floor_id}>
                  {f.floor_number}
                </option>
              ))}
            </select>
          </div>

          {/* Room Name */}
          <div className="mb-3">
            <label className="form-label">Room Name</label>
            <input
              type="text"
              className="form-control"
              name="room_name"
              value={form.room_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Latitude */}
          <div className="mb-3">
            <label className="form-label">Latitude</label>
            <input
              type="number"
              className="form-control"
              step="0.000001"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
            />
          </div>

          {/* Longitude */}
          <div className="mb-3">
            <label className="form-label">Longitude</label>
            <input
              type="number"
              className="form-control"
              step="0.000001"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
            />
          </div>

          {/* Radius */}
          <div className="mb-3">
            <label className="form-label">Radius (meters)</label>
            <input
              type="number"
              className="form-control"
              name="radius"
              value={form.radius}
              onChange={handleChange}
            />
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" type="button" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn btn-success" type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Room"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
