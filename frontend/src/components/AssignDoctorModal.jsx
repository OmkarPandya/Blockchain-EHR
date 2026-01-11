import React from "react";
import "./Modal.css";

const AssignDoctorModal = ({
  show,
  onClose,
  allDoctors,
  selectedDoctors,
  onToggle,
  onSubmit,
  assigning,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Manage Report Access</h2>
        <p className="modal-description">
          Select doctors who are allowed to view and comment on this report.
        </p>
        <div className="doctor-selection-list">
          {allDoctors.map((doc) => (
            <div
              key={doc.wallet}
              onClick={() => onToggle(doc.wallet)}
              className={`doctor-option ${
                selectedDoctors.includes(doc.wallet) ? "selected" : ""
              }`}
            >
              <div className="doctor-option-info">
                <div>
                  <strong className="doctor-name-label">{doc.name}</strong>
                  <small className="doctor-email-label">{doc.email}</small>
                </div>
                {selectedDoctors.includes(doc.wallet) && (
                  <span className="selection-badge">✓ Access Granted</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn secondary">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={assigning}
            className="modal-btn primary"
          >
            {assigning ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDoctorModal;
