import React from "react";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="icon-wrapper">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>
          You don't have permission to view this medical report. Access is
          restricted to assigned patients and doctors only.
        </p>
        <div className="actions">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
          <button onClick={() => navigate("/")} className="btn-secondary">
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
