// src/Viewpoint/rolecheck.jsx
import { useEffect, useState, useRef } from "react";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
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
    { label: "Departments", path: "/departments" },
    { label: "Programs", path: "/programs" },
    { label: "Sections", path: "/sections" },
    { label: "Semesters", path: "/semesters" },
    { label: "Subjects", path: "/subjects" },
    { label: "Subject Offerings", path: "/subject-offerings" },
    { label: "Buildings", path: "/buildings" },
    { label: "Floors", path: "/floors" },
    { label: "Rooms", path: "/rooms" },
    { label: "Attendance", path: "/attendance" },
  ];

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // AUTO-LOGOUT / IDLE DETECTION (SweetAlert2)
  const IDLE_LIMIT_MS = 2 * 60 * 1000; // 2 minutes
  const WARNING_COUNTDOWN_SEC = 120; // seconds for countdown
  const TOTAL_IDLE_MS = IDLE_LIMIT_MS + WARNING_COUNTDOWN_SEC * 1000;

  const idleTimerRef = useRef(null);
  const swalIntervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);

  const clearIdleTimeout = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  };

  // Start the idle timer counting from now (used when user leaves the page)
  const startAwayTimer = () => {
    // clear any existing timer and schedule the idle threshold
    clearIdleTimeout();
    idleTimerRef.current = setTimeout(() => {
      startIdleCountdownSwal();
    }, IDLE_LIMIT_MS);
  };

  // start the SweetAlert countdown. Pass remainingSeconds to resume a partially elapsed countdown.
  const startIdleCountdownSwal = (remainingSeconds = WARNING_COUNTDOWN_SEC) => {
    // avoid opening multiple dialogs
    try { if (Swal.isVisible()) return; } catch { /* ignore */ }
    let remaining = Math.max(0, Math.floor(remainingSeconds));
    const countdownStart = Date.now();

    Swal.fire({
      title: 'Auto logout warning',
      icon: 'warning',
      iconHtml: '!',
      html: `<p style="font-size:0.95rem">You have been idle. You will be automatically logged out in <strong id="swal-count">${remaining}</strong> seconds.</p>`,
      showCancelButton: true,
      confirmButtonText: 'Stay Logged In',
      cancelButtonText: 'Logout Now',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#d33',
      allowOutsideClick: false,
      didOpen: () => {
        const el = Swal.getHtmlContainer().querySelector('#swal-count');
        // keep interval reference so we can clear it from other handlers
        swalIntervalRef.current = setInterval(() => {
          // compute remaining based on elapsed wall-clock time (robust to throttling)
          const elapsed = Math.floor((Date.now() - countdownStart) / 1000);
          const current = Math.max(0, remaining - elapsed);
          if (el) el.textContent = String(current);
          if (current <= 0) {
            clearInterval(swalIntervalRef.current);
            swalIntervalRef.current = null;
            // auto-logout
            try { Swal.close(); } catch { /* ignore */ }
            handleLogout();
          }
        }, 1000);
      },
    }).then((result) => {
      // User clicked Stay Logged In (confirm) -> reset timers
      if (swalIntervalRef.current) {
        clearInterval(swalIntervalRef.current);
        swalIntervalRef.current = null;
      }

      if (result.isConfirmed) {
        resetIdleTimer();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Logout Now clicked
        handleLogout();
      }
    });
  };

  // When the user returns to the page (focus or visibility visible), determine whether
  // we should logout immediately, resume the countdown with reduced remaining time,
  // or simply reset the idle timers.
  const handleReturn = () => {
    const diff = Date.now() - lastActivityRef.current;
    if (diff >= TOTAL_IDLE_MS) {
      // elapsed past full idle + countdown → ensure logout
      handleLogout();
      return;
    }

    if (diff >= IDLE_LIMIT_MS) {
      // we're in the warning window — compute remaining seconds
      const elapsedSinceWarningMs = diff - IDLE_LIMIT_MS;
      const remainingSec = Math.max(0, WARNING_COUNTDOWN_SEC - Math.floor(elapsedSinceWarningMs / 1000));
      startIdleCountdownSwal(remainingSec);
      return;
    }

    // Returned before idle threshold — reset normally
    resetIdleTimer();
  };

  const resetIdleTimer = () => {
    // update last activity timestamp and clear timeouts/alerts
    lastActivityRef.current = Date.now();
    clearIdleTimeout();
    if (swalIntervalRef.current) {
      clearInterval(swalIntervalRef.current);
      swalIntervalRef.current = null;
    }
    // If SweetAlert is visible, close it immediately on activity
    try {
      if (Swal.isVisible()) Swal.close();
    } catch {
      // ignore
    }

    // re-arm the timeout based on lastActivity
    idleTimerRef.current = setTimeout(() => {
      startIdleCountdownSwal();
    }, IDLE_LIMIT_MS);
  };

  useEffect(() => {
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "click"];
    const onActivity = () => resetIdleTimer();
    events.forEach((ev) => window.addEventListener(ev, onActivity));

    // Detect tab visibility changes so we can react when user switches tabs
    const onVisibilityChange = () => {
      if (document.hidden) {
        // start away timer when user leaves the tab/window
        startAwayTimer();
      } else {
        // user returned to tab — determine if logout/resume/reset is required
        handleReturn();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Also handle window blur (user switched window)
    const onBlur = () => {
      // When user blurs the window (switches away), start the away timer
      startAwayTimer();
    };
    const onFocus = () => {
      // When user focuses/returns, evaluate whether to logout or resume countdown
      handleReturn();
    };
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    // Periodic checker to handle situations where timers are throttled
    checkIntervalRef.current = setInterval(() => {
      const diff = Date.now() - lastActivityRef.current;
      if (diff > IDLE_LIMIT_MS) {
        startIdleCountdownSwal();
      }
    }, 1000);

    resetIdleTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      clearIdleTimeout();
      if (swalIntervalRef.current) clearInterval(swalIntervalRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearIdleTimeout();
    if (swalIntervalRef.current) {
      clearInterval(swalIntervalRef.current);
      swalIntervalRef.current = null;
    }
    try { if (Swal.isVisible()) Swal.close(); } catch { /* ignore */ }
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={layoutStyle}>
      {/* Idle warning handled via SweetAlert2 */}

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
