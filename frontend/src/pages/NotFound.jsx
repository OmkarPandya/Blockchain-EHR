import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  console.log("NotFound Component Rendering");
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-description">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => navigate("/dashboard")} className="notfound-btn">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
