import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LogOut,
  GraduationCap,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit2,
  Plus,
  X,
  Calendar,
  Image,
  FilePlus,
  Search,
  ExternalLink,
  AlignLeft,
  Menu,
  BarChart3,
  Filter,
  PieChart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCirculars } from '../context/CircularContext';
import { DEPARTMENTS, DEPARTMENT_FULL_NAMES, DEPT_ROUTES } from '../types';
import type { Department, Circular } from '../types';
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns';

/* ───────────── Helpers ───────────── */
const generateId = () => `cir_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* ───────────── Stat Card ───────────── */
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);

/* ───────────── Upload Modal ───────────── */
const UploadModal: React.FC<{
  onClose: () => void;
  editCircular?: Circular;
}> = ({ onClose, editCircular }) => {
  const { addNewCircular, editCircular: doEdit } = useCirculars();
  const [title, setTitle] = useState(editCircular?.title ?? '');
  const [eventName, setEventName] = useState(editCircular?.eventName ?? '');
  const [description, setDescription] = useState(editCircular?.description ?? '');
  const [selectedDepts, setSelectedDepts] = useState<Department[]>(
    editCircular?.departments ?? []
  );
  const [posterPreview, setPosterPreview] = useState<string | null>(
    editCircular?.posterImage ?? null
  );
  const [posterBase64, setPosterBase64] = useState<string | null>(
    editCircular?.posterImage ?? null
  );
  const [pdfBase64, setPdfBase64] = useState<string | null>(editCircular?.pdfFile ?? null);
  const [pdfName, setPdfName] = useState<string | null>(editCircular?.pdfName ?? null);

  const now = new Date();
  const defaultStart = format(now, "yyyy-MM-dd'T'HH:mm");
  const defaultExpiry = format(
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd'T'HH:mm"
  );

  const [startDate, setStartDate] = useState(
    editCircular?.startDate
      ? format(new Date(editCircular.startDate), "yyyy-MM-dd'T'HH:mm")
      : defaultStart
  );
  const [expiryDate, setExpiryDate] = useState(
    editCircular?.expiryDate
      ? format(new Date(editCircular.expiryDate), "yyyy-MM-dd'T'HH:mm")
      : defaultExpiry
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const toggleDept = (d: Department) =>
    setSelectedDepts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const handlePosterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(['Poster must be an image file.']);
      return;
    }
    const b64 = await toBase64(file);
    setPosterBase64(b64);
    setPosterPreview(b64);
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(['Only PDF files are allowed.']);
      return;
    }
    const b64 = await toBase64(file);
    setPdfBase64(b64);
    setPdfName(file.name);
  };

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Circular title is required.');
    if (selectedDepts.length === 0) errs.push('Select at least one department.');
    if (!expiryDate) errs.push('Expiry date & time is required.');
    if (startDate && expiryDate && new Date(expiryDate) <= new Date(startDate))
      errs.push('Expiry must be after start date.');
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    const circular: Circular = {
      id: editCircular?.id ?? generateId(),
      title,
      eventName,
      description,
      posterImage: posterBase64,
      pdfFile: pdfBase64,
      pdfName,
      departments: selectedDepts,
      uploadDate: editCircular?.uploadDate ?? new Date().toISOString(),
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      status: new Date(expiryDate) > new Date() ? 'active' : 'expired',
      createdBy: 'admin@jit.ac.in',
    };

    if (editCircular) {
      doEdit(circular);
    } else {
      addNewCircular(circular);
    }
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box upload-modal">
        <div className="modal-header">
          <h2>{editCircular ? 'Edit Circular' : 'Upload New Circular'}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body upload-form">
          {errors.length > 0 && (
            <div className="form-errors">
              {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
            </div>
          )}

          {/* Basic Info */}
          <div className="form-section">
            <h3 className="section-title"><AlignLeft size={16} /> Circular Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Circular Title *</label>
                <input
                  className="f-input"
                  type="text"
                  placeholder="e.g. Tech Fest 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Event Name</label>
                <input
                  className="f-input"
                  type="text"
                  placeholder="e.g. Annual Symposium"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="f-input f-textarea"
                placeholder="Enter circular description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="form-section">
            <h3 className="section-title"><Image size={16} /> Attachments</h3>
            <div className="form-row">
              {/* Poster */}
              <div className="upload-zone" onClick={() => posterRef.current?.click()}>
                {posterPreview ? (
                  <div className="poster-preview-wrap">
                    <img src={posterPreview} alt="poster" className="poster-preview-img" />
                    <span className="poster-change-label">Click to change</span>
                  </div>
                ) : (
                  <>
                    <Image size={32} className="upload-icon" />
                    <p>Click to upload poster image</p>
                    <span>PNG, JPG, WEBP</span>
                  </>
                )}
                <input
                  ref={posterRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePosterChange}
                />
              </div>

              {/* PDF */}
              <div className="upload-zone" onClick={() => pdfRef.current?.click()}>
                {pdfName ? (
                  <>
                    <FileText size={32} className="upload-icon success-icon" />
                    <p className="pdf-name">{pdfName}</p>
                    <span>Click to change PDF</span>
                  </>
                ) : (
                  <>
                    <FilePlus size={32} className="upload-icon" />
                    <p>Click to upload PDF circular</p>
                    <span>PDF only</span>
                  </>
                )}
                <input
                  ref={pdfRef}
                  type="file"
                  accept="application/pdf"
                  style={{ display: 'none' }}
                  onChange={handlePdfChange}
                />
              </div>
            </div>
          </div>

          {/* Department Selection */}
          <div className="form-section">
            <h3 className="section-title"><Users size={16} /> Select Departments</h3>
            <div className="dept-grid">
              {DEPARTMENTS.map((d) => (
                <label key={d} className={`dept-check${selectedDepts.includes(d) ? ' checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedDepts.includes(d)}
                    onChange={() => toggleDept(d)}
                  />
                  <span className="dept-short">{d}</span>
                  <span className="dept-long">{DEPARTMENT_FULL_NAMES[d]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="form-section">
            <h3 className="section-title"><Calendar size={16} /> Schedule</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date & Time *</label>
                <input
                  className="f-input"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Expiry Date & Time *</label>
                <input
                  className="f-input"
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner sm" /> : editCircular ? 'Update Circular' : 'Publish Circular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ───────────── Preview Modal ───────────── */
const PreviewModal: React.FC<{ circular: Circular; onClose: () => void }> = ({
  circular,
  onClose,
}) => {
  const openPdf = () => {
    if (!circular.pdfFile) return;
    const byteStr = atob(circular.pdfFile.split(',')[1]);
    const ab = new ArrayBuffer(byteStr.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
    const blob = new Blob([ab], { type: 'application/pdf' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box preview-modal">
        <div className="modal-header">
          <h2>Preview: {circular.title}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="preview-body">
          {circular.posterImage && (
            <img src={circular.posterImage} alt="poster" className="preview-poster" />
          )}
          <div className="preview-meta">
            {circular.eventName && <p><strong>Event:</strong> {circular.eventName}</p>}
            {circular.description && <p><strong>Description:</strong> {circular.description}</p>}
            <p><strong>Departments:</strong> {circular.departments.join(', ')}</p>
            <p><strong>Published:</strong> {format(new Date(circular.uploadDate), 'dd MMM yyyy, hh:mm a')}</p>
            <p><strong>Expires:</strong> {format(new Date(circular.expiryDate), 'dd MMM yyyy, hh:mm a')}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`badge badge-${circular.status}`}>{circular.status.toUpperCase()}</span>
            </p>
          </div>
          {circular.pdfFile && (
            <button className="btn-primary preview-pdf-btn" onClick={openPdf}>
              <ExternalLink size={16} /> Open PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────── Admin Dashboard ───────────── */
const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { circulars, removeCircular } = useCirculars();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'circulars' | 'analytics'>('dashboard');
  const [analyticsStatus, setAnalyticsStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [analyticsTime, setAnalyticsTime] = useState<'all' | 'today' | 'weekly' | 'monthly'>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState<Circular | undefined>();
  const [previewTarget, setPreviewTarget] = useState<Circular | undefined>();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const totalCirculars = circulars.length;
  const activeCirculars = circulars.filter((c) => c.status === 'active').length;
  const expiredCirculars = circulars.filter((c) => c.status === 'expired').length;

  const filtered = circulars.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.departments.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    removeCircular(id);
    setDeleteConfirm(null);
  };

  const openEdit = (c: Circular) => {
    setEditTarget(c);
    setShowUpload(true);
  };

  const closeUpload = () => {
    setShowUpload(false);
    setEditTarget(undefined);
  };

  const recentUploads = [...circulars]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 5);

  return (
    <div className="admin-layout">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <GraduationCap size={28} />
          <span>JIT Portal</span>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item${activeTab === 'dashboard' ? ' active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); closeSidebar(); }}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            className={`nav-item${activeTab === 'analytics' ? ' active' : ''}`}
            onClick={() => { setActiveTab('analytics'); closeSidebar(); }}
          >
            <BarChart3 size={20} /> Analytics
          </button>
          <button
            className={`nav-item${activeTab === 'circulars' ? ' active' : ''}`}
            onClick={() => { setActiveTab('circulars'); closeSidebar(); }}
          >
            <FileText size={20} /> Circulars
          </button>
          <button
            className="nav-item"
            onClick={() => { navigate('/departments'); closeSidebar(); }}
          >
            <Users size={20} /> Departments
          </button>
        </nav>
        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1 className="page-title">
                {activeTab === 'dashboard' ? 'Dashboard Overview' : 
                 activeTab === 'analytics' ? 'Analytics & Reports' : 'Manage Circulars'}
              </h1>
              <p className="page-sub">Welcome back, Super Admin</p>
            </div>
          </div>
          <button className="btn-primary upload-trigger" onClick={() => setShowUpload(true)}>
            <Plus size={18} /> <span className="btn-label">New Circular</span>
          </button>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Stat Cards */}
            <div className="stats-grid">
              <StatCard label="Total Circulars" value={totalCirculars} icon={<FileText size={24} />} color="blue" />
              <StatCard label="Active" value={activeCirculars} icon={<CheckCircle size={24} />} color="green" />
              <StatCard label="Expired" value={expiredCirculars} icon={<XCircle size={24} />} color="red" />
              <StatCard label="Departments" value={DEPARTMENTS.length} icon={<Users size={24} />} color="purple" />
            </div>

            {/* Recent Uploads */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Uploads</h2>
              </div>
              {recentUploads.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} />
                  <p>No circulars uploaded yet.</p>
                  <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload First Circular</button>
                </div>
              ) : (
                <div className="recent-list">
                  {recentUploads.map((c) => (
                    <div className="recent-item" key={c.id}>
                      <div className="recent-thumb">
                        {c.posterImage
                          ? <img src={c.posterImage} alt="" />
                          : <FileText size={24} />}
                      </div>
                      <div className="recent-info">
                        <p className="recent-title">{c.title}</p>
                        <p className="recent-meta">
                          {c.departments.join(', ')} &bull;{' '}
                          {formatDistanceToNow(new Date(c.uploadDate), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={`badge badge-${c.status}`}>{c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Quick Links */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Department Dashboards</h2>
              </div>
              <div className="dept-links-grid">
                {DEPARTMENTS.map((d) => {
                  const count = circulars.filter(
                    (c) => c.status === 'active' && c.departments.includes(d)
                  ).length;
                  return (
                    <button
                      key={d}
                      className="dept-link-card"
                      onClick={() => navigate(DEPT_ROUTES[d])}
                    >
                      <span className="dept-link-name">{d}</span>
                      <span className="dept-link-count">{count} active</span>
                      <ExternalLink size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-toolbar">
              <div className="analytics-filters">
                <div className="filter-group">
                  <label><Filter size={14} /> Status</label>
                  <select 
                    value={analyticsStatus} 
                    onChange={(e) => setAnalyticsStatus(e.target.value as any)}
                  >
                    <option value="all">All Notices</option>
                    <option value="active">Active</option>
                    <option value="inactive">Expired</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label><Calendar size={14} /> Time Period</label>
                  <select 
                    value={analyticsTime} 
                    onChange={(e) => setAnalyticsTime(e.target.value as any)}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="weekly">This Week</option>
                    <option value="monthly">This Month</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card analytics-chart-card">
              <div className="card-header">
                <h2 className="card-title">Department-wise Uploads</h2>
              </div>
              <div className="chart-body">
                {(() => {
                  // Filter logic
                  const filteredAnalytics = circulars.filter(c => {
                    // Status filter
                    if (analyticsStatus === 'active' && c.status !== 'active') return false;
                    if (analyticsStatus === 'inactive' && c.status !== 'expired') return false;
                    
                    // Time filter
                    const uploadDate = new Date(c.uploadDate);
                    if (analyticsTime === 'today' && !isToday(uploadDate)) return false;
                    if (analyticsTime === 'weekly' && !isThisWeek(uploadDate)) return false;
                    if (analyticsTime === 'monthly' && !isThisMonth(uploadDate)) return false;
                    
                    return true;
                  });

                  // Aggregation
                  const deptCounts = DEPARTMENTS.map(d => {
                    const count = filteredAnalytics.filter(c => c.departments.includes(d)).length;
                    return { dept: d, name: DEPARTMENT_FULL_NAMES[d], count };
                  });

                  const maxCount = Math.max(...deptCounts.map(d => d.count), 1);
                  const totalCount = filteredAnalytics.length;
                  const totalSlices = deptCounts.reduce((sum, item) => sum + item.count, 0);

                  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
                  let cumulativePercent = 0;
                  const pieGradientArgs = deptCounts.map((item, i) => {
                    if (totalSlices === 0 || item.count === 0) return null;
                    const percent = (item.count / totalSlices) * 100;
                    const start = cumulativePercent;
                    cumulativePercent += percent;
                    const color = PIE_COLORS[i % PIE_COLORS.length];
                    return `${color} ${start}% ${cumulativePercent}%`;
                  }).filter(Boolean).join(', ');

                  const pieStyle = totalSlices > 0 && pieGradientArgs
                    ? { background: `conic-gradient(${pieGradientArgs})` }
                    : { background: '#e2e8f0' };

                  return (
                    <>
                      <div className="analytics-summary">
                        <div className="summary-box">
                          <h3>Total Matches</h3>
                          <div className="summary-val">{totalCount}</div>
                        </div>
                        {/* Could add more summary boxes if needed */}
                      </div>
                      
                      <div className="analytics-charts-grid">
                        {/* Bar Chart Column */}
                        <div className="chart-col">
                          <h3 className="chart-col-title"><BarChart3 size={16}/> Bar Chart</h3>
                          <div className="bar-chart-wrap">
                            {deptCounts.map(item => (
                              <div className="bar-row" key={item.dept}>
                                <div className="bar-label" title={item.name}>{item.dept}</div>
                                <div className="bar-track">
                                  <div 
                                    className="bar-fill" 
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                  >
                                    {item.count > 0 && <span className="bar-value-inner">{item.count}</span>}
                                  </div>
                                </div>
                                <div className="bar-value-outer">{item.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pie Chart Column */}
                        <div className="chart-col pie-col">
                          <h3 className="chart-col-title"><PieChart size={16}/> Distribution</h3>
                          <div className="pie-container">
                            <div className="pie-chart" style={pieStyle}></div>
                            {totalSlices > 0 ? (
                              <div className="pie-legend">
                                {deptCounts.map((item, i) => {
                                  if (item.count === 0) return null;
                                  return (
                                    <div className="legend-item" key={item.dept}>
                                      <span className="legend-color" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                                      <span className="legend-label">{item.dept}</span>
                                      <span className="legend-value">{item.count} ({((item.count / totalSlices) * 100).toFixed(0)}%)</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="no-data-msg">No data available for selected filters.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Circulars Tab */}
        {activeTab === 'circulars' && (
          <div className="circulars-content">
            <div className="circulars-toolbar">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search by title or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} />
                <p>{search ? 'No results found.' : 'No circulars yet.'}</p>
                {!search && (
                  <button className="btn-primary" onClick={() => setShowUpload(true)}>
                    Upload First Circular
                  </button>
                )}
              </div>
            ) : (
              <div className="circulars-table-wrap">
                <table className="circulars-table">
                  <thead>
                    <tr>
                      <th>Poster</th>
                      <th>Title</th>
                      <th>Departments</th>
                      <th>Uploaded</th>
                      <th>Expiry</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="table-thumb">
                            {c.posterImage
                              ? <img src={c.posterImage} alt="" />
                              : <FileText size={20} />}
                          </div>
                        </td>
                        <td>
                          <p className="table-title">{c.title}</p>
                          {c.eventName && <p className="table-sub">{c.eventName}</p>}
                        </td>
                        <td>
                          <div className="dept-tags">
                            {c.departments.map((d) => (
                              <span key={d} className="dept-tag">{d}</span>
                            ))}
                          </div>
                        </td>
                        <td className="table-date">{format(new Date(c.uploadDate), 'dd MMM yy')}</td>
                        <td className="table-date">{format(new Date(c.expiryDate), 'dd MMM yy, hh:mm a')}</td>
                        <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                        <td>
                          <div className="action-btns">
                            <button className="icon-btn blue" title="Preview" onClick={() => setPreviewTarget(c)}>
                              <Eye size={16} />
                            </button>
                            <button className="icon-btn green" title="Edit" onClick={() => openEdit(c)}>
                              <Edit2 size={16} />
                            </button>
                            <button className="icon-btn red" title="Delete" onClick={() => setDeleteConfirm(c.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upload / Edit Modal */}
      {showUpload && (
        <UploadModal onClose={closeUpload} editCircular={editTarget} />
      )}

      {/* Preview Modal */}
      {previewTarget && (
        <PreviewModal circular={previewTarget} onClose={() => setPreviewTarget(undefined)} />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-box confirm-modal">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="confirm-body">
              <XCircle size={48} className="confirm-icon" />
              <p>Are you sure you want to delete this circular? This action cannot be undone.</p>
              <div className="confirm-actions">
                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
