import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Download, Share2, FileText, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { noticeService } from '../services/notice.service';
import type { Circular } from '../types';
import SEO from '../components/SEO';
import './NoticeDetail.css';

const NoticeDetail: React.FC = () => {
  const { slugId } = useParams<{ slugId: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Circular | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotice = async () => {
      if (!slugId) return;
      try {
        setLoading(true);
        // Extract ID from slug-id
        const parts = slugId.split('-');
        const id = parts[parts.length - 1]; // Assuming ID is the last part

        // Ensure id exists and is valid
        if (!id) throw new Error('Invalid URL');

        const data = await noticeService.getNoticeById(id);
        setNotice(data);
      } catch (err: any) {
        console.error(err);
        setError('Notice not found or it has been removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotice();
  }, [slugId]);

  const handleShare = async () => {
    if (!notice) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: notice.title,
          text: `Notice: ${notice.title}\n\n${notice.description || ''}`,
          url: window.location.href,
        });
      }
    } catch (err) { }
  };

  const downloadFile = (file: string, name: string) => {
    const link = document.createElement('a');
    link.href = file;
    link.download = name;
    if (!file.startsWith('data:')) {
      link.target = '_blank';
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="nd-page">
        <div className="nd-loading">
          <Loader2 size={32} className="animate-spin" />
          <p style={{ marginTop: 16 }}>Loading notice...</p>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="nd-page" style={{ textAlign: 'center', paddingTop: 80 }}>
        <FileText size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h2>{error || 'Notice not found'}</h2>
        <button className="nd-btn nd-btn-secondary" style={{ width: 'auto', margin: '24px auto' }} onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const category = notice.category || 'Circulars';
  const expires = formatDistanceToNow(new Date(notice.expiryDate), { addSuffix: true });

  // JSON-LD Article Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": notice.title,
    "description": notice.description,
    "image": notice.posterImage || undefined,
    "datePublished": new Date(notice.uploadDate).toISOString(),
    "author": {
      "@type": "Person",
      "name": notice.createdBy
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jeppiaar Institute of Technology",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/noticelogo.png`
      }
    }
  };

  return (
    <div className="nd-page">
      <SEO
        title={`${notice.title} | JIT Notice`}
        description={notice.description || `Official notice regarding ${notice.title} from Jeppiaar Institute of Technology.`}
        type="article"
        image={notice.posterImage || '/noticelogo.png'}
        schema={schema}
      />

      <header className="nd-header">
        <div className="nd-header-inner">
          <button className="nd-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft size={16} /> Back
          </button>
          <button className="nd-share-btn" onClick={handleShare} aria-label="Share notice">
            <Share2 size={16} /> Share
          </button>
        </div>
      </header>

      <main className="nd-main">
        <article className="nd-card">
          <div className="nd-meta-top">
            <span className="nd-category-badge">{category}</span>
          </div>

          <h1 className="nd-title">{notice.title}</h1>

          <div className="nd-meta-row">
            <div className="nd-meta-item" title="Date Published">
              <Calendar size={16} />
              <time dateTime={notice.uploadDate}>{format(new Date(notice.uploadDate), 'MMM dd, yyyy')}</time>
            </div>
            <div className="nd-meta-item" title="Expiry Date">
              <Clock size={16} />
              <span>Exp {expires}</span>
            </div>
          </div>

          {notice.posterImage && (
            <img
              src={notice.posterImage}
              alt={`Poster for ${notice.title}`}
              className="nd-poster"
              loading="lazy"
            />
          )}

          <div className="nd-desc">
            {notice.description}
          </div>

          <div className="nd-actions">
            {notice.posterImage && (
              <button
                className="nd-btn nd-btn-secondary"
                onClick={() => downloadFile(notice.posterImage!, notice.title + '.png')}
              >
                <Download size={16} /> Download Image
              </button>
            )}
            {notice.pdfFile && (
              <>
                <button
                  className="nd-btn nd-btn-primary"
                  onClick={() => window.open(notice.pdfFile!, '_blank')}
                >
                  <FileText size={16} /> View PDF
                </button>
                <button
                  className="nd-btn nd-btn-secondary"
                  onClick={() => downloadFile(notice.pdfFile!, notice.pdfName ?? 'notice.pdf')}
                >
                  <Download size={16} /> Download PDF
                </button>
              </>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};

export default NoticeDetail;
