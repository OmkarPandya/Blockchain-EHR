import React, { useState, useEffect } from "react";
import { searchPatients } from "../api/auth";
import "./Modal.css";

const ChangePatientModal = ({
  show,
  onClose,
  onSubmit,
  updating,
  currentPatientName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (show) {
      setSearchQuery("");
      setPatients([]);
      setSelectedPatient(null);
      setShowDropdown(false);
    }
  }, [show]);

  useEffect(() => {
    if (
      !searchQuery ||
      (selectedPatient && searchQuery === selectedPatient.name)
    ) {
      if (!searchQuery) {
        setPatients([]);
        setShowDropdown(false);
      }
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await searchPatients(searchQuery);
        setPatients(response.data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedPatient]);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchQuery(patient.name);
    setShowDropdown(false);
    setPatients([]);
  };

  const handleSubmit = () => {
    if (selectedPatient) {
      onSubmit(selectedPatient.wallet);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ overflow: "visible" }}>
        <h2 className="modal-title">Change Assigned Patient</h2>
        <p className="modal-description">
          Current Patient: <strong>{currentPatientName || "Unknown"}</strong>
        </p>
        <p className="modal-description" style={{ marginBottom: "15px" }}>
          Search for the new patient you want to assign this report to.
        </p>

        <div className="patient-search-container" style={{ position: "relative", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Start typing patient's name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery && setShowDropdown(true)}
            style={{ width: "100%", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "1rem" }}
          />

          {showDropdown && patients.length > 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "5px", zIndex: 10, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
              {patients.map((p) => (
                <div
                  key={p.wallet}
                  onClick={() => handleSelectPatient(p)}
                  style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#f8fafc"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
                >
                  <div style={{ fontWeight: "bold", color: "#1e293b" }}>{p.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{p.email} | {p.wallet.substring(0, 10)}...</div>
                </div>
              ))}
            </div>
          )}

          {showDropdown && searchQuery && patients.length === 0 && (
            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px", marginTop: "5px", zIndex: 10, padding: "15px", textAlign: "center", color: "#64748b" }}>
              No patients found
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updating || !selectedPatient}
            className="modal-btn primary"
            style={{ opacity: (!selectedPatient || updating) ? 0.6 : 1 }}
          >
            {updating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePatientModal;
