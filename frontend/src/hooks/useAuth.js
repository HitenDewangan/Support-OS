import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

const useAuth = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("supportos_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedBusiness, setSelectedBusiness] = useState(() => {
    const saved = localStorage.getItem("supportos_selected_business");
    return saved ? JSON.parse(saved) : null;
  });
  const hasTokenAndUser =
    !!localStorage.getItem("token") && !!localStorage.getItem("supportos_user");
  const [loading, setLoading] = useState(!hasTokenAndUser);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("supportos_user");

    if (!token) {
      setLoading(false);
      return;
    }

    if (savedUser) {
      setLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("supportos_user", JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("supportos_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    const data = await authService.login({ email, password });
    const userData = data.user;
    setUser(userData);
    localStorage.setItem("supportos_user", JSON.stringify(userData));
    setLoading(false);
    return { userData, businesses: data.businesses || [] };
  };

  const selectBusiness = (business) => {
    setSelectedBusiness(business);
    localStorage.setItem("supportos_selected_business", JSON.stringify(business));
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setSelectedBusiness(null);
    localStorage.removeItem("supportos_user");
    localStorage.removeItem("supportos_selected_business");
    navigate("/login");
  };

  return {
    user,
    selectedBusiness,
    selectBusiness,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };
};

export default useAuth;
