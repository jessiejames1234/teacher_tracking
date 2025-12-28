// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import UserManagement from "./pages/user/Index.jsx";
import ClassScheduleManagement from "./pages/ClassSchedule/Index.jsx";
import BuildingManagement from "./pages/Building/Index.jsx";
import FloorManagement from "./pages/Floor/Index.jsx";
import RoomManagement from "./pages/Room/Index.jsx";
import AttendanceManagement from "./pages/Attedance/Index.jsx";
import DepartmentManagement from "./pages/Department/Index.jsx";
import ProgramManagement from "./pages/Program/Index.jsx";
import SectionManagement from "./pages/Section/Index.jsx";
import SemesterManagement from "./pages/Semester/Index.jsx";
import SubjectManagement from "./pages/Subject/Index.jsx";
import SubjectOfferingManagement from "./pages/SubjectOffering/Index.jsx";
import Dashboard from "./pages/Dashboard/Index.jsx";

import RoleCheck from "./Viewpoint/rolecheck.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with layout + nav */}
        <Route element={<RoleCheck />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Default after login could be /users */}
          <Route path="/" element={<UserManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/class-schedules" element={<ClassScheduleManagement />} />
          <Route path="/departments" element={<DepartmentManagement />} />
          <Route path="/programs" element={<ProgramManagement />} />
          <Route path="/sections" element={<SectionManagement />} />
          <Route path="/semesters" element={<SemesterManagement />} />
          <Route path="/subjects" element={<SubjectManagement />} />
          <Route path="/subject-offerings" element={<SubjectOfferingManagement />} />
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
