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
  Brain,
  Cpu,
  Database,
  Binary,
  Network,
  Code,
  Laptop,
  Server,
  Cloud,
  GraduationCap,
  BookOpen,
  Briefcase,
  Settings,
  Microscope,
  Award
} from 'lucide-react';
import { useCirculars } from '../../context/CircularContext';
import type { Circular } from '../../types';
import { format, formatDistanceToNow } from 'date-fns';
import './AIDSDashboard.css';

/* ────── Frontend Inference Helpers ────── */
const CATEGORIES = [
  { name: 'All', icon: null },
  { name: 'Academic', icon: <BookOpen size={14} /> },
  { name: 'Exam', icon: <FileText size={14} /> },
  { name: 'Placement', icon: <Briefcase size={14} /> },
  { name: 'Workshop', icon: <Settings size={14} /> },
  { name: 'Hackathon', icon: <Code size={14} /> },
  { name: 'Research', icon: <Microscope size={14} /> },
  { name: 'Seminar', icon: <Award size={14} /> },
  { name: 'Events', icon: <Calendar size={14} /> },
  { name: 'Circulars', icon: <FileText size={14} /> }
];

const getPriority = (c: Circular): 'urgent' | 'important' | 'normal' => {
  const text = `${c.title} ${c.description || ''} ${c.eventName || ''}`.toLowerCase();
  if (/(urgent|immediate|deadline|mandatory)/.test(text)) return 'urgent';
  if (/(important|attention|exam|placement|hackathon)/.test(text)) return 'important';
  return 'normal';
};

const getCategory = (c: Circular): string => {
  const text = `${c.title} ${c.description || ''} ${c.eventName || ''}`.toLowerCase();
  if (/(hackathon|coding|competition)/.test(text)) return 'Hackathon';
  if (/(research|paper|publication|journal)/.test(text)) return 'Research';
  if (/(seminar|guest lecture)/.test(text)) return 'Seminar';
  if (/(exam|test|assessment|quiz)/.test(text)) return 'Exam';
  if (/(placement|interview|job|recruitment)/.test(text)) return 'Placement';
  if (/(workshop|training)/.test(text)) return 'Workshop';
  if (/(event|fest|celebration|symposium)/.test(text)) return 'Events';
  if (/(academic|class|syllabus)/.test(text)) return 'Academic';
  return 'Circulars';
};

const getRotation = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return ((Math.abs(hash) % 300) / 100) - 1.5;
};

const AIDSDashboard: React.FC = () => {
  const { getCircularsForDept } = useCirculars();

  const allAidCirculars = useMemo(() => {
    return getCircularsForDept('Artificial Intelligence and Data Science').filter((c) => c.status === 'active');
  }, [getCircularsForDept]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNotice, setSelectedNotice] = useState<Circular | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredCirculars = useMemo(() => {
    return allAidCirculars.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const category = getCategory(c);
      const matchCategory = selectedCategory === 'All' || category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [allAidCirculars, searchQuery, selectedCategory]);

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
    <div className="ai-wrapper">
      
      {/* ────────────── TOP SIGNBOARD ────────────── */}
      <div className="ai-signboard-wood">
        <div className="ai-signboard-inner">
          <div className="screw tl" />
          <div className="screw tr" />
          <div className="screw bl" />
          <div className="screw br" />

          {/* Decorative AI/DS Icons Background */}
          <Brain className="ai-sign-bg-icon" size={32} style={{ top: 10, left: 100 }} />
          <Database className="ai-sign-bg-icon" size={24} style={{ top: 50, left: 70 }} />
          <Network className="ai-sign-bg-icon" size={28} style={{ top: 15, right: 90 }} />
          <Cpu className="ai-sign-bg-icon" size={22} style={{ top: 55, right: 60 }} />
          <Binary className="ai-sign-bg-icon" size={20} style={{ bottom: 10, left: 130 }} />
          <Server className="ai-sign-bg-icon" size={18} style={{ bottom: 10, right: 120 }} />
          <Cloud className="ai-sign-bg-icon" size={26} style={{ top: 25, left: 150 }} />
          <Laptop className="ai-sign-bg-icon" size={20} style={{ top: 25, right: 150 }} />

          <div className="ai-signboard-top">
            <img src="/jitnotice.png" alt="JIT Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '4px' }} />
            <div style={{ textAlign: 'left' }}>
              <h1 className="ai-sign-title">AI&DS DEPARTMENT</h1>
              <div className="ai-sign-subtitle">DIGITAL NOTICE BOARD</div>
            </div>
          </div>

          <div className="ai-sign-meta">
            <div className="ai-meta-item">
              <Calendar size={14} />
              <span>{format(new Date(), 'MMM dd, yyyy')}</span>
            </div>
            <div className="ai-meta-divider" />
            <div className="ai-meta-item">
              <FileText size={14} />
              <span>{allAidCirculars.length} Active Notices</span>
            </div>
            <div className="ai-meta-divider" />
            <div className="ai-meta-item">
              <GraduationCap size={14} />
              <span>Academic Year 2025 - 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────── SEARCH & FILTERS ────────────── */}
      <div className="ai-controls">
        <div className="ai-search-row">
          <div className="ai-search-box">
            <Search size={18} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="ai-filter-btn">
            <Filter size={16} /> Filters
          </button>
        </div>
        <div className="ai-filter-chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`ai-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.icon}
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────── CORK BOARD ────────────── */}
      <main className="ai-cork-board">
        <div className="ai-board-glass" />
        {filteredCirculars.length === 0 ? (
          <>
            <div className="ai-sticky-note">
              <div className="ai-push-pin pin-red" style={{ top: -6 }} />
              Keep Learning<br/>🚀
            </div>
            <div style={{ margin: 'auto', width: '100%', maxWidth: '340px' }}>
              <div className="ai-paper ai-torn-bottom">
                <div className="ai-push-pin pin-cyan" />
                <div className="ai-paper-icon">
                  <FileText size={48} strokeWidth={1.5} />
                </div>
                <h3 className="ai-paper-title">No notices found</h3>
                <p className="ai-paper-subtitle">Try adjusting your search<br/>or category filter.</p>
              </div>
            </div>
            <div className="ai-bottom-strip ai-torn-top ai-torn-bottom">
              <div className="ai-push-pin pin-cyan" style={{ top: 12, left: 16 }} />
              <div className="ai-push-pin pin-cyan" style={{ top: 12, left: 'auto', right: 16 }} />
              <div className="ai-strip-left">
                <Bell size={24} color="#6B7280" />
                <div>
                  <h4 className="ai-strip-title">Get instant updates</h4>
                  <p className="ai-strip-subtitle">New notices will appear here.</p>
                </div>
              </div>
              <button className="ai-strip-refresh" onClick={handleRefresh}>
                <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="ai-papers-grid">
            {paginatedCirculars.map((c) => {
              const rot = getRotation(c.id);
              const prio = getPriority(c);
              const expires = formatDistanceToNow(new Date(c.expiryDate), { addSuffix: true });

              return (
                <div
                  key={c.id}
                  className="ai-paper ai-torn-bottom"
                  style={{ transform: `rotate(${rot}deg)` }}
                  onClick={() => setSelectedNotice(c)}
                >
                  <div className={`ai-push-pin pin-${prio === 'urgent' ? 'red' : prio === 'important' ? 'purple' : 'cyan'}`} />
                  
                  <h3 className="ai-paper-title" style={{ textAlign: 'left', marginTop: 16 }}>{c.title}</h3>
                  <div className="ai-paper-subtitle" style={{ textAlign: 'left', marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, lineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description || 'No description provided.'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', borderTop: '1px dashed #E5E7EB', paddingTop: 8 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12}/> {format(new Date(c.uploadDate), 'MMM dd')}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12}/> Exp {expires}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentPage < totalPages && (
            <div ref={observerRef} className="ai-pagination-sentinel" style={{ height: '40px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
              <div className="spinner sm" style={{ borderTopColor: 'var(--text-dark, #333)' }}></div>
            </div>
          )}
        </>
      )}
    </main>

      {/* ────────────── FOOTER ────────────── */}
      

      {/* ────────────── NOTICE MODAL ────────────── */}
      {selectedNotice && (
        <div className="ai-modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="ai-modal-paper" onClick={(e) => e.stopPropagation()}>
            <button className="ai-modal-close" onClick={() => setSelectedNotice(null)}>
              <X size={20} />
            </button>
            <div style={{ marginBottom: 16, borderBottom: '1px dashed #E5E7EB', paddingBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--ai-primary)', fontWeight: 600, marginBottom: 8 }}>{getCategory(selectedNotice)}</div>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, color: 'var(--ai-text-dark)' }}>{selectedNotice.title}</h2>
              <div style={{ fontSize: 13, color: 'var(--ai-text-muted)', display: 'flex', gap: 12 }}>
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
            
            <div style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ai-text-dark)', marginBottom: 24, whiteSpace: 'pre-wrap' }}>
              {selectedNotice.description}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {selectedNotice.posterImage && (
                <button onClick={() => downloadFile(selectedNotice.posterImage!, selectedNotice.title + '.png')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--ai-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Download size={16} /> Download Poster
                </button>
              )}
              {selectedNotice.pdfFile && (
                <>
                  <button onClick={() => openPdf(selectedNotice.pdfFile!)} style={{ flex: 1, padding: '10px', background: 'var(--ai-primary)', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <FileText size={16} /> View PDF
                  </button>
                  <button onClick={() => downloadFile(selectedNotice.pdfFile!, selectedNotice.pdfName ?? 'notice.pdf')} style={{ flex: 1, padding: '10px', background: 'white', color: 'var(--ai-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Download size={16} /> Download PDF
                  </button>
                </>
              )}
              <button onClick={() => handleShare(selectedNotice)} style={{ padding: '10px', background: 'white', color: 'var(--ai-text-dark)', border: '1px solid #D1D5DB', borderRadius: 4, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
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

export default AIDSDashboard;
