import React, { useState } from "react";
import { searchPatients } from "../api/auth";
import { uploadLabReport } from "../api/report";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./LabUpload.css";

const LabUpload = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [hospital, setHospital] = useState("");
  const [reportType, setReportType] = useState("Blood Test");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const response = await searchPatients(searchQuery);
      setPatients(response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to search patients");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !file || !hospital) {
      setError("Please fill all fields and select a patient");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("labWallet", user.wallet);
    formData.append("patientWallet", selectedPatient.wallet);
    formData.append("hospital", hospital);
    formData.append("reportType", reportType);

    try {
      await uploadLabReport(formData);
      toast.success("Report uploaded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lab-upload-container">
      <h1 className="lab-upload-title">Upload Laboratory Report</h1>

      {/* Search Section */}
      <div className="search-section card">
        <h3>1. Find Patient</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by Email or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-btn">
            Search
          </button>
        </div>

        <div className="patients-list">
          {patients.map((p) => (
            <div
              key={p.wallet}
              onClick={() => setSelectedPatient(p)}
              className={`patient-item ${
                selectedPatient?.wallet === p.wallet ? "selected" : ""
              }`}
            >
              <strong>{p.name}</strong> ({p.email})<br />
              <small className="wallet-addr">Wallet: {p.wallet}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Form */}
      {selectedPatient && (
        <form onSubmit={handleUpload} className="upload-form-section card">
          <h3 className="form-sub-title">
            2. Report Details for {selectedPatient.name}
          </h3>

          <div className="input-group">
            <label className="input-label">Hospital/Lab Name:</label>
            <input
              type="text"
              required
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Report Type:</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="form-select"
            >
              <option value="Blood Test">Blood Test</option>
              <option value="Urine Test">Urine Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Biopsy">Biopsy</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Report File (PDF/Image):</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-report-btn"
          >
            {loading ? "Uploading..." : "Upload & Deploy to Blockchain"}
          </button>
        </form>
      )}

      {error && <p className="error-message">{error}</p>}

      <button onClick={() => navigate("/dashboard")} className="back-btn">
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default LabUpload;
