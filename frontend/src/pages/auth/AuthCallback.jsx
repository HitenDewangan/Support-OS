import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import useNotification from "../../hooks/useNotification";

const AuthCallback = () => {
  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      notification.error("Google login failed. No token returned.");
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);

    authService
      .getCurrentUser()
      .then((data) => {
        const user = data.user;
        localStorage.setItem("supportos_user", JSON.stringify(user));
        notification.success("Google login completed. Redirecting...");

        if (user.role === "customer") {
          // Send customer to login page to select a business
          navigate("/login", { state: { businessSelection: true } });
        } else {
          const redirectTo = user.role === "businessAdmin" ? "/admin" : `/${user.role}`;
          navigate(redirectTo);
        }
      })
      .catch((error) => {
        console.error("Auth callback failed:", error);
        notification.error("Unable to complete Google login.");
        navigate("/login");
      });
  }, [navigate, notification]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          borderRadius: "20px",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "12px" }}>Finishing Google login...</h2>
        <p style={{ color: "var(--text)" }}>
          Please wait while we sign you in and redirect to your dashboard.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
