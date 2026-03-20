import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-hot-toast";
import { updateProfile } from "../api/auth";
import "./Modal.css";

const EditProfileModal = ({ show, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show) {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      return toast.error("Name and email are required");
    }

    setSubmitting(true);
    try {
      const { data } = await updateProfile({ name, email });
      // Update local storage
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Profile updated successfully!");
      onClose();
      // Reload to reflect changes across the app
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Edit Profile</h2>
        <p className="modal-description">
          Update your personal details below.
        </p>
        
        <div style={{ marginBottom: "1rem", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="modal-btn success"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;

