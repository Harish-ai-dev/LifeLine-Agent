import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), '../website/src');
const DEST_COMP = path.join(process.cwd(), 'src/components/marketing');
const DEST_DATA = path.join(process.cwd(), 'src/data/marketing');
const DEST_APP = path.join(process.cwd(), 'src/app/(marketing)');

// Create dirs
[DEST_COMP, DEST_DATA, DEST_APP].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Helper to copy and process files
function processFile(srcPath, destPath, type) {
  let content = fs.readFileSync(srcPath, 'utf8');

  // Replace react-router-dom
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
    let nextImports = [];
    let navImports = [];
    if (imports.includes('Link')) nextImports.push('Link');
    if (imports.includes('useNavigate') || imports.includes('useLocation')) {
      if (imports.includes('useNavigate')) navImports.push('useRouter as useNavigate');
      if (imports.includes('useLocation')) navImports.push('usePathname as useLocation');
    }
    
    let res = [];
    if (nextImports.length > 0) res.push(`import Link from 'next/link';`);
    if (navImports.length > 0) res.push(`import { ${navImports.join(', ')} } from 'next/navigation';`);
    return res.join('\n');
  });

  // Replace to= with href= in Links
  content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');

  // Replace relative imports to absolute path aliases
  if (type === 'page') {
    content = content.replace(/['"]\.\.\/components\/(.*)['"]/g, "'@/components/marketing/$1'");
    content = content.replace(/['"]\.\.\/data\/(.*)['"]/g, "'@/data/marketing/$1'");
    content = content.replace(/['"]\.\.\/lib\/(.*)['"]/g, "'@/lib/$1'");
  } else if (type === 'component') {
    content = content.replace(/['"]\.\.\/data\/(.*)['"]/g, "'@/data/marketing/$1'");
    content = content.replace(/['"]\.\/(.*)['"]/g, "'@/components/marketing/$1'");
  } else if (type === 'data') {
    content = content.replace(/['"]\.\.\/components\/(.*)['"]/g, "'@/components/marketing/$1'");
  }

  // Remove default exports from pages so they can be named properly, but App Router needs default exports.
  // We'll leave them as is.

  const needsUseClient = content.includes('useState') || content.includes('useEffect') || content.includes('useNavigate') || content.includes('useLocation') || content.includes('onClick');
  
  if (needsUseClient && !content.includes("'use client'") && !content.includes('"use client"')) {
    content = `'use client';\n\n` + content;
  }

  fs.writeFileSync(destPath, content);
}

// 1. Data
const dataFiles = fs.readdirSync(path.join(SRC, 'data'));
dataFiles.forEach(f => {
  if (f.endsWith('.ts')) {
    processFile(path.join(SRC, 'data', f), path.join(DEST_DATA, f), 'data');
  }
});

// 2. Components
const compFiles = fs.readdirSync(path.join(SRC, 'components'));
compFiles.forEach(f => {
  if (f.endsWith('.tsx') || f.endsWith('.ts')) {
    processFile(path.join(SRC, 'components', f), path.join(DEST_COMP, f), 'component');
  }
});

// 3. Pages -> App Router Routes
const pagesMap = {
  'HomePage.tsx': 'page.tsx', 
  'AgentsPage.tsx': 'agents/page.tsx',
  'SimulatorPage.tsx': 'simulator/page.tsx',
  'ArchitecturePage.tsx': 'architecture/page.tsx',
  'DocsPage.tsx': 'docs/page.tsx',
  'ProvenancePage.tsx': 'provenance/page.tsx',
  'ContributePage.tsx': 'contribute/page.tsx',
  'ReviewsPage.tsx': 'reviews/page.tsx',
  'AboutPage.tsx': 'about/page.tsx',
  'PrivacyTermsPage.tsx': 'legal/page.tsx'
};

const pagesFiles = fs.readdirSync(path.join(SRC, 'pages'));
pagesFiles.forEach(f => {
  if (pagesMap[f]) {
    const routeFile = pagesMap[f];
    const routeDir = path.dirname(path.join(DEST_APP, routeFile));
    if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, { recursive: true });
    
    // Convert named exports to default exports for Next.js App Router compatibility
    let content = fs.readFileSync(path.join(SRC, 'pages', f), 'utf8');
    const pageName = f.replace('.tsx', '');
    if (content.includes(`export const ${pageName}`)) {
        content = content.replace(`export const ${pageName}`, `const ${pageName}`);
        content += `\nexport default ${pageName};\n`;
        fs.writeFileSync(path.join(SRC, 'pages', f), content);
    }
    
    processFile(path.join(SRC, 'pages', f), path.join(DEST_APP, routeFile), 'page');
  }
});

console.log('Migration script completed.');
