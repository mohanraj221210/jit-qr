import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ExternalLink } from 'lucide-react';
import { DEPARTMENTS, DEPARTMENT_FULL_NAMES, DEPT_ROUTES } from '../types';
import { useCirculars } from '../context/CircularContext';

const DEPT_COLORS: Record<string, string> = {
  IT: '#2563EB',
  CSE: '#7C3AED',
  ECE: '#0891B2',
  'AI&DS': '#059669',
  Mechanical: '#D97706',
  CSBS: '#BE185D',
  MBA: '#0F766E',
};

const DepartmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { circulars } = useCirculars();

  return (
    <div className="depts-page">
      <header className="depts-header">
        <div className="depts-brand">
          <GraduationCap size={36} />
          <div>
            <h1>Department Circulars</h1>
            <p>Select a department to view its circulars</p>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/admin')}>
          ← Admin Dashboard
        </button>
      </header>

      <main className="depts-grid-wrap">
        <div className="depts-grid">
          {DEPARTMENTS.map((d) => {
            const count = circulars.filter(
              (c) => c.status === 'active' && c.departments.includes(d)
            ).length;
            const color = DEPT_COLORS[d] ?? '#2563EB';
            return (
              <div
                key={d}
                className="dept-card"
                style={{ '--dept-color': color } as React.CSSProperties}
                onClick={() => navigate(DEPT_ROUTES[d])}
              >
                <div className="dept-card-top">
                  <span className="dept-card-short">{d}</span>
                  <ExternalLink size={18} className="dept-card-arrow" />
                </div>
                <p className="dept-card-full">{DEPARTMENT_FULL_NAMES[d]}</p>
                <div className="dept-card-count">
                  <span className="count-badge" style={{ background: color }}>
                    {count}
                  </span>
                  <span>active circular{count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="dept-footer">
        <p>JIT – Jeppiaar Institute of Technology &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default DepartmentsPage;
