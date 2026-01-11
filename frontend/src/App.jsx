import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LabUpload from "./pages/LabUpload";
import ReportDetails from "./pages/ReportDetails";
import Unauthorized from "./pages/Unauthorized";
import ReportNotFound from "./pages/ReportNotFound";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";
import "./App.css";

const AppContent = () => {
  const [isBlurred, setIsBlurred] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const isAuthRoute = ["/", "/register"].includes(location.pathname);
  const showHeader = user && !isAuthRoute;

  useEffect(() => {
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);

    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    const handleVisibilityChange = () => {
      if (document.hidden) setIsBlurred(true);
      else setIsBlurred(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <>
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 4000,
          style: {
            padding: "16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "600",
          },
          success: {
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            style: {
              background: "#F97316",
              color: "#fff",
            },
          },
        }}
      />

      {showHeader && (
        <Header
          onLogout={handleLogout}
          isNarrow={location.pathname.includes("/reports/")}
        />
      )}

      <div className={isBlurred ? "blurred" : ""}>
        {isBlurred && (
          <div className="screenshot-protection-overlay">Protected Content</div>
        )}
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lab-upload"
              element={
                <ProtectedRoute allowedRoles={["laboratory"]}>
                  <LabUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <ProtectedRoute>
                  <ReportDetails />
                </ProtectedRoute>
              }
            />

            {/* Dedicated 404 Route */}
            <Route path="/404" element={<NotFound />} />

            {/* Catch-all Route for 404 */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/report-not-found" element={<ReportNotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
