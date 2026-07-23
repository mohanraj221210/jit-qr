import fs from 'fs';
import path from 'path';

const DEPARTMENTS = [
  'ITDashboard.tsx',
  'CSEDashboard.tsx',
  'ECEDashboard.tsx',
  'AIDSDashboard.tsx',
  'MechanicalDashboard.tsx',
  'CSBSDashboard.tsx',
  'MBADashboard.tsx',
];

for (const file of DEPARTMENTS) {
  const filePath = path.join('src/pages/departments', file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes("import SEO from '../../components/SEO';")) {
    content = `import SEO from '../../components/SEO';\nimport slugify from 'slugify';\n` + content;
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports for ${file}`);
  }
}
