import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  FileText,
  Bell,
  RefreshCw,
  Info,
  Calendar,
  Clock,
  Download,
  Share2,
  X,
  Laptop,
  Code,
  Briefcase,
  BarChart3,
  TrendingUp,
  Database,
  Network,
  Shield,
  Cloud,
  Brain,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Target,
  Award,
  Users,
  MapPin,
  Cpu,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useCirculars } from '../../context/CircularContext';
import type { Circular } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import './CSBSDashboard.css';

/* ────── Frontend Inference Helpers ────── */
const CATEGORIES = [
  { name: 'All', icon: null },
  { name: 'Academic', icon: <BookOpen size={14} /> },
  { name: 'Exam', icon: <FileText size={14} /> },
  { name: 'Placement', icon: <Briefcase size={14} /> },
  { name: 'Internship', icon: <TrendingUp size={14} /> },
  { name: 'Workshop', icon: <Target size={14} /> },
  { name: 'Hackathon', icon: <Code size={14} /> },
  { name: 'Seminar', icon: <Users size={14} /> },
  { name: 'Industry Visit', icon: <MapPin size={14} /> },
  { name: 'Certification', icon: <Award size={14} /> },
  { name: 'Events', icon: <Calendar size={14} /> },
  { name: 'Circulars', icon: <ClipboardList size={14} /> }
];

const getPriority = (c: Circular): 'urgent' | 'important' | 'normal' => {
  const text = `${c.title} ${c.description || ''} ${c.eventName || ''}`.toLowerCase();
  if (/(urgent|immediate|deadline|mandatory)/.test(text)) return 'urgent';
  if (/(important|attention|exam|placement|internship|hackathon|certification)/.test(text)) return 'important';
  return 'normal';
};

// Read category directly from the API field — never infer from keywords.
const getCategory = (c: Circular): string =>
  (c.category?.trim() || 'Circulars');


const getRotation = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ((Math.abs(hash) % 300) / 100) - 1.5;
};

const CSBSDashboard: React.FC = () => {
  const { getCircularsForDept } = useCirculars();

  // Load CSBS active circulars
  const allCsbsCirculars = useMemo(() => {
    return getCircularsForDept('Computer Science and Business System').filter((c) => c.status === 'active');
  }, [getCircularsForDept]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Circular | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingFile, setViewingFile] = useState<{ url: string; type: 'image' | 'pdf' } | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  const filteredCirculars = useMemo(() => {
    return allCsbsCirculars.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const category = getCategory(c);
      const matchCategory =
        selectedCategory === 'All' ||
        category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [allCsbsCirculars, searchQuery, selectedCategory]);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredCirculars.length / 10);

  const paginatedCirculars = useMemo(() => {
    return filteredCirculars.slice(0, currentPage * 10);
  }, [filteredCirculars, currentPage]);

  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCurrentPage((prev) => Math.min(prev + 1, totalPages));
        }
      },
      { rootMargin: '100px' }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [totalPages]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleShare = async (c: Circular) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: c.title,
          text: `Notice: ${c.title}\n\n${c.description || ''}`,
          url: window.location.href,
        });
      } else {
        alert('Sharing not supported on this browser.');
      }
    } catch (err) { }
  };

  const downloadFile = (file: string, name: string) => {
    if (file.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = file;
      link.download = name;
      link.click();
    } else {
      const link = document.createElement('a');
      link.href = file;
      link.target = '_blank';
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openViewer = (file: string, type: 'image' | 'pdf') => {
    if (file.startsWith('data:')) {
      const mimeMatch = file.match(/^data:([^;]+);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : (type === 'image' ? 'image/png' : 'application/pdf');
      const byteStr = atob(file.split(',')[1]);
      const ab = new ArrayBuffer(byteStr.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
      const blob = new Blob([ab], { type: mime });
      setViewingFile({ url: URL.createObjectURL(blob), type });
    } else {
      setViewingFile({ url: file, type });
    }
  };

  const openPdf = (file: string) => {
    openViewer(file, 'pdf');
  };

  useEffect(() => {
    if (selectedNotice) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedNotice]);

  return (
    <div className="csbs-wrapper">

      {/* ────────────── TOP SIGNBOARD ────────────── */}
      <div className="csbs-signboard-wood">
        <div className="csbs-signboard-inner">
          <div className="screw tl" />
          <div className="screw tr" />
          <div className="screw bl" />
          <div className="screw br" />

          {/* Decorative CSBS Icons Background */}
          <Laptop className="csbs-sign-bg-icon" size={32} style={{ top: 10, left: 100 }} />
          <BarChart3 className="csbs-sign-bg-icon" size={24} style={{ top: 50, left: 70 }} />
          <Database className="csbs-sign-bg-icon" size={28} style={{ top: 15, right: 90 }} />
          <Code className="csbs-sign-bg-icon" size={22} style={{ top: 55, right: 60 }} />
          <Briefcase className="csbs-sign-bg-icon" size={20} style={{ bottom: 10, left: 130 }} />
          <Shield className="csbs-sign-bg-icon" size={18} style={{ bottom: 10, right: 120 }} />
          <Brain className="csbs-sign-bg-icon" size={26} style={{ top: 25, left: 150 }} />
          <Network className="csbs-sign-bg-icon" size={20} style={{ top: 25, right: 150 }} />
          <Cloud className="csbs-sign-bg-icon" size={24} style={{ top: 75, left: 200 }} />

          <div className="csbs-signboard-top">
            <img src="/jitnotice.png" alt="JIT Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '4px' }} />
            <div style={{ textAlign: 'left' }}>
              <h1 className="csbs-sign-title">COMPUTER SCIENCE<br />& BUSINESS SYSTEMS</h1>
              <div className="csbs-sign-subtitle">DIGITAL NOTICE BOARD</div>
            </div>
          </div>

          <div className="csbs-sign-meta">
            <div className="csbs-meta-item">
              <Calendar size={14} />
              <span>{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
            <div className="csbs-meta-divider" />
            <div className="csbs-meta-item">
              <FileText size={14} />
              <span>{allCsbsCirculars.length} Active Notices</span>
            </div>
            <div className="csbs-meta-divider" />
            <div className="csbs-meta-item">
              <GraduationCap size={14} />
              <span>Academic Year 2025 - 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────── SEARCH & FILTERS ────────────── */}
      <div className="csbs-controls">
        <div className="csbs-search-row">
          <div className="csbs-search-box">
            <Search size={18} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="csbs-filter-btn">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="csbs-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`csbs-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────── CORK BOARD ────────────── */}
      <main className="csbs-cork-board">
        <div className="csbs-board-glass" />
        {filteredCirculars.length === 0 ? (
          <>
            <div className="csbs-sticky-note">
              <div className="csbs-push-pin pin-red" style={{ top: -6 }} />
              Innovate.<br />Integrate.<br />Lead.
            </div>
            <div style={{ margin: 'auto', width: '100%', maxWidth: '340px' }}>
              <div className="csbs-paper csbs-torn-bottom">
                <div className="csbs-push-pin pin-gold" />
                <div className="csbs-paper-icon">
                  <Cpu size={48} strokeWidth={1.5} />
                </div>
                <h3 className="csbs-paper-title" style={{ textAlign: 'center' }}>No notices found</h3>
                <p className="csbs-paper-subtitle" style={{ textAlign: 'center' }}>Try adjusting your search<br />or category filter.</p>
              </div>
            </div>
            <div className="csbs-bottom-strip csbs-torn-top csbs-torn-bottom">
              <div className="csbs-push-pin pin-gray" style={{ top: 12, left: 16 }} />
              <div className="csbs-push-pin pin-gray" style={{ top: 12, left: 'auto', right: 16 }} />
              <div className="csbs-strip-left">
                <Bell size={24} color="#6B7280" />
                <div>
                  <h4 className="csbs-strip-title">Get instant updates</h4>
                  <p className="csbs-strip-subtitle">New notices will appear automatically.</p>
                </div>
              </div>
              <button className="csbs-strip-refresh" onClick={handleRefresh}>
                <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="csbs-papers-grid">
              {paginatedCirculars.map((c) => {
                const rot = getRotation(c.id);
                const prio = getPriority(c);
                const expires = formatDistanceToNow(new Date(c.expiryDate), { addSuffix: true });

                return (
                  <div
                    key={c.id}
                    className="csbs-paper csbs-torn-bottom"
                    style={{ transform: `rotate(${rot}deg)` }}
                    onClick={() => setSelectedNotice(c)}
                  >
                    <div className={`csbs-push-pin pin-${prio === 'urgent' ? 'red' : prio === 'important' ? 'gold' : 'blue'}`} />

                    {/* Priority Ribbon */}
                    {prio !== 'normal' && (
                      <div className={`csbs-ribbon ${prio}`}>
                        {prio}
                      </div>
                    )}

                    <h3 className="csbs-paper-title">{c.title}</h3>
                    <div className="csbs-paper-subtitle">
                      {c.description || 'No description provided.'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', borderTop: '1px dashed #E5E7EB', paddingTop: 8, marginTop: 16 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {format(new Date(c.uploadDate), 'MMM dd')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Exp {expires}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentPage < totalPages && (
              <div ref={observerRef} className="csbs-pagination-sentinel" style={{ height: '40px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                <div className="spinner sm" style={{ borderTopColor: 'var(--text-dark, #333)' }}></div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ────────────── FOOTER ────────────── */}
      <footer className="csbs-footer">
        <div style={{ padding: 2 }}>
          <img src="/jitnotice.png" alt="JIT Logo" style={{ width: 32, height: 32, borderRadius: 2 }} />
        </div>
        <div className="csbs-footer-center">
          <p className="csbs-footer-text">Powered by JIT QR NOTICE</p>
          <p className="csbs-footer-subtext">&copy; {new Date().getFullYear()} Jeppiaar Institute of Technology</p>
        </div>
        <Info size={20} color="rgba(255,255,255,0.7)" />
      </footer>

      {/* ────────────── NOTICE MODAL ────────────── */}
      {selectedNotice && (
        <div className="csbs-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="csbs-modal-paper" onClick={(e) => e.stopPropagation()}>
            <button className="csbs-modal-close" onClick={() => setSelectedNotice(null)}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: 16, borderBottom: '1px dashed #E5E7EB', paddingBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--csbs-primary)', fontWeight: 600, marginBottom: 8 }}>{getCategory(selectedNotice)}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, color: 'var(--csbs-text-dark)' }}>{selectedNotice.title}</h2>
              <div style={{ fontSize: 13, color: 'var(--csbs-text-muted)', display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {format(new Date(selectedNotice.uploadDate), 'MMM dd, yyyy')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Exp: {format(new Date(selectedNotice.expiryDate), 'MMM dd')}</span>
              </div>
            </div>

            {selectedNotice.posterImage && (
              <div 
                onClick={() => openViewer(selectedNotice.posterImage!, 'image')}
                style={{ cursor: 'pointer', marginBottom: 20, textAlign: 'center', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#f9fafb' }}
                title="Click to view fullscreen"
              >
                <img
                  src={selectedNotice.posterImage}
                  alt={selectedNotice.title}
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px', textAlign: 'center' }}>
                  🔍 Click to view full screen
                </div>
              </div>
            )}

            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--csbs-text-dark)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {selectedNotice.description}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {selectedNotice.posterImage && (
                <button onClick={() => downloadFile(selectedNotice.posterImage!, selectedNotice.title + '.png')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--csbs-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Download size={16} /> Download Poster
                </button>
              )}
              {selectedNotice.pdfFile && (
                <>
                  <button onClick={() => openPdf(selectedNotice.pdfFile!)} style={{ flex: 1, padding: '10px', background: 'var(--csbs-primary)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FileText size={16} /> View PDF
                  </button>
                  <button onClick={() => downloadFile(selectedNotice.pdfFile!, selectedNotice.pdfName ?? 'notice.pdf')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--csbs-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Download size={16} /> Download PDF
                  </button>
                </>
              )}
              <button onClick={() => handleShare(selectedNotice)} style={{ padding: '10px', background: 'white', color: 'var(--csbs-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────── UNIFIED FILE VIEWER MODAL ────────────── */}
      {viewingFile && (
        <div className="pdf-viewer-overlay" onClick={() => { setViewingFile(null); setZoomScale(1); }}>
          <div className="pdf-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h3>${viewingFile.type === 'image' ? 'Circular Image' : 'Circular Document'}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  className="pdf-viewer-close" 
                  onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))}
                  title="Zoom Out"
                  style={{ marginRight: '4px' }}
                >
                  <ZoomOut size={18} />
                </button>
                <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  ${Math.round(zoomScale * 100)}%
                </span>
                <button 
                  className="pdf-viewer-close" 
                  onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))}
                  title="Zoom In"
                  style={{ marginRight: '16px' }}
                >
                  <ZoomIn size={18} />
                </button>
                <button 
                  className="pdf-viewer-close" 
                  onClick={() => setZoomScale(1)}
                  title="Reset Zoom"
                  style={{ marginRight: '16px' }}
                >
                  Reset
                </button>
                <button className="pdf-viewer-close" onClick={() => { setViewingFile(null); setZoomScale(1); }}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="pdf-viewer-body" style={{ overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              ${viewingFile.type === 'image' ? (
                <div style={{ 
                  overflow: 'auto', 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img
                    src={viewingFile.url}
                    alt="Circular Content"
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.2s ease',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease'
                }}>
                  <iframe
                    src={viewingFile.url}
                    title="Circular Document"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-anim { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default CSBSDashboard;
