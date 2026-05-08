import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail, Lock, Zap, Building2, ChevronRight,
  Bot, Shield, Users, Eye, EyeOff,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import useNotification from "../../hooks/useNotification";
import authService from "../../services/authService";
import Button from "../../components/common/Button";
import { BACKEND_URL } from "../../utils/constants";

const GoogleIcon = ({ size = 18 }) => (
  <img
    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg"
    alt="Google"
    style={{ width: size, height: size, objectFit: "contain", display: "block" }}
  />
);

const features = [
  { icon: Bot,    text: "AI responds instantly with full conversation context" },
  { icon: Users,  text: "Smart escalation to human agents when needed" },
  { icon: Shield, text: "Strict per-tenant data isolation — secure by design" },
];

const Login = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [step, setStep]         = useState("login");
  const [businesses, setBusinesses] = useState([]);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, selectBusiness, loading } = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const notification = useNotification();

  useEffect(() => {
    if (location.state?.businessSelection) {
      authService.getBusinesses()
        .then(({ businesses: biz }) => {
          if (biz?.length > 0) { setBusinesses(biz); setStep("business-selection"); }
          else navigate("/customer");
        })
        .catch(() => navigate("/customer"));
    }
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const { userData, businesses: biz } = await login(email, password);
      notification.success("Welcome back!");
      if (userData.role === "customer" && biz?.length > 0) {
        setBusinesses(biz);
        setStep("business-selection");
      } else {
        navigate(userData.role === "businessAdmin" ? "/admin" : `/${userData.role}`);
      }
    } catch (error) {
      notification.error(error.message || "Login failed");
    }
  };

  const handleBusinessSelect = (business) => {
    selectBusiness(business);
    navigate("/customer");
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = `${BACKEND_URL}/auth/google?role=customer`;
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px 13px 44px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "15px",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#f8fafc",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* ── Left branding panel ── */}
      <div className="auth-left-panel" style={{ width: "42%", minWidth: "380px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative", zIndex: 1 }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(124, 58, 237, 0.45)",
          }}>
            <Zap size={21} fill="white" color="white" />
          </div>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "#f1f5f9", letterSpacing: "-0.5px" }}>
            SupportOS
          </span>
        </div>

        {/* Center copy */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{
            fontSize: "38px", fontWeight: "800", color: "#f1f5f9",
            letterSpacing: "-1.2px", lineHeight: 1.15, marginBottom: "16px",
          }}>
            Support that<br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>actually works.</span>
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.48)", fontSize: "16px",
            lineHeight: 1.7, marginBottom: "36px", maxWidth: "320px",
          }}>
            AI-powered multi-tenant customer support with real-time chat and intelligent routing.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {features.map(({ icon: Icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "34px", height: "34px", borderRadius: "9px", flexShrink: 0,
                  backgroundColor: "rgba(124, 58, 237, 0.18)",
                  border: "1px solid rgba(124, 58, 237, 0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={15} color="#a78bfa" />
                </div>
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.45 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust row */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex" }}>
            {["A","B","C","D"].map((l, i) => (
              <div key={l} style={{
                width: "30px", height: "30px", borderRadius: "50%",
                background: `linear-gradient(135deg, hsl(${260 + i * 18}, 65%, 62%), hsl(${278 + i * 18}, 68%, 52%))`,
                border: "2.5px solid rgba(12, 17, 32, 0.9)",
                marginLeft: i ? "-8px" : 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "11px", fontWeight: "700", color: "white",
              }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#f1f5f9" }}>
              Trusted by support teams
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              Real-time · AI-powered · Multi-tenant
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex: 1, backgroundColor: "#ffffff",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "48px 40px", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: "400px", animation: "fadeIn 0.4s ease-out" }}>

          {step === "login" && (
            <>
              <div style={{ marginBottom: "36px" }}>
                <h1 style={{
                  fontSize: "28px", fontWeight: "800", color: "#0f172a",
                  marginBottom: "8px", letterSpacing: "-0.7px",
                }}>
                  Welcome back
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>
                  Sign in to your account to continue.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Email */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Email address
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={inputStyle}
                      onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#f8fafc"; }}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Password</label>
                    <Link to="/forgot-password" style={{ fontSize: "13px", color: "#7c3aed", fontWeight: "600" }}>Forgot?</Link>
                  </div>
                  <div style={{ position: "relative" }}>
                    <Lock size={17} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...inputStyle, paddingRight: "44px" }}
                      onFocus={(e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; e.target.style.backgroundColor = "#fff"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#f8fafc"; }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="primary" fullWidth loading={loading}
                  style={{ padding: "13px", fontSize: "15px", fontWeight: "700", borderRadius: "12px", marginTop: "4px" }}>
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", margin: "24px 0", color: "#94a3b8", fontSize: "13px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
                <span style={{ padding: "0 12px" }}>or</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </div>

              <Button variant="outline" fullWidth onClick={handleGoogleLogin} loading={isGoogleLoading} icon={GoogleIcon}
                style={{ padding: "12px", fontSize: "14px", fontWeight: "600", borderRadius: "12px" }}>
                Continue with Google
              </Button>
              <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "6px" }}>
                For customers only
              </p>

              <p style={{ textAlign: "center", marginTop: "28px", fontSize: "14px", color: "#64748b" }}>
                Don't have an account?{" "}
                <Link to="/register" style={{ color: "#7c3aed", fontWeight: "700" }}>Create one</Link>
              </p>
            </>
          )}

          {step === "business-selection" && (
            <>
              <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", marginBottom: "8px", letterSpacing: "-0.5px" }}>
                  Choose a business
                </h1>
                <p style={{ color: "#64748b", fontSize: "15px" }}>
                  Select which company you need support from.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {businesses.map((biz) => (
                  <button
                    key={biz._id}
                    onClick={() => handleBusinessSelect(biz)}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.backgroundColor = "rgba(124,58,237,0.04)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 18px", border: "1.5px solid #e2e8f0",
                      borderRadius: "14px", backgroundColor: "#f8fafc",
                      cursor: "pointer", transition: "all 0.2s", width: "100%", textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "38px", height: "38px", borderRadius: "10px",
                        backgroundColor: "rgba(124,58,237,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Building2 size={18} style={{ color: "#7c3aed" }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>
                          {biz.companyName || biz.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>Click to connect</div>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: "#94a3b8" }} />
                  </button>
                ))}
                <button
                  onClick={() => setStep("login")}
                  style={{ marginTop: "8px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px", padding: "8px 0" }}
                >
                  ← Back to login
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
