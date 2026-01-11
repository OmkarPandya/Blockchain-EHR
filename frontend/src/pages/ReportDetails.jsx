import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById } from "../api/report";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import "./ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getReportById(id);
        setReport(response.data);
      } catch (err) {
        console.error("Error fetching report:", err);
        if (err.response) {
          if (err.response.status === 403) {
            navigate("/unauthorized");
          } else if (err.response.status === 404) {
            navigate("/report-not-found");
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          toast.error("Failed to connect to the server");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  if (loading) return <div className="loading">Loading details...</div>;

  // If loading is done but no report, the useEffect would have navigated away.
  // But just in case, we return null or a loader.
  if (!report) return null;

  return (
    <div className="dashboard-container">
      <Header user={user} onLogout={handleLogout} />
      <div className="report-details-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Dashboard
        </button>

        <div className="details-grid">
          <div className="image-section">
            <img src={report.scan} alt="Medical Scan" />
            <div className="mt-4" style={{ marginTop: "15px" }}>
              <a
                href={report.scan}
                target="_blank"
                rel="noopener noreferrer"
                className="view-link"
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Open Full Resolution Image ↗
              </a>
            </div>
          </div>

          <div className="info-section">
            <h2>{report.reportType || "Lab Report"}</h2>

            <div className="detail-item">
              <label>Hospital</label>
              <p>{report.hospital}</p>
            </div>

            <div className="detail-item">
              <label>Date</label>
              <p>{new Date(report.date).toLocaleDateString()}</p>
            </div>

            <div className="detail-item text-center">
              <label>Assigned Doctors</label>
              <div className="doctors-badges">
                {report.doctors && report.doctors.length > 0 ? (
                  report.doctors.map((doc, idx) => (
                    <span key={idx} className="doctor-badge">
                      {typeof doc === "object" ? doc.name : doc}
                    </span>
                  ))
                ) : (
                  <span>None assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="comments-section">
          <h3>Doctor Consultation Comments</h3>
          {report.comments && report.comments.length > 0 ? (
            <div className="comments-stack">
              {report.comments.map((comment, idx) => (
                <div key={idx} className="comment-card">
                  <div className="comment-header">
                    <span className="comment-doctor">{comment.doctorName}</span>
                    <span className="comment-date">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">No comments from doctors yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
