import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { loginWithWallet, lookupWallets } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "./Auth.css";

const Login = () => {
  const [wallet, setWallet] = useState("");
  const [walletNames, setWalletNames] = useState({});
  const [availableWallets, setAvailableWallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for already connected accounts on mount
  useEffect(() => {
    const checkConnected = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_accounts", []);
          if (accounts.length > 0) {
            setAvailableWallets(accounts);
            setWallet(accounts[0]);
            fetchWalletNames(accounts);
          }
        } catch (err) {
          console.error("Silent account check failed:", err);
        }
      }
    };
    checkConnected();
  }, []);

  const fetchWalletNames = async (accounts) => {
    try {
      const { data } = await lookupWallets(accounts);
      const namesMap = {};
      data.forEach((u) => {
        namesMap[u.wallet.toLowerCase()] = `${u.name} (${u.user_type})`;
      });
      setWalletNames(namesMap);
    } catch (err) {
      console.error("Failed to lookup names:", err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAvailableWallets(accounts);
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        fetchWalletNames(accounts);
        toast.success("Accounts fetched successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(wallet);
      const message = "Login to Blockchain EHR";
      const signature = await signer.signMessage(message);

      const response = await loginWithWallet(wallet, signature);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Blockchain EHR</h1>
      <div className="auth-card">
        {availableWallets.length > 0 ? (
          <div className="auth-form">
            <div
              className="input-group"
              style={{ marginBottom: "20px", width: "100%" }}
            >
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
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className="auth-select"
                style={{ width: "100%" }}
              >
                {availableWallets.map((w, index) => (
                  <option key={w} value={w}>
                    Account {index + 1}:{" "}
                    {walletNames[w.toLowerCase()] || "Not Registered"} (
                    {w.substring(0, 6)}...{w.substring(w.length - 4)})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="auth-btn primary-btn"
            >
              {loading ? "Check MetaMask..." : "Login with Wallet Signature"}
            </button>
            <p className="auth-switch">
              New user?{" "}
              <span className="auth-link" onClick={() => navigate("/register")}>
                Register here
              </span>
            </p>
          </div>
        ) : (
          <div className="auth-form">
            <button
              onClick={connectWallet}
              disabled={loading}
              className="auth-btn wallet-btn"
            >
              {loading ? "Connecting..." : "Connect Wallet"}
            </button>
            <p className="auth-switch">
              New user?{" "}
              <span className="auth-link" onClick={() => navigate("/register")}>
                Register here
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
