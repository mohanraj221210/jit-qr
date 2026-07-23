import fs from 'fs';
import path from 'path';

const DEPARTMENTS = [
  { file: 'ITDashboard.tsx', title: 'Information Technology Notices | JIT', desc: 'Digital Notice Board for Information Technology Department at Jeppiaar Institute of Technology.', wrapperClass: 'it-wrapper' },
  { file: 'CSEDashboard.tsx', title: 'CSE Department Notices | JIT', desc: 'Digital Notice Board for Computer Science and Engineering Department at Jeppiaar Institute of Technology.', wrapperClass: 'cs-wrapper' },
  { file: 'ECEDashboard.tsx', title: 'ECE Department Notices | JIT', desc: 'Digital Notice Board for Electronics and Communication Engineering Department at Jeppiaar Institute of Technology.', wrapperClass: 'ec-wrapper' },
  { file: 'AIDSDashboard.tsx', title: 'AI&DS Department Notices | JIT', desc: 'Digital Notice Board for Artificial Intelligence and Data Science Department at Jeppiaar Institute of Technology.', wrapperClass: 'ai-wrapper' },
  { file: 'MechanicalDashboard.tsx', title: 'Mechanical Engineering Notices | JIT', desc: 'Digital Notice Board for Mechanical Engineering Department at Jeppiaar Institute of Technology.', wrapperClass: 'mech-wrapper' },
  { file: 'CSBSDashboard.tsx', title: 'CSBS Department Notices | JIT', desc: 'Digital Notice Board for Computer Science and Business System Department at Jeppiaar Institute of Technology.', wrapperClass: 'csbs-wrapper' },
  { file: 'MBADashboard.tsx', title: 'MBA Department Notices | JIT', desc: 'Digital Notice Board for Master of Business Administration Department at Jeppiaar Institute of Technology.', wrapperClass: 'mba-wrapper' },
];

for (const dept of DEPARTMENTS) {
  const filePath = path.join('src/pages/departments', dept.file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Add imports
  if (!content.includes('import SEO')) {
    content = content.replace(/(import React.*?;\n)/, `$1import SEO from '../../components/SEO';\nimport slugify from 'slugify';\n`);
  }
  
  // Add SEO component
  if (!content.includes('<SEO')) {
    const returnRegex = new RegExp(`(return\\s*\\([\\s\\S]*?<div className="${dept.wrapperClass}">)`);
    content = content.replace(returnRegex, `$1\n      <SEO title="${dept.title}" description="${dept.desc}" />`);
  }
  
  // Replace h3 with wrapped link
  // E.g. <h3 className="it-paper-title" style={{ textAlign: 'left', marginTop: 16 }}>{c.title}</h3>
  const h3Regex = /(<h3[^>]*>\{c\.title\}<\/h3>)/g;
  content = content.replace(h3Regex, `<a href={\`/notice/\${slugify(c.title || 'notice', { lower: true, strict: true })}-\${c.id}\`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); setSelectedNotice(c); }}>$1</a>`);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${dept.file}`);
}
