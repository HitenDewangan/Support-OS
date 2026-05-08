import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Lock, Zap, CheckCircle } from "lucide-react";
import authService from "../../services/authService";
import useNotification from "../../hooks/useNotification";
import Button from "../../components/common/Button";

const AgentRegister = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const navigate = useNavigate();
  const notification = useNotification();

  if (!token || !email) {
    return (
      <div style={containerStyle}>
        <div className="glass-card" style={cardStyle}>
          <h2 style={{ color: "var(--error)", fontSize: "20px", fontWeight: "700" }}>
            Invalid Invite Link
          </h2>
          <p style={{ color: "var(--text)", marginTop: "12px" }}>
            This invite link is missing required information. Please ask your
            business admin to resend the invitation.
          </p>
          <Link to="/login" style={{ color: "var(--accent)", marginTop: "20px", display: "block" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      notification.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      notification.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authService.registerAgent({ token, password });
      setDone(true);
    } catch (error) {
      notification.error(
        error.response?.data?.message || "Registration failed. The invite may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={containerStyle}>
        <div className="glass-card" style={{ ...cardStyle, textAlign: "center" }}>
          <CheckCircle size={48} style={{ color: "var(--success)", margin: "0 auto 16px" }} />
          <h2 style={{ color: "var(--text-bright)", fontSize: "24px", fontWeight: "700" }}>
            Registration Complete!
          </h2>
          <p style={{ color: "var(--text)", marginTop: "12px", marginBottom: "28px" }}>
            Your agent account has been created. You can now log in.
          </p>
          <Button variant="primary" fullWidth onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div className="glass-card animate-fade-in" style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={logoStyle}>
            <Zap size={28} fill="currentColor" />
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-bright)", marginBottom: "8px" }}>
            Accept Invitation
          </h1>
          <p style={{ color: "var(--text)", fontSize: "14px" }}>
            You've been invited as a support agent.
          </p>
          <div style={{ marginTop: "12px", padding: "10px 16px", borderRadius: "10px", backgroundColor: "var(--accent-muted)", color: "var(--accent)", fontSize: "14px", fontWeight: "600" }}>
            {email}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Set Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Confirm Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create My Account
          </Button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: "600" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  padding: "24px",
  backgroundColor: "var(--bg)",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  padding: "40px",
};

const logoStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "14px",
  background: "var(--accent)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  margin: "0 auto 16px",
  boxShadow: "0 8px 24px rgba(124, 58, 237, 0.3)",
};

const labelStyle = {
  display: "block",
  fontSize: "14px",
  fontWeight: "600",
  color: "var(--text-bright)",
  marginBottom: "8px",
  paddingLeft: "4px",
};

const inputWrapperStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const iconStyle = {
  position: "absolute",
  left: "14px",
  color: "var(--text)",
};

const inputStyle = {
  width: "100%",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "12px 16px 12px 44px",
  color: "var(--text-bright)",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

export default AgentRegister;
