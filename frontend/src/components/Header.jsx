import React, { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import "./Header.css";

const Header = ({ onLogout, isNarrow }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <div className="app-header">
      <div className={`header-content ${isNarrow ? "narrow" : ""}`}>
        <div className="header-left">
          <h1 className="branding-title">Blockchain EHR</h1>
        </div>
        <div className="header-center">
          {/* Empty center for original layout or future use */}
        </div>
        <div className="header-right">
          <div className="user-menu-container">
            {user.name && (
              <span className="user-name-display" title={user.name}>
                {user.name}
              </span>
            )}
            <button
              className="menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ☰
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }} 
                  className="dropdown-item"
                >
                  Edit Profile
                </button>
                <button onClick={onLogout} className="dropdown-item logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <EditProfileModal 
        show={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </div>
  );
};

export default Header;
