import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReportCard.css";

const ReportCard = ({ report, user, onAssign, onComment }) => {
  const navigate = useNavigate();
  return (
    <div className="report-card">
      <div className="report-header">
        <div className="report-meta">
          <span className="report-type-badge">
            {report.reportType || "Lab Report"}
          </span>
          <small className="report-date">
            {new Date(report.date).toLocaleDateString()}
          </small>
        </div>
        <h3 className="hospital-name">{report.hospital}</h3>
        {user.user_type === "doctor" && (
          <p className="patient-wallet">
            Patient: {report.patient.substring(0, 10)}...
          </p>
        )}
      </div>

      {user.user_type === "patient" && (
        <div className="assigned-doctors-section">
          <strong className="section-label">Assigned Doctors:</strong>
          <div className="doctors-list">
            {report.doctors && report.doctors.length > 0 ? (
              report.doctors.map((doc, idx) => (
                <span key={idx} className="doctor-badge">
                  {typeof doc === "object"
                    ? doc.name
                    : doc.substring(0, 6) + "..."}
                </span>
              ))
            ) : (
              <span className="no-data">None assigned</span>
            )}
          </div>
        </div>
      )}

      {/* Comments section removed from card as requested */}

      <div className="report-actions">
        <a
          href={report.scan}
          target="_blank"
          rel="noopener noreferrer"
          className="view-link"
        >
          View Image ↗
        </a>

        <button
          onClick={() => navigate(`/reports/${report._id}`)}
          className="action-btn details-btn"
        >
          View Details
        </button>

        {user.user_type === "patient" ? (
          <button
            onClick={() => onAssign(report)}
            className="action-btn patient-btn"
          >
            Manage Access
          </button>
        ) : (
          <button
            onClick={() => onComment(report)}
            className="action-btn doctor-btn"
          >
            + Add Comment
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
