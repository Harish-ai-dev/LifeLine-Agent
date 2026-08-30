import fs from 'fs';
import path from 'path';

// 1. Navbar.tsx
const navbarPath = path.join(process.cwd(), 'src/components/marketing/Navbar.tsx');
let navbar = fs.readFileSync(navbarPath, 'utf8');
const navbarLogoRegex = /<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600.*?<\/div>\s*<\/div>/s;
navbar = navbar.replace(navbarLogoRegex, `<img src="/logo.png" alt="LifeLine Agent Logo" className="w-9 h-9 rounded-[11px] shadow-md group-hover:scale-110 transition-transform duration-300" />`);
fs.writeFileSync(navbarPath, navbar);

// 2. LoginPage
const loginPath = path.join(process.cwd(), 'src/app/login/page.tsx');
let login = fs.readFileSync(loginPath, 'utf8');
const loginLogoRegex = /<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-red-500\/20">\s*<Activity className="w-5 h-5 animate-pulse" \/>\s*<\/div>/s;
login = login.replace(loginLogoRegex, `<img src="/logo.png" alt="LifeLine Agent Logo" className="w-9 h-9 rounded-[11px] shadow-md hover:scale-110 transition-transform duration-300" />`);
fs.writeFileSync(loginPath, login);

// 3. Sidebar.tsx
const sidebarPath = path.join(process.cwd(), 'src/components/layout/Sidebar.tsx');
let sidebar = fs.readFileSync(sidebarPath, 'utf8');
const sidebarLogoRegex = /<div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-red-500\/20 shrink-0">\s*<Activity className="w-5 h-5 animate-pulse" \/>\s*<\/div>/s;
sidebar = sidebar.replace(sidebarLogoRegex, `<img src="/logo.png" alt="LifeLine Agent Logo" className="w-9 h-9 rounded-[11px] shadow-md shrink-0 hover:scale-110 transition-transform duration-300" />`);
fs.writeFileSync(sidebarPath, sidebar);

console.log("Logo replaced in Navbar, Login, and Sidebar!");
