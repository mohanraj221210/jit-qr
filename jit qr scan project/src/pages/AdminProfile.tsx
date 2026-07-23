import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Save,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminProfile.css';
import { profileService } from '../services/profile.service';
import { useAuth } from '../context/AuthContext';



interface ProfileData {
  fullName: string;
  email: string;
  mobile: string;
  avatar: string | null;
  role: string;
  accountCreated: string;
  lastLogin: string;
  status: string;
  lastUpdated: string;
  adminId?: string;
  username?: string;
}

const defaultProfile: ProfileData = {
  fullName: 'Admin',
  email: 'admin@jit.ac.in',
  mobile: '+91 98765 43210',
  avatar: null,
  role: 'Admin',
  accountCreated: '15 Jan 2026',
  lastLogin: 'Today, 10:00 AM',
  status: 'Active',
  lastUpdated: '10 Jul 2026',
  adminId: 'AD-2026-001',
  username: 'admin'
};

interface AdminProfileProps {
  onBack: () => void;
}

/* ───────────── Campus Background Illustration ───────────── */
const CampusIllustrationProfile: React.FC = () => (
  <svg
    viewBox="0 0 960 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="ap-bg-svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="apfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ffaf00ff" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#ffaf00ff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <g stroke="#ffaf00ff" strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.8">
      {/* Ground lines */}
      <line x1="0" y1="260" x2="960" y2="260" strokeWidth="1.2" />
      <line x1="0" y1="266" x2="960" y2="266" strokeWidth="0.5" />
      {[20, 100, 180, 260, 340, 420, 500, 580, 660, 740, 820, 900].map((x, i) => (
        <line key={i} x1={x} y1="260" x2={x} y2="266" strokeWidth="0.3" />
      ))}

      {/* Campus silhouette lines */}
      {/* Left wing annex */}
      <rect x="50" y="190" width="100" height="70" />
      <line x1="45" y1="190" x2="155" y2="190" strokeWidth="1" />
      {[60, 75, 90, 105, 120, 135].map((x, i) => (
        <rect key={i} x={x} y="200" width="10" height="15" />
      ))}
      {[60, 75, 90, 105, 120, 135].map((x, i) => (
        <rect key={i} x={x} y="225" width="10" height="18" />
      ))}

      {/* Main central building elevation */}
      <rect x="350" y="100" width="260" height="160" strokeWidth="1.2" />
      <line x1="340" y1="100" x2="620" y2="100" strokeWidth="1.5" />
      {/* Portico columns */}
      {[390, 420, 450, 510, 540, 570].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="100" x2={x} y2="260" strokeWidth="1" />
          <line x1={x - 4} y1="103" x2={x + 4} y2="103" strokeWidth="0.7" />
          <line x1={x - 4} y1="256" x2={x + 4} y2="256" strokeWidth="0.7" />
        </g>
      ))}
      {/* Triangular pediment */}
      <path d="M380 100 L480 60 L580 100" strokeWidth="1.2" />
      <path d="M390 100 L480 68 L570 100" strokeWidth="0.6" />
      {/* Entry steps */}
      <line x1="370" y1="260" x2="590" y2="260" strokeWidth="1.2" />
      <line x1="375" y1="264" x2="585" y2="264" strokeWidth="0.9" />
      <line x1="380" y1="268" x2="580" y2="268" strokeWidth="0.6" />

      {/* Clock Tower */}
      <rect x="455" y="10" width="50" height="90" strokeWidth="1.2" />
      <circle cx="480" cy="40" r="15" strokeWidth="1" />
      <line x1="480" y1="25" x2="480" y2="40" strokeWidth="1" />
      <line x1="480" y1="40" x2="491" y2="46" strokeWidth="1" />
      {/* Belfry openings */}
      <rect x="465" y="65" width="12" height="20" rx="5" />
      <rect x="483" y="65" width="12" height="20" rx="5" />
      {/* Spire */}
      <path d="M455 10 L480 -25 L505 10" strokeWidth="1.2" />
      <line x1="480" y1="-25" x2="480" y2="-45" strokeWidth="1" />

      {/* Right wing annex */}
      <rect x="810" y="190" width="100" height="70" />
      <line x1="805" y1="190" x2="915" y2="190" strokeWidth="1" />
      {[820, 835, 850, 865, 880, 895].map((x, i) => (
        <rect key={i} x={x} y="200" width="10" height="15" />
      ))}
      {[820, 835, 850, 865, 880, 895].map((x, i) => (
        <rect key={i} x={x} y="225" width="10" height="18" />
      ))}

      {/* Landscaping / Trees */}
      <ellipse cx="200" cy="220" rx="20" ry="30" />
      <line x1="200" y1="240" x2="200" y2="260" strokeWidth="1" />
      <ellipse cx="760" cy="220" rx="20" ry="30" />
      <line x1="760" y1="240" x2="760" y2="260" strokeWidth="1" />

      {/* Birds */}
      <path d="M100 50 Q105 45 110 50" />
      <path d="M120 40 Q126 34 132 40" />
      <path d="M820 50 Q825 45 830 50" />
      <path d="M840 40 Q846 34 852 40" />
    </g>
  </svg>
);

export const AdminProfile: React.FC<AdminProfileProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);

  // Loading & submit states
  const [isSaving, setIsSaving] = useState(false);
  const { logout } = useAuth();

  // Validation errors
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    mobile?: string;
  }>({});

  // Fetch live profile details on mount
  const fetchProfile = async () => {
    try {
      const data = await profileService.getProfile();

      setFullName(data.name || '');
      setEmail(data.email || '');
      setMobile(data.phone || '');

      setProfile({
        fullName: data.name || '',
        email: data.email || '',
        mobile: data.phone || '',
        avatar: null,
        role: data.role || 'Admin',
        accountCreated: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 Jan 2026',
        lastLogin: data.lastLoginAt ? new Date(data.lastLoginAt).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Today, 10:00 AM',
        status: data.status || 'Active',
        lastUpdated: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '10 Jul 2026',
        adminId: data._id || (data.role === 'SuperAdmin' ? 'AD-2026-SUP' : 'AD-2026-001'),
        username: data.email ? data.email.split('@')[0] : 'admin'
      });
    } catch (err) {
      // Fall back to dummy profile data if unauthorized/offline
      setFullName(profile.fullName);
      setEmail(profile.email);
      setMobile(profile.mobile);

      const savedDesignation = localStorage.getItem('admin_designation') || 'Chief Administrator';
      const savedDepartment = localStorage.getItem('admin_department') || 'IT & Operations';
      const savedBio = localStorage.getItem('admin_bio') || 'Responsible for managing college notifications, QR code generation, access control, and user role management.';
      
      setDesignation(savedDesignation);
      setDepartment(savedDepartment);
      setBio(savedBio);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors: {
      fullName?: string;
      email?: string;
      mobile?: string;
      designation?: string;
      department?: string;
      bio?: string;
    } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    } else if (fullName.length > 100) {
      newErrors.fullName = 'Full Name cannot exceed 100 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (email.length > 100) {
      newErrors.email = 'Email cannot exceed 100 characters.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (mobile.length > 20) {
      newErrors.mobile = 'Mobile number cannot exceed 20 characters.';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(mobile.replace(/\s+/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number (10-15 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setMobile(profile.mobile);
    setDesignation(localStorage.getItem('admin_designation') || 'Chief Administrator');
    setDepartment(localStorage.getItem('admin_department') || 'IT & Operations');
    setBio(localStorage.getItem('admin_bio') || 'Responsible for managing college notifications, QR code generation, access control, and user role management.');
    setErrors({});
    setIsEditMode(false);
    toast.success('Changes discarded.');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please resolve validation errors before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile({
        name: fullName,
        email,
        phone: mobile
      });
      
      // Save local fields
      localStorage.setItem('admin_designation', designation.trim());
      localStorage.setItem('admin_department', department.trim());
      localStorage.setItem('admin_bio', bio.trim());

      // Update the local profile state directly to reflect changes immediately
      setProfile(prev => ({
        ...prev,
        fullName: updatedProfile.name || fullName,
        email: updatedProfile.email || email,
        mobile: updatedProfile.phone || mobile,
        username: updatedProfile.email ? updatedProfile.email.split('@')[0] : prev.username,
      }));

      // Ensure form state matches the updated data
      setFullName(updatedProfile.name || fullName);
      setEmail(updatedProfile.email || email);
      setMobile(updatedProfile.phone || mobile);

      toast.success('Profile updated successfully.');
      setIsEditMode(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile details.';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  

  const handleDeleteProfile = async () => {
    const confirm = window.confirm('Are you sure you want to delete your administrator account? This action cannot be undone.');
    if (!confirm) return;

    try {
      await profileService.deleteProfile();
      toast.success('Account deleted successfully.');
      onBack();
      logout();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete account.';
      toast.error(msg);
    }
  };

  // Get initials for profile fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="ap-container">
        <CampusIllustrationProfile />
        <header className="ap-header">
          <div className="ap-header-left">
            <div className="ap-skeleton-title" />
            <div className="ap-skeleton-subtitle" />
          </div>
        </header>
        <div className="ap-grid">
          <div className="ap-col-sidebar">
            <div className="ap-skeleton-card" style={{ height: '340px' }} />
            <div className="ap-skeleton-card" style={{ height: '220px' }} />
          </div>
          <div className="ap-col-main">
            <div className="ap-skeleton-card" style={{ height: '340px' }} />
            <div className="ap-skeleton-card" style={{ height: '280px' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ap-container">
      {/* Header */}
      <header className="ap-header">
        <div className="ap-header-left">
          <h2 className="ap-title">👤 Admin Profile</h2>
          <p className="ap-subtitle">Manage your administrator account information.</p>
        </div>
        <button type="button" className="ap-back-btn" onClick={onBack} aria-label="Back to dashboard">
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </header>

      <div className="ap-grid">
        {/* Left Column: Profile Card & Account Metadata */}
        <div className="ap-col-sidebar">
          {/* Main Profile Card */}
          <div className="ap-card ap-profile-card">
            <div className="ap-avatar-container">
              <div className="ap-avatar-wrapper">
                <div className="ap-avatar-placeholder">{getInitials(fullName || 'Admin')}</div>
              </div>
            </div>

            <div className="ap-profile-info">
              <h2 className="ap-profile-name">{fullName || 'Admin'}</h2>
              <p className="ap-profile-designation">{designation || 'Chief Administrator'}</p>
              <div className="ap-role-badge">
                <Shield size={12} />
                <span>{profile.role}</span>
              </div>
              <p className="ap-profile-dept">{department || 'IT & Operations'}</p>
              <p className="ap-profile-email">{email || 'admin@jit.ac.in'}</p>

              <div className="ap-profile-status-bar">
                <span className="ap-status-dot active"></span>
                <span className="ap-status-text">Online</span>
              </div>

              <div className="ap-profile-footer">
                <span className="ap-updated-label">Last updated:</span>
                <span className="ap-updated-val">{profile.lastUpdated}</span>
              </div>
            </div>
          </div>

          {/* Account Details Metadata Card */}
          <div className="ap-card ap-account-meta-card">
            <h3 className="ap-card-sec-title">Account Information</h3>
            <div className="ap-meta-list">
              <div className="ap-meta-item">
                <span className="ap-meta-label">Admin ID</span>
                <span className="ap-meta-val">{profile.adminId || 'AD-2026-001'}</span>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label">Username</span>
                <span className="ap-meta-val">@{profile.username || 'admin'}</span>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label">Administrator Role</span>
                <span className="ap-meta-val">{profile.role}</span>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label">Account Created</span>
                <span className="ap-meta-val">{profile.accountCreated}</span>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label">Last Login</span>
                <span className="ap-meta-val">{profile.lastLogin}</span>
              </div>
              <div className="ap-meta-item">
                <span className="ap-meta-label">Account Status</span>
                <span className="ap-meta-val status-active">{profile.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personal Information & Security Settings */}
        <div className="ap-col-main">
          {/* Personal Info Form */}
          <div className="ap-card ap-form-card">
            <h3 className="ap-card-sec-title">
              {isEditMode ? '📝 Edit Personal Information' : 'ℹ️ Personal Information'}
            </h3>

            <form onSubmit={handleSave} className="ap-form">
              <div className="ap-form-fields-grid">
                {/* Full Name */}
                <div className="ap-form-group">
                  <label htmlFor="fullName" className="ap-field-label">
                    Full Name
                  </label>
                  <div className={`ap-input-wrapper ${errors.fullName ? 'error' : ''} ${!isEditMode ? 'readonly' : ''}`}>
                    <User className="ap-field-icon" size={18} />
                    <input
                      id="fullName"
                      type="text"
                      className="ap-input"
                      placeholder="Enter full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      readOnly={!isEditMode}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.fullName && <p className="ap-validation-msg">{errors.fullName}</p>}
                </div>

                {/* Email Address */}
                <div className="ap-form-group">
                  <label htmlFor="email" className="ap-field-label">
                    Email Address
                  </label>
                  <div className={`ap-input-wrapper ${errors.email ? 'error' : ''} ${!isEditMode ? 'readonly' : ''}`}>
                    <Mail className="ap-field-icon" size={18} />
                    <input
                      id="email"
                      type="email"
                      className="ap-input"
                      placeholder="admin@jit.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      readOnly={!isEditMode}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.email && <p className="ap-validation-msg">{errors.email}</p>}
                </div>

                {/* Phone Number */}
                <div className="ap-form-group">
                  <label htmlFor="mobile" className="ap-field-label">
                    Phone Number
                  </label>
                  <div className={`ap-input-wrapper ${errors.mobile ? 'error' : ''} ${!isEditMode ? 'readonly' : ''}`}>
                    <Phone className="ap-field-icon" size={18} />
                    <input
                      id="mobile"
                      type="tel"
                      className="ap-input"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      readOnly={!isEditMode}
                      disabled={isSaving}
                    />
                  </div>
                  {errors.mobile && <p className="ap-validation-msg">{errors.mobile}</p>}
                </div>

                {/* Designation */}
               

                {/* Department */}
                

                {/* Bio/About */}
               
              </div>

              {/* Form Action Buttons */}
              {isEditMode ? (
                <div className="ap-form-actions">
                  <button
                    type="button"
                    className="ap-btn ap-btn-outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="ap-btn ap-btn-primary"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="ap-spinner"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="ap-form-actions">
                  <button
                    type="button"
                    className="ap-btn ap-btn-primary"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Danger Zone */}
          <div className="ap-card ap-danger-card">
            <h3 className="ap-card-sec-title">Danger Zone</h3>
            <p className="ap-card-sec-sub">Deletes your administrator account permanently. This action cannot be undone.</p>
            <div className="ap-danger-actions">
              <button
                type="button"
                className="ap-btn ap-btn-danger"
                onClick={handleDeleteProfile}
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
};
