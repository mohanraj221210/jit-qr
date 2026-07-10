import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  FileText,
  Bell,
  RefreshCw,
  Calendar,
  Clock,
  Download,
  Share2,
  X,
  Cog,
  Wrench,
  Hammer,
  Settings,
  Ruler,
  Factory,
  Bolt,
  Truck,
  Construction,
  GraduationCap,
  BookOpen,
  Briefcase,
  Microscope,
  Award,
  Globe,
  MapPin,
  Clipboard
} from 'lucide-react';
import { useCirculars } from '../../context/CircularContext';
import type { Circular } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import './MechanicalDashboard.css';

/* ────── Frontend Inference Helpers ────── */
const CATEGORIES = [
  { name: 'All', icon: null },
  { name: 'Academic', icon: <BookOpen size={14} /> },
  { name: 'Exam', icon: <FileText size={14} /> },
  { name: 'Placement', icon: <Briefcase size={14} /> },
  { name: 'Workshop', icon: <Settings size={14} /> },
  { name: 'Industrial Visit', icon: <MapPin size={14} /> },
  { name: 'Symposium', icon: <Globe size={14} /> },
  { name: 'Project Expo', icon: <Award size={14} /> },
  { name: 'Research', icon: <Microscope size={14} /> },
  { name: 'Events', icon: <Calendar size={14} /> },
  { name: 'Circulars', icon: <Clipboard size={14} /> }
];

const getPriority = (c: Circular): 'urgent' | 'important' | 'normal' => {
  const text = `${c.title} ${c.description || ''} ${c.eventName || ''}`.toLowerCase();
  if (/(urgent|immediate|deadline|mandatory)/.test(text)) return 'urgent';
  if (/(important|attention|exam|placement|symposium|visit|expo)/.test(text)) return 'important';
  return 'normal';
};

const getCategory = (c: Circular): string => {
  const text = `${c.title} ${c.description || ''} ${c.eventName || ''}`.toLowerCase();
  if (/(project expo|exhibition|expo)/.test(text)) return 'Project Expo';
  if (/(symposium|national level)/.test(text)) return 'Symposium';
  if (/(industrial visit|iv|tour|factory)/.test(text)) return 'Industrial Visit';
  if (/(research|paper|publication|journal)/.test(text)) return 'Research';
  if (/(exam|test|assessment|quiz)/.test(text)) return 'Exam';
  if (/(placement|interview|job|recruitment)/.test(text)) return 'Placement';
  if (/(workshop|training)/.test(text)) return 'Workshop';
  if (/(event|fest|celebration)/.test(text)) return 'Events';
  if (/(academic|class|syllabus)/.test(text)) return 'Academic';
  return 'Circulars';
};

const getRotation = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ((Math.abs(hash) % 300) / 100) - 1.5;
};

const MechanicalDashboard: React.FC = () => {
  const { getCircularsForDept } = useCirculars();

  // Load Mechanical active circulars
  const allMechCirculars = useMemo(() => {
    return getCircularsForDept('Mechanical Engineering').filter((c) => c.status === 'active');
  }, [getCircularsForDept]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Circular | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCirculars = useMemo(() => {
    return allMechCirculars.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const category = getCategory(c);
      const matchCategory = selectedCategory === 'All' || category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [allMechCirculars, searchQuery, selectedCategory]);

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
    } catch (err) {}
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

  const openPdf = (file: string) => {
    if (file.startsWith('data:')) {
      const byteStr = atob(file.split(',')[1]);
      const ab = new ArrayBuffer(byteStr.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
      const blob = new Blob([ab], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob), '_blank');
    } else {
      window.open(file, '_blank');
    }
  };

  useEffect(() => {
    if (selectedNotice) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedNotice]);

  return (
    <div className="mech-wrapper">
      
      {/* ────────────── TOP SIGNBOARD ────────────── */}
      <div className="mech-signboard-wood">
        <div className="mech-signboard-inner">
          <div className="screw tl" />
          <div className="screw tr" />
          <div className="screw bl" />
          <div className="screw br" />

          {/* Decorative Mechanical Icons Background */}
          <Cog className="mech-sign-bg-icon" size={32} style={{ top: 10, left: 100 }} />
          <Wrench className="mech-sign-bg-icon" size={24} style={{ top: 50, left: 70 }} />
          <Factory className="mech-sign-bg-icon" size={28} style={{ top: 15, right: 90 }} />
          <Hammer className="mech-sign-bg-icon" size={22} style={{ top: 55, right: 60 }} />
          <Ruler className="mech-sign-bg-icon" size={20} style={{ bottom: 10, left: 130 }} />
          <Construction className="mech-sign-bg-icon" size={18} style={{ bottom: 10, right: 120 }} />
          <Bolt className="mech-sign-bg-icon" size={26} style={{ top: 25, left: 150 }} />
          <Truck className="mech-sign-bg-icon" size={24} style={{ top: 75, left: 200 }} />

          <div className="mech-signboard-top">
            <img src="/jitnotice.png" alt="JIT Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '4px' }} />
            <div style={{ textAlign: 'left' }}>
              <h1 className="mech-sign-title">MECHANICAL<br/>ENGINEERING</h1>
              <div className="mech-sign-subtitle">DIGITAL NOTICE BOARD</div>
            </div>
          </div>

          <div className="mech-sign-meta">
            <div className="mech-meta-item">
              <Calendar size={14} />
              <span>{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
            <div className="mech-meta-divider" />
            <div className="mech-meta-item">
              <FileText size={14} />
              <span>{allMechCirculars.length} Active Notices</span>
            </div>
            <div className="mech-meta-divider" />
            <div className="mech-meta-item">
              <GraduationCap size={14} />
              <span>Academic Year 2025 - 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────── SEARCH & FILTERS ────────────── */}
      <div className="mech-controls">
        <div className="mech-search-row">
          <div className="mech-search-box">
            <Search size={18} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="mech-filter-btn">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="mech-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`mech-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────── CORK BOARD ────────────── */}
      <main className="mech-cork-board">
        <div className="mech-board-glass" />
        {filteredCirculars.length === 0 ? (
          <>
            <div className="mech-sticky-note">
              <div className="mech-push-pin pin-red" style={{ top: -6 }} />
              Design.<br/>Build.<br/>Innovate.
            </div>
            <div style={{ margin: 'auto', width: '100%', maxWidth: '340px' }}>
              <div className="mech-paper mech-torn-bottom">
                <div className="mech-push-pin pin-orange" />
                <div className="mech-paper-icon">
                  <Clipboard size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mech-paper-title" style={{ textAlign: 'center' }}>No notices found</h3>
                <p className="mech-paper-subtitle" style={{ textAlign: 'center' }}>Try adjusting your search<br/>or category filter.</p>
              </div>
            </div>
            <div className="mech-bottom-strip mech-torn-top mech-torn-bottom">
              <div className="mech-push-pin pin-gray" style={{ top: 12, left: 16 }} />
              <div className="mech-push-pin pin-gray" style={{ top: 12, left: 'auto', right: 16 }} />
              <div className="mech-strip-left">
                <Bell size={24} color="#6B7280" />
                <div>
                  <h4 className="mech-strip-title">Get instant updates</h4>
                  <p className="mech-strip-subtitle">New notices will appear automatically.</p>
                </div>
              </div>
              <button className="mech-strip-refresh" onClick={handleRefresh}>
                <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mech-papers-grid">
            {paginatedCirculars.map((c) => {
              const rot = getRotation(c.id);
              const prio = getPriority(c);
              const expires = formatDistanceToNow(new Date(c.expiryDate), { addSuffix: true });

              return (
                <div
                  key={c.id}
                  className="mech-paper mech-torn-bottom"
                  style={{ transform: `rotate(${rot}deg)` }}
                  onClick={() => setSelectedNotice(c)}
                >
                  <div className={`mech-push-pin pin-${prio === 'urgent' ? 'red' : prio === 'important' ? 'orange' : 'blue'}`} />
                  
                  {/* Priority Ribbon */}
                  {prio !== 'normal' && (
                    <div className={`mech-ribbon ${prio}`}>
                      {prio}
                    </div>
                  )}

                  <h3 className="mech-paper-title">{c.title}</h3>
                  <div className="mech-paper-subtitle">
                    {c.description || 'No description provided.'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', borderTop: '1px dashed #E5E7EB', paddingTop: 8, marginTop: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12}/> {format(new Date(c.uploadDate), 'MMM dd')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> Exp {expires}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <div ref={observerRef} className="mech-pagination-sentinel" style={{ height: '40px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
              <div className="spinner sm" style={{ borderTopColor: 'var(--text-dark, #333)' }}></div>
            </div>
          )}
        </>
      )}
    </main>

      {/* ────────────── FOOTER ────────────── */}
      

      {/* ────────────── NOTICE MODAL ────────────── */}
      {selectedNotice && (
        <div className="mech-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="mech-modal-paper" onClick={(e) => e.stopPropagation()}>
            <button className="mech-modal-close" onClick={() => setSelectedNotice(null)}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: 16, borderBottom: '1px dashed #E5E7EB', paddingBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--mech-primary)', fontWeight: 600, marginBottom: 8 }}>{getCategory(selectedNotice)}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, color: 'var(--mech-text-dark)' }}>{selectedNotice.title}</h2>
              <div style={{ fontSize: 13, color: 'var(--mech-text-muted)', display: 'flex', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {format(new Date(selectedNotice.uploadDate), 'MMM dd, yyyy')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> Exp: {format(new Date(selectedNotice.expiryDate), 'MMM dd')}</span>
              </div>
            </div>
            
            {selectedNotice.posterImage && (
              <div style={{ marginBottom: 20, textAlign: 'center', borderRadius: 6, overflow: 'hidden', border: '1px solid #E5E7EB', backgroundColor: '#f9fafb' }}>
                <img
                  src={selectedNotice.posterImage}
                  alt={selectedNotice.title}
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                />
              </div>
            )}

            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--mech-text-dark)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {selectedNotice.description}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {selectedNotice.posterImage && (
                <button onClick={() => downloadFile(selectedNotice.posterImage!, selectedNotice.title + '.png')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--mech-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Download size={16} /> Download Poster
                </button>
              )}
              {selectedNotice.pdfFile && (
                <>
                  <button onClick={() => openPdf(selectedNotice.pdfFile!)} style={{ flex: 1, padding: '10px', background: 'var(--mech-primary)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FileText size={16} /> View PDF
                  </button>
                  <button onClick={() => downloadFile(selectedNotice.pdfFile!, selectedNotice.pdfName ?? 'notice.pdf')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--mech-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Download size={16} /> Download PDF
                  </button>
                </>
              )}
              <button onClick={() => handleShare(selectedNotice)} style={{ padding: '10px', background: 'white', color: 'var(--mech-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Share2 size={16} />
              </button>
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

export default MechanicalDashboard;
