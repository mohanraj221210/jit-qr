import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const success = await login(email.trim(), password);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Mobile Hero Section — branding for smaller viewports */}
      <div className="mobile-hero">
        <div className="mobile-hero-bg" />
        <div className="mobile-hero-content">
          <img src="/noticelogo.png" alt="College Crest" className="mobile-crest-logo" />
          <div className="mobile-logo-text">
            <span className="mobile-logo-title-main">NOTICE BOARD</span>
            <span className="mobile-logo-title-sub">ADMIN PORTAL</span>
          </div>
        </div>
      </div>

      {/* Left Panel — Branding & Illustration (55% width) */}
      <div className="login-left">
        <div className="login-left-header">
          <img src="/noticelogo.png" alt="College Crest" className="college-logo-img" />
          <div className="logo-text">
            <span className="logo-title-main">NOTICE BOARD</span>
            <span className="logo-title-sub">ADMIN PORTAL</span>
          </div>
        </div>

        <div className="login-left-body">
          <h1 className="hero-heading">
            <span className="navy-text">Every Notice.</span>
            <span className="gold-text">Every Impact.</span>
          </h1>
          <div className="hero-subtitle">
            <p>
              You hold the power to inform, inspire and keep the entire campus connected.
            </p>
          </div>
        </div>

        <div className="login-left-illustration-wrap">
          <img
            src="/jitgate.jpeg"
            alt="Jeppiaar Institute of Technology Entrance"
            className="entrance-sketch-img"
          />
        </div>

        
      </div>

      {/* Right Panel — Login Card (45% width) */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="badge-logo-container">
              <img src="/noticelogo.png" alt="Campus Line Art Badge" className="badge-logo-img" />
            </div>
            <h2 className="login-title-redesign">
              Welcome Back, <br className="mobile-br" /><span>Admin!</span>
            </h2>
            <p className="login-subtitle-redesign">
              Sign in to continue to your admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form-redesign">
            <div className="form-group-redesign">
              <label className="form-label-redesign">Email / Username</label>
              <div className="input-wrapper-redesign">
                <input
                  type="email"
                  className="form-input-redesign"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} className="input-icon-redesign" />
              </div>
            </div>

            <div className="form-group-redesign">
              <label className="form-label-redesign">Password</label>
              <div className="input-wrapper-redesign">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input-redesign"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} className="input-icon-redesign" />
                <button
                  type="button"
                  className="eye-btn-redesign"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options-row">
              <label className="remember-me-wrap">
                <input type="checkbox" className="checkbox-custom" />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                className="forgot-password-link"
                onClick={(e) => e.preventDefault()}
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <div className="login-error-redesign">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn-redesign"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-redesign" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-hint-redesign">
            <div className="demo-badge">Demo Login</div>
            <div className="demo-creds">
              <div className="demo-cred-item">
                <span className="demo-icon">📧</span>
                <code>rohithvijay2205@gmail.com</code>
              </div>
              <div className="demo-cred-item">
                <span className="demo-icon">🔑</span>
                <code>12345678</code>
              </div>
            </div>
          </div>

          <div className="security-divider">
            <span>
             Admin Access
            </span>
          </div>

          <div className="login-footer-text">
            <div className="footer-secure">Secure Admin Access</div>
            <div className="footer-copyright">© 2026 Notice Board Admin Portal</div>
            <div className="footer-college-desktop">Jeppiaar Institute of Technology. All Rights Reserved.</div>
            <div className="footer-college-mobile">Jeppiaar Institute of Technology</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

