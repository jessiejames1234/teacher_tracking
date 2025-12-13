import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      // ==== FAILED LOGIN HANDLING ====
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error || "Invalid username or password",
          confirmButtonColor: "#d33"
        });
        return;
      }

      // ==== SUCCESS LOGIN ====
      localStorage.setItem("token", data.token);

      Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Login successful.",
        showConfirmButton: false,
        timer: 1500
      });

      setTimeout(() => {
        navigate("/users");
      }, 1500);

    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please check your connection or try again.",
        confirmButtonColor: "#d33"
      });
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0" style={{ minHeight: "100vh" }}>

        {/* LEFT SIDE */}
        <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center p-5"
             style={{ background: "#ffffff" }}>
          
          <img 
            src="/logo-left.png" 
            alt="School Logo"
            style={{ width: "250px", marginBottom: "20px" }}
          />

          <h4 className="mt-3 fw-bold">Cagayan De Oro College</h4>
          <p className="text-center mt-2" style={{ maxWidth: "350px" }}>
            Max Suniel St. Carmen, Cagayan de Oro City, Misamis Oriental, Philippines 9000
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center"
             style={{ background: "#2f8f41" }}>
          
          <div className="card shadow p-4" style={{ width: "22rem", borderRadius: "12px" }}>
            
            <div className="text-center mb-2">
              <img 
                src="/logo-right.png"
                alt="PHINMA Education"
                style={{ width: "120px" }}
              />
            </div>

            <h4 className="text-center mb-3 fw-bold">Sign In</h4>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Username</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-success w-100 fw-semibold">
                Sign In
              </button>

              <div className="text-center mt-3">
                <a href="#" className="text-decoration-none">Forgot Password</a>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}