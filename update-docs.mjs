import fs from 'fs';
import path from 'path';

const dirs = [
  path.join(process.cwd(), 'docs'),
  path.join(process.cwd(), 'my-agent/docs'),
  path.join(process.cwd(), 'my-agent')
];

const replacements = [
  { regex: /React \+ Vite \+ TypeScript/g, replacement: "Next.js App Router + TypeScript" },
  { regex: /VITE_API_BASE_URL/g, replacement: "NEXT_PUBLIC_API_BASE_URL" },
  { regex: /\[React \/ Streamlit UI: Role Dashboards & Scenario Dispatch\]/g, replacement: "[Next.js UI: Marketing, Dashboards & Simulator]" },
  { regex: /\[Streamlit UI: live agent log \+ final decision\]/g, replacement: "[Next.js UI: Live Agent Telemetry + Role Dashboards]" },
  { regex: /- \*\*Streamlit\*\* - for the UI./g, replacement: "- **Next.js** - for the unified Frontend UI." },
  { regex: /- Build Streamlit front end./g, replacement: "- Build Next.js full-stack front end." },
  { regex: /streamlit_app\.py\s+demo front end/g, replacement: "frontend/           Next.js Application" }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Don't recurse into subdirectories for this specific script to avoid touching unintended things, except for my-agent/docs
    } else if (file.endsWith('.md')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

// Process specific directories
processDirectory(path.join(process.cwd(), 'docs'));
processDirectory(path.join(process.cwd(), 'my-agent/docs'));
processDirectory(path.join(process.cwd(), 'my-agent'));

console.log('Documentation scan and update complete.');
