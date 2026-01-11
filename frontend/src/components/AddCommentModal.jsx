import React from "react";
import "./Modal.css";

const AddCommentModal = ({
  show,
  onClose,
  commentText,
  onCommentChange,
  onSubmit,
  submitting,
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Add Clinical Comment</h2>
        <p className="modal-description">
          Your comment will be visible to the patient and stored in their secure
          medical history.
        </p>
        <textarea
          value={commentText}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Enter your analysis or notes here..."
          className="modal-textarea"
        />
        <div className="modal-actions">
          <button onClick={onClose} className="modal-btn secondary">
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting || !commentText.trim()}
            className="modal-btn success"
          >
            {submitting ? "Submitting..." : "Submit Comment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCommentModal;
