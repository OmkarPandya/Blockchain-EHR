import React from "react";
import "./Modal.css";

const LogoutModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: "400px", textAlign: "center" }}
      >
        <div
          className="modal-icon"
          style={{ fontSize: "3rem", marginBottom: "20px" }}
        >
          👋
        </div>
        <h2 className="modal-title">Confirm Logout</h2>
        <p className="modal-description">
          Are you sure you want to log out of your Blockchain EHR account?
        </p>
        <div
          className="modal-actions"
          style={{ justifyContent: "center", gap: "16px" }}
        >
          <button onClick={onClose} className="modal-btn secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="modal-btn primary"
            style={{ backgroundColor: "var(--danger)" }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
