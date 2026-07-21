import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import imageCompression from "browser-image-compression";
import { compressPdfFile, formatFileSize } from '../utils/CompressFile';
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
  Bell,
  Upload,
  MoreVertical,
  ArrowRight,
  User,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCirculars } from '../context/CircularContext';
import { DEPARTMENTS, DEPARTMENT_FULL_NAMES, DEPT_ROUTES, DEPARTMENT_SHORT_NAMES } from '../types';
import type { Department, Circular, NoticeUploadPayload } from '../types';
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns';
import './AdminDashboard.css';
import { AdminProfile } from './AdminProfile';
import { noticeService } from '../services/notice.service';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/* ───────────── Mini Sparkline ───────────── */
const Sparkline: React.FC<{ color: string }> = ({ color }) => {
  const pts = [3, 7, 4, 9, 6, 11, 8];
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const w = 72, h = 28;
  const toX = (i: number) => (i / (pts.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/* ───────────── Campus Illustration SVG (Sidebar)#ffa600ff ───────────── */
const CampusIllustrationSidebar: React.FC = () => (
  <svg
    viewBox="0 0 220 600"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: 'auto', opacity: 0.3, pointerEvents: 'none' }}
    aria-hidden="true"
  >
    <g stroke="#000000ff" strokeLinecap="round" strokeLinejoin="round">
      {/* ── GROUND & WALKWAY ── */}
      <line x1="0" y1="520" x2="220" y2="520" strokeWidth="1.4" />
      <line x1="0" y1="526" x2="220" y2="526" strokeWidth="0.5" />
      {[10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210].map((x, i) =>
        <line key={i} x1={x} y1="520" x2={x} y2="528" strokeWidth="0.35" />
      )}
      {/* ── FENCE ── */}
      <line x1="0" y1="540" x2="220" y2="540" strokeWidth="0.8" />
      <line x1="0" y1="546" x2="220" y2="546" strokeWidth="0.4" />
      {[8, 18, 28, 38, 48, 58, 68, 78, 88, 98, 108, 118, 128, 138, 148, 158, 168, 178, 188, 198, 208].map((x, i) =>
        <line key={i} x1={x} y1="533" x2={x} y2="546" strokeWidth="0.55" />
      )}
      {/* ── LAMP POST LEFT ── */}
      <line x1="28" y1="470" x2="28" y2="522" strokeWidth="0.9" />
      <line x1="28" y1="470" x2="40" y2="462" strokeWidth="0.8" />
      <circle cx="42" cy="460" r="4" strokeWidth="0.7" />
      <line x1="28" y1="484" x2="22" y2="484" strokeWidth="0.6" />
      <line x1="28" y1="496" x2="22" y2="496" strokeWidth="0.6" />
      {/* ── LAMP POST RIGHT ── */}
      <line x1="192" y1="470" x2="192" y2="522" strokeWidth="0.9" />
      <line x1="192" y1="470" x2="180" y2="462" strokeWidth="0.8" />
      <circle cx="178" cy="460" r="4" strokeWidth="0.7" />
      <line x1="192" y1="484" x2="198" y2="484" strokeWidth="0.6" />
      <line x1="192" y1="496" x2="198" y2="496" strokeWidth="0.6" />
      {/* ── TREES LEFT ── */}
      <line x1="15" y1="480" x2="15" y2="522" strokeWidth="1" />
      <ellipse cx="15" cy="462" rx="12" ry="19" strokeWidth="0.8" />
      <ellipse cx="15" cy="455" rx="8" ry="12" strokeWidth="0.5" />
      <path d="M3 472 Q15 465 27 472" strokeWidth="0.4" />
      {/* ── TREES RIGHT ── */}
      <line x1="205" y1="480" x2="205" y2="522" strokeWidth="1" />
      <ellipse cx="205" cy="462" rx="12" ry="19" strokeWidth="0.8" />
      <ellipse cx="205" cy="455" rx="8" ry="12" strokeWidth="0.5" />
      <path d="M193 472 Q205 465 217 472" strokeWidth="0.4" />
      {/* ── BUSHES ── */}
      <path d="M50 520 Q56 512 62 520 Q68 512 74 520" strokeWidth="0.65" />
      <path d="M145 520 Q152 511 159 520 Q165 511 172 520" strokeWidth="0.65" />
      {/* ── STEPS (entrance) ── */}
      <line x1="72" y1="520" x2="148" y2="520" strokeWidth="1.1" />
      <line x1="76" y1="516" x2="144" y2="516" strokeWidth="0.9" />
      <line x1="80" y1="512" x2="140" y2="512" strokeWidth="0.7" />
      <line x1="84" y1="508" x2="136" y2="508" strokeWidth="0.6" />
      {/* ── LEFT WING ── */}
      <rect x="10" y="400" width="55" height="112" strokeWidth="1.1" />
      {/* Wing floor divider */}
      <line x1="10" y1="450" x2="65" y2="450" strokeWidth="0.75" />
      {/* Wing cornice */}
      <line x1="7" y1="400" x2="68" y2="400" strokeWidth="1" />
      <line x1="7" y1="404" x2="68" y2="404" strokeWidth="0.4" />
      {/* Wing parapet */}
      {[12, 21, 30, 39, 48, 57].map((x, i) =>
        <rect key={i} x={x} y="392" width="6" height="9" strokeWidth="0.55" />
      )}
      <line x1="7" y1="392" x2="68" y2="392" strokeWidth="0.8" />
      {/* Wing windows floor 1 */}
      <rect x="17" y="410" width="14" height="18" strokeWidth="0.8" /><line x1="24" y1="410" x2="24" y2="428" strokeWidth="0.35" /><line x1="17" y1="419" x2="31" y2="419" strokeWidth="0.35" />
      <rect x="36" y="410" width="14" height="18" strokeWidth="0.8" /><line x1="43" y1="410" x2="43" y2="428" strokeWidth="0.35" /><line x1="36" y1="419" x2="50" y2="419" strokeWidth="0.35" />
      {/* Wing windows floor 2 */}
      <rect x="17" y="458" width="14" height="18" strokeWidth="0.8" /><line x1="24" y1="458" x2="24" y2="476" strokeWidth="0.35" /><line x1="17" y1="467" x2="31" y2="467" strokeWidth="0.35" />
      <rect x="36" y="458" width="14" height="18" strokeWidth="0.8" /><line x1="43" y1="458" x2="43" y2="476" strokeWidth="0.35" /><line x1="36" y1="467" x2="50" y2="467" strokeWidth="0.35" />
      {/* ── RIGHT WING ── */}
      <rect x="155" y="400" width="55" height="112" strokeWidth="1.1" />
      <line x1="155" y1="450" x2="210" y2="450" strokeWidth="0.75" />
      <line x1="152" y1="400" x2="213" y2="400" strokeWidth="1" />
      <line x1="152" y1="404" x2="213" y2="404" strokeWidth="0.4" />
      {[157, 166, 175, 184, 193, 202].map((x, i) =>
        <rect key={i} x={x} y="392" width="6" height="9" strokeWidth="0.55" />
      )}
      <line x1="152" y1="392" x2="213" y2="392" strokeWidth="0.8" />
      <rect x="162" y="410" width="14" height="18" strokeWidth="0.8" /><line x1="169" y1="410" x2="169" y2="428" strokeWidth="0.35" /><line x1="162" y1="419" x2="176" y2="419" strokeWidth="0.35" />
      <rect x="181" y="410" width="14" height="18" strokeWidth="0.8" /><line x1="188" y1="410" x2="188" y2="428" strokeWidth="0.35" /><line x1="181" y1="419" x2="195" y2="419" strokeWidth="0.35" />
      <rect x="162" y="458" width="14" height="18" strokeWidth="0.8" /><line x1="169" y1="458" x2="169" y2="476" strokeWidth="0.35" /><line x1="162" y1="467" x2="176" y2="467" strokeWidth="0.35" />
      <rect x="181" y="458" width="14" height="18" strokeWidth="0.8" /><line x1="188" y1="458" x2="188" y2="476" strokeWidth="0.35" /><line x1="181" y1="467" x2="195" y2="467" strokeWidth="0.35" />
      {/* ── CENTRAL MAIN BUILDING ── */}
      <rect x="62" y="345" width="96" height="167" strokeWidth="1.2" />
      {/* Floor dividers */}
      <line x1="62" y1="393" x2="158" y2="393" strokeWidth="0.8" />
      <line x1="62" y1="440" x2="158" y2="440" strokeWidth="0.8" />
      {/* Cornice */}
      <line x1="56" y1="345" x2="164" y2="345" strokeWidth="1.1" />
      <line x1="56" y1="349" x2="164" y2="349" strokeWidth="0.45" />
      {/* Dentil molding */}
      {[58, 65, 72, 79, 86, 93, 100, 107, 114, 121, 128, 135, 142, 149, 156].map((x, i) =>
        <rect key={i} x={x} y="339" width="4" height="6" strokeWidth="0.45" />
      )}
      <line x1="56" y1="338" x2="164" y2="338" strokeWidth="0.7" />
      {/* Balustrade top */}
      {[59, 66, 73, 80, 87, 94, 101, 108, 115, 122, 129, 136, 143, 150, 157].map((x, i) =>
        <line key={i} x1={x} y1="330" x2={x} y2="338" strokeWidth="0.5" />
      )}
      <line x1="56" y1="330" x2="164" y2="330" strokeWidth="0.8" />
      {/* Floor 1 windows (arched) */}
      {[68, 84, 100, 116, 132].map((x, i) => (
        <g key={i}>
          <rect x={x} y="355" width="14" height="22" strokeWidth="0.8" />
          <path d={`M${x} 361 Q${x + 7} 353 ${x + 14} 361`} strokeWidth="0.5" />
          <line x1={x + 7} y1="361" x2={x + 7} y2="377" strokeWidth="0.35" />
        </g>
      ))}
      {/* Floor 2 windows */}
      {[68, 84, 100, 116, 132].map((x, i) => (
        <g key={i}>
          <rect x={x} y="401" width="14" height="22" strokeWidth="0.8" />
          <line x1={x + 7} y1="401" x2={x + 7} y2="423" strokeWidth="0.35" />
          <line x1={x} y1="412" x2={x + 14} y2="412" strokeWidth="0.35" />
        </g>
      ))}
      {/* Floor 3 windows */}
      {[72, 91, 110, 129].map((x, i) => (
        <g key={i}>
          <rect x={x} y="448" width="13" height="20" strokeWidth="0.8" />
          <line x1={x + 6.5} y1="448" x2={x + 6.5} y2="468" strokeWidth="0.35" />
          <line x1={x} y1="458" x2={x + 13} y2="458" strokeWidth="0.35" />
        </g>
      ))}
      {/* Portico columns (x4) */}
      <line x1="80" y1="330" x2="80" y2="508" strokeWidth="0.85" />
      <line x1="96" y1="330" x2="96" y2="508" strokeWidth="0.85" />
      <line x1="124" y1="330" x2="124" y2="508" strokeWidth="0.85" />
      <line x1="140" y1="330" x2="140" y2="508" strokeWidth="0.85" />
      {/* Column caps & bases */}
      <line x1="75" y1="333" x2="85" y2="333" strokeWidth="0.8" />
      <line x1="91" y1="333" x2="101" y2="333" strokeWidth="0.8" />
      <line x1="119" y1="333" x2="129" y2="333" strokeWidth="0.8" />
      <line x1="135" y1="333" x2="145" y2="333" strokeWidth="0.8" />
      <line x1="75" y1="505" x2="85" y2="505" strokeWidth="0.8" />
      <line x1="91" y1="505" x2="101" y2="505" strokeWidth="0.8" />
      <line x1="119" y1="505" x2="129" y2="505" strokeWidth="0.8" />
      <line x1="135" y1="505" x2="145" y2="505" strokeWidth="0.8" />
      {/* Main door */}
      <rect x="97" y="472" width="26" height="40" rx="2" strokeWidth="1" />
      <path d="M97 478 Q110 470 123 478" strokeWidth="0.7" />
      <line x1="110" y1="478" x2="110" y2="512" strokeWidth="0.5" />
      {/* Pediment triangle */}
      <path d="M68 330 L110 305 L152 330" strokeWidth="1" />
      <path d="M75 330 L110 312 L145 330" strokeWidth="0.5" />
      {/* ── CLOCK TOWER ── */}
      {/* Tower shaft */}
      <rect x="88" y="195" width="44" height="135" strokeWidth="1" />
      {/* Tower cornice */}
      <line x1="83" y1="195" x2="137" y2="195" strokeWidth="1.1" />
      <line x1="83" y1="199" x2="137" y2="199" strokeWidth="0.45" />
      {[84, 88, 92, 96, 100, 104, 108, 112, 116, 120, 124, 128, 132].map((x, i) =>
        <rect key={i} x={x} y="189" width="3" height="6" strokeWidth="0.4" />
      )}
      <line x1="83" y1="188" x2="137" y2="188" strokeWidth="0.65" />
      {/* Tower belfry arches */}
      <rect x="94" y="250" width="14" height="20" rx="7" strokeWidth="0.8" />
      <rect x="112" y="250" width="14" height="20" rx="7" strokeWidth="0.8" />
      <line x1="103" y1="250" x2="103" y2="270" strokeWidth="0.35" />
      <line x1="121" y1="250" x2="121" y2="270" strokeWidth="0.35" />
      {/* Clock face */}
      <circle cx="110" cy="225" r="16" strokeWidth="1" />
      <circle cx="110" cy="225" r="13" strokeWidth="0.45" />
      {/* Hour marks */}
      <line x1="110" y1="209" x2="110" y2="213" strokeWidth="0.8" />
      <line x1="110" y1="237" x2="110" y2="241" strokeWidth="0.8" />
      <line x1="94" y1="225" x2="98" y2="225" strokeWidth="0.8" />
      <line x1="122" y1="225" x2="126" y2="225" strokeWidth="0.8" />
      {/* Clock hands */}
      <line x1="110" y1="213" x2="110" y2="225" strokeWidth="1" />
      <line x1="110" y1="225" x2="119" y2="232" strokeWidth="1" />
      <circle cx="110" cy="225" r="1.5" strokeWidth="0.6" />
      {/* Tower roof / pyramid */}
      <path d="M86 188 L110 142 L134 188" strokeWidth="1.1" />
      <path d="M92 188 L110 150 L128 188" strokeWidth="0.5" />
      {/* Spire */}
      <line x1="110" y1="142" x2="110" y2="112" strokeWidth="1.2" />
      <line x1="106" y1="117" x2="114" y2="117" strokeWidth="0.8" />
      <polygon points="110,104 106,114 114,114" strokeWidth="0.8" />
      {/* ── SKY / BIRDS ── */}
      <path d="M25 80 Q30 75 35 80" strokeWidth="0.75" />
      <path d="M42 65 Q48 59 54 65" strokeWidth="0.75" />
      <path d="M155 72 Q161 66 167 72" strokeWidth="0.75" />
      <path d="M170 90 Q174 85 178 90" strokeWidth="0.6" />
      <path d="M60 55 Q64 50 68 55" strokeWidth="0.6" />
      <path d="M140 50 Q145 44 150 50" strokeWidth="0.7" />
    </g>
  </svg>
);

/* ───────────── Campus Illustration SVG (Hero) ───────────── */
const CampusIllustrationHero: React.FC = () => (
  <svg
    viewBox="0 0 960 290"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: 'auto', maxWidth: '88%', opacity: 0.7, pointerEvents: 'none' }}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="hfade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffaf00ff" stopOpacity="0" />
        <stop offset="18%" stopColor="#ffaf00ff" stopOpacity="1" />
        <stop offset="85%" stopColor="#ffaf00ff" stopOpacity="1" />
        <stop offset="100%" stopColor="#ffaf00ff" stopOpacity="0.3" />
      </linearGradient>
    </defs>
    <g stroke="#ffaf00ff" strokeLinecap="round" strokeLinejoin="round">

      {/* ══ BIRDS IN SKY ══ */}
      <path d="M38 22 Q44 16 50 22" strokeWidth="0.9" />
      <path d="M58 12 Q65 6 72 12" strokeWidth="0.9" />
      <path d="M82 28 Q87 23 92 28" strokeWidth="0.75" />
      <path d="M110 16 Q115 11 120 16" strokeWidth="0.7" />
      <path d="M790 18 Q797 12 804 18" strokeWidth="0.9" />
      <path d="M820 30 Q825 25 830 30" strokeWidth="0.75" />
      <path d="M845 14 Q851 8 857 14" strokeWidth="0.85" />
      <path d="M875 24 Q879 20 883 24" strokeWidth="0.65" />
      <path d="M912 10 Q918 4 924 10" strokeWidth="0.8" />
      <path d="M940 22 Q944 17 948 22" strokeWidth="0.65" />
      <path d="M420 8 Q425 3 430 8" strokeWidth="0.7" />
      <path d="M460 20 Q465 15 470 20" strokeWidth="0.65" />

      {/* ══ GROUND LINE + WALKWAY ══ */}
      <line x1="0" y1="268" x2="960" y2="268" strokeWidth="1.5" stroke="url(#hfade)" />
      <line x1="0" y1="274" x2="960" y2="274" strokeWidth="0.6" stroke="url(#hfade)" />
      {[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920].map((x, i) =>
        <line key={i} x1={x} y1="268" x2={x} y2="276" strokeWidth="0.4" />
      )}

      {/* ══ FAR LEFT ANNEX ══ */}
      <rect x="14" y="210" width="94" height="58" strokeWidth="1.05" />
      <line x1="9" y1="210" x2="113" y2="210" strokeWidth="1" />
      <line x1="9" y1="215" x2="113" y2="215" strokeWidth="0.4" />
      {/* Parapet */}
      <line x1="9" y1="203" x2="113" y2="203" strokeWidth="0.8" />
      {[11, 19, 27, 35, 43, 51, 59, 67, 75, 83, 91, 99, 107].map((x, i) =>
        <rect key={i} x={x} y="197" width="5" height="7" strokeWidth="0.5" />
      )}
      <line x1="9" y1="196" x2="113" y2="196" strokeWidth="0.65" />
      {/* Windows */}
      <rect x="20" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="27.5" y1="222" x2="27.5" y2="242" strokeWidth="0.35" /><line x1="20" y1="232" x2="35" y2="232" strokeWidth="0.35" />
      <rect x="42" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="49.5" y1="222" x2="49.5" y2="242" strokeWidth="0.35" /><line x1="42" y1="232" x2="57" y2="232" strokeWidth="0.35" />
      <rect x="64" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="71.5" y1="222" x2="71.5" y2="242" strokeWidth="0.35" /><line x1="64" y1="232" x2="79" y2="232" strokeWidth="0.35" />
      <rect x="86" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="93.5" y1="222" x2="93.5" y2="242" strokeWidth="0.35" /><line x1="86" y1="232" x2="101" y2="232" strokeWidth="0.35" />

      {/* ══ LEFT CONNECTOR STEP ══ */}
      <line x1="108" y1="210" x2="108" y2="180" strokeWidth="1" />
      <line x1="108" y1="180" x2="168" y2="180" strokeWidth="0.8" />
      <rect x="108" y="180" width="64" height="88" strokeWidth="0.85" />
      <line x1="108" y1="224" x2="172" y2="224" strokeWidth="0.6" />
      <rect x="115" y="187" width="12" height="16" strokeWidth="0.7" /><line x1="121" y1="187" x2="121" y2="203" strokeWidth="0.3" />
      <rect x="133" y="187" width="12" height="16" strokeWidth="0.7" /><line x1="139" y1="187" x2="139" y2="203" strokeWidth="0.3" />
      <rect x="151" y="187" width="12" height="16" strokeWidth="0.7" /><line x1="157" y1="187" x2="157" y2="203" strokeWidth="0.3" />
      <rect x="115" y="231" width="12" height="16" strokeWidth="0.7" /><line x1="121" y1="231" x2="121" y2="247" strokeWidth="0.3" />
      <rect x="133" y="231" width="12" height="16" strokeWidth="0.7" />
      <rect x="151" y="231" width="12" height="16" strokeWidth="0.7" />

      {/* ══ LEFT MAIN WING ══ */}
      <rect x="168" y="158" width="118" height="110" strokeWidth="1.1" />
      <line x1="162" y1="158" x2="290" y2="158" strokeWidth="1.1" />
      <line x1="162" y1="163" x2="290" y2="163" strokeWidth="0.45" />
      <line x1="168" y1="204" x2="286" y2="204" strokeWidth="0.8" />
      {/* Parapet with balustrade */}
      {[164, 171, 178, 185, 192, 199, 206, 213, 220, 227, 234, 241, 248, 255, 262, 269, 276, 283].map((x, i) =>
        <line key={i} x1={x} y1="148" x2={x} y2="158" strokeWidth="0.5" />
      )}
      <line x1="162" y1="148" x2="290" y2="148" strokeWidth="0.8" />
      <line x1="162" y1="152" x2="290" y2="152" strokeWidth="0.4" />
      {/* Dentil row */}
      {[163, 169, 175, 181, 187, 193, 199, 205, 211, 217, 223, 229, 235, 241, 247, 253, 259, 265, 271, 277, 283].map((x, i) =>
        <rect key={i} x={x} y="141" width="3" height="8" strokeWidth="0.4" />
      )}
      <line x1="162" y1="140" x2="290" y2="140" strokeWidth="0.6" />
      {/* Windows floor 1 */}
      {[176, 200, 224, 252].map((x, i) => (
        <g key={i}>
          <rect x={x} y="168" width="16" height="22" strokeWidth="0.85" />
          <path d={`M${x} 174 Q${x + 8} 165 ${x + 16} 174`} strokeWidth="0.5" />
          <line x1={x + 8} y1="174" x2={x + 8} y2="190" strokeWidth="0.35" />
        </g>
      ))}
      {/* Windows floor 2 */}
      {[176, 200, 224, 252].map((x, i) => (
        <g key={i}>
          <rect x={x} y="212" width="16" height="22" strokeWidth="0.85" />
          <line x1={x + 8} y1="212" x2={x + 8} y2="234" strokeWidth="0.35" />
          <line x1={x} y1="223" x2={x + 16} y2="223" strokeWidth="0.35" />
        </g>
      ))}

      {/* ══ CENTRAL MAIN BUILDING ══ */}
      <rect x="286" y="105" width="232" height="163" strokeWidth="1.3" />
      {/* Floor dividers */}
      <line x1="286" y1="158" x2="518" y2="158" strokeWidth="0.9" />
      <line x1="286" y1="210" x2="518" y2="210" strokeWidth="0.9" />
      {/* Main cornice */}
      <line x1="278" y1="105" x2="526" y2="105" strokeWidth="1.2" />
      <line x1="278" y1="110" x2="526" y2="110" strokeWidth="0.45" />
      {/* Dentil molding */}
      {[280, 286, 292, 298, 304, 310, 316, 322, 328, 334, 340, 346, 352, 358, 364, 370, 376, 382, 388, 394, 400, 406, 412, 418, 424, 430, 436, 442, 448, 454, 460, 466, 472, 478, 484, 490, 496, 502, 508, 514, 520].map((x, i) =>
        <rect key={i} x={x} y="98" width="3" height="8" strokeWidth="0.4" />
      )}
      <line x1="278" y1="97" x2="526" y2="97" strokeWidth="0.65" />
      {/* Balustrade top */}
      {[280, 287, 294, 301, 308, 315, 322, 329, 336, 343, 350, 357, 364, 371, 378, 385, 392, 399, 406, 413, 420, 427, 434, 441, 448, 455, 462, 469, 476, 483, 490, 497, 504, 511, 518].map((x, i) =>
        <line key={i} x1={x} y1="87" x2={x} y2="97" strokeWidth="0.5" />
      )}
      <line x1="278" y1="87" x2="526" y2="87" strokeWidth="0.8" />
      {/* Floor 1 – arched windows */}
      {[296, 322, 348, 374, 400, 426, 452, 478].map((x, i) => (
        <g key={i}>
          <rect x={x} y="117" width="16" height="26" strokeWidth="0.85" />
          <path d={`M${x} 124 Q${x + 8} 115 ${x + 16} 124`} strokeWidth="0.55" />
          <line x1={x + 8} y1="124" x2={x + 8} y2="143" strokeWidth="0.35" />
        </g>
      ))}
      {/* Floor 2 windows */}
      {[300, 328, 356, 384, 412, 440, 468, 496].map((x, i) => (
        <g key={i}>
          <rect x={x} y="166" width="15" height="22" strokeWidth="0.85" />
          <line x1={x + 7.5} y1="166" x2={x + 7.5} y2="188" strokeWidth="0.35" />
          <line x1={x} y1="177" x2={x + 15} y2="177" strokeWidth="0.35" />
        </g>
      ))}
      {/* Floor 3 windows */}
      {[304, 334, 364, 394, 424, 454, 484].map((x, i) => (
        <g key={i}>
          <rect x={x} y="218" width="14" height="20" strokeWidth="0.8" />
          <line x1={x + 7} y1="218" x2={x + 7} y2="238" strokeWidth="0.35" />
          <line x1={x} y1="228" x2={x + 14} y2="228" strokeWidth="0.35" />
        </g>
      ))}
      {/* Entrance Portico (6 columns) */}
      {[352, 368, 384, 400, 416, 432].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="87" x2={x} y2="268" strokeWidth="0.95" />
          <line x1={x - 5} y1="91" x2={x + 5} y2="91" strokeWidth="0.8" />
          <line x1={x - 5} y1="264" x2={x + 5} y2="264" strokeWidth="0.8" />
          <line x1={x - 4} y1="94" x2={x + 4} y2="94" strokeWidth="0.5" />
        </g>
      ))}
      {/* Pediment */}
      <path d="M340 87 L402 55 L464 87" strokeWidth="1.1" />
      <path d="M348 87 L402 62 L456 87" strokeWidth="0.5" />
      {/* Entrance steps */}
      <line x1="338" y1="268" x2="466" y2="268" strokeWidth="1" />
      <line x1="334" y1="263" x2="470" y2="263" strokeWidth="0.85" />
      <line x1="330" y1="258" x2="474" y2="258" strokeWidth="0.7" />
      <line x1="326" y1="253" x2="478" y2="253" strokeWidth="0.55" />
      {/* Main double door */}
      <rect x="381" y="220" width="42" height="48" rx="2" strokeWidth="1.05" />
      <path d="M381 228 Q402 218 423 228" strokeWidth="0.75" />
      <line x1="402" y1="228" x2="402" y2="268" strokeWidth="0.5" />
      <rect x="385" y="240" width="14" height="12" rx="1" strokeWidth="0.5" />
      <rect x="403" y="240" width="14" height="12" rx="1" strokeWidth="0.5" />

      {/* ══ CLOCK TOWER ══ */}
      {/* Base joins building */}
      <rect x="382" y="10" width="40" height="80" strokeWidth="1.25" />
      {/* Tower cornice band */}
      <line x1="376" y1="10" x2="428" y2="10" strokeWidth="1.1" />
      <line x1="376" y1="14" x2="428" y2="14" strokeWidth="0.45" />
      {[377, 381, 385, 389, 393, 397, 401, 405, 409, 413, 417, 421, 425].map((x, i) =>
        <rect key={i} x={x} y="4" width="2.5" height="7" strokeWidth="0.4" />
      )}
      <line x1="376" y1="3" x2="428" y2="3" strokeWidth="0.65" />
      {/* Belfry openings */}
      <rect x="390" y="56" width="12" height="20" rx="6" strokeWidth="0.8" />
      <rect x="406" y="56" width="12" height="20" rx="6" strokeWidth="0.8" />
      <line x1="402" y1="56" x2="402" y2="76" strokeWidth="0.35" />
      {/* Clock face */}
      <circle cx="402" cy="34" r="16" strokeWidth="1.05" />
      <circle cx="402" cy="34" r="13" strokeWidth="0.4" />
      {/* Hour marks */}
      <line x1="402" y1="18" x2="402" y2="22" strokeWidth="0.8" />
      <line x1="402" y1="46" x2="402" y2="50" strokeWidth="0.8" />
      <line x1="386" y1="34" x2="390" y2="34" strokeWidth="0.8" />
      <line x1="414" y1="34" x2="418" y2="34" strokeWidth="0.8" />
      {/* Diagonal marks */}
      <line x1="391" y1="23" x2="394" y2="26" strokeWidth="0.55" />
      <line x1="413" y1="23" x2="410" y2="26" strokeWidth="0.55" />
      <line x1="391" y1="45" x2="394" y2="42" strokeWidth="0.55" />
      <line x1="413" y1="45" x2="410" y2="42" strokeWidth="0.55" />
      {/* Clock hands */}
      <line x1="402" y1="22" x2="402" y2="34" strokeWidth="1" />
      <line x1="402" y1="34" x2="412" y2="40" strokeWidth="1" />
      <circle cx="402" cy="34" r="1.8" strokeWidth="0.6" />
      {/* Tower pyramid roof */}
      <path d="M375 3 L402 -28 L429 3" strokeWidth="1.1" />
      <path d="M381 3 L402 -20 L423 3" strokeWidth="0.5" />
      {/* Spire */}
      <line x1="402" y1="-28" x2="402" y2="-52" strokeWidth="1.2" />
      <line x1="397" y1="-47" x2="407" y2="-47" strokeWidth="0.9" />
      <polygon points="402,-58 397,-50 407,-50" strokeWidth="0.9" />
      {/* Weather vane */}
      <line x1="396" y1="-56" x2="408" y2="-56" strokeWidth="0.6" />
      <path d="M408 -58 L414 -56 L408 -54" strokeWidth="0.5" />
      {/* Lower tower joining central block */}
      <line x1="376" y1="87" x2="428" y2="87" strokeWidth="1" />
      <rect x="380" y="78" width="44" height="10" strokeWidth="0.8" />

      {/* ══ RIGHT MAIN WING ══ */}
      <rect x="518" y="158" width="118" height="110" strokeWidth="1.1" />
      <line x1="514" y1="158" x2="642" y2="158" strokeWidth="1.1" />
      <line x1="514" y1="163" x2="642" y2="163" strokeWidth="0.45" />
      <line x1="518" y1="204" x2="636" y2="204" strokeWidth="0.8" />
      {[516, 523, 530, 537, 544, 551, 558, 565, 572, 579, 586, 593, 600, 607, 614, 621, 628, 635].map((x, i) =>
        <line key={i} x1={x} y1="148" x2={x} y2="158" strokeWidth="0.5" />
      )}
      <line x1="514" y1="148" x2="642" y2="148" strokeWidth="0.8" />
      <line x1="514" y1="152" x2="642" y2="152" strokeWidth="0.4" />
      {[515, 521, 527, 533, 539, 545, 551, 557, 563, 569, 575, 581, 587, 593, 599, 605, 611, 617, 623, 629, 635].map((x, i) =>
        <rect key={i} x={x} y="141" width="3" height="8" strokeWidth="0.4" />
      )}
      <line x1="514" y1="140" x2="642" y2="140" strokeWidth="0.6" />
      {/* Windows floor 1 */}
      {[526, 550, 576, 604].map((x, i) => (
        <g key={i}>
          <rect x={x} y="168" width="16" height="22" strokeWidth="0.85" />
          <path d={`M${x} 174 Q${x + 8} 165 ${x + 16} 174`} strokeWidth="0.5" />
          <line x1={x + 8} y1="174" x2={x + 8} y2="190" strokeWidth="0.35" />
        </g>
      ))}
      {/* Windows floor 2 */}
      {[526, 550, 576, 604].map((x, i) => (
        <g key={i}>
          <rect x={x} y="212" width="16" height="22" strokeWidth="0.85" />
          <line x1={x + 8} y1="212" x2={x + 8} y2="234" strokeWidth="0.35" />
          <line x1={x} y1="223" x2={x + 16} y2="223" strokeWidth="0.35" />
        </g>
      ))}

      {/* ══ RIGHT CONNECTOR ══ */}
      <rect x="634" y="180" width="58" height="88" strokeWidth="0.85" />
      <line x1="634" y1="224" x2="692" y2="224" strokeWidth="0.6" />
      <rect x="642" y="187" width="12" height="16" strokeWidth="0.7" />
      <rect x="660" y="187" width="12" height="16" strokeWidth="0.7" />
      <rect x="678" y="187" width="12" height="16" strokeWidth="0.7" />
      <rect x="642" y="231" width="12" height="16" strokeWidth="0.7" />
      <rect x="660" y="231" width="12" height="16" strokeWidth="0.7" />
      <rect x="678" y="231" width="12" height="16" strokeWidth="0.7" />
      <line x1="630" y1="180" x2="696" y2="180" strokeWidth="1" />

      {/* ══ FAR RIGHT ANNEX ══ */}
      <rect x="688" y="210" width="94" height="58" strokeWidth="1.05" />
      <line x1="684" y1="210" x2="786" y2="210" strokeWidth="1" />
      <line x1="684" y1="215" x2="786" y2="215" strokeWidth="0.4" />
      {[686, 694, 702, 710, 718, 726, 734, 742, 750, 758, 766, 774, 782].map((x, i) =>
        <rect key={i} x={x} y="197" width="5" height="7" strokeWidth="0.5" />
      )}
      <line x1="684" y1="196" x2="786" y2="196" strokeWidth="0.8" />
      <line x1="684" y1="203" x2="786" y2="203" strokeWidth="0.65" />
      {/* Windows */}
      <rect x="696" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="703.5" y1="222" x2="703.5" y2="242" strokeWidth="0.35" /><line x1="696" y1="232" x2="711" y2="232" strokeWidth="0.35" />
      <rect x="718" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="725.5" y1="222" x2="725.5" y2="242" strokeWidth="0.35" /><line x1="718" y1="232" x2="733" y2="232" strokeWidth="0.35" />
      <rect x="740" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="747.5" y1="222" x2="747.5" y2="242" strokeWidth="0.35" /><line x1="740" y1="232" x2="755" y2="232" strokeWidth="0.35" />
      <rect x="762" y="222" width="15" height="20" strokeWidth="0.8" /><line x1="769.5" y1="222" x2="769.5" y2="242" strokeWidth="0.35" /><line x1="762" y1="232" x2="777" y2="232" strokeWidth="0.35" />

      {/* ══ TREES ══ */}
      {/* Far left tree cluster */}
      <line x1="0" y1="236" x2="0" y2="270" strokeWidth="1" />
      <ellipse cx="0" cy="220" rx="14" ry="17" strokeWidth="0.85" />
      <ellipse cx="0" cy="212" rx="9" ry="11" strokeWidth="0.5" />
      {/* Between left annex and connector */}
      <line x1="152" y1="245" x2="152" y2="270" strokeWidth="1" />
      <ellipse cx="152" cy="228" rx="13" ry="18" strokeWidth="0.85" />
      <ellipse cx="152" cy="220" rx="8" ry="11" strokeWidth="0.5" />
      <path d="M139 238 Q152 231 165 238" strokeWidth="0.4" />
      {/* Between right connector and right annex */}
      <line x1="656" y1="245" x2="656" y2="270" strokeWidth="1" />
      <ellipse cx="656" cy="228" rx="13" ry="18" strokeWidth="0.85" />
      <ellipse cx="656" cy="220" rx="8" ry="11" strokeWidth="0.5" />
      <path d="M643 238 Q656 231 669 238" strokeWidth="0.4" />
      {/* Far right tree cluster */}
      <line x1="820" y1="244" x2="820" y2="270" strokeWidth="1" />
      <ellipse cx="820" cy="227" rx="14" ry="18" strokeWidth="0.85" />
      <line x1="840" y1="248" x2="840" y2="270" strokeWidth="1" />
      <ellipse cx="840" cy="231" rx="12" ry="15" strokeWidth="0.85" />
      <line x1="858" y1="242" x2="858" y2="270" strokeWidth="1" />
      <ellipse cx="858" cy="226" rx="10" ry="16" strokeWidth="0.85" />
      <line x1="876" y1="248" x2="876" y2="270" strokeWidth="1" />
      <ellipse cx="876" cy="232" rx="12" ry="14" strokeWidth="0.85" />

      {/* ══ LAMP POSTS ══ */}
      {[70, 220, 542, 690, 800, 900].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="232" x2={x} y2="270" strokeWidth="0.9" />
          <line x1={x} y1="232" x2={x + 14} y2="224" strokeWidth="0.8" />
          <circle cx={x + 16} cy="222" r="4" strokeWidth="0.7" />
          <line x1={x} y1="244" x2={x - 6} y2="244" strokeWidth="0.55" />
          <line x1={x} y1="254" x2={x - 6} y2="254" strokeWidth="0.45" />
        </g>
      ))}

      {/* ══ BUSHES / HEDGES ══ */}
      {[40, 55, 70, 490, 505, 520, 760, 775, 790].map((x, i) => (
        <path key={i} d={`M${x} 268 Q${x + 7} 260 ${x + 14} 268`} strokeWidth="0.65" />
      ))}
      {[115, 130, 800, 815].map((x, i) => (
        <path key={i} d={`M${x} 268 Q${x + 6} 262 ${x + 12} 268 Q${x + 6} 263 ${x} 268`} strokeWidth="0.55" />
      ))}

      {/* ══ FLAGPOLE (left of central block) ══ */}
      <line x1="300" y1="87" x2="300" y2="40" strokeWidth="0.85" />
      <path d="M300 40 L328 50 L300 60" strokeWidth="0.75" />
      <line x1="300" y1="40" x2="300" y2="38" strokeWidth="0.6" />

    </g>
  </svg>
);

/* ───────────── Upload Modal ───────────── */
const UploadModal: React.FC<{
  onClose: () => void;
  editCircular?: Circular;
}> = ({ onClose, editCircular }) => {
  const { addNewCircular, editCircular: doEdit } = useCirculars();
  const [title, setTitle] = useState(editCircular?.title ?? '');
  const [description, setDescription] = useState(editCircular?.description ?? '');
  const [category, setCategory] = useState<Circular['category'] | ''>(
    editCircular?.category ?? ''
  );
  const [selectedDepts, setSelectedDepts] = useState<Department[]>(
    editCircular?.departments ?? []
  );
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(
    editCircular?.posterImage ?? null
  );
  const [pdfName, setPdfName] = useState<string | null>(editCircular?.pdfName ?? null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [pdfSizeInfo, setPdfSizeInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    wasCompressed: boolean;
  } | null>(null);

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const posterRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const toggleDept = (d: Department) =>
    setSelectedDepts((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );

  const compressAttachment = async (file: File): Promise<File | null> => {
    setIsCompressing(true);
    setCompressionProgress(10);
    setUploadError(null);
    setErrors([]);
    try {
      if (file.type.startsWith('image/')) {
        const originalMime = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp';
        const options = {
          maxSizeMB: 5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: originalMime,
          initialQuality: 0.85,
        };
        const compressed = await imageCompression(file, options);
        setCompressionProgress(90);
        const safeType = compressed.type.startsWith('image/') ? compressed.type : originalMime;
        const result = new File([compressed], file.name, {
          type: safeType,
          lastModified: Date.now(),
        });
        setCompressionProgress(100);
        if (result.size > 5 * 1024 * 1024) {
          setUploadError('Unable to compress this file below the 5 MB upload limit.');
          return null;
        }
        return result;
      }

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const { compressedFile, originalSize, compressedSize } = await compressPdfFile(
          file,
          (progress) => setCompressionProgress(progress)
        );
        if (compressedSize > 5 * 1024 * 1024) {
          setUploadError('This PDF could not be compressed below 5 MB. Please upload a smaller PDF file.');
          return null;
        }
        setPdfSizeInfo({
          originalSize: formatFileSize(originalSize),
          compressedSize: formatFileSize(compressedSize),
          wasCompressed: originalSize > 5 * 1024 * 1024,
        });
        return compressedFile;
      }

      if (file.size <= 5 * 1024 * 1024) {
        setCompressionProgress(100);
        return file;
      }
      setUploadError('This document exceeds the 5 MB upload limit. Please compress it manually before uploading.');
      return null;
    } catch (err) {
      console.error('Compression failed:', err);
      setUploadError('This PDF could not be compressed below 5 MB. Please upload a smaller PDF file.');
      return null;
    } finally {
      setIsCompressing(false);
      setCompressionProgress(0);
    }
  };

  const handlePosterChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors(["Poster must be an image file."]);
      return;
    }

    const compressed = await compressAttachment(file);
    if (compressed) {
      setAttachmentFile(compressed);
      setPosterPreview(URL.createObjectURL(compressed));
      setPdfName(null);
      setUploadError(null);
    }
  };

  const handlePdfChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isPdf) {
      setErrors(["Only PDF (.pdf) files are accepted for document upload."]);
      setUploadError("Only PDF (.pdf) files are accepted for document upload.");
      return;
    }

    setUploadError(null);
    setErrors([]);
    setPdfSizeInfo(null);

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    if (file.size <= MAX_SIZE) {
      setAttachmentFile(file);
      setPdfName(file.name);
      setPosterPreview(null);
      setPdfSizeInfo({
        originalSize: formatFileSize(file.size),
        compressedSize: formatFileSize(file.size),
        wasCompressed: false,
      });
    } else {
      const compressed = await compressAttachment(file);
      if (compressed) {
        setAttachmentFile(compressed);
        setPdfName(compressed.name);
        setPosterPreview(null);
        setUploadError(null);
      } else {
        setAttachmentFile(null);
        setPdfName(null);
      }
    }
  };

  const validate = () => {
    const errs: string[] = [];
    if (!title.trim()) errs.push('Circular title is required.');
    if (!category) errs.push('Category is required.');
    if (selectedDepts.length === 0) errs.push('Select at least one department.');
    if (!expiryDate) errs.push('Expiry date & time is required.');
    if (startDate && expiryDate && new Date(expiryDate) <= new Date(startDate))
      errs.push('Expiry must be after start date.');
    if (!editCircular && !attachmentFile) {
      errs.push('Please upload an attachment (Poster or PDF Document).');
    }
    if (attachmentFile && attachmentFile.size > 5 * 1024 * 1024) {
      errs.push('Attachment size must be below 5 MB.');
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setSubmitting(true);

    const circularData: NoticeUploadPayload = {
      title,
      description,
      attachments: attachmentFile,
      departments: selectedDepts,
      category: category || 'Circulars',
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      createdBy: 'admin@jit.ac.in',
    };

    try {
      if (editCircular) {
        await doEdit(editCircular.id, circularData);
      } else {
        await addNewCircular(circularData);
      }
      onClose();
    } catch (err) {
      // Error handled by context toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ad-modal-overlay" onClick={(e) => e.target === e.currentTarget && !isCompressing && onClose()}>
      <div className="ad-modal-box ad-upload-modal">
        <div className="ad-modal-header">
          <h2>{editCircular ? 'Edit Circular' : 'Upload New Circular'}</h2>
          <button className="ad-modal-close" onClick={onClose} disabled={isCompressing}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="ad-modal-body ad-upload-form" style={{ position: 'relative' }}>
          {isCompressing && (
            <div className="ad-compressing-overlay">
              <div className="ad-compressing-spinner"></div>
              <span className="ad-compressing-text">Compressing PDF...</span>
              <div className="ad-compression-progress-container">
                <div className="ad-compression-progress-bar">
                  <div
                    className="ad-compression-progress-fill"
                    style={{ width: `${compressionProgress}%` }}
                  ></div>
                </div>
                <span className="ad-compression-status-text">{compressionProgress}%</span>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="ad-form-errors">
              {errors.map((e, i) => <p key={i}>⚠ {e}</p>)}
            </div>
          )}

          {/* Basic Info */}
          <div className="ad-form-section">
            <h3 className="ad-section-title"><AlignLeft size={16} /> Circular Details</h3>
            <div className="ad-form-group" style={{ marginBottom: '1rem' }}>
              <label>Circular Title *</label>
              <input
                className="ad-f-input"
                type="text"
                placeholder="e.g. Tech Fest 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="ad-form-row">
              <div className="ad-form-group">
                <label>Category *</label>
                <select
                  className="ad-f-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Academic">Academic</option>
                  <option value="Exam">Exam</option>
                  <option value="Placement">Placement</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Events">Events</option>
                  <option value="Holidays">Holidays</option>
                  <option value="Circulars">Circulars</option>
                </select>
              </div>
            </div>
            <div className="ad-form-group" style={{ marginTop: '1rem' }}>
              <label>Description</label>
              <textarea
                className="ad-f-input ad-f-textarea"
                placeholder="Enter circular description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="ad-form-section">
            <h3 className="ad-section-title"><Image size={16} /> Attachments</h3>
            <div className="ad-form-row">
              <div className="ad-upload-zone" onClick={() => !isCompressing && posterRef.current?.click()}>
                {posterPreview ? (
                  <div className="ad-poster-preview-wrap">
                    <img src={posterPreview} alt="poster" className="ad-poster-preview-img" />
                    <span className="ad-poster-change-label">Click to change</span>
                  </div>
                ) : (
                  <>
                    <Image size={32} className="ad-upload-icon" />
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
                  disabled={isCompressing}
                />
              </div>

              <div className="ad-upload-zone" onClick={() => !isCompressing && pdfRef.current?.click()}>
                {pdfName ? (
                  <>
                    <FileText size={32} className="ad-upload-icon ad-success-icon" />
                    <p className="ad-pdf-name">{pdfName}</p>
                    {pdfSizeInfo && (
                      <div className={`ad-pdf-size-badge ${pdfSizeInfo.wasCompressed ? 'ad-size-compressed' : 'ad-size-ok'}`}>
                        {pdfSizeInfo.wasCompressed ? (
                          <span className="ad-pdf-size-change">
                            {pdfSizeInfo.originalSize} → {pdfSizeInfo.compressedSize} (Compressed)
                          </span>
                        ) : (
                          <span>Size: {pdfSizeInfo.compressedSize}</span>
                        )}
                      </div>
                    )}
                    <span style={{ marginTop: '6px' }}>Click to change document</span>
                  </>
                ) : (
                  <>
                    <FilePlus size={32} className="ad-upload-icon" />
                    <p>Click to upload PDF circular</p>
                    <span>PDF files only (Auto-compressed if &gt; 5 MB)</span>
                  </>
                )}
                <input
                  ref={pdfRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  style={{ display: 'none' }}
                  onChange={handlePdfChange}
                  disabled={isCompressing}
                />
              </div>
            </div>

            {/* Inline upload error — shown right below the upload zones */}
            {uploadError && (
              <div className="ad-upload-error-banner">
                <AlertCircle size={16} className="ad-upload-error-icon" />
                <span>{uploadError}</span>
                <button
                  type="button"
                  className="ad-upload-error-dismiss"
                  onClick={() => setUploadError(null)}
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Department Selection */}
          <div className="ad-form-section">
            <h3 className="ad-section-title"><Users size={16} /> Select Departments</h3>
            <div className="ad-dept-grid">
              {DEPARTMENTS.map((d) => (
                <label key={d} className={`ad-dept-check${selectedDepts.includes(d) ? ' ad-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedDepts.includes(d)}
                    onChange={() => toggleDept(d)}
                    disabled={isCompressing}
                  />
                  <span className="ad-dept-short">{DEPARTMENT_SHORT_NAMES[d]}</span>
                  <span className="ad-dept-long">{DEPARTMENT_FULL_NAMES[d]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="ad-form-section">
            <h3 className="ad-section-title"><Calendar size={16} /> Schedule</h3>
            <div className="ad-form-row">
              <div className="ad-form-group">
                <label>Start Date & Time *</label>
                <input
                  className="ad-f-input"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isCompressing}
                />
              </div>
              <div className="ad-form-group">
                <label>Expiry Date & Time *</label>
                <input
                  className="ad-f-input"
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  disabled={isCompressing}
                />
              </div>
            </div>
          </div>

          <div className="ad-modal-footer">
            <button type="button" className="ad-btn-secondary" onClick={onClose} disabled={isCompressing}>Cancel</button>
            <button type="submit" className="ad-btn-primary" disabled={submitting || isCompressing}>
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
    const file = circular.pdfFile;
    if (file.startsWith('data:')) {
      const mimeMatch = file.match(/^data:([^;]+);base64,/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const byteStr = atob(file.split(',')[1]);
      const ab = new ArrayBuffer(byteStr.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteStr.length; i++) ia[i] = byteStr.charCodeAt(i);
      const blob = new Blob([ab], { type: mime });
      window.open(URL.createObjectURL(blob), '_blank');
    } else {
      window.open(file, '_blank');
    }
  };

  return (
    <div className="ad-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal-box ad-preview-modal">
        <div className="ad-modal-header">
          <h2>Preview: {circular.title}</h2>
          <button className="ad-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="ad-preview-body">
          {circular.posterImage && (
            <img src={circular.posterImage} alt="poster" className="ad-preview-poster" />
          )}
          <div className="ad-preview-meta">
            {circular.eventName && <p><strong>Event:</strong> {circular.eventName}</p>}
            {circular.description && <p><strong>Description:</strong> {circular.description}</p>}
            <p><strong>Category:</strong> {circular.category || 'Circulars'}</p>
            <p><strong>Departments:</strong> {circular.departments.join(', ')}</p>
            <p><strong>Published:</strong> {format(new Date(circular.uploadDate), 'dd MMM yyyy, hh:mm a')}</p>
            <p><strong>Expires:</strong> {format(new Date(circular.expiryDate), 'dd MMM yyyy, hh:mm a')}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`ad-badge ad-badge-${circular.status}`}>{circular.status.toUpperCase()}</span>
            </p>
          </div>
          {circular.pdfFile && (
            <button className="ad-btn-primary ad-preview-pdf-btn" onClick={openPdf}>
              <ExternalLink size={16} /> {circular.pdfName && (circular.pdfName.toLowerCase().endsWith('.pdf') || circular.pdfName.toLowerCase().includes('pdf')) ? 'Open PDF' : 'Open Document'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────── Admin Dashboard ───────────── */
const AdminDashboard: React.FC = () => {
  const {
    circulars,
    loading: loadingCirculars,
    page,
    totalPages,
    total,
    setPage,
    removeCircular,
  } = useCirculars();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'circulars' | 'analytics' | 'profile'>('dashboard');
  const [analyticsStatus, setAnalyticsStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [analyticsTime, setAnalyticsTime] = useState<'all' | 'today' | 'weekly' | 'monthly'>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState<Circular | undefined>();
  const [previewTarget, setPreviewTarget] = useState<Circular | undefined>();
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const closeSidebar = () => setSidebarOpen(false);

  const [scrolled, setScrolled] = useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [statsDept, setStatsDept] = useState<string>('');
  const [statsData, setStatsData] = useState<{
    total: { _id: string | null; count: number }[];
    categories: { _id: string; count: number }[];
    departments: { _id: string; count: number }[];
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await noticeService.getNoticeStats(statsDept || undefined);
      if (data && data.stats && data.stats[0]) {
        setStatsData(data.stats[0]);
      } else {
        setStatsData({ total: [], categories: [], departments: [] });
      }
    } catch (err) {
      console.error("Failed to load statistics from server:", err);
      setStatsData({ total: [], categories: [], departments: [] });
    } finally {
      setLoadingStats(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsDept, circulars]);

  const { totalCirculars, activeCirculars, expiredCirculars } = React.useMemo(() => {
    let tot = 0;
    let act = 0;
    let exp = 0;

    if (statsData?.total && Array.isArray(statsData.total)) {
      statsData.total.forEach(item => {
        if (item._id === null || item._id === undefined) {
          tot += item.count || 0;
        } else if (item._id === 'active') {
          act = item.count || 0;
          tot += act;
        } else if (item._id === 'expired' || item._id === 'inactive') {
          exp = item.count || 0;
          tot += exp;
        } else {
          tot += item.count || 0;
        }
      });
    }

    if (tot === 0 && circulars.length > 0) {
      return {
        totalCirculars: circulars.length,
        activeCirculars: circulars.filter((c) => c.status === 'active').length,
        expiredCirculars: circulars.filter((c) => c.status === 'expired').length,
      };
    }

    return { totalCirculars: tot, activeCirculars: act, expiredCirculars: exp };
  }, [statsData, circulars]);

  const todayUploads = React.useMemo(() => {
    return circulars.filter((c) => isToday(new Date(c.uploadDate))).length;
  }, [circulars]);

  const filtered = circulars.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.departments.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    await removeCircular(id);
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

  const recentUploads = useMemo(
    () =>
      [...circulars]
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, 5),
    [circulars]
  );

  const statCards = [
    {
      label: 'Total Circulars',
      sub: 'All time',
      value: totalCirculars,
      icon: <FileText size={22} />,
      color: '#163A70',
      sparkColor: '#3B82F6',
    },
    {
      label: 'Active Circulars',
      sub: 'Currently active',
      value: activeCirculars,
      icon: <CheckCircle size={22} />,
      color: '#22C55E',
      sparkColor: '#22C55E',
    },
    {
      label: 'Expired Circulars',
      sub: 'Past expiration',
      value: expiredCirculars,
      icon: <XCircle size={22} />,
      color: '#F59E0B',
      sparkColor: '#F59E0B',
    },
    {
      label: "Today's Uploads",
      sub: 'Uploaded today',
      value: todayUploads,
      icon: <Upload size={22} />,
      color: '#D4AF37',
      sparkColor: '#D4AF37',
    },
  ];

  const getDeptLabel = (c: Circular) => {
    if (c.departments.length === 0) return 'All Departments';
    if (c.departments.length === 1) return DEPARTMENT_FULL_NAMES[c.departments[0]] || c.departments[0];
    return `${c.departments[0]} +${c.departments.length - 1}`;
  };

  return (
    <div className="ad-layout">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && <div className="ad-sidebar-backdrop" onClick={closeSidebar} />}

      {/* ── Desktop Sidebar ── */}
      <aside className={`ad-sidebar${sidebarOpen ? ' ad-sidebar-open' : ''}`}>
        <CampusIllustrationSidebar />

        {/* Brand */}
        <div className="ad-sidebar-brand">
          <div className="ad-sidebar-logo">
            <img src="/noticelogo.png" alt="JIT" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <GraduationCap size={26} className="ad-sidebar-logo-fallback" />
          </div>
          <div>
            <div className="ad-sidebar-title">JIT Portal</div>
            <div className="ad-sidebar-subtitle">Admin Panel</div>
          </div>
          <button className="ad-sidebar-close-btn" onClick={closeSidebar}><X size={18} /></button>
        </div>

        {/* Nav */}
        <nav className="ad-sidebar-nav">
          <button
            className={`ad-nav-item${activeTab === 'dashboard' ? ' ad-nav-active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); closeSidebar(); }}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button
            className={`ad-nav-item${activeTab === 'analytics' ? ' ad-nav-active' : ''}`}
            onClick={() => { setActiveTab('analytics'); closeSidebar(); }}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
          <button
            className={`ad-nav-item${activeTab === 'circulars' ? ' ad-nav-active' : ''}`}
            onClick={() => { setActiveTab('circulars'); closeSidebar(); }}
          >
            <FileText size={20} />
            <span>Circulars</span>
          </button>
          <button
            className={`ad-nav-item${activeTab === 'profile' ? ' ad-nav-active' : ''}`}
            onClick={() => { setActiveTab('profile'); closeSidebar(); }}
          >
            <User size={20} />
            <span>Profile</span>
          </button>
        </nav>

        {/* Admin Profile + Logout at bottom */}
        <div className="ad-sidebar-footer">
          <div
            className="ad-sidebar-profile ad-clickable-profile"
            onClick={() => { setActiveTab('profile'); closeSidebar(); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="ad-sidebar-avatar">SA</div>
            <div className="ad-sidebar-profile-info">
              <div className="ad-sidebar-profile-name">Admin</div>
              <div className="ad-sidebar-profile-role">Administrator</div>
            </div>
          </div>
          <button className="ad-nav-item ad-logout-btn" onClick={logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="ad-main">

        {/* ── Top App Bar ── */}
        <header className={`ad-topbar${scrolled ? ' ad-topbar-scrolled' : ''}`}>
          <div className="ad-topbar-left">
            <button className="ad-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div className="ad-topbar-brand">
              <div className="ad-topbar-logo">
                <img src="/noticelogo.png" alt="JIT" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <GraduationCap size={22} className="ad-topbar-logo-fallback" />
              </div>
              <div>
                <div className="ad-topbar-title">JIT Portal</div>
                <div className="ad-topbar-subtitle">Admin Panel</div>
              </div>
            </div>
          </div>
          <div className="ad-topbar-right">
            <button className="ad-icon-pill" aria-label="Notifications">
              <Bell size={20} />
              <span className="ad-notif-badge">3</span>
            </button>
            <div
              className="ad-topbar-avatar"
              onClick={() => setActiveTab('profile')}
              style={{ cursor: 'pointer' }}
            >
              SA
            </div>
          </div>
        </header>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && (
          <div className="ad-page-content">

            {/* Hero Welcome */}
            <section className="ad-hero">
              <CampusIllustrationHero />
              <div className="ad-hero-text">
                <p className="ad-greeting">{getGreeting()},</p>
                <h1 className="ad-hero-name">Admin <span>👋</span></h1>
                <p className="ad-hero-sub">Manage departmental circulars efficiently from one place.</p>
              </div>
              <button
                className="ad-new-circular-btn"
                onClick={() => setShowUpload(true)}
                aria-label="Upload new circular"
              >
                <Plus size={20} />
                New Circular
              </button>
            </section>

            {/* Stats Filter Bar */}
            <div className="ad-stats-filter-bar">
              <h2 className="ad-stats-section-title">Notice Statistics</h2>
              <div className="ad-stats-dept-selector">
                <label htmlFor="statsDeptSelect"><Filter size={14} /> Department:</label>
                <select
                  id="statsDeptSelect"
                  value={statsDept}
                  onChange={(e) => setStatsDept(e.target.value)}
                  className="ad-stats-select"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {DEPARTMENT_SHORT_NAMES[d] || d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stat Cards */}
            <section className="ad-stats-grid" style={{ opacity: loadingStats ? 0.7 : 1, transition: 'opacity 0.2s' }}>
              {statCards.map((s) => (
                <div className="ad-stat-card" key={s.label}>
                  <div className="ad-stat-top">
                    <div className="ad-stat-icon-box" style={{ background: s.color }}>
                      {s.icon}
                    </div>
                    <div className="ad-stat-details">
                      <div className="ad-stat-label">{s.label}</div>
                      <div className="ad-stat-value">{s.value}</div>
                    </div>
                  </div>
                  <div className="ad-stat-bottom">
                    <span className="ad-stat-sub">{s.sub}</span>
                    <Sparkline color={s.sparkColor} />
                  </div>
                </div>
              ))}
            </section>

            {/* Recent Uploads */}
            <section className="ad-card ad-recent-card">
              <div className="ad-card-header">
                <h2 className="ad-card-title">Recent Uploads</h2>
                <button
                  className="ad-view-all-btn"
                  onClick={() => setActiveTab('circulars')}
                >
                  View all <ArrowRight size={14} />
                </button>
              </div>

              {recentUploads.length === 0 ? (
                <div className="ad-empty-state">
                  <FileText size={44} />
                  <p>No circulars uploaded yet.</p>
                  <button className="ad-btn-primary" onClick={() => setShowUpload(true)}>
                    Upload First Circular
                  </button>
                </div>
              ) : (
                <div className="ad-recent-list">
                  {recentUploads.map((c) => (
                    <div className="ad-recent-row" key={c.id}>
                      <div className="ad-recent-icon">
                        {c.posterImage
                          ? <img src={c.posterImage} alt="" className="ad-recent-thumb-img" />
                          : <FileText size={20} />}
                      </div>
                      <div className="ad-recent-info">
                        <p className="ad-recent-title">{c.title}</p>
                        <p className="ad-recent-dept">{getDeptLabel(c)}</p>
                      </div>
                      <div className="ad-recent-meta">
                        <span className="ad-recent-time">
                          {formatDistanceToNow(new Date(c.uploadDate), { addSuffix: false }).replace('about ', '')} ago
                        </span>
                        <span className={`ad-status-chip ad-status-${c.status}`}>
                          {c.status === 'active' ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      <div className="ad-recent-menu">
                        <button
                          className="ad-menu-btn"
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          aria-label="More options"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {openMenuId === c.id && (
                          <div className="ad-dropdown">
                            <button onClick={() => { setPreviewTarget(c); setOpenMenuId(null); }}>
                              <Eye size={14} /> Preview
                            </button>
                            <button onClick={() => { openEdit(c); setOpenMenuId(null); }}>
                              <Edit2 size={14} /> Edit
                            </button>
                            <button
                              className="ad-dropdown-danger"
                              onClick={() => { setDeleteConfirm(c.id); setOpenMenuId(null); }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    className="ad-view-all-circulars-btn"
                    onClick={() => setActiveTab('circulars')}
                  >
                    View all circulars <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </section>

            {/* Department Quick Links */}
            <section className="ad-card">
              <div className="ad-card-header">
                <h2 className="ad-card-title">Department Dashboards</h2>
              </div>
              <div className="ad-dept-links-grid">
                {DEPARTMENTS.map((d) => {
                  const count = circulars.filter(
                    (c) => c.status === 'active' && c.departments.includes(d)
                  ).length;
                  return (
                    <button
                      key={d}
                      className="ad-dept-link-card"
                      onClick={() => navigate(DEPT_ROUTES[d])}
                    >
                      <span className="ad-dept-link-name">{d}</span>
                      <span className="ad-dept-link-count">{count} active</span>
                      <ExternalLink size={14} />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {activeTab === 'analytics' && (
          <div className="ad-page-content">
            <div className="ad-analytics-header">
              <h2 className="ad-page-heading">Analytics & Reports</h2>
              <div className="ad-analytics-filters">
                <div className="ad-filter-group">
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
                <div className="ad-filter-group">
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

            <div className="ad-card ad-analytics-chart-card">
              <div className="ad-card-header">
                <h2 className="ad-card-title">Department-wise Uploads</h2>
              </div>
              <div className="ad-chart-body">
                {(() => {
                  const filteredAnalytics = circulars.filter(c => {
                    if (analyticsStatus === 'active' && c.status !== 'active') return false;
                    if (analyticsStatus === 'inactive' && c.status !== 'expired') return false;
                    const uploadDate = new Date(c.uploadDate);
                    if (analyticsTime === 'today' && !isToday(uploadDate)) return false;
                    if (analyticsTime === 'weekly' && !isThisWeek(uploadDate)) return false;
                    if (analyticsTime === 'monthly' && !isThisMonth(uploadDate)) return false;
                    return true;
                  });

                  const deptCounts = DEPARTMENTS.map(d => {
                    let count = 0;
                    if (analyticsStatus === 'all' && analyticsTime === 'all') {
                      const found = statsData?.departments?.find(item => item._id === d);
                      count = found ? found.count : 0;
                    } else {
                      count = filteredAnalytics.filter(c => c.departments.includes(d)).length;
                    }
                    return { dept: d, name: DEPARTMENT_FULL_NAMES[d], count };
                  });

                  const maxCount = Math.max(...deptCounts.map(d => d.count), 1);
                  const totalCount = analyticsStatus === 'all' && analyticsTime === 'all'
                    ? totalCirculars
                    : filteredAnalytics.length;
                  const totalSlices = deptCounts.reduce((sum, item) => sum + item.count, 0);

                  const PIE_COLORS = ['#163A70', '#22C55E', '#F59E0B', '#EF4444', '#8b5cf6', '#06b6d4', '#D4AF37'];
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
                      <div className="ad-analytics-summary">
                        <div className="ad-summary-box">
                          <h3>Total Matches</h3>
                          <div className="ad-summary-val">{totalCount}</div>
                        </div>
                      </div>
                      <div className="ad-analytics-charts-grid">
                        <div className="ad-chart-col">
                          <h3 className="ad-chart-col-title"><BarChart3 size={16} /> Bar Chart</h3>
                          <div className="ad-bar-chart-wrap">
                            {deptCounts.map(item => (
                              <div className="ad-bar-row" key={item.dept}>
                                <div className="ad-bar-label" title={item.name}>{item.dept}</div>
                                <div className="ad-bar-track">
                                  <div
                                    className="ad-bar-fill"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                  >
                                    {item.count > 0 && <span className="ad-bar-value-inner">{item.count}</span>}
                                  </div>
                                </div>
                                <div className="ad-bar-value-outer">{item.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="ad-chart-col ad-pie-col">
                          <h3 className="ad-chart-col-title"><PieChart size={16} /> Distribution</h3>
                          <div className="ad-pie-container">
                            <div className="ad-pie-chart" style={pieStyle}></div>
                            {totalSlices > 0 ? (
                              <div className="ad-pie-legend">
                                {deptCounts.map((item, i) => {
                                  if (item.count === 0) return null;
                                  return (
                                    <div className="ad-legend-item" key={item.dept}>
                                      <span className="ad-legend-color" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                                      <span className="ad-legend-label">{item.dept}</span>
                                      <span className="ad-legend-value">{item.count} ({((item.count / totalSlices) * 100).toFixed(0)}%)</span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="ad-no-data-msg">No data available for selected filters.</p>
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

        {/* ── Circulars Tab ── */}
        {activeTab === 'circulars' && (
          <div className="ad-page-content">
            <div className="ad-circulars-header">
              <h2 className="ad-page-heading">Manage Circulars</h2>
              <button className="ad-btn-primary" onClick={() => setShowUpload(true)}>
                <Plus size={18} /> New Circular
              </button>
            </div>

            <div className="ad-search-bar">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by title or department... (Ctrl+K)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === 'k') { e.preventDefault(); (e.target as HTMLInputElement).focus(); } }}
              />
              {search && (
                <button className="ad-search-clear" onClick={() => setSearch('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            {loadingCirculars ? (
              <div className="ad-table-wrap" style={{ border: 'none' }}>
                <table className="ad-table">
                  <tbody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td colSpan={8} style={{ padding: '8px 0' }}>
                          <div className="ad-skeleton-row-bar" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ad-empty-state">
                <FileText size={48} />
                <p>{search ? 'No results found.' : 'No circulars yet.'}</p>
                {!search && (
                  <button className="ad-btn-primary" onClick={() => setShowUpload(true)}>
                    Upload First Circular
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="ad-table-wrap">
                  <table className="ad-table">
                    <thead>
                      <tr>
                        <th>Poster</th>
                        <th>Title</th>
                        <th>Category</th>
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
                            <div className="ad-table-thumb">
                              {c.posterImage
                                ? <img src={c.posterImage} alt="" />
                                : <FileText size={20} />}
                            </div>
                          </td>
                          <td>
                            <p className="ad-table-title">{c.title}</p>
                            {c.eventName && <p className="ad-table-sub">{c.eventName}</p>}
                          </td>
                          <td>
                            <span className="ad-badge">{c.category || 'Circulars'}</span>
                          </td>
                          <td>
                            <div className="ad-dept-tags">
                              {c.departments.map((d) => (
                                <span key={d} className="ad-dept-tag">{DEPARTMENT_SHORT_NAMES[d as Department] || d}</span>
                              ))}
                            </div>
                          </td>
                          <td className="ad-table-date">{format(new Date(c.uploadDate), 'dd MMM yy')}</td>
                          <td className="ad-table-date">{format(new Date(c.expiryDate), 'dd MMM yy')}</td>
                          <td><span className={`ad-badge ad-badge-${c.status}`}>{c.status}</span></td>
                          <td>
                            <div className="ad-action-btns">
                              <button className="ad-icon-btn ad-icon-blue" title="Preview" onClick={() => setPreviewTarget(c)}>
                                <Eye size={16} />
                              </button>
                              <button className="ad-icon-btn ad-icon-green" title="Edit" onClick={() => openEdit(c)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="ad-icon-btn ad-icon-red" title="Delete" onClick={() => setDeleteConfirm(c.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="ad-mobile-cards">
                  {filtered.map((c) => (
                    <div className="ad-mobile-card" key={c.id}>
                      <div className="ad-mobile-card-top">
                        <div className="ad-mobile-thumb">
                          {c.posterImage ? <img src={c.posterImage} alt="" /> : <FileText size={20} />}
                        </div>
                        <div className="ad-mobile-card-info">
                          <p className="ad-table-title">{c.title}</p>
                          <p className="ad-table-sub">{c.departments.join(', ')}</p>
                        </div>
                        <span className={`ad-badge ad-badge-${c.status}`}>{c.status}</span>
                      </div>
                      <div className="ad-mobile-card-footer">
                        <span className="ad-badge">{c.category || 'Circulars'}</span>
                        <span className="ad-table-date">{format(new Date(c.uploadDate), 'dd MMM yy')}</span>
                        <div className="ad-action-btns">
                          <button className="ad-icon-btn ad-icon-blue" onClick={() => setPreviewTarget(c)}><Eye size={15} /></button>
                          <button className="ad-icon-btn ad-icon-green" onClick={() => openEdit(c)}><Edit2 size={15} /></button>
                          <button className="ad-icon-btn ad-icon-red" onClick={() => setDeleteConfirm(c.id)}><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                  <div className="ad-pagination">
                    <button
                      className="ad-page-btn"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </button>
                    <span className="ad-page-info">
                      Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total: {total})
                    </span>
                    <button
                      className="ad-page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <AdminProfile onBack={() => setActiveTab('dashboard')} />
        )}

        {/* ── Mobile Bottom Navigation ── */}
        <nav className="ad-bottom-nav">
          <button
            className={`ad-bottom-nav-item${activeTab === 'dashboard' ? ' ad-bottom-nav-active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={22} />
            <span>Dashboard</span>
          </button>
          <button
            className={`ad-bottom-nav-item${activeTab === 'analytics' ? ' ad-bottom-nav-active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={22} />
            <span>Analytics</span>
          </button>
          <button
            className={`ad-bottom-nav-item${activeTab === 'circulars' ? ' ad-bottom-nav-active' : ''}`}
            onClick={() => setActiveTab('circulars')}
          >
            <FileText size={22} />
            <span>Circulars</span>
          </button>
          <button
            className={`ad-bottom-nav-item${activeTab === 'profile' ? ' ad-bottom-nav-active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={22} />
            <span>Profile</span>
          </button>
          <button className="ad-bottom-nav-item" onClick={logout}>
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </nav>
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
        <div className="ad-modal-overlay">
          <div className="ad-modal-box ad-confirm-modal">
            <div className="ad-modal-header">
              <h2>Confirm Delete</h2>
              <button className="ad-modal-close" onClick={() => setDeleteConfirm(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="ad-confirm-body">
              <XCircle size={48} className="ad-confirm-icon" />
              <p>Are you sure you want to delete this circular? This action cannot be undone.</p>
              <div className="ad-confirm-actions">
                <button className="ad-btn-secondary" onClick={() => setDeleteConfirm(null)}>
                  Cancel
                </button>
                <button className="ad-btn-danger" onClick={() => handleDelete(deleteConfirm)}>
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
