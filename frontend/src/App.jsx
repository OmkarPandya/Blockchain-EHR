import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  console.log("App Rendering - Current Path:", window.location.pathname);

  return (
    <Router>
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
              background: "#F97316", // Orange-red color
              color: "#fff",
            },
          },
        }}
      />
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
    </Router>
  );
}

export default App;
