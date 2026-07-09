// import React, { useState, useEffect, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   GraduationCap,
//   ArrowLeft,
//   FileText,
//   Calendar,
//   Clock,
//   Download,
//   ExternalLink,
//   X,
//   ZoomIn,
//   ZoomOut,
//   RotateCcw,
//   Maximize2,
// } from 'lucide-react';
// import { useCirculars } from '../context/CircularContext';
// import { DEPARTMENTS, DEPARTMENT_FULL_NAMES } from '../types';
// import type { Department } from '../types';
// import { format, formatDistanceToNow } from 'date-fns';

// /* ────── Helpers ────── */
// const openPdf = (base64: string) => {
//   const byteStr = atob(base64.split(',')[1]);
//   const ab = new ArrayBuffer(byteStr.length);
//   const ia = new Uint8Array(ab);
//   for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
//   const blob = new Blob([ab], { type: 'application/pdf' });
//   window.open(URL.createObjectURL(blob), '_blank');
// };

// const downloadPdf = (base64: string, name: string) => {
//   const link = document.createElement('a');
//   link.href = base64;
//   link.download = name;
//   link.click();
// };

// /* ────── Image Lightbox ────── */
// interface LightboxProps {
//   src: string;
//   title: string;
//   onClose: () => void;
// }

// const ImageLightbox: React.FC<LightboxProps> = ({ src, title, onClose }) => {
//   const [zoom, setZoom] = useState(1);
//   const [dragging, setDragging] = useState(false);
//   const [pos, setPos] = useState({ x: 0, y: 0 });
//   const [startPos, setStartPos] = useState({ x: 0, y: 0 });

//   /* ESC key to close */
//   useEffect(() => {
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') onClose();
//       if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 4));
//       if (e.key === '-') setZoom((z) => Math.max(z - 0.25, 0.5));
//       if (e.key === '0') { setZoom(1); setPos({ x: 0, y: 0 }); }
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [onClose]);

//   /* Prevent body scroll */
//   useEffect(() => {
//     document.body.style.overflow = 'hidden';
//     return () => { document.body.style.overflow = ''; };
//   }, []);

//   const handleMouseDown = (e: React.MouseEvent) => {
//     if (zoom <= 1) return;
//     setDragging(true);
//     setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
//   };
//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!dragging) return;
//     setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
//   };
//   const handleMouseUp = () => setDragging(false);

//   const resetView = useCallback(() => { setZoom(1); setPos({ x: 0, y: 0 }); }, []);

//   return (
//     <div
//       className="lightbox-overlay"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       {/* Toolbar */}
//       <div className="lightbox-toolbar">
//         <span className="lightbox-title">{title}</span>
//         <div className="lightbox-tools">
//           <button
//             className="lb-tool-btn"
//             title="Zoom Out (−)"
//             onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
//           >
//             <ZoomOut size={18} />
//           </button>
//           <span className="lb-zoom-label">{Math.round(zoom * 100)}%</span>
//           <button
//             className="lb-tool-btn"
//             title="Zoom In (+)"
//             onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
//           >
//             <ZoomIn size={18} />
//           </button>
//           <button
//             className="lb-tool-btn"
//             title="Reset (0)"
//             onClick={resetView}
//           >
//             <RotateCcw size={18} />
//           </button>
//           <button
//             className="lb-tool-btn"
//             title="Fit to screen"
//             onClick={() => { setZoom(1); setPos({ x: 0, y: 0 }); }}
//           >
//             <Maximize2 size={18} />
//           </button>
//           <div className="lb-divider" />
//           <button className="lb-tool-btn lb-close" title="Close (Esc)" onClick={onClose}>
//             <X size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Image Stage */}
//       <div
//         className="lightbox-stage"
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}
//         style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
//       >
//         <img
//           src={src}
//           alt={title}
//           className="lightbox-img"
//           style={{
//             transform: `translate(${pos.x}px, ${pos.y}px) scale(${zoom})`,
//             transition: dragging ? 'none' : 'transform 0.2s ease',
//           }}
//           draggable={false}
//         />
//       </div>

//       {/* Hint */}
//       <div className="lightbox-hint">
//         Press <kbd>Esc</kbd> to close &nbsp;·&nbsp;
//         <kbd>+</kbd> / <kbd>−</kbd> to zoom &nbsp;·&nbsp;
//         <kbd>0</kbd> to reset &nbsp;·&nbsp; Drag to pan when zoomed
//       </div>
//     </div>
//   );
// };

// /* ────── Circular Card ────── */
// const CircularCard: React.FC<{
//   circular: {
//     id: string;
//     title: string;
//     eventName: string;
//     description: string;
//     posterImage: string | null;
//     pdfFile: string | null;
//     pdfName: string | null;
//     uploadDate: string;
//     expiryDate: string;
//   };
//   onImageClick: (src: string, title: string) => void;
// }> = ({ circular, onImageClick }) => {
//   const expiresIn = formatDistanceToNow(new Date(circular.expiryDate), {
//     addSuffix: true,
//   });

//   return (
//     <div className="circular-card">
//       {/* Poster */}
//       <div className="card-poster">
//         {circular.posterImage ? (
//           <div
//             className="card-poster-clickable"
//             onClick={() => onImageClick(circular.posterImage!, circular.title)}
//             title="Click to view full image"
//           >
//             <img src={circular.posterImage} alt={circular.title} />
//             <div className="poster-zoom-hint">
//               <ZoomIn size={22} />
//               <span>Click to view</span>
//             </div>
//           </div>
//         ) : (
//           <div className="card-poster-placeholder">
//             <FileText size={48} />
//           </div>
//         )}
//         {circular.eventName && (
//           <span className="card-event-badge">{circular.eventName}</span>
//         )}
//       </div>

//       {/* Body */}
//       <div className="card-body">
//         <h3 className="card-title">{circular.title}</h3>
//         {circular.description && (
//           <p className="card-desc">{circular.description}</p>
//         )}

//         <div className="card-meta-row">
//           <span className="card-meta-item">
//             <Calendar size={14} />
//             {format(new Date(circular.uploadDate), 'dd MMM yyyy')}
//           </span>
//           <span className="card-meta-item expires">
//             <Clock size={14} />
//             Expires {expiresIn}
//           </span>
//         </div>

//         {/* Actions */}
//         <div className="card-actions">
//           {circular.posterImage && (
//             <button
//               className="card-btn view-img"
//               onClick={() => onImageClick(circular.posterImage!, circular.title)}
//             >
//               <ZoomIn size={15} /> View Image
//             </button>
//           )}
//           {circular.pdfFile ? (
//             <>
//               <button
//                 className="card-btn primary"
//                 onClick={() => openPdf(circular.pdfFile!)}
//               >
//                 <ExternalLink size={15} /> View PDF
//               </button>
//               <button
//                 className="card-btn secondary"
//                 onClick={() =>
//                   downloadPdf(circular.pdfFile!, circular.pdfName ?? 'circular.pdf')
//                 }
//               >
//                 <Download size={15} /> Download
//               </button>
//             </>
//           ) : (
//             !circular.posterImage && (
//               <span className="no-pdf">No attachments</span>
//             )
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ────── Department Dashboard ────── */
// const DeptDashboard: React.FC = () => {
//   const { deptId } = useParams<{ deptId: string }>();
//   const navigate = useNavigate();
//   const { getCircularsForDept } = useCirculars();

//   const [lightbox, setLightbox] = useState<{ src: string; title: string } | null>(null);

//   const dept = DEPARTMENTS.find((d) => d === deptId) as Department | undefined;
//   const circulars = dept ? getCircularsForDept(dept) : [];

//   const openLightbox = useCallback((src: string, title: string) => {
//     setLightbox({ src, title });
//   }, []);

//   const closeLightbox = useCallback(() => {
//     setLightbox(null);
//   }, []);

//   if (!dept) {
//     return (
//       <div className="dept-not-found">
//         <GraduationCap size={64} />
//         <h2>Department not found</h2>
//         <button className="btn-primary" onClick={() => navigate('/')}>
//           Go Home
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="dept-page">
//       {/* Header */}
//       <header className="dept-header">
//         <div className="dept-header-inner">
//           <div className="dept-header-brand">
//             <GraduationCap size={32} />
//             <div>
//               <h1 className="dept-name">{dept} Department</h1>
//               <p className="dept-fullname">{DEPARTMENT_FULL_NAMES[dept]}</p>
//             </div>
//           </div>
//           <div className="dept-header-right">
//             <span className="active-count">
//               {circulars.length} active circular{circulars.length !== 1 ? 's' : ''}
//             </span>
//             <button className="back-btn" onClick={() => navigate(-1)}>
//               <ArrowLeft size={16} /> Back
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Grid */}
//       <main className="dept-main">
//         {circulars.length === 0 ? (
//           <div className="empty-state dept-empty">
//             <FileText size={64} />
//             <h2>No Active Circulars</h2>
//             <p>There are no circulars assigned to {dept} department at the moment.</p>
//           </div>
//         ) : (
//           <div className="circulars-grid">
//             {circulars.map((c) => (
//               <CircularCard key={c.id} circular={c} onImageClick={openLightbox} />
//             ))}
//           </div>
//         )}
//       </main>

//       <footer className="dept-footer">
//         <p>JIT – Jeppiaar Institute of Technology &copy; {new Date().getFullYear()}</p>
//       </footer>

//       {/* Lightbox */}
//       {lightbox && (
//         <ImageLightbox
//           src={lightbox.src}
//           title={lightbox.title}
//           onClose={closeLightbox}
//         />
//       )}
//     </div>
//   );
// };

// export default DeptDashboard;
