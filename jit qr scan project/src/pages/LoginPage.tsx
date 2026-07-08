import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';

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
    await new Promise((r) => setTimeout(r, 600));
    const success = login(email.trim(), password);
    if (success) {
      navigate('/admin');
    } else {
      setError('Invalid email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="college-logo-wrap">
            <GraduationCap size={56} color="#fff" strokeWidth={1.5} />
          </div>
          <h1 className="college-name">JIT Circular Portal</h1>
          <p className="college-tagline">
            Jeppiaar Institute of Technology
          </p>
          <div className="login-feature-list">
            <div className="login-feature-item">
              <span className="feature-dot" />
              Upload and manage department circulars
            </div>
            <div className="login-feature-item">
              <span className="feature-dot" />
              Target specific departments instantly
            </div>
            <div className="login-feature-item">
              <span className="feature-dot" />
              Auto-expiry with no manual cleanup
            </div>
            <div className="login-feature-item">
              <span className="feature-dot" />
              Real-time dashboard for all departments
            </div>
          </div>
        </div>
        <div className="login-left-circles">
          <div className="lc lc1" />
          <div className="lc lc2" />
          <div className="lc lc3" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <div className="admin-badge">
              <Shield size={16} />
              Admin Access
            </div>
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Sign in to manage circulars</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@jit.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className={`login-btn${loading ? ' loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="login-hint">
            <p>Default credentials:</p>
            <code>admin@jit.ac.in &nbsp;/&nbsp; Admin@123</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
