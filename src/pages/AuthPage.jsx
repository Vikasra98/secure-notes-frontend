import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./AuthPage.css";

const EyeIcon = ({ visible }) =>
  visible ? (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

const AuthPage = () => {
  const [tab, setTab] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const switchTab = (t) => {
    setTab(t);
    setErrors({});
    setShowPw(false);
  };

  // ── validation ──────────────────────────────────────────────────────────────
  const validateLogin = () => {
    const e = {};
    if (!loginForm.email) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(loginForm.email))
      e.email = "Enter a valid email.";
    if (!loginForm.password) e.password = "Password is required.";
    return e;
  };

  const validateRegister = () => {
    const e = {};
    if (!regForm.name.trim()) e.name = "Name is required.";
    if (!regForm.email) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(regForm.email))
      e.email = "Enter a valid email.";
    if (!regForm.password) e.password = "Password is required.";
    else if (regForm.password.length < 6) e.password = "Min 6 characters.";
    else if (!/\d/.test(regForm.password))
      e.password = "Must contain a number.";
    if (regForm.password !== regForm.confirm)
      e.confirm = "Passwords do not match.";
    return e;
  };

  // ── submit handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register(regForm.name, regForm.email, regForm.password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-card-title">Secure Notes</h1>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === "login" ? "active" : ""}`}
            onClick={() => switchTab("login")}
          >
            Login
          </button>
          <button
            className={`auth-tab-btn ${tab === "register" ? "active" : ""}`}
            onClick={() => switchTab("register")}
          >
            Register
          </button>
        </div>

        {/* ── Login form ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-error" : ""}`}
                placeholder=""
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="pw-wrapper">
                <input
                  type={showPw ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-error" : ""}`}
                  placeholder=""
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  <EyeIcon visible={showPw} />
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Login"}
            </button>

            <button
              type="button"
              className="auth-forgot"
              onClick={() =>
                toast.info("Password reset is not available in this demo.")
              }
            >
              Forgot password?
            </button>
          </form>
        )}

        {/* ── Register form ── */}
        {tab === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-error" : ""}`}
                placeholder=""
                value={regForm.name}
                onChange={(e) =>
                  setRegForm({ ...regForm, name: e.target.value })
                }
                autoComplete="name"
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-error" : ""}`}
                placeholder=""
                value={regForm.email}
                onChange={(e) =>
                  setRegForm({ ...regForm, email: e.target.value })
                }
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="pw-wrapper">
                <input
                  type={showPw ? "text" : "password"}
                  className={`form-control ${errors.password ? "is-error" : ""}`}
                  placeholder=""
                  value={regForm.password}
                  onChange={(e) =>
                    setRegForm({ ...regForm, password: e.target.value })
                  }
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  <EyeIcon visible={showPw} />
                </button>
              </div>
              {errors.password && (
                <p className="field-error">{errors.password}</p>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className={`form-control ${errors.confirm ? "is-error" : ""}`}
                placeholder=""
                value={regForm.confirm}
                onChange={(e) =>
                  setRegForm({ ...regForm, confirm: e.target.value })
                }
                autoComplete="new-password"
              />
              {errors.confirm && (
                <p className="field-error">{errors.confirm}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full auth-submit"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
