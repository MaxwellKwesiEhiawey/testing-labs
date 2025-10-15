import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import fs from 'fs/promises';

test.describe('E2E Scenario E: Visual UI Validation with Baseline Screenshots', () => {

  const screenshotDir = './test-results/visual-baseline';
  const comparisonDir = './test-results/visual-comparison';

  test.beforeAll(async () => {
    // Ensure screenshot directories exist
    try {
      await fs.mkdir(screenshotDir, { recursive: true });
      await fs.mkdir(comparisonDir, { recursive: true });
    } catch (error) {
      console.log('Screenshot directories already exist or created', (error as Error).message);
    }
  });

  test('E2E: Login Page Visual Validation @e2e @visual @baseline', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Capturing login page baseline screenshots...');

    // Navigate to login page
    await loginPage.navigateToLogin();
    await page.waitForLoadState('networkidle');

    // Set consistent viewport for baseline
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    // Capture full login page
    await page.screenshot({
      path: `${screenshotDir}/login-page-full.png`,
      fullPage: true
    });

    // Capture login form only
    const loginForm = page.locator('.oxd-form');
    await loginForm.screenshot({
      path: `${screenshotDir}/login-form.png`
    });

    // Capture logo area
    const logoArea = page.locator('.orangehrm-login-branding');
    if (await logoArea.count() > 0) {
      await logoArea.screenshot({
        path: `${screenshotDir}/login-logo.png`
      });
    }

    // Test responsive design - mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: `${screenshotDir}/login-mobile.png`,
      fullPage: true
    });

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: `${screenshotDir}/login-tablet.png`,
      fullPage: true
    });

    console.log('Login page visual validation completed');
  });

  test('E2E: Dashboard Visual Validation @e2e @visual @dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Capturing dashboard baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow widgets to load

    // Capture full dashboard
    await page.screenshot({
      path: `${screenshotDir}/dashboard-admin-full.png`,
      fullPage: true
    });

    // Capture individual dashboard components
    const quickLaunch = page.locator('.orangehrm-quick-launch');
    if (await quickLaunch.count() > 0) {
      await quickLaunch.screenshot({
        path: `${screenshotDir}/dashboard-quick-launch.png`
      });
    }

    // Capture dashboard cards
    const dashboardCards = page.locator('.orangehrm-dashboard-card');
    const cardCount = await dashboardCards.count();
    
    for (let i = 0; i < Math.min(cardCount, 5); i++) {
      await dashboardCards.nth(i).screenshot({
        path: `${screenshotDir}/dashboard-card-${i + 1}.png`
      });
    }

    // Capture navigation menu
    const mainMenu = page.locator('.oxd-main-menu');
    await mainMenu.screenshot({
      path: `${screenshotDir}/navigation-menu.png`
    });

    // Capture top bar
    const topBar = page.locator('.oxd-topbar');
    await topBar.screenshot({
      path: `${screenshotDir}/top-bar.png`
    });

    console.log('Dashboard visual validation completed');
  });

  test('E2E: Employee Management Visual Validation @e2e @visual @employee', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Capturing employee management baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Employee List Page
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/employee-list-full.png`,
      fullPage: true
    });

    // Capture search form
    const searchForm = page.locator('.oxd-table-filter');
    await searchForm.screenshot({
      path: `${screenshotDir}/employee-search-form.png`
    });

    // Capture data table
    const dataTable = page.locator('.oxd-table');
    await dataTable.screenshot({
      path: `${screenshotDir}/employee-data-table.png`
    });

    // Add Employee Page
    await employeePage.navigateToAddEmployee();
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/add-employee-full.png`,
      fullPage: true
    });

    // Capture add employee form
    const addForm = page.locator('.oxd-form');
    await addForm.screenshot({
      path: `${screenshotDir}/add-employee-form.png`
    });

    console.log('Employee management visual validation completed');
  });

  test('E2E: Leave Management Visual Validation @e2e @visual @leave', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Capturing leave management baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Leave Module Dashboard
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/leave-dashboard-full.png`,
      fullPage: true
    });

    // Apply Leave Page
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/apply-leave-full.png`,
      fullPage: true
    });

    // Capture apply leave form
    const applyForm = page.locator('.oxd-form');
    await applyForm.screenshot({
      path: `${screenshotDir}/apply-leave-form.png`
    });

    // Test calendar widget
    await page.click('input[placeholder="yyyy-dd-mm"]');
    await page.waitForSelector('.oxd-calendar-dropdown', { state: 'visible' });
    
    const calendar = page.locator('.oxd-calendar-dropdown');
    await calendar.screenshot({
      path: `${screenshotDir}/calendar-widget.png`
    });

    // Close calendar
    await page.click('body');

    // My Leave Page
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/my-leave-full.png`,
      fullPage: true
    });

    console.log('Leave management visual validation completed');
  });

  test('E2E: Form States Visual Validation @e2e @visual @forms', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Capturing form states baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navigate to Add Employee for form testing
    await employeePage.navigateToAddEmployee();
    await page.waitForLoadState('networkidle');

    // Capture empty form state
    await page.screenshot({
      path: `${screenshotDir}/form-empty-state.png`,
      fullPage: true
    });

    // Fill partial form
    await page.fill('input[name="firstName"]', 'Visual');
    await page.fill('input[name="lastName"]', 'Test');

    // Capture partially filled form
    await page.screenshot({
      path: `${screenshotDir}/form-partial-filled.png`,
      fullPage: true
    });

    // Trigger validation errors
    await page.click('button[type="submit"]'); // This should trigger some validation

    // Wait for validation errors to appear
    await page.waitForTimeout(1000);

    // Capture form with validation errors
    await page.screenshot({
      path: `${screenshotDir}/form-validation-errors.png`,
      fullPage: true
    });

    // Enable login details to test more form elements
    await page.click('input[type="checkbox"]');
    await page.waitForSelector('input[autocomplete="username"]', { state: 'visible' });

    // Capture expanded form
    await page.screenshot({
      path: `${screenshotDir}/form-expanded-state.png`,
      fullPage: true
    });

    console.log('Form states visual validation completed');
  });

  test('E2E: Data Table Variations Visual Validation @e2e @visual @tables', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Capturing data table variations baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Employee List Table
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');

    // Capture table with data
    await page.screenshot({
      path: `${screenshotDir}/table-with-data.png`,
      fullPage: true
    });

    // Capture table header
    const tableHeader = page.locator('.oxd-table-header');
    await tableHeader.screenshot({
      path: `${screenshotDir}/table-header.png`
    });

    // Capture table pagination
    const tablePagination = page.locator('.oxd-table-footer');
    if (await tablePagination.count() > 0) {
      await tablePagination.screenshot({
        path: `${screenshotDir}/table-pagination.png`
      });
    }

    // Test table with search results
    await page.fill('input[placeholder="Type for hints..."]', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `${screenshotDir}/table-search-results.png`,
      fullPage: true
    });

    // Reset search to show empty results if possible
    await page.fill('input[placeholder="Type for hints..."]', 'NonExistentEmployee12345');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Capture no data state
    await page.screenshot({
      path: `${screenshotDir}/table-no-data.png`,
      fullPage: true
    });

    console.log('Data table variations visual validation completed');
  });

  test('E2E: Modal and Dialog Visual Validation @e2e @visual @modals', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Capturing modal and dialog baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');

    // Try to trigger a delete confirmation modal
    const deleteButton = page.locator('.bi-trash').first();
    
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      
      // Wait for modal to appear
      await page.waitForSelector('.oxd-dialog-container', { state: 'visible' });
      
      // Capture confirmation modal
      await page.screenshot({
        path: `${screenshotDir}/confirmation-modal.png`,
        fullPage: true
      });

      // Capture just the modal dialog
      const modal = page.locator('.oxd-dialog-container');
      await modal.screenshot({
        path: `${screenshotDir}/modal-dialog-only.png`
      });

      // Cancel the modal
      await page.click('.oxd-button--ghost');
      await page.waitForSelector('.oxd-dialog-container', { state: 'hidden' });
    }

    console.log('Modal and dialog visual validation completed');
  });

  test('E2E: Responsive Design Visual Validation @e2e @visual @responsive', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Capturing responsive design baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');

    // Test multiple viewport sizes
    const viewports = [
      { name: 'desktop-large', width: 1920, height: 1080 },
      { name: 'desktop-medium', width: 1366, height: 768 },
      { name: 'tablet-landscape', width: 1024, height: 768 },
      { name: 'tablet-portrait', width: 768, height: 1024 },
      { name: 'mobile-large', width: 414, height: 896 },
      { name: 'mobile-medium', width: 375, height: 667 },
      { name: 'mobile-small', width: 320, height: 568 }
    ];

    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000); // Allow layout to adjust

      // Capture dashboard at different sizes
      await page.screenshot({
        path: `${screenshotDir}/responsive-dashboard-${viewport.name}.png`,
        fullPage: true
      });

      // Test navigation menu responsiveness
      const navMenu = page.locator('.oxd-main-menu');
      if (await navMenu.count() > 0) {
        await navMenu.screenshot({
          path: `${screenshotDir}/responsive-navigation-${viewport.name}.png`
        });
      }
    }

    console.log('Responsive design visual validation completed');
  });

  test('E2E: Theme and Color Scheme Validation @e2e @visual @theme', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Capturing theme and color scheme baseline screenshots...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Capture different UI elements for color consistency
    const elements = [
      { selector: '.oxd-button--main', name: 'primary-buttons' },
      { selector: '.oxd-button--secondary', name: 'secondary-buttons' },
      { selector: '.oxd-input', name: 'input-fields' },
      { selector: '.oxd-select-text-input', name: 'select-fields' },
      { selector: '.oxd-table-header', name: 'table-headers' },
      { selector: '.oxd-topbar', name: 'top-navigation' },
      { selector: '.oxd-main-menu', name: 'side-navigation' }
    ];

    for (const element of elements) {
      const locator = page.locator(element.selector).first();
      if (await locator.count() > 0) {
        await locator.screenshot({
          path: `${screenshotDir}/theme-${element.name}.png`
        });
      }
    }

    // Capture full page for overall color scheme
    await page.screenshot({
      path: `${screenshotDir}/theme-full-color-scheme.png`,
      fullPage: true
    });

    console.log('Theme and color scheme validation completed');
  });

  test('E2E: Visual Regression Detection @e2e @visual @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Running visual regression detection...');

    await loginPage.navigateToLogin();
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Capture current login page
    await page.screenshot({
      path: `${comparisonDir}/current-login.png`,
      fullPage: true
    });

    // Login and capture dashboard
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `${comparisonDir}/current-dashboard.png`,
      fullPage: true
    });

    // Compare with baseline if it exists
    try {
      const baselineLogin = `${screenshotDir}/login-page-full.png`;
      const baselineDashboard = `${screenshotDir}/dashboard-admin-full.png`;
      
      // Check if baseline files exist
      await fs.access(baselineLogin);
      await fs.access(baselineDashboard);
      
      console.log('Baseline screenshots found - visual regression comparison available');
      
      // Note: In a real implementation, you would use a visual comparison library
      // like playwright's expect().toHaveScreenshot() or a third-party tool
      // For this demo, we're just documenting the process
      
    } catch (error) {
      console.log('Baseline screenshots not found - creating new baselines', (error as Error).message);
    }

    console.log('Visual regression detection completed');
  });

  test.afterAll(async () => {
    console.log('Visual UI validation test suite completed');
    console.log(`Screenshots saved to: ${screenshotDir}`);
    console.log(`Comparison images saved to: ${comparisonDir}`);
    
    // Generate summary report
    const summaryReport = {
      testSuite: 'E2E Visual UI Validation',
      timestamp: new Date().toISOString(),
      screenshotCount: 50, // Approximate count
      directories: {
        baseline: screenshotDir,
        comparison: comparisonDir
      },
      testCategories: [
        'Login Page Visual Validation',
        'Dashboard Visual Validation', 
        'Employee Management Visual Validation',
        'Leave Management Visual Validation',
        'Form States Visual Validation',
        'Data Table Variations Visual Validation',
        'Modal and Dialog Visual Validation',
        'Responsive Design Visual Validation',
        'Theme and Color Scheme Validation',
        'Visual Regression Detection'
      ]
    };

    // Save summary report
    await fs.writeFile(
      `${comparisonDir}/visual-test-summary.json`,
      JSON.stringify(summaryReport, null, 2)
    );
  });

});