const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots/scan');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '375px', width: 375, height: 812 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
  { name: '1920px', width: 1920, height: 1080 },
];

const ROLES = {
  unauth: null,
  hospital_staff: {
    token: 'lifeline_mock_hospital_staff_usr_1001',
    user: {
      id: 'usr_1001',
      username: 'dr_mehta',
      role: 'hospital_staff',
      facility_id: 'hosp-lilavati',
      facility_name: 'Lilavati Hospital & Research Centre'
    }
  },
  clinical_staff: {
    token: 'lifeline_mock_hospital_staff_usr_1002',
    user: {
      id: 'usr_1002',
      username: 'dr_ananya',
      role: 'hospital_staff',
      facility_id: 'hosp-kem',
      facility_name: 'KEM Hospital Mumbai'
    }
  },
  blood_donor: {
    token: 'lifeline_mock_blood_donor_usr_2001',
    user: {
      id: 'usr_2001',
      username: 'rahul_sharma',
      role: 'blood_donor',
      donor_id: 'DONOR-001'
    }
  },
  government_authority: {
    token: 'lifeline_mock_government_authority_usr_3001',
    user: {
      id: 'usr_3001',
      username: 'dir_sharma',
      role: 'government_authority',
      facility_id: 'AUTH-001',
      facility_name: 'Maharashtra Health Directorate'
    }
  }
};

const PAGES_TO_SCAN = [
  // Marketing & Public
  { id: 'web_landing', path: '/web', role: 'unauth', category: 'Marketing' },
  { id: 'root_landing', path: '/', role: 'unauth', category: 'Marketing' },
  { id: 'about', path: '/about', role: 'unauth', category: 'Marketing' },
  { id: 'agents', path: '/agents', role: 'unauth', category: 'Marketing' },
  { id: 'architecture', path: '/architecture', role: 'unauth', category: 'Marketing' },
  { id: 'contribute', path: '/contribute', role: 'unauth', category: 'Marketing' },
  { id: 'docs', path: '/docs', role: 'unauth', category: 'Marketing' },
  { id: 'legal', path: '/legal', role: 'unauth', category: 'Marketing' },
  { id: 'provenance', path: '/provenance', role: 'unauth', category: 'Marketing' },
  { id: 'simulator', path: '/simulator', role: 'unauth', category: 'Marketing' },
  { id: 'emergency_sos', path: '/emergency', role: 'unauth', category: 'Emergency' },

  // Auth
  { id: 'login', path: '/login', role: 'unauth', category: 'Auth' },

  // Hospital Portal
  { id: 'hospital_dashboard', path: '/hospital', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_facility_lilavati', path: '/hospital/facility/hosp-lilavati', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_facility_kem', path: '/hospital/facility/hosp-kem', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_facilities', path: '/hospital/facilities', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_beds', path: '/hospital/beds', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_blood_bank', path: '/hospital/blood-bank', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_requests', path: '/hospital/requests', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_issues', path: '/hospital/issues', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_inventory', path: '/hospital/inventory', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_patients', path: '/hospital/patients', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_sos', path: '/hospital/sos', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_audit', path: '/hospital/audit', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_copilot', path: '/hospital/copilot', role: 'hospital_staff', category: 'Hospital' },

  // Donor Portal
  { id: 'donor_dashboard', path: '/donor', role: 'blood_donor', category: 'Donor' },
  { id: 'donor_profile', path: '/donor/profile', role: 'blood_donor', category: 'Donor' },
  { id: 'donor_requests', path: '/donor/requests', role: 'blood_donor', category: 'Donor' },
  { id: 'donor_donations', path: '/donor/donations', role: 'blood_donor', category: 'Donor' },

  // Government Authority Portal
  { id: 'government_dashboard', path: '/government', role: 'government_authority', category: 'Government' },
  { id: 'government_network', path: '/government/network', role: 'government_authority', category: 'Government' },
  { id: 'government_report', path: '/government/report', role: 'government_authority', category: 'Government' },
  { id: 'government_audit', path: '/government/audit', role: 'government_authority', category: 'Government' },
  { id: 'government_copilot', path: '/government/copilot', role: 'government_authority', category: 'Government' },
  { id: 'government_ask_ai', path: '/government/ask-ai', role: 'government_authority', category: 'Government' },
];

async function runScan() {
  console.log('Starting Full Scan across 5 viewports...');
  const browser = await chromium.launch({ headless: true });
  const allFindings = [];
  const scanLog = [];

  for (const vp of VIEWPORTS) {
    console.log(\n========================================);
    console.log(SCANNING BREAKPOINT:  (x));
    console.log(========================================);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LifeLine-Scanner/1.0',
    });

    const page = await context.newPage();

    // Listen for console and network errors
    const pageConsoleErrors = [];
    const pageNetworkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageConsoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      pageConsoleErrors.push(Uncaught: );
    });

    page.on('requestfailed', req => {
      pageNetworkErrors.push(${req.method()}  - );
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon.ico')) {
        pageNetworkErrors.push(HTTP : );
      }
    });

    for (const item of PAGES_TO_SCAN) {
      pageConsoleErrors.length = 0;
      pageNetworkErrors.length = 0;

      const targetUrl = ${BASE_URL};
      const screenshotFilename = ${item.id}_.png;
      const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFilename);

      try {
        // Set Auth State in localStorage before navigation if role is needed
        if (item.role && ROLES[item.role]) {
          const authData = ROLES[item.role];
          await page.goto(${BASE_URL}/login, { waitUntil: 'domcontentloaded' });
          await page.evaluate(({ token, user }) => {
            localStorage.setItem('lifeline_token', token);
            localStorage.setItem('lifeline_user', JSON.stringify(user));
          }, authData);
        } else {
          // Clear auth for unauth
          await page.goto(${BASE_URL}/login, { waitUntil: 'domcontentloaded' });
          await page.evaluate(() => {
            localStorage.removeItem('lifeline_token');
            localStorage.removeItem('lifeline_user');
          });
        }

        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
          await page.waitForTimeout(2000);
        });

        await page.waitForTimeout(1000); // Allow render animations to settle

        // Run in-page DOM analysis
        const domAnalysis = await page.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          const winWidth = window.innerWidth;
          const winHeight = window.innerHeight;

          // 1. Horizontal overflow
          const docScrollWidth = html.scrollWidth;
          const hasHorizontalOverflow = docScrollWidth > winWidth + 2;

          // Elements overflowing window width
          const overflowingElements = [];
          const allElements = Array.from(document.querySelectorAll('*'));
          for (const el of allElements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winWidth + 5 && rect.width > 0 && rect.height > 0) {
              const tag = el.tagName.toLowerCase();
              const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join(' ') : '';
              overflowingElements.push({ tag, cls, right: Math.round(rect.right), width: Math.round(rect.width) });
              if (overflowingElements.length >= 5) break;
            }
          }

          // 2. Dead links (href=# or href=undefined or empty)
          const links = Array.from(document.querySelectorAll('a'));
          const deadLinks = [];
          for (const a of links) {
            const href = a.getAttribute('href');
            if (href === '#' || href === 'undefined' || href === '' || href === 'null') {
              deadLinks.push({ text: a.innerText.trim().slice(0, 30), href });
            }
          }

          // 3. Broken images
          const images = Array.from(document.querySelectorAll('img'));
          const brokenImages = images.filter(img => img.naturalWidth === 0 && img.getAttribute('src') && !img.getAttribute('src').startsWith('data:')).map(img => img.getAttribute('src'));

          // 4. Exposed secrets / keys
          const pageText = document.body.innerText;
          const potentialSecrets = [];
          const secretPatterns = [
            /AIza[0-9A-Za-z-_]{35}/g, // Google API key
            /ghp_[0-9a-zA-Z]{36}/g,   // GitHub token
            /sk_live_[0-9a-zA-Z]{24}/g, // Stripe key
            /ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g // JWT
          ];
          for (const pat of secretPatterns) {
            const matches = pageText.match(pat);
            if (matches) {
              potentialSecrets.push(...matches);
            }
          }

          // 5. Detect empty critical containers or broken components
          const emptyCards = [];
          const cards = Array.from(document.querySelectorAll('.card, [class*=rounded-2xl], [class*=rounded-xl]'));
          for (const c of cards) {
            if (c.getBoundingClientRect().height > 50 && c.innerText.trim() === '') {
              emptyCards.push(c.className.slice(0, 30));
            }
          }

          return {
            title: document.title,
            hasHorizontalOverflow,
            docScrollWidth,
            winWidth,
            overflowingElements,
            deadLinks: deadLinks.slice(0, 5),
            brokenImages: brokenImages.slice(0, 3),
            potentialSecrets: potentialSecrets.slice(0, 3),
            emptyCardsCount: emptyCards.length,
          };
        });

        // Capture screenshot
        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log([] Scanned  ->  | H-Overflow: );

        // Analyze and classify findings
        if (domAnalysis.hasHorizontalOverflow) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Layout / Responsiveness',
            severity: 'P1',
            description: Horizontal page overflow detected: document scrollWidth (px) exceeds viewport width (px). Offending elements: ,
            screenshot: docs/screenshots/scan/
          });
        }

        if (pageConsoleErrors.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Console / Runtime Error',
            severity: pageConsoleErrors.some(e => e.includes('Uncaught') || e.includes('404')) ? 'P1' : 'P2',
            description: Console errors observed on page load: ,
            screenshot: docs/screenshots/scan/
          });
        }

        if (pageNetworkErrors.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'API / Network Error',
            severity: pageNetworkErrors.some(e => e.includes('500') || e.includes('404')) ? 'P1' : 'P2',
            description: Network request failures: ,
            screenshot: docs/screenshots/scan/
          });
        }

        if (domAnalysis.deadLinks.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Navigation / Broken Link',
            severity: 'P2',
            description: Found empty or placeholder links (href=# or href="): ,
 screenshot: docs/screenshots/scan/
 });
 }

 if (domAnalysis.brokenImages.length > 0) {
 allFindings.push({
 page: item.path,
 breakpoint: vp.name,
 category: 'Visual / Assets',
 severity: 'P2',
 description: Broken image source detected: ,
 screenshot: docs/screenshots/scan/
 });
 }

 if (domAnalysis.potentialSecrets.length > 0) {
 allFindings.push({
 page: item.path,
 breakpoint: vp.name,
 category: 'Security / Exposure',
 severity: 'P0',
 description: Exposed secret/token strings rendered in DOM: ,
 screenshot: docs/screenshots/scan/
 });
 }

 scanLog.push({
 page: item.path,
 breakpoint: vp.name,
 title: domAnalysis.title,
 errors: pageConsoleErrors.length,
 networkErrors: pageNetworkErrors.length,
 horizontalOverflow: domAnalysis.hasHorizontalOverflow,
 screenshot: screenshotFilename
 });

 } catch (err) {
 console.error(Error scanning at :, err.message);
 allFindings.push({
 page: item.path,
 breakpoint: vp.name,
 category: 'Functional / Crash',
 severity: 'P0',
 description: Page failed to load or crashed: ,
 screenshot: docs/screenshots/scan/
 });
 }
 }

 // Modal & Overlay Scans for this viewport
 console.log([] Scanning Modals and Overlays...);

 // 1. Unified Copilot Modal (Hospital)
 try {
 const authData = ROLES.hospital_staff;
 await page.goto(${BASE_URL}/hospital, { waitUntil: 'networkidle' }).catch(() => {});
 await page.evaluate(({ token, user }) => {
 localStorage.setItem('lifeline_token', token);
 localStorage.setItem('lifeline_user', JSON.stringify(user));
 }, authData);
 await page.goto(${BASE_URL}/hospital, { waitUntil: 'networkidle' });
 await page.waitForTimeout(1000);

 // Trigger Unified Copilot (button with Ask AI or Copilot icon)
 const copilotBtn = await page.button:has-text(Ask AI), button[title*=Copilot], button[aria-label*=Copilot];
 if (copilotBtn) {
 await copilotBtn.click();
 await page.waitForTimeout(600);
 const copilotShot = modal_unified_copilot_.png;
 await page.screenshot({ path: path.join(SCREENSHOT_DIR, copilotShot), fullPage: false });
 console.log([] Captured Unified Copilot Modal -> );
 }

 // 2. Notification Center Popup (Bell Icon)
 const bellBtn = await page.button:has(svg.lucide-bell), button[aria-label*=Notification];
 if (bellBtn) {
 await bellBtn.click();
 await page.waitForTimeout(600);
 const notifShot = modal_notifications_.png;
 await page.screenshot({ path: path.join(SCREENSHOT_DIR, notifShot), fullPage: false });
 console.log([] Captured Notification Center -> );
 }

 // 3. Facility Switcher Dropdown
 const facilitySwitcher = await page.[aria-label*=facility], button:has-text(Lilavati), select, div[class*=facility-switcher];
 if (facilitySwitcher) {
 await facilitySwitcher.click().catch(() => {});
 await page.waitForTimeout(500);
 const facilityShot = modal_facility_switcher_.png;
 await page.screenshot({ path: path.join(SCREENSHOT_DIR, facilityShot), fullPage: false });
 console.log([] Captured Facility Switcher -> );
 }

 // 4. Emergency SOS Modal (Broadcast / Trigger)
 await page.goto(${BASE_URL}/emergency, { waitUntil: 'networkidle' });
 await page.waitForTimeout(1000);
 const sosShot = modal_emergency_sos_.png;
 await page.screenshot({ path: path.join(SCREENSHOT_DIR, sosShot), fullPage: false });

 // 5. Staff Broadcast / Alert Modal on Hospital SOS page
 await page.goto(${BASE_URL}/hospital/sos, { waitUntil: 'networkidle' });
 await page.waitForTimeout(1000);
 const broadcastBtn = await page.button:has-text(Broadcast), button:has-text(Trigger SOS), button:has-text(Emergency);
 if (broadcastBtn) {
 await broadcastBtn.click().catch(() => {});
 await page.waitForTimeout(600);
 const broadcastShot = modal_staff_broadcast_.png;
 await page.screenshot({ path: path.join(SCREENSHOT_DIR, broadcastShot), fullPage: false });
 console.log([] Captured Staff Broadcast Modal -> );
 }

 } catch (modalErr) {
 console.error(Error capturing modals at :, modalErr.message);
 }

 await context.close();
 }

 await browser.close();

 // Save scan results to JSON
 fs.writeFileSync(
 path.join(SCREENSHOT_DIR, 'scan_results.json'),
 JSON.stringify({ findings: allFindings, log: scanLog }, null, 2),
 'utf-8'
 );

 console.log(\nScan complete! Found issue findings across all viewports.);
}

runScan().catch(err => {
 console.error('Fatal scan failure:', err);
 process.exit(1);
});
