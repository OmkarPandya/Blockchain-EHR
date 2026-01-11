import React from "react";
import "./Header.css";

const Header = ({ onLogout, isNarrow }) => {
  const [showDropdown, setShowDropdown] = React.useState(false);

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
            <button
              className="menu-trigger"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              ☰
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={onLogout} className="dropdown-item logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
