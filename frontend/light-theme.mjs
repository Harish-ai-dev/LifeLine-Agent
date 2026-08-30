import fs from 'fs';
import path from 'path';

const dirs = [
  path.join(process.cwd(), 'src/components/marketing'),
  path.join(process.cwd(), 'src/app/(marketing)')
];

const replacements = [
  { regex: /bg-\[\#0B1120\]/g, replacement: "bg-slate-50 dark:bg-[#0B1120]" },
  { regex: /bg-slate-950/g, replacement: "bg-slate-50 dark:bg-slate-950" },
  { regex: /bg-slate-900/g, replacement: "bg-white dark:bg-slate-900" },
  { regex: /bg-slate-800/g, replacement: "bg-slate-100 dark:bg-slate-800" },
  { regex: /bg-slate-900\/50/g, replacement: "bg-white/50 dark:bg-slate-900/50" },
  { regex: /bg-slate-900\/90/g, replacement: "bg-white/90 dark:bg-slate-900/90" },
  
  { regex: /text-white/g, replacement: "text-slate-900 dark:text-white" },
  { regex: /text-slate-100/g, replacement: "text-slate-800 dark:text-slate-100" },
  { regex: /text-slate-200/g, replacement: "text-slate-700 dark:text-slate-200" },
  { regex: /text-slate-300/g, replacement: "text-slate-600 dark:text-slate-300" },
  { regex: /text-slate-400/g, replacement: "text-slate-500 dark:text-slate-400" },
  { regex: /text-slate-500/g, replacement: "text-slate-400 dark:text-slate-500" }, // This one is tricky, keep it standard

  { regex: /border-slate-800/g, replacement: "border-slate-200 dark:border-slate-800" },
  { regex: /border-slate-700/g, replacement: "border-slate-300 dark:border-slate-700" },
  { regex: /border-slate-900/g, replacement: "border-slate-200 dark:border-slate-900" },
  
  { regex: /from-slate-900/g, replacement: "from-white dark:from-slate-900" },
  { regex: /via-slate-900/g, replacement: "via-white dark:via-slate-900" },
  { regex: /to-slate-900/g, replacement: "to-white dark:to-slate-900" },
  { regex: /from-\[\#0B1120\]/g, replacement: "from-slate-50 dark:from-[#0B1120]" },
  { regex: /via-\[\#0B1120\]/g, replacement: "via-slate-50 dark:via-[#0B1120]" },
  { regex: /to-\[\#0B1120\]/g, replacement: "to-slate-50 dark:to-[#0B1120]" },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      for (const { regex, replacement } of replacements) {
        // Only replace if it doesn't already have dark: prefix to prevent double replacements
        // This is a bit tricky with regex, we'll just do a straight replace and then clean up doubles if needed
        content = content.replace(regex, (match, offset, string) => {
           const before = string.substring(Math.max(0, offset - 5), offset);
           if (before.includes('dark:')) return match; // Skip if already prefixed
           return replacement;
        });
      }
      
      // Fix potential doubles like `dark:bg-white dark:bg-slate-900`
      content = content.replace(/dark:(text|bg|border|from|via|to)-[a-z0-9-\/\[\]#]+\s+dark:/g, 'dark:');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    processDirectory(dir);
  }
}

console.log('Light theme conversion completed.');
