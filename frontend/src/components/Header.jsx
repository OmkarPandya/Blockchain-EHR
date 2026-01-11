import React from "react";
import "./Header.css";

const Header = ({ user, onLogout }) => {
  return (
    <div className="dashboard-header">
      <div className="header-info">
        <h1 className="header-title">Dashboard</h1>
        <p className="header-welcome">
          Welcome back, <strong>{user.name}</strong> ({user.user_type})
        </p>
        <small className="header-wallet">Wallet: {user.wallet}</small>
      </div>
      <button onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </div>
  );
};

export default Header;
