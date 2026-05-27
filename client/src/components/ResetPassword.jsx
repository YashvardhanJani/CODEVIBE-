// client/src/components/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API_BASE_URL from "../config/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setResponseMsg("Invalid or missing reset token. Please request a new password reset.");
    }
  }, [token]);

  const validate = () => {
    const next = {
      newPassword: newPassword.length < 6 ? "Password must be at least 6 characters" : "",
      confirmPassword: confirmPassword !== newPassword ? "Passwords do not match" : "",
    };
    setErrors(next);
    return !next.newPassword && !next.confirmPassword;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResponseMsg("");
    setIsSuccess(false);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setResponseMsg(res.data.message);
      if (res.data.success) {
        setIsSuccess(true);
        setTimeout(() => navigate("/login"), 2500);
      }
    } catch (err) {
      setResponseMsg(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-container">
        <div className="login-card">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h1>Reset Password</h1>

            {!token ? (
              <p style={{ color: "#ff4d6d", padding: "12px", border: "1px solid #ff4d6d", borderRadius: "6px" }}>
                Missing reset token.{" "}
                <Link to="/ForgetPassword">Request a new reset link →</Link>
              </p>
            ) : isSuccess ? (
              <p style={{ color: "#4caf50", padding: "12px", border: "1px solid #4caf50", borderRadius: "6px", backgroundColor: "rgba(76,175,80,0.1)" }}>
                {responseMsg} Redirecting to login…
              </p>
            ) : (
              <>
                <label htmlFor="new-password">NEW PASSWORD:</label>
                <div style={{ position: "relative" }}>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        newPassword: e.target.value.length < 6
                          ? "Password must be at least 6 characters"
                          : "",
                      }));
                    }}
                    style={{ border: errors.newPassword ? "1px solid #ff4d6d" : "" }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: "0.85rem", padding: 0 }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.newPassword && (
                  <p style={{ color: "#ff4d6d", fontSize: "0.85rem", marginTop: "5px" }}>{errors.newPassword}</p>
                )}

                <label htmlFor="confirm-password" style={{ marginTop: "12px" }}>CONFIRM PASSWORD:</label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value !== newPassword ? "Passwords do not match" : "",
                    }));
                  }}
                  style={{ border: errors.confirmPassword ? "1px solid #ff4d6d" : "" }}
                  required
                />
                {errors.confirmPassword && (
                  <p style={{ color: "#ff4d6d", fontSize: "0.85rem", marginTop: "5px" }}>{errors.confirmPassword}</p>
                )}

                <button type="submit" disabled={loading} style={{ marginTop: "16px" }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </button>

                {responseMsg && !isSuccess && (
                  <p style={{ color: "#ff4d6d", marginTop: "1rem", padding: "10px", borderRadius: "6px", backgroundColor: "rgba(255,77,109,0.1)", border: "1px solid #ff4d6d" }}>
                    {responseMsg}{" "}
                    <Link to="/ForgetPassword">Request a new link →</Link>
                  </p>
                )}
              </>
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

export default ResetPassword;
