import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  UserPlus, Mail, Lock, User, Zap, ChevronRight,
  Shield, CheckCircle2, Eye, EyeOff,
} from "lucide-react";
import useNotification from "../../hooks/useNotification";
import authService from "../../services/authService";
import Button from "../../components/common/Button";

const perks = [
  "No credit card required to get started",
  "AI-powered responses from day one",
  "Real-time chat with your support team",
  "Strict data isolation — your data stays yours",
];

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const navigate    = useNavigate();
  const notification = useNotification();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("businessId");

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      notification.error("Passwords do not match");
      return;
    }
    if (!agreed) { notification.error("Please accept the terms"); return; }
    setLoading(true);
    try {
      await authService.registerCustomer({ name: formData.name, email: formData.email, password: formData.password, businessId });
      notification.success("Account created! You can now sign in.");
      navigate("/login");
    } catch (error) {
      notification.error(error.response?.data?.message || error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px 12px 42px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    backgroundColor: "#f8fafc",
  };
  const focus = (e) => { e.target.style.borderColor = "#7c3aed"; e.target.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.1)"; e.target.style.backgroundColor = "#fff"; };
  const blur  = (e) => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.backgroundColor = "#f8fafc"; };

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
            fontSize: "36px", fontWeight: "800", color: "#f1f5f9",
            letterSpacing: "-1px", lineHeight: 1.2, marginBottom: "16px",
          }}>
            Your customers<br />
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>deserve better.</span>
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.48)", fontSize: "15px",
            lineHeight: 1.7, marginBottom: "32px", maxWidth: "310px",
          }}>
            Join SupportOS and give your customers an AI-powered support experience that delights.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {perks.map((perk) => (
              <div key={perk} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <CheckCircle2 size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            padding: "18px 20px",
            borderRadius: "14px",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>
              "Deploying SupportOS cut our response time by 60%"
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", color: "white",
              }}>S</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#f1f5f9" }}>Suraj D.</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.32)" }}>Head of Support</div>
              </div>
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
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{
              fontSize: "26px", fontWeight: "800", color: "#0f172a",
              marginBottom: "8px", letterSpacing: "-0.6px",
            }}>
              Create your account
            </h1>
            <p style={{ color: "#64748b", fontSize: "15px" }}>
              {businessId ? "Register to access your support portal." : "Start for free. No credit card required."}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Full name */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Full name</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type="text" placeholder="John Doe" value={formData.name} onChange={set("name")} style={inputStyle} onFocus={focus} onBlur={blur} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Email address</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type="email" placeholder="you@example.com" value={formData.email} onChange={set("email")} style={inputStyle} onFocus={focus} onBlur={blur} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={set("password")} style={{ ...inputStyle, paddingRight: "42px" }} onFocus={focus} onBlur={blur} required />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Confirm password</label>
              <div style={{ position: "relative" }}>
                <Shield size={16} style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type={showConfirm ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={set("confirmPassword")} style={{ ...inputStyle, paddingRight: "42px" }} onFocus={focus} onBlur={blur} required />
                <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", marginTop: "2px" }}>
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                style={{ width: "16px", height: "16px", marginTop: "2px", cursor: "pointer", accentColor: "#7c3aed" }} />
              <span style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.5 }}>
                I agree to the{" "}
                <a href="#" style={{ color: "#7c3aed", fontWeight: "600" }}>Terms of Service</a>
                {" "}and{" "}
                <a href="#" style={{ color: "#7c3aed", fontWeight: "600" }}>Privacy Policy</a>
              </span>
            </label>

            <Button type="submit" variant="primary" fullWidth loading={loading} icon={UserPlus}
              style={{ padding: "13px", fontSize: "15px", fontWeight: "700", borderRadius: "12px", marginTop: "4px" }}>
              Create Account
            </Button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#64748b" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#7c3aed", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              Sign in <ChevronRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
