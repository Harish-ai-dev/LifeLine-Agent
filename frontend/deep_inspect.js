const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve(__dirname, '../docs/screenshots/scan');

const ROLES = {
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

async function deepInspect() {
  console.log('Starting Deep Interactive and Visual Inspection...');
  const browser = await chromium.launch({ headless: true });
  const findings = [];

  const viewports = [
    { name: '375px', width: 375, height: 812 },
    { name: '768px', width: 768, height: 1024 },
    { name: '1024px', width: 1024, height: 768 },
    { name: '1440px', width: 1440, height: 900 },
    { name: '1920px', width: 1920, height: 1080 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // 1. Test Login View Autofill & Submission
    console.log(`[${vp.name}] Testing Login View...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    // Test autofill demo credentials button
    const autofillBtn = await page.$('button:has-text("Autofill Demo Credentials")');
    if (autofillBtn) {
      await autofillBtn.click();
      await page.waitForTimeout(300);
      const usernameVal = await page.$eval('input[autocomplete="username"]', el => el.value).catch(() => '');
      if (!usernameVal) {
        findings.push({
          page: '/login',
          breakpoint: vp.name,
          category: 'Functional / Form',
          severity: 'P1',
          description: 'Login autofill demo credentials button clicked but username field was not populated.',
          screenshot: `docs/screenshots/scan/login_${vp.name}.png`
        });
      }
    }

    // 2. Test Hospital Console Navigation and Interactivity
    console.log(`[${vp.name}] Testing Hospital Console Interaction...`);
    await page.evaluate((auth) => {
      localStorage.setItem('lifeline_token', auth.token);
      localStorage.setItem('lifeline_user', JSON.stringify(auth.user));
    }, ROLES.hospital_staff);

    await page.goto(`${BASE_URL}/hospital`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Check if Mobile Menu / Hamburger exists on mobile
    if (vp.width <= 768) {
      const menuBtn = await page.$('button:has(svg.lucide-menu), button[aria-label*="menu"]');
      if (!menuBtn) {
        findings.push({
          page: '/hospital',
          breakpoint: vp.name,
          category: 'Navigation / Mobile UX',
          severity: 'P1',
          description: 'Mobile menu toggle button (hamburger) missing or not accessible in topbar at mobile/tablet viewport.',
          screenshot: `docs/screenshots/scan/hospital_dashboard_${vp.name}.png`
        });
      }
    }

    // 3. Test Bed Reservation Action on /hospital/beds
    console.log(`[${vp.name}] Testing Bed Reservation Flow...`);
    await page.goto(`${BASE_URL}/hospital/beds`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const reserveBedBtn = await page.$('button:has-text("Reserve"), button:has-text("Book Bed")');
    if (reserveBedBtn) {
      await reserveBedBtn.click();
      await page.waitForTimeout(400);
      const modalExists = await page.$('div[role="dialog"], [class*="modal"], [class*="fixed inset-0"]');
      if (!modalExists) {
        findings.push({
          page: '/hospital/beds',
          breakpoint: vp.name,
          category: 'Functional / Modal',
          severity: 'P1',
          description: 'Clicking "Reserve Bed" button did not open Bed Reservation Modal overlay.',
          screenshot: `docs/screenshots/scan/hospital_beds_${vp.name}.png`
        });
      }
    }

    // 4. Test Blood Bank Donor Broadcast Action on /hospital/blood-bank
    console.log(`[${vp.name}] Testing Blood Bank Request Flow...`);
    await page.goto(`${BASE_URL}/hospital/blood-bank`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const broadcastBloodBtn = await page.$('button:has-text("Broadcast Urgent Request"), button:has-text("Request Blood")');
    if (broadcastBloodBtn) {
      await broadcastBloodBtn.click();
      await page.waitForTimeout(400);
      const bloodModal = await page.$('div[role="dialog"], [class*="modal"], [class*="fixed inset-0"]');
      if (!bloodModal) {
        findings.push({
          page: '/hospital/blood-bank',
          breakpoint: vp.name,
          category: 'Functional / Modal',
          severity: 'P1',
          description: 'Clicking "Broadcast Urgent Request" button did not open Donor Request Modal.',
          screenshot: `docs/screenshots/scan/hospital_blood_bank_${vp.name}.png`
        });
      }
    }

    // 5. Test Facility URL binding: /hospital/facility/hosp-lilavati vs /hospital/facility/hosp-kem
    console.log(`[${vp.name}] Testing Facility Data Binding...`);
    await page.goto(`${BASE_URL}/hospital/facility/hosp-kem`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const kemPageText = await page.evaluate(() => document.body.innerText);
    if (!kemPageText.toLowerCase().includes('kem') && !kemPageText.toLowerCase().includes('king edward')) {
      findings.push({
        page: '/hospital/facility/hosp-kem',
        breakpoint: vp.name,
        category: 'Data / Binding',
        severity: 'P1',
        description: 'Facility detail route /hospital/facility/hosp-kem failed to render KEM Hospital name or data binding in header/cards.',
        screenshot: `docs/screenshots/scan/hospital_facility_kem_${vp.name}.png`
      });
    }

    // 6. Test Donor Portal Accept / Decline Interaction on /donor/requests
    console.log(`[${vp.name}] Testing Donor Request Interaction...`);
    await page.evaluate((auth) => {
      localStorage.setItem('lifeline_token', auth.token);
      localStorage.setItem('lifeline_user', JSON.stringify(auth.user));
    }, ROLES.blood_donor);

    await page.goto(`${BASE_URL}/donor/requests`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const acceptBtn = await page.$('button:has-text("Accept"), button:has-text("Pledge"), button:has-text("Respond")');
    if (acceptBtn) {
      const initialText = await page.evaluate(el => el.innerText, acceptBtn);
      await acceptBtn.click();
      await page.waitForTimeout(400);
      const afterText = await page.evaluate(el => el.innerText, acceptBtn).catch(() => '');
      console.log(`[${vp.name}] Donor accept button clicked: "${initialText}" -> "${afterText}"`);
    }

    // 7. Test Government Authority NL Query & Daily Report
    console.log(`[${vp.name}] Testing Government Authority Report...`);
    await page.evaluate((auth) => {
      localStorage.setItem('lifeline_token', auth.token);
      localStorage.setItem('lifeline_user', JSON.stringify(auth.user));
    }, ROLES.government_authority);

    await page.goto(`${BASE_URL}/government/report`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const generateReportBtn = await page.$('button:has-text("Generate"), button:has-text("Refresh"), button:has-text("Run AI Summary")');
    if (generateReportBtn) {
      await generateReportBtn.click().catch(() => {});
      await page.waitForTimeout(1000);
    }

    // 8. Test Emergency SOS Dispatch simulator on /emergency
    console.log(`[${vp.name}] Testing Emergency Dispatch Page...`);
    await page.goto(`${BASE_URL}/emergency`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const triggerSosBtn = await page.$('button:has-text("TRIGGER EMERGENCY SOS"), button:has-text("Dispatch"), button:has-text("Send Emergency Alert")');
    if (triggerSosBtn) {
      console.log(`[${vp.name}] Emergency SOS trigger button present on /emergency`);
    }

    await context.close();
  }

  await browser.close();

  console.log(`Deep inspection completed with ${findings.length} findings.`);
  return findings;
}

deepInspect().catch(console.error);
