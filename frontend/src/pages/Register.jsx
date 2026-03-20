import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    user_type: "patient",
    wallet: "",
    ayushmanCardNumber: "",
  });
  const [availableWallets, setAvailableWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getWallets = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          setAvailableWallets(accounts);
          if (accounts.length > 0) {
            setFormData((prev) => ({ ...prev, wallet: accounts[0] }));
          }
        }
      } catch (err) {
        console.error("Error in Register.jsx initialization:", err);
        toast.error(
          "MetaMask connection failed. Please ensure it is installed and unlocked."
        );
      }
    };
    getWallets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.wallet) return toast.error("Please select a wallet address");

    setLoading(true);
    try {
      await registerUser(formData);
      toast.success("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Register for Blockchain EHR</h1>
      <form onSubmit={handleSubmit} className="auth-form-card">
        <div className="input-group">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="auth-input"
            required
          />
        </div>
        <div className="input-group">
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="auth-input"
            required
          />
        </div>
        <div className="input-group">
          <select
            name="user_type"
            onChange={handleChange}
            className="auth-select"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="laboratory">Laboratory</option>
          </select>
        </div>
        <div className="input-group">
          <input
            name="ayushmanCardNumber"
            type="text"
            placeholder="Ayushman Card Number (Optional)"
            onChange={handleChange}
            className="auth-input"
          />
        </div>
        <div className="input-group">
          <label
            className="input-label"
            style={{
              marginBottom: "8px",
              display: "block",
              color: "var(--slate-600)",
              fontWeight: "600",
              fontSize: "0.85rem",
              textAlign: "left",
            }}
          >
            Select Wallet Address:
          </label>
          <select
            name="wallet"
            value={formData.wallet}
            onChange={handleChange}
            className="auth-select"
            required
          >
            {availableWallets.length === 0 ? (
              <option value="">No wallets connected</option>
            ) : (
              availableWallets.map((wallet, index) => (
                <option key={wallet} value={wallet}>
                  Account {index + 1}: ({wallet.substring(0, 6)}...
                  {wallet.substring(wallet.length - 4)})
                </option>
              ))
            )}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="auth-btn submit-btn"
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="auth-switch">
          Already have an account?{" "}
          <span className="auth-link" onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
