// src/Viewpoint/rolecheck.jsx
import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

export default function RoleCheck() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Simple auth check: if no token, kick to login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const navItems = [
    { label: "User Management", path: "/users" },
    { label: "Class Schedules", path: "/class-schedules" },
    { label: "Buildings", path: "/buildings" },
    { label: "Floors", path: "/floors" },
    { label: "Rooms", path: "/rooms" },
    { label: "Attendance", path: "/attendance" },
  ];

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("token");
    // remove any stored user info if you add it later
    navigate("/login");
  };

  return (
    <div style={layoutStyle}>
      {/* TOP BAR */}
      <header style={headerStyle}>
        <button
          type="button"
          onClick={toggleSidebar}
          style={burgerButtonStyle}
          aria-label="Toggle navigation"
        >
          <span style={burgerLineStyle} />
          <span style={burgerLineStyle} />
          <span style={burgerLineStyle} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700 }}>3D School — Teacher Attendance</span>
        </div>

        <button type="button" onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </header>

      {/* SIDEBAR */}
      <aside
        style={{
          ...sidebarStyle,
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div style={{ padding: "1rem 1.25rem", fontWeight: 600 }}>
          Navigation
        </div>
        <nav>
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  ...navLinkStyle,
                  ...(active ? navLinkActiveStyle : {}),
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* OVERLAY when sidebar open (for small screens) */}
      {sidebarOpen && (
        <div
          style={overlayStyle}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
  );
}

/* Layout styles */

const layoutStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  position: "relative",
  backgroundColor: "#f5f5f5",
};

const headerStyle = {
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 1rem",
  backgroundColor: "#2ead00",
  color: "#fff",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const burgerButtonStyle = {
  border: "none",
  background: "transparent",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  cursor: "pointer",
};

const burgerLineStyle = {
  width: "20px",
  height: "2px",
  backgroundColor: "#fff",
  borderRadius: "2px",
};

const logoutButtonStyle = {
  border: "1px solid rgba(255,255,255,0.8)",
  background: "transparent",
  color: "#fff",
  padding: "4px 10px",
  borderRadius: "4px",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const sidebarStyle = {
  position: "fixed",
  top: "56px", // under header
  left: 0,
  bottom: 0,
  width: "220px",
  backgroundColor: "#ffffff",
  borderRight: "1px solid #ddd",
  paddingTop: "0.5rem",
  transition: "transform 0.2s ease-out",
  zIndex: 12,
};

const navLinkStyle = {
  display: "block",
  padding: "0.5rem 1.25rem",
  color: "#333",
  textDecoration: "none",
  fontSize: "0.95rem",
};

const navLinkActiveStyle = {
  backgroundColor: "#e9f2ff",
  fontWeight: 600,
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.25)",
  zIndex: 11,
};

const mainStyle = {
  padding: "1rem",
  marginTop: "0.5rem",
};
