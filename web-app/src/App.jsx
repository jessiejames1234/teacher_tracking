// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import UserManagement from "./pages/user/Index.jsx";
import ClassScheduleManagement from "./pages/ClassSchedule/Index.jsx";
import BuildingManagement from "./pages/Building/Index.jsx";
import FloorManagement from "./pages/Floor/Index.jsx";
import RoomManagement from "./pages/Room/Index.jsx";
import AttendanceManagement from "./pages/Attedance/Index.jsx";

import RoleCheck from "./Viewpoint/rolecheck.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout + nav */}
        <Route element={<RoleCheck />}>
          {/* Default after login could be /users */}
          <Route path="/" element={<UserManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/class-schedules" element={<ClassScheduleManagement />} />
          <Route path="/buildings" element={<BuildingManagement />} />
          <Route path="/floors" element={<FloorManagement />} />
          <Route path="/rooms" element={<RoomManagement />} />
          <Route path="/attendance" element={<AttendanceManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
