import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import 'sweetalert2/dist/sweetalert2.min.css';

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  // Simple math captcha: two numbers (5..110) to add
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaTouched, setCaptchaTouched] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const captchaRef = useRef(null);

  // generate captcha where the TOTAL is between 5 and 110 (inclusive)
  // generateCaptcha(true) will focus the captcha input after regenerating
  const generateCaptcha = (focus = false) => {
    const total = Math.floor(Math.random() * (110 - 5 + 1)) + 5; // 5..110
    // split total into two positive integers a and b (1..total-1)
    const a = Math.floor(Math.random() * (total - 1)) + 1;
    const b = total - a;
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaInput("");
    // reset interaction state so errors don't show right after reload
    setCaptchaTouched(false);
    setAttemptedSubmit(false);
    if (focus) setTimeout(() => captchaRef.current?.focus?.(), 60);
  };

  // On mount generate captcha but do not focus it — keep username first
  useEffect(() => { generateCaptcha(false); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptchaChange = (e) => {
    setCaptchaInput(e.target.value.replace(/[^0-9]/g, ''));
    // mark as touched on change so inline errors can show after interaction
    setCaptchaTouched(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // mark that the user attempted to submit (used to control error visibility)
    setAttemptedSubmit(true);

    // No client-side domain restriction — let server validate the email/user credentials

    // validate captcha first
    const expected = captchaA + captchaB;
    if (String(expected) !== String((captchaInput || '').trim())) {
      await Swal.fire({ icon: 'error', title: 'Wrong Answer', text: 'Please solve the math challenge correctly before signing in.', confirmButtonColor: '#d33' });
      generateCaptcha();
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        await Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: data.error || "Invalid username or password",
          confirmButtonColor: "#d33",
        });
        generateCaptcha();
        return;
      }

      // store token
      localStorage.setItem("token", data.token);

      // success alert then navigate
      await Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: "Login successful.",
        showConfirmButton: false,
        timer: 1200,
      });

      navigate("/users");
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Please check your connection or try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const { value: email } = await Swal.fire({
      title: 'Forgot Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'email@example.com',
      showCancelButton: true,
    });

    if (email) {
      await Swal.fire({
        icon: 'info',
        title: 'Request received',
        text: `If ${email} exists in our system, you'll receive password reset instructions.`,
      });
    }
  };

  return (
    <div className="container-fluid ps-lg-0 pr-lg-0">
      <section>
        <div className="col-12 mt-3 mt-sm-0">
          <div className="row">
            <div className="col-lg-5 col-12">
              <div className="college-detail mt-md-5 pt-md-5 in-down a1 text-center">
                <img src="/Phinmalogo2.png" alt="college logo" className="w-25 mt-xxl-5 mt-xl-4" />
                <div className="college-name mt-3">
                  <h3 className="pl-lg-5 pr-lg-5 ml-2 mr-2"><span id="lblTitle">Cagayan De Oro College</span></h3>
                </div>
                <div className="college-address px-lg-5">
                  <p><span id="lblAddres">Max Suniel St. Carmen, Cagayan de Oro City, Misamis Oriental, Philippines 9000</span></p>
                </div>
              </div>
              <div className="pt-xxl-4">
                <img id="imgNPCLogo" className="NPC-Logo" src="/logo-left.png" alt="npc" />
                <div id="overlay" className="overlay"></div>
              </div>
            </div>

            {/* hidden captcha values for compatibility with sample markup */}
            <input type="hidden" name="hdnCaptchaValue" id="hdnCaptchaValue" value={captchaA + captchaB} />
            <input type="hidden" name="hdnCaptchaInput" id="hdnCaptchaInput" value={captchaInput} />

            <div className="col-lg-4 offset-lg-1 col-sm-6 offset-sm-3 col-12 mt-lg-5 pt-xxl-4 pt-lg-3 mb-4 login-details">
              <div className="d-flex align-items-center ms-lg-2">
                <img src="/logo-right.png" alt="logo" className="w-25 in-down a1" />
                <div className="in-down a2 ms-2">
                  <h3 className="mb-0">PHINMA EDUCATION</h3>
                  <p className="mb-0">MAKING LIVES BETTER THROUGH EDUCATION</p>
                </div>
              </div>

              <div id="DivLogin" className="card ms-lg-2 mt-2 in-left a2">
                <div className="card-body pt-md-5 pb-md-5 ps-md-4 pe-md-4">
                  <div className="row">
                    <div className="col-md-12 mb-3">
                      <div className="default-form-header">
                        <h4 className="mb-1">Sign In</h4>
                        {/* blue underline to match design */}
                        <div style={{ height: 3, width: 120, background: '#2b6cb0', marginTop: 8, borderRadius: 2 }} />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleLogin}>
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group position-relative mb-4">
                          <div className="label-dynamic">
                            <sup style={{ color: '#d9534f' }}>* </sup>
                            <label style={{ fontWeight: 600 }}>Username</label>
                          </div>
                          <input
                            name="email"
                            type="email"
                            id="txt_username"
                            tabIndex={1}
                            className="form-control"
                            placeholder="Enter Username"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={{
                              border: 'none',
                              borderBottom: '2px solid #e6eef7',
                              borderRadius: 0,
                              paddingRight: 40
                            }}
                          />
                          <i className="bi bi-person" style={{ position: 'absolute', right: 10, top: '44px', color: '#9ca3af' }} />
                        </div>
                      </div>

                      <div id="pnlpwd" className="col-12">
                        <div className="form-group position-relative mb-3">
                          <div className="label-dynamic">
                            <sup style={{ color: '#d9534f' }}>* </sup>
                            <label style={{ fontWeight: 600 }}>Password</label>
                          </div>

                          <input
                            name="password"
                            type="password"
                            id="txt_password"
                            tabIndex={2}
                            className="form-control"
                            autoComplete="off"
                            placeholder="Enter Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={{
                              border: 'none',
                              borderBottom: '2px solid #e6eef7',
                              borderRadius: 0,
                              paddingRight: 40
                            }}
                          />

                          <a href="#" aria-label="eye" className="ms-2" onClick={(ev) => { ev.preventDefault(); /* no-op placeholder for eye toggle */ }} style={{ position: 'absolute', right: 10, top: '44px', color: '#9ca3af' }}>
                            <i className="bi bi-eye-slash password-prefix" />
                          </a>
                        </div>
                      </div>

                      {/* Math Captcha Start (visually match original small boxed numbers) */}
                      <div className="submit__control col-12 mt-3">
                        <div className="row align-items-center">
                          <div className="col-10">
                            <div className="d-flex align-items-center">
                              <div style={{ minWidth: 72, height: 44, borderRadius: 6, border: '1px solid #e6eef7', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{captchaA}</div>

                              <div style={{ width: 24, textAlign: 'center', fontWeight: 700, margin: '0 8px' }}>+</div>

                              <div style={{ minWidth: 56, height: 44, borderRadius: 6, border: '1px solid #e6eef7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{captchaB}</div>

                              <div style={{ width: 24, textAlign: 'center', fontWeight: 700, margin: '0 8px' }}>=</div>

                              <input
                                className="submit__input form-control d-inline-block"
                                type="text"
                                maxLength={3}
                                size={3}
                                tabIndex={3}
                                value={captchaInput}
                                onChange={handleCaptchaChange}
                                onBlur={() => setCaptchaTouched(true)}
                                ref={captchaRef}
                                style={{ width: 96, display: 'inline-block', marginLeft: 8 }}
                                required
                              />
                            </div>
                          </div>

                          <div className="col-2 text-end">
                            <button type="button" aria-label="reload captcha" className="btn btn-outline-secondary p-2 d-flex align-items-center justify-content-center" onClick={() => generateCaptcha(true)} title="Reload challenge" style={{ borderRadius: 6, width: 44, height: 44 }}>
                              {/* Inline SVG ensures the reload icon is visible even if icon fonts aren't loaded */}
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                <path d="M21 12a9 9 0 10-3.05 6.364L21 12z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 3v6h-6" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="visually-hidden">Reload captcha</span>
                            </button>
                          </div>

                          <div className="col-12 mt-2">
                            <div>
                              <div className={`submit__error ${(captchaTouched || attemptedSubmit) && captchaInput && String(captchaA + captchaB) !== String(captchaInput) ? '' : 'd-none'}`} style={{ color: '#d9534f', fontWeight: 600 }}>Please fill correct value</div>
                              <div className={`submit__error--empty ${(captchaTouched || attemptedSubmit) && !captchaInput ? '' : 'd-none'}`} style={{ color: '#d9534f', fontWeight: 600 }}>Required field cannot be left blank</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Math Captcha END */}

                      <div className="mt-4 col-12">
                        <div className="d-grid col-sm-6 col-12 mx-auto">
                          <button id="btnSubmit" tabIndex={4} className="btn btn-primary submit" type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 6 }}>
                            {loading ? 'Signing In...' : 'Sign In'} <i className="bi bi-box-arrow-in-right ms-2" />
                          </button>
                          <input type="hidden" name="hdnusername" id="hdnusername" value={form.email} />
                          <input type="hidden" name="hdnpassword" id="hdnpassword" value={form.password} />
                        </div>

                        <div className="mt-3 text-center">
                          <a id="lbtForgePass" tabIndex={4} className="hypr-link text-decoration-none" href="#" onClick={handleForgot}>Forgot Password</a>
                        </div>

                      </div>

                    </div>
                  </form>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
    </div>
  );
}