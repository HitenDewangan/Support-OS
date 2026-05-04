import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layouts
import PageWrapper from "./components/layout/PageWrapper";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import AuthCallback from "./pages/auth/AuthCallback";
import AgentRegister from "./pages/auth/AgentRegister";
import AlertsShowcase from "./pages/AlertsShowcase";

// Customer Pages
import ChatWidget from "./pages/customer/ChatWidget";
import TicketForm from "./pages/customer/TicketForm";
import MyTickets from "./pages/customer/MyTickets";

// Agent Pages
import AgentDashboard from "./pages/agent/AgentDashboard";
import TicketQueue from "./pages/agent/TicketQueue";
import TicketDetail from "./pages/agent/TicketDetail";
import AgentProfile from "./pages/agent/AgentProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgentManagement from "./pages/admin/AgentManagement";
import Analytics from "./pages/admin/Analytics";
import FAQManager from "./pages/admin/FAQManager";
import BusinessSettings from "./pages/admin/BusinessSettings";

// SuperAdmin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import TenantList from "./pages/superadmin/TenantList";

import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/oauth/callback" element={<AuthCallback />} />
          <Route path="/register/agent" element={<AgentRegister />} />
          <Route path="/alerts-demo" element={<AlertsShowcase />} />

          {/* Protected Customer Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute role="customer">
                <PageWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<MyTickets />} />
            <Route path="chat/:ticketId" element={<ChatWidget />} />
            <Route path="new-ticket" element={<TicketForm />} />
          </Route>

          {/* Protected Agent Routes */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute role="agent">
                <PageWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentDashboard />} />
            <Route path="queue" element={<TicketQueue />} />
            <Route path="ticket/:id" element={<TicketDetail />} />
            <Route path="profile" element={<AgentProfile />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="businessAdmin">
                <PageWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="agents" element={<AgentManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="faq" element={<FAQManager />} />
            <Route path="settings" element={<BusinessSettings />} />
          </Route>

          {/* Protected SuperAdmin Routes */}
          <Route
            path="/superadmin"
            element={
              <ProtectedRoute role="superadmin">
                <PageWrapper />
              </ProtectedRoute>
            }
          >
            <Route index element={<SuperAdminDashboard />} />
            <Route path="tenants" element={<TenantList />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
