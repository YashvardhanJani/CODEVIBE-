// client/src/components/ForgetPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_BASE_URL from "../config/api";
import forgotPic from "../assets/forgotPassword.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email address";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setLoading(true);
    setResponseMsg("");
    setIsSuccess(false);

    try {
      // Send lowercase `email` — matches backend normalisation
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });
      setResponseMsg(res.data.message);
      setIsSuccess(true);
    } catch (err) {
      setResponseMsg(err.response?.data?.message || "Something went wrong. Please try again.");
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-image">
          <img
            src={forgotPic}
            alt="Forgot Password"
            loading="lazy"
            style={{ width: "100%", maxWidth: "500px", height: "auto" }}
          />
        </div>
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h1>Forgot Your Password?</h1>
            <p style={{ color: "#ccc", marginBottom: "1rem", fontSize: "0.9rem" }}>
              Enter your registered email and we'll send you a reset link.
            </p>

            <label htmlFor="forgot-email">EMAIL:</label>
            <input
              id="forgot-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
              aria-invalid={!!emailError}
              style={{ border: emailError ? "1px solid #ff4d6d" : "" }}
              required
            />
            {emailError && (
              <p style={{ color: "#ff4d6d", fontSize: "0.85rem", marginTop: "5px" }}>
                {emailError}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {responseMsg && (
              <p
                style={{
                  color: isSuccess ? "#4caf50" : "#ff4d6d",
                  marginTop: "1rem",
                  padding: "10px",
                  borderRadius: "6px",
                  backgroundColor: isSuccess ? "rgba(76,175,80,0.1)" : "rgba(255,77,109,0.1)",
                  border: `1px solid ${isSuccess ? "#4caf50" : "#ff4d6d"}`,
                  fontSize: "0.9rem",
                }}
              >
                {responseMsg}
              </p>
            )}

            <p style={{ marginTop: "1.5rem" }}>
              Back to <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
