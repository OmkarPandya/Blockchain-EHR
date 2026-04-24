import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./ReportCard.css";

const ReportCard = ({ report, user, onAssign, onComment, onChangePatient }) => {
  const navigate = useNavigate();
  const [showImageModal, setShowImageModal] = useState(false);
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
        {(user.user_type === "doctor" || user.user_type === "laboratory") && (
          <p className="patient-wallet">
            Patient: {report.patientName ? report.patientName : `${report.patient.substring(0, 10)}...`}
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
        <button
          onClick={() => setShowImageModal(true)}
          className="view-link"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "1rem" }}
        >
          View Image ↗
        </button>

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
        ) : user.user_type === "doctor" ? (
          <button
            onClick={() => onComment(report)}
            className="action-btn doctor-btn"
          >
            + Add Comment
          </button>
        ) : user.user_type === "laboratory" ? (
          <button
            onClick={() => onChangePatient(report)}
            className="action-btn patient-btn"
            style={{ backgroundColor: "#0284c7" }}
          >
            Change Patient
          </button>
        ) : null}
      </div>

      {showImageModal && ReactDOM.createPortal(
        <div 
          className="modal-overlay" 
          onClick={() => setShowImageModal(false)}
          style={{ cursor: "zoom-out", zIndex: 9999 }}
        >
          <object 
            data={report.scan} 
            aria-label="Full Resolution Scan" 
            style={{ width: "90vw", height: "90vh", borderRadius: "8px", backgroundColor: "white", cursor: "default" }} 
            onClick={(e) => e.stopPropagation()} 
          >
            <iframe src={report.scan} style={{ width: "100%", height: "100%", border: "none" }} title="Report Preview"></iframe>
          </object>
          <button 
            onClick={() => setShowImageModal(false)}
            style={{ position: "absolute", top: "20px", right: "30px", background: "white", color: "#333", border: "none", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
          >
            ✕
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ReportCard;
