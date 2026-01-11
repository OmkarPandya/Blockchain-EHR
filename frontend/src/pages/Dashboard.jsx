import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  getPatientReports,
  assignDoctors,
  getDoctorReports,
  addDoctorComment,
} from "../api/report";
import { getDoctors } from "../api/auth";

// Modular Components
import ReportCard from "../components/ReportCard";
import AssignDoctorModal from "../components/AssignDoctorModal";
import AddCommentModal from "../components/AddCommentModal";

// Styles
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Assign Doctor states
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [assigning, setAssigning] = useState(false);

  // Add Comment states
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReports();
      if (user.user_type === "patient") {
        fetchDoctors();
      }
    }
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let response;
      if (user.user_type === "patient") {
        response = await getPatientReports(user.wallet);
      } else if (user.user_type === "doctor") {
        response = await getDoctorReports(user.wallet);
      }

      if (response) {
        setReports(response.data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to fetch reports");
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

  const openAssignModal = (report) => {
    setSelectedReport(report);
    // Extract wallets if doctors are objects {wallet, name}
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
      await assignDoctors(selectedReport._id, selectedDoctors);
      toast.success("Doctors updated successfully!");
      setShowAssignModal(false);
      fetchReports();
    } catch (err) {
      toast.error("Failed to assign doctors");
    } finally {
      setAssigning(false);
    }
  };

  const openCommentModal = (report) => {
    setSelectedReport(report);
    setCommentText("");
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return alert("Please enter comment text");

    setSubmittingComment(true);
    try {
      await addDoctorComment({
        reportId: selectedReport._id,
        doctorWallet: user.wallet,
        doctorName: user.name,
        content: commentText,
      });
      toast.success("Comment added successfully!");
      setShowCommentModal(false);
      fetchReports();
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Lab Actions */}
      {user.user_type === "laboratory" && (
        <div className="lab-actions-container">
          <h2 className="section-title">Laboratory Actions</h2>
          <button
            onClick={() => navigate("/lab-upload")}
            className="full-width-action-btn"
          >
            + Upload New Lab Report
          </button>
        </div>
      )}

      {/* Reports View (Patients & Doctors) */}
      {(user.user_type === "patient" || user.user_type === "doctor") && (
        <div className="reports-view">
          <h2 className="reports-title">
            {user.user_type === "patient"
              ? "My Medical Reports"
              : "Reports Assigned to Me"}
          </h2>

          {loading ? (
            <p className="loading-text">Loading reports...</p>
          ) : reports.length > 0 ? (
            <div className="reports-grid">
              {reports.map((report) => (
                <ReportCard
                  key={report._id}
                  report={report}
                  user={user}
                  onAssign={openAssignModal}
                  onComment={openCommentModal}
                />
              ))}
            </div>
          ) : (
            <div className="empty-reports-state">
              <p className="empty-text">No reports assigned yet.</p>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};

export default Dashboard;
