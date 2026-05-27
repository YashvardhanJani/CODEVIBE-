import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Simple password strength indicator
  const getStrength = (pwd) => {
    if (!pwd) return { label: '', color: '' };
    if (pwd.length < 6) return { label: 'Too short', color: '#e94560' };
    if (pwd.length < 8) return { label: 'Weak', color: '#f6a623' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && pwd.length >= 10)
      return { label: 'Strong', color: '#38a169' };
    return { label: 'Medium', color: '#d69e2e' };
  };

  const strength = getStrength(form.password);
  const passwordsMatch =
    form.confirmPassword && form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save the new JWT returned by the server
        if (data.token) localStorage.setItem('token', data.token);

        setStatus('success');
        setMessage(data.message);

        // Redirect to dashboard (or login) after 2.5 seconds
        setTimeout(() => navigate('/dashboard'), 2500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  // No token in URL — guard
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="feedback-box error">
            <span className="feedback-icon">❌</span>
            <p>Invalid or missing reset token.</p>
          </div>
          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">
          <h1 className="brand-title">CodeVibe</h1>
          <p className="brand-subtitle">Learn. Code. Grow.</p>
        </div>

        <h2 className="auth-heading">Set a new password</h2>
        <p className="auth-description">
          Choose a strong password you haven't used before.
        </p>

        {/* Success State */}
        {status === 'success' ? (
          <div className="feedback-box success">
            <span className="feedback-icon">✅</span>
            <p>{message}</p>
            <p className="feedback-hint">Redirecting you to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form" noValidate>

            {/* Error Banner */}
            {status === 'error' && (
              <div className="feedback-box error">
                <span className="feedback-icon">⚠️</span>
                <p>{message}</p>
                {message.toLowerCase().includes('expired') && (
                  <Link to="/forgot-password" className="auth-link">
                    Request a new reset link →
                  </Link>
                )}
              </div>
            )}

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                New password
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoFocus
                  autoComplete="new-password"
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <p className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${
                  form.confirmPassword
                    ? passwordsMatch
                      ? 'input-valid'
                      : 'input-invalid'
                    : ''
                }`}
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                disabled={status === 'loading'}
              />
              {form.confirmPassword && !passwordsMatch && (
                <p className="input-error-msg">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="input-success-msg">✓ Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={
                status === 'loading' ||
                !form.password ||
                !form.confirmPassword ||
                !passwordsMatch
              }
            >
              {status === 'loading' ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>

          </form>
        )}

        {/* Footer */}
        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            ← Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
};

export default ResetPassword;