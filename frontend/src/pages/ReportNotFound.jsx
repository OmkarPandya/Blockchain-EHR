import React from "react";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.css"; // Reuse the same premium styles

const ReportNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div
          className="icon-wrapper"
          style={{ background: "#fef3c7", color: "#d97706" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h1>Report Not Found</h1>
        <p>
          We couldn't find the medical report you're looking for. It might have
          been deleted or the link is incorrect.
        </p>
        <div className="actions">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportNotFound;
