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

  // Auth & Login
  { id: 'login', path: '/login', role: 'unauth', category: 'Auth' },

  // Hospital Portal
  { id: 'hospital_dashboard', path: '/hospital', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_facility_lilavati', path: '/hospital/facility/hosp-lilavati', role: 'hospital_staff', category: 'Hospital' },
  { id: 'hospital_facility_kem', path: '/hospital/facility/hosp-kem', role: 'clinical_staff', category: 'Hospital' },
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
  console.log('Starting Fast Full Scan across 5 viewports...');
  const browser = await chromium.launch({ headless: true });
  const allFindings = [];
  const scanLog = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n========================================`);
    console.log(`SCANNING BREAKPOINT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);

    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 LifeLine-Scanner/1.0',
    });

    const page = await context.newPage();

    const pageConsoleErrors = [];
    const pageNetworkErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        pageConsoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      pageConsoleErrors.push(`Uncaught: ${err.message}`);
    });

    page.on('response', resp => {
      if (resp.status() >= 400 && !resp.url().includes('favicon.ico')) {
        pageNetworkErrors.push(`HTTP ${resp.status()}: ${resp.url()}`);
      }
    });

    let currentRole = null;

    for (const item of PAGES_TO_SCAN) {
      pageConsoleErrors.length = 0;
      pageNetworkErrors.length = 0;

      const targetUrl = `${BASE_URL}${item.path}`;
      const screenshotFilename = `${item.id}_${vp.name}.png`;
      const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFilename);

      try {
        // Only re-set localStorage if role changed
        if (item.role !== currentRole) {
          await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
          if (item.role && ROLES[item.role]) {
            const authData = ROLES[item.role];
            await page.evaluate((auth) => {
              localStorage.setItem('lifeline_token', auth.token);
              localStorage.setItem('lifeline_user', JSON.stringify(auth.user));
            }, authData);
          } else {
            await page.evaluate(() => {
              localStorage.removeItem('lifeline_token');
              localStorage.removeItem('lifeline_user');
            });
          }
          currentRole = item.role;
        }

        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(600); // Allow render to complete

        const domAnalysis = await page.evaluate(() => {
          const body = document.body;
          const html = document.documentElement;
          const winWidth = window.innerWidth;

          // 1. Horizontal overflow
          const docScrollWidth = Math.max(html.scrollWidth, body.scrollWidth);
          const hasHorizontalOverflow = docScrollWidth > winWidth + 2;

          const overflowingElements = [];
          const allElements = Array.from(document.querySelectorAll('*'));
          for (const el of allElements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winWidth + 5 && rect.width > 0 && rect.height > 0) {
              const tag = el.tagName.toLowerCase();
              const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 3).join(' ') : '';
              overflowingElements.push({ tag, cls, right: Math.round(rect.right), width: Math.round(rect.width) });
              if (overflowingElements.length >= 3) break;
            }
          }

          // 2. Dead links (href="#" or href="undefined" or empty)
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
            /AIza[0-9A-Za-z-_]{35}/g,
            /ghp_[0-9a-zA-Z]{36}/g,
            /sk_live_[0-9a-zA-Z]{24}/g
          ];
          for (const pat of secretPatterns) {
            const matches = pageText.match(pat);
            if (matches) {
              potentialSecrets.push(...matches);
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
          };
        });

        await page.screenshot({ path: screenshotPath, fullPage: true });

        console.log(`[${vp.name}] Scanned ${item.path} -> ${screenshotFilename} | H-Overflow: ${domAnalysis.hasHorizontalOverflow}`);

        if (domAnalysis.hasHorizontalOverflow) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Layout / Responsiveness',
            severity: 'P1',
            description: `Horizontal page overflow: document scrollWidth (${domAnalysis.docScrollWidth}px) exceeds viewport width (${domAnalysis.winWidth}px). Offending elements: ${JSON.stringify(domAnalysis.overflowingElements)}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
          });
        }

        if (pageConsoleErrors.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Console / Runtime Error',
            severity: pageConsoleErrors.some(e => e.includes('Uncaught') || e.includes('404')) ? 'P1' : 'P2',
            description: `Console errors on page load: ${pageConsoleErrors.join(' | ').slice(0, 250)}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
          });
        }

        if (pageNetworkErrors.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'API / Network Error',
            severity: pageNetworkErrors.some(e => e.includes('500') || e.includes('404')) ? 'P1' : 'P2',
            description: `Network request failures: ${pageNetworkErrors.join(' | ').slice(0, 250)}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
          });
        }

        if (domAnalysis.deadLinks.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Navigation / Broken Link',
            severity: 'P2',
            description: `Empty or placeholder links (href="#" or href=""): ${JSON.stringify(domAnalysis.deadLinks)}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
          });
        }

        if (domAnalysis.brokenImages.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Visual / Assets',
            severity: 'P2',
            description: `Broken image source: ${domAnalysis.brokenImages.join(', ')}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
          });
        }

        if (domAnalysis.potentialSecrets.length > 0) {
          allFindings.push({
            page: item.path,
            breakpoint: vp.name,
            category: 'Security / Exposure',
            severity: 'P0',
            description: `Exposed secret/token in DOM: ${domAnalysis.potentialSecrets.join(', ').slice(0, 100)}`,
            screenshot: `docs/screenshots/scan/${screenshotFilename}`
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
        console.error(`Error scanning ${item.path} at ${vp.name}:`, err.message);
        allFindings.push({
          page: item.path,
          breakpoint: vp.name,
          category: 'Functional / Crash',
          severity: 'P0',
          description: `Page failed to load or crashed: ${err.message}`,
          screenshot: `docs/screenshots/scan/${screenshotFilename}`
        });
      }
    }

    // Modal & Overlay Scans for this viewport
    console.log(`[${vp.name}] Scanning Modals, Login Tabs, and Overlays...`);

    try {
      // 1. Scan Login Tabs (all 4 roles)
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.removeItem('lifeline_token');
        localStorage.removeItem('lifeline_user');
      });
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);

      const loginTabs = [
        { name: 'hospital_console', selector: 'button:has-text("Hospital Console"), button:has-text("Hospital")' },
        { name: 'clinical_staff', selector: 'button:has-text("Clinical Staff"), button:has-text("Staff")' },
        { name: 'blood_donor', selector: 'button:has-text("Blood Donor"), button:has-text("Donor")' },
        { name: 'health_authority', selector: 'button:has-text("Health Authority"), button:has-text("Authority"), button:has-text("Government")' }
      ];

      for (const tab of loginTabs) {
        const tabBtn = await page.$(tab.selector);
        if (tabBtn) {
          await tabBtn.click().catch(() => {});
          await page.waitForTimeout(300);
          const tabShot = `login_tab_${tab.name}_${vp.name}.png`;
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, tabShot), fullPage: true });
        }
      }

      // 2. Unified Copilot Modal (Hospital Topbar)
      const authData = ROLES.hospital_staff;
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate((auth) => {
        localStorage.setItem('lifeline_token', auth.token);
        localStorage.setItem('lifeline_user', JSON.stringify(auth.user));
      }, authData);
      await page.goto(`${BASE_URL}/hospital`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const copilotBtn = await page.$('button:has-text("Ask AI"), button[title*="Copilot"], button[aria-label*="Copilot"]');
      if (copilotBtn) {
        await copilotBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const copilotShot = `modal_unified_copilot_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, copilotShot), fullPage: false });
        console.log(`[${vp.name}] Captured Unified Copilot Modal -> ${copilotShot}`);
        const closeBtn = await page.$('button:has(svg.lucide-x), button[aria-label="Close"]');
        if (closeBtn) await closeBtn.click().catch(() => {});
      }

      // 3. Notification Center Popup (Bell Icon)
      const bellBtn = await page.$('button:has(svg.lucide-bell), button[aria-label*="Notification"]');
      if (bellBtn) {
        await bellBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const notifShot = `modal_notifications_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, notifShot), fullPage: false });
        console.log(`[${vp.name}] Captured Notification Center -> ${notifShot}`);
        await page.keyboard.press('Escape').catch(() => {});
      }

      // 4. Facility Switcher Dropdown in Topbar
      const facilitySwitcher = await page.$('[aria-label*="facility"], button:has-text("Lilavati"), select, div[class*="facility-switcher"]');
      if (facilitySwitcher) {
        await facilitySwitcher.click().catch(() => {});
        await page.waitForTimeout(300);
        const facilityShot = `modal_facility_switcher_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, facilityShot), fullPage: false });
        console.log(`[${vp.name}] Captured Facility Switcher -> ${facilityShot}`);
      }

      // 5. Emergency SOS Broadcast Modal on Hospital SOS page
      await page.goto(`${BASE_URL}/hospital/sos`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const broadcastBtn = await page.$('button:has-text("Broadcast"), button:has-text("Trigger SOS"), button:has-text("Emergency")');
      if (broadcastBtn) {
        await broadcastBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const broadcastShot = `modal_staff_broadcast_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, broadcastShot), fullPage: false });
        console.log(`[${vp.name}] Captured Staff Broadcast Modal -> ${broadcastShot}`);
      }

      // 6. Bed Reservation Modal on Beds page
      await page.goto(`${BASE_URL}/hospital/beds`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const reserveBtn = await page.$('button:has-text("Reserve"), button:has-text("Book Bed"), button:has-text("New Reservation")');
      if (reserveBtn) {
        await reserveBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const bedShot = `modal_bed_reservation_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, bedShot), fullPage: false });
        console.log(`[${vp.name}] Captured Bed Reservation Modal -> ${bedShot}`);
      }

      // 7. Donor Request Modal on Blood Bank page
      await page.goto(`${BASE_URL}/hospital/blood-bank`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const reqBtn = await page.$('button:has-text("Request Blood"), button:has-text("Broadcast Request"), button:has-text("Urgent Request")');
      if (reqBtn) {
        await reqBtn.click().catch(() => {});
        await page.waitForTimeout(400);
        const donorReqShot = `modal_donor_request_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, donorReqShot), fullPage: false });
        console.log(`[${vp.name}] Captured Donor Request Modal -> ${donorReqShot}`);
      }

    } catch (modalErr) {
      console.error(`Error capturing modals at ${vp.name}:`, modalErr.message);
    }

    await context.close();
  }

  await browser.close();

  fs.writeFileSync(
    path.join(SCREENSHOT_DIR, 'scan_results.json'),
    JSON.stringify({ findings: allFindings, log: scanLog }, null, 2),
    'utf-8'
  );

  console.log(`\nScan complete! Generated all screenshots and scan_results.json.`);
}

runScan().catch(err => {
  console.error('Fatal scan failure:', err);
  process.exit(1);
});
