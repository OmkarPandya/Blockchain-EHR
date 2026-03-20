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
  const [showDropdown, setShowDropdown] = useState(false);
  const [file, setFile] = useState(null);
  const [hospital, setHospital] = useState("");
  const [reportType, setReportType] = useState("Blood Test");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Debounced search logic
  React.useEffect(() => {
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
        <div className="dropdown-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Start typing patient's name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              className="search-input"
            />
          </div>

          {showDropdown && patients.length > 0 && (
            <div className="patients-dropdown">
              {patients.map((p) => (
                <div
                  key={p.wallet}
                  onClick={() => handleSelectPatient(p)}
                  className={`patient-dropdown-item ${
                    selectedPatient?.wallet === p.wallet ? "selected" : ""
                  }`}
                >
                  <div className="patient-info">
                    <span className="patient-name">{p.name}</span>
                    <span className="patient-email">{p.email}</span>
                  </div>
                  <small className="wallet-addr">Wallet: {p.wallet}</small>
                </div>
              ))}
            </div>
          )}

          {showDropdown && searchQuery && patients.length === 0 && (
            <div className="patients-dropdown">
              <div className="no-results">No patients found</div>
            </div>
          )}
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
              accept=".pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (selectedFile) {
                  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
                  if (!allowedTypes.includes(selectedFile.type)) {
                    toast.error("Invalid format. Please upload a PDF, JPG, or PNG file.");
                    e.target.value = null;
                    setFile(null);
                    return;
                  }
                  setFile(selectedFile);
                }
              }}
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
