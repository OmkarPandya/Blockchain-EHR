import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import { getReportById, assignDoctors, addDoctorComment } from "../api/report";
import { getDoctors } from "../api/auth";
import AssignDoctorModal from "../components/AssignDoctorModal";
import AddCommentModal from "../components/AddCommentModal";
import { toast } from "react-hot-toast";
import "./ReportDetails.css";

const ReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

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

    const fetchDoctors = async () => {
      try {
        const response = await getDoctors();
        setAllDoctors(response.data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      }
    };

    if (id) {
      fetchReport();
      if (user && user.user_type === "patient") {
        fetchDoctors();
      }
    }
  }, [id, navigate]);

  const openAssignModal = () => {
    if (!report) return;
    // Map existing doctors to wallets
    const wallets = (report.doctors || []).map((d) =>
      typeof d === "string" ? d : d.wallet
    );
    setSelectedDoctors(wallets);
    setShowAssignModal(true);
  };

  const toggleDoctorSelection = (wallet) => {
    if (selectedDoctors.includes(wallet)) {
      setSelectedDoctors(selectedDoctors.filter((w) => w !== wallet));
    } else {
      setSelectedDoctors([...selectedDoctors, wallet]);
    }
  };

  const handleAssignSubmit = async () => {
    setAssigning(true);
    try {
      await assignDoctors(report._id, selectedDoctors);
      toast.success("Doctors updated successfully!");
      setShowAssignModal(false);

      // Refresh report details
      const response = await getReportById(id);
      setReport(response.data);
    } catch (err) {
      toast.error("Failed to assign doctors");
    } finally {
      setAssigning(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return toast.error("Please enter comment text");

    setSubmittingComment(true);
    try {
      await addDoctorComment({
        reportId: report._id,
        doctorWallet: user.wallet,
        doctorName: user.name,
        content: commentText,
      });
      toast.success("Comment added successfully!");
      setShowCommentModal(false);
      
      // Refresh report details
      const response = await getReportById(id);
      setReport(response.data);
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) return <div className="loading">Loading details...</div>;
  if (!report) return null;

  return (
    <div className="dashboard-container">
      <div className="report-details-container">
        <div className="report-details-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back to Dashboard
          </button>

          {user.user_type === "patient" && (
            <button onClick={openAssignModal} className="manage-access-btn">
              Manage Access
            </button>
          )}

          {user.user_type === "doctor" && (
            <button 
              onClick={() => { setCommentText(""); setShowCommentModal(true); }} 
              className="manage-access-btn" 
              style={{ background: "var(--primary)" }}
            >
              + Add Comment
            </button>
          )}
        </div>

        <div className="details-grid">
          <div className="image-section">
            <object 
              data={report.scan} 
              aria-label="Medical Scan" 
              style={{ width: "100%", height: "400px", borderRadius: "12px", backgroundColor: "#f8fafc" }}
            >
              <iframe src={report.scan} style={{ width: "100%", height: "400px", border: "none" }} title="Report"></iframe>
            </object>
            <div className="mt-4" style={{ marginTop: "15px" }}>
              <button
                onClick={() => setShowImageModal(true)}
                className="view-link"
                style={{
                  color: "#6366f1",
                  textDecoration: "none",
                  fontWeight: "bold",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "1rem"
                }}
              >
                View Full Resolution Image ↗
              </button>
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

      <AssignDoctorModal
        show={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        allDoctors={allDoctors}
        selectedDoctors={selectedDoctors}
        onToggle={toggleDoctorSelection}
        onSubmit={handleAssignSubmit}
        assigning={assigning}
      />

      <AddCommentModal
        show={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        commentText={commentText}
        onCommentChange={setCommentText}
        onSubmit={handleCommentSubmit}
        submitting={submittingComment}
      />

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

export default ReportDetails;
