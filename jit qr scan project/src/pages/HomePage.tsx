import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Laptop,
  Cpu,
  Radio,
  BrainCircuit,
  Wrench,
  Briefcase,
  Bell,
  ShieldCheck,
  Calendar,
  ChevronRight
} from 'lucide-react';
import './HomePage.css';

const DEPARTMENTS = [
  {
    name: 'Computer Science and Engineering',
    route: '/cse',
    icon: <Cpu size={28} strokeWidth={1.5} />,
  },
  {
    name: 'Information Technology',
    route: '/it',
    icon: <Laptop size={28} strokeWidth={1.5} />,
  },
  {
    name: 'Artificial Intelligence & Data Science',
    route: '/aids',
    icon: <BrainCircuit size={28} strokeWidth={1.5} />,
  },
  {
    name: 'Electronics & Communication Engineering',
    route: '/ece',
    icon: <Radio size={28} strokeWidth={1.5} />,
  },
  {
    name: 'Computer Science and Business Systems',
    route: '/csbs',
    icon: <Radio size={28} strokeWidth={1.5} />,
  },

  {
    name: 'Mechanical Engineering',
    route: '/mechanical',
    icon: <Wrench size={28} strokeWidth={1.5} />,
  },
  {
    name: 'Master of Business Administration',
    route: '/mba',
    icon: <Briefcase size={28} strokeWidth={1.5} />,
  },
];

const HomePage: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Jeppiaar Institute of Technology",
    "url": window.location.href,
    "logo": `${window.location.origin}/jitnotice.png`,
    "description": "Stay informed with official announcements, department notices, academic updates, events and circulars.",
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="realistic-wall">
      <SEO 
        title="JIT Notice Board | Official Digital Notice Board"
        description="Stay informed with official announcements, department notices, academic updates, events and circulars."
        schema={schema}
      />
      
      {/* Sleek Glass Navbar */}
      {/* <nav className="glass-navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <img src="/jitnotice.png" alt="JIT Logo" className="nav-logo" />
            <span className="nav-title">Jeppiaar Institute of Technology</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/" className="nav-link">Departments</Link>
            <Link to="/" className="nav-link">About</Link>
          </div>
        </div>
      </nav> */}

      {/* Main Notice Board Area */}
      <main className="board-environment">
        
        {/* The Wooden Frame */}
        <div className={`notice-board-frame ${mounted ? 'animate-in' : ''}`}>
          
          {/* The Cork/Felt Board Surface */}
          <div className="notice-board-surface">
            
            {/* Top Board Header */}
            <div className="board-header-note">
              <div className="pin top-left"></div>
              <div className="pin top-right"></div>
              <img src="/jitnotice.png" alt="JIT Seal" className="header-seal" />
              <h1>JIT Digital Notice Board</h1>
              <p>Official announcements, department notices, and academic circulars.</p>
            </div>

            {/* Departments Grid as Pinned Notes */}
            <div className="pinned-notes-grid">
              {DEPARTMENTS.map((dept, index) => {
                // Generate a slight random rotation for realism, but deterministic based on index
                const rotation = index % 2 === 0 ? -1.5 : 1.5;
                const offset = index % 3 === 0 ? 2 : (index % 3 === 1 ? -1 : 0);
                
                return (
                  <Link 
                    key={dept.name} 
                    to={dept.route}
                    className="pinned-note"
                    aria-label={`View ${dept.name} Notice Board`}
                    style={{ 
                      '--anim-delay': `${0.2 + (index * 0.1)}s`,
                      '--idle-rot': `${rotation}deg`,
                      '--idle-y': `${offset}px`
                    } as React.CSSProperties}
                  >
                    <div className="realistic-pin">
                      <div className="pin-head"></div>
                      <div className="pin-shadow"></div>
                    </div>
                    
                    <div className="note-content">
                      <div className="note-icon">
                        {dept.icon}
                      </div>
                      <h3 className="note-title">{dept.name}</h3>
                      <div className="note-footer">
                        <span>View Notices</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Bottom Info Strip - Pinned Memos */}
            <div className="info-memos-container">
               <div className="info-memo" style={{'--anim-delay': '1.2s', '--memo-rot': '-2deg'} as React.CSSProperties}>
                 <div className="tape"></div>
                 <ShieldCheck size={20} className="memo-icon" />
                 <div>
                   <h4>Official Updates</h4>
                   <p>Verified department notices</p>
                 </div>
               </div>
               
               <div className="info-memo" style={{'--anim-delay': '1.3s', '--memo-rot': '0deg'} as React.CSSProperties}>
                 <div className="tape"></div>
                 <Bell size={20} className="memo-icon" />
                 <div>
                   <h4>Real-Time</h4>
                   <p>Instant digital access</p>
                 </div>
               </div>

               <div className="info-memo" style={{'--anim-delay': '1.4s', '--memo-rot': '1.5deg'} as React.CSSProperties}>
                 <div className="tape"></div>
                 <Calendar size={20} className="memo-icon" />
                 <div>
                   <h4>Events & Circulars</h4>
                   <p>Stay updated on campus life</p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>

      <footer className="board-footer">
        <p>&copy; {new Date().getFullYear()} Jeppiaar Institute of Technology. Empowering Minds. Building Futures.</p>
      </footer>
    </div>
  );
};

export default HomePage;
