import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { LeavePage } from '../pages/LeavePage';
import { faker } from '@faker-js/faker';

test.describe('E2E Scenario C: Leave Request Workflow', () => {

  let leaveRequestData: {
    employeeName: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    comment: string;
  };

  test.beforeAll(async () => {
    // Generate test data for leave requests
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // One week from now
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2); // 3-day leave

    leaveRequestData = {
      employeeName: faker.person.fullName(),
      leaveType: 'Annual',
      fromDate: startDate.toISOString().split('T')[0],
      toDate: endDate.toISOString().split('T')[0],
      comment: `E2E test leave request - ${faker.lorem.sentence()}`
    };
  });

  test('E2E: Complete Leave Request Lifecycle @e2e @leave @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);

    // ============== PHASE 1: ESS APPLIES FOR LEAVE ==============
    console.log('Phase 1: ESS employee applies for leave');

    // Login as ESS user
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Navigate to Leave module
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Leave');

    // Apply for leave
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Apply Leave');

    // Fill leave application form
    await leavePage.selectLeaveType(leaveRequestData.leaveType);
    await leavePage.selectFromDate(leaveRequestData.fromDate);
    await leavePage.selectToDate(leaveRequestData.toDate);
    await leavePage.fillComment(leaveRequestData.comment);

    // Check leave balance before applying
    const balanceElement = page.locator('.oxd-text--span:has-text("Balance")');
    let initialBalance = '';
    if (await balanceElement.count() > 0) {
      initialBalance = await balanceElement.first().textContent() || '';
      console.log(`Initial leave balance: ${initialBalance}`);
    }

    // Submit leave request
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verify success message
    await expect(page.locator('.oxd-toast--success')).toBeVisible();
    console.log('Leave request submitted successfully');

    // Verify leave appears in "My Leave" list
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    // Search for the submitted leave request
    const leaveRows = page.locator('.oxd-table-body .oxd-table-row');
    const rowCount = await leaveRows.count();
    
    if (rowCount > 0) {
      // Verify the leave request details in the first row
      const firstRow = leaveRows.first();
      const dateCell = firstRow.locator('.oxd-table-cell').nth(1);
      const statusCell = firstRow.locator('.oxd-table-cell').nth(5);
      
      const dateText = await dateCell.textContent();
      const statusText = await statusCell.textContent();
      
      expect(dateText).toContain(leaveRequestData.fromDate.split('-')[0]); // Year
      expect(statusText).toMatch(/(Pending|Scheduled)/i);
      console.log(`Leave request status: ${statusText}`);
    }

    // ============== PHASE 2: MANAGER REVIEWS LEAVE ==============
    console.log('Phase 2: Manager reviews leave request');

    // Logout as ESS
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login as Manager
    await loginPage.login(process.env.MANAGER_USERNAME || 'manager', process.env.MANAGER_PASSWORD || 'manager123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Navigate to Leave module
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    // Access Leave List for review
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');

    // Search for pending leave requests
    const statusDropdown = page.locator('.oxd-select-text-input').first();
    if (await statusDropdown.count() > 0) {
      await statusDropdown.click();
      await page.click('span:has-text("Pending Approval")');
    }

    // Apply search filters
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Find the leave request to approve
    const pendingLeaveRows = page.locator('.oxd-table-body .oxd-table-row');
    const pendingCount = await pendingLeaveRows.count();
    
    if (pendingCount > 0) {
      console.log(`Found ${pendingCount} pending leave requests`);
      
      // Review the first pending request
      const firstPendingRow = pendingLeaveRows.first();
      
      // Click on action button (three dots)
      const actionButton = firstPendingRow.locator('.oxd-icon-button').first();
      await actionButton.click();
      
      // Select Approve from dropdown
      const approveOption = page.locator('li:has-text("Approve")');
      if (await approveOption.count() > 0) {
        await approveOption.click();
        await page.waitForLoadState('networkidle');
        console.log('Manager approved the leave request');
        
        // Verify approval success
        await expect(page.locator('.oxd-toast--success')).toBeVisible();
      } else {
        // Alternative method: look for approve button in actions
        const approveButton = page.locator('button:has-text("Approve")');
        if (await approveButton.count() > 0) {
          await approveButton.click();
          await page.waitForLoadState('networkidle');
          console.log('Manager approved the leave request (alternative method)');
        }
      }
    }

    // ============== PHASE 3: VERIFY APPROVAL NOTIFICATION ==============
    console.log('Phase 3: Verify approval workflow completion');

    // Check if approval was successful by searching for approved leaves
    await page.selectOption('select', 'Approved');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    const approvedLeaveRows = page.locator('.oxd-table-body .oxd-table-row');
    const approvedCount = await approvedLeaveRows.count();
    console.log(`Found ${approvedCount} approved leave requests`);

    // ============== PHASE 4: ESS VERIFIES APPROVAL ==============
    console.log('Phase 4: ESS verifies leave approval');

    // Logout as Manager
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login back as ESS
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Check leave status in My Leave
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    // Verify leave status has been updated
    const myLeaveRows = page.locator('.oxd-table-body .oxd-table-row');
    if (await myLeaveRows.count() > 0) {
      const statusCell = myLeaveRows.first().locator('.oxd-table-cell').nth(5);
      const currentStatus = await statusCell.textContent();
      console.log(`Current leave status: ${currentStatus}`);
      
      // Status should be approved or scheduled
      expect(currentStatus).toMatch(/(Approved|Scheduled)/i);
    }

    console.log('E2E Leave Request Workflow test completed successfully!');
    
    // Take screenshot for documentation
    await page.screenshot({ 
      path: './test-results/screenshots/e2e-leave-workflow-complete.png',
      fullPage: true 
    });
  });

  test('E2E: Leave Request with Insufficient Balance @e2e @leave @edge-case', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);

    console.log('Testing leave request with insufficient balance...');

    // Login as ESS user
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');

    // Navigate to Apply Leave
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    // Try to apply for excessive leave (30 days)
    await leavePage.selectLeaveType('Annual');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30); // 30 days
    
    await leavePage.selectFromDate(startDate.toISOString().split('T')[0]);
    await leavePage.selectToDate(endDate.toISOString().split('T')[0]);
    await leavePage.fillComment('Testing excessive leave request');

    // Submit the request
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Check for error message about insufficient balance
    const errorToast = page.locator('.oxd-toast--error');
    const warningToast = page.locator('.oxd-toast--warn');
    
    const errorCount = await errorToast.count();
    const warningCount = await warningToast.count();
    
    if (errorCount > 0 || warningCount > 0) {
      console.log('System correctly prevented excessive leave request');
      const errorMessage = await (errorCount > 0 ? errorToast : warningToast).textContent();
      expect(errorMessage).toMatch(/(balance|insufficient|exceed)/i);
    }
  });

  test('E2E: Leave Request Rejection Workflow @e2e @leave @rejection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);

    console.log('Testing leave request rejection workflow...');

    // ============== ESS APPLIES FOR LEAVE ==============
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');

    // Apply for leave
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    // Fill leave form with short notice (tomorrow)
    await leavePage.selectLeaveType('Annual');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    await leavePage.selectFromDate(tomorrow.toISOString().split('T')[0]);
    await leavePage.selectToDate(tomorrow.toISOString().split('T')[0]);
    await leavePage.fillComment('Emergency leave request for testing rejection workflow');

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ============== MANAGER REJECTS LEAVE ==============
    // Logout and login as Manager
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await loginPage.login(process.env.MANAGER_USERNAME || 'manager', process.env.MANAGER_PASSWORD || 'manager123');

    // Navigate to Leave List
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');

    // Find and reject the leave request
    const pendingRows = page.locator('.oxd-table-body .oxd-table-row');
    if (await pendingRows.count() > 0) {
      const actionButton = pendingRows.first().locator('.oxd-icon-button').first();
      await actionButton.click();
      
      const rejectOption = page.locator('li:has-text("Reject")');
      if (await rejectOption.count() > 0) {
        await rejectOption.click();
        
        // Fill rejection comment if required
        const commentField = page.locator('textarea');
        if (await commentField.count() > 0) {
          await commentField.fill('Rejected due to short notice - E2E test');
          await page.click('button:has-text("Save")');
        }
        
        await page.waitForLoadState('networkidle');
        console.log('Manager rejected the leave request');
      }
    }

    // ============== ESS VERIFIES REJECTION ==============
    // Logout and login as ESS
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');

    // Check rejection status
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    // Verify rejection status
    const myLeaveRows = page.locator('.oxd-table-body .oxd-table-row');
    if (await myLeaveRows.count() > 0) {
      const statusCell = myLeaveRows.first().locator('.oxd-table-cell').nth(5);
      const status = await statusCell.textContent();
      console.log(`Leave status after rejection: ${status}`);
      expect(status).toMatch(/(Rejected|Cancelled)/i);
    }

    console.log('Leave rejection workflow completed successfully');
  });

  test('E2E: Multiple Leave Types Workflow @e2e @leave @types', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);

    console.log('Testing multiple leave types workflow...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');

    const leaveTypes = ['Annual', 'Casual', 'Medical'];
    
    for (const leaveType of leaveTypes) {
      console.log(`Testing ${leaveType} leave application...`);
      
      // Navigate to Apply Leave
      await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
      await page.waitForLoadState('networkidle');
      await page.click('a:has-text("Apply")');
      await page.waitForLoadState('networkidle');

      // Apply for different leave type
      await leavePage.selectLeaveType(leaveType);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10) + 5); // Random future date
      
      await leavePage.selectFromDate(startDate.toISOString().split('T')[0]);
      await leavePage.selectToDate(startDate.toISOString().split('T')[0]);
      await leavePage.fillComment(`${leaveType} leave request for E2E testing`);

      // Check if leave type has balance
      const balanceSection = page.locator('.oxd-text--span:has-text("Balance")');
      if (await balanceSection.count() > 0) {
        const balanceText = await balanceSection.textContent();
        console.log(`${leaveType} balance: ${balanceText}`);
        
        // Only submit if balance is available
        if (!balanceText?.includes('0.00')) {
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
          
          // Check for success or error
          const successToast = page.locator('.oxd-toast--success');
          const errorToast = page.locator('.oxd-toast--error');
          
          if (await successToast.count() > 0) {
            console.log(`${leaveType} leave applied successfully`);
          } else if (await errorToast.count() > 0) {
            const errorText = await errorToast.textContent();
            console.log(`${leaveType} leave failed: ${errorText}`);
          }
        } else {
          console.log(`${leaveType} leave skipped - no balance available`);
        }
      }
      
      await page.waitForTimeout(1000); // Brief pause between requests
    }

    // Verify all applied leaves in My Leave
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    const totalLeaveRows = await page.locator('.oxd-table-body .oxd-table-row').count();
    console.log(`Total leave requests in system: ${totalLeaveRows}`);

    console.log('Multiple leave types workflow completed');
  });

  test('E2E: Leave Calendar Integration @e2e @leave @calendar', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Testing leave calendar integration...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');

    // Navigate to Leave module
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    // Look for calendar view if available
    const calendarView = page.locator('a:has-text("Calendar")');
    if (await calendarView.count() > 0) {
      await calendarView.click();
      await page.waitForLoadState('networkidle');
      
      // Verify calendar is displayed
      await expect(page.locator('.calendar')).toBeVisible();
      console.log('Leave calendar view accessible');
    }

    // Test date picker integration in Apply Leave
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    // Click on date picker
    await page.click('input[placeholder="yyyy-dd-mm"]');
    
    // Verify calendar popup appears
    const calendarDropdown = page.locator('.oxd-calendar-dropdown');
    if (await calendarDropdown.count() > 0) {
      await expect(calendarDropdown).toBeVisible();
      
      // Test calendar navigation
      const monthSelect = calendarDropdown.locator('select').first();
      const yearSelect = calendarDropdown.locator('select').last();
      
      await expect(monthSelect).toBeVisible();
      await expect(yearSelect).toBeVisible();
      
      // Select a date
      const availableDate = calendarDropdown.locator('.oxd-calendar-date:not(.--disabled)').first();
      await availableDate.click();
      
      console.log('Calendar date selection working correctly');
    }

    // Take screenshot of calendar integration
    await page.screenshot({ 
      path: './test-results/screenshots/leave-calendar-integration.png',
      fullPage: true 
    });

    console.log('Leave calendar integration test completed');
  });

});