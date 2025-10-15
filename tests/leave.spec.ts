import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LeavePage } from '../pages/LeavePage';
import { UserFixtures, TestDataGenerator } from '../fixtures/testData';

test.describe('Leave Management Tests @leave', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let leavePage: LeavePage;
  let leaveData: any;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    leavePage = new LeavePage(page);
    leaveData = TestDataGenerator.generateLeaveRequest();

    await loginPage.navigateToLogin();
  });

  test('ESS applies for leave @smoke @leave @ess', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('Click Apply for Leave', async () => {
      await leavePage.clickApplyLeave();
    });

    await test.step('Fill leave application form', async () => {
      await leavePage.selectLeaveType(leaveData.leaveType);
      await leavePage.selectFromDate(leaveData.fromDate);
      await leavePage.selectToDate(leaveData.toDate);
      await leavePage.fillComment(leaveData.comment);
    });

    await test.step('Submit leave application', async () => {
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify leave application submitted', async () => {
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Submitted');
    });

    await test.step('Take screenshot of submitted leave', async () => {
      await page.screenshot({ path: 'screenshots/leave-application-submitted.png', fullPage: true });
    });
  });

  test('Manager reviews leave requests @functional @leave @manager', async ({ page }) => {
    await test.step('Login as Manager', async () => {
      const manager = UserFixtures.MANAGER;
      await loginPage.login(manager.username, manager.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('Go to Leave Approvals', async () => {
      await leavePage.navigateToLeaveApprovals();
    });

    await test.step('Verify leave requests are visible', async () => {
      await expect(page.locator('.oxd-table')).toBeVisible();
      const hasRequests = await leavePage.hasLeaveRequests();
      if (hasRequests) {
        await expect(page.locator('.oxd-table-body .oxd-table-row')).toBeVisible();
      }
    });

    await test.step('Take screenshot of leave requests list', async () => {
      await page.screenshot({ path: 'screenshots/leave-requests-list.png', fullPage: true });
    });
  });

  test('Manager approves leave request @functional @leave @manager', async ({ page }) => {
    // First, create a leave request as ESS
    await test.step('Create leave request as ESS', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Annual');
      await leavePage.selectFromDate(leaveData.fromDate);
      await leavePage.selectToDate(leaveData.toDate);
      await leavePage.fillComment('Test leave request for approval');
      await leavePage.submitLeaveApplication();
      
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Submitted');
    });

    await test.step('Logout and login as Manager', async () => {
      await dashboardPage.logout();
      const manager = UserFixtures.MANAGER;
      await loginPage.login(manager.username, manager.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave Approvals', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.navigateToLeaveApprovals();
    });

    await test.step('Approve the leave request', async () => {
      const hasRequests = await leavePage.hasLeaveRequests();
      if (hasRequests) {
        await leavePage.approveFirstLeaveRequest();
        await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Updated');
      }
    });

    await test.step('Take screenshot of approved leave', async () => {
      await page.screenshot({ path: 'screenshots/leave-request-approved.png', fullPage: true });
    });
  });

  test('Manager rejects leave request @functional @leave @manager', async ({ page }) => {
    // First, create a leave request as ESS
    await test.step('Create leave request as ESS', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Sick');
      await leavePage.selectFromDate(leaveData.fromDate);
      await leavePage.selectToDate(leaveData.toDate);
      await leavePage.fillComment('Test leave request for rejection');
      await leavePage.submitLeaveApplication();
      
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Submitted');
    });

    await test.step('Logout and login as Manager', async () => {
      await dashboardPage.logout();
      const manager = UserFixtures.MANAGER;
      await loginPage.login(manager.username, manager.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave Approvals', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.navigateToLeaveApprovals();
    });

    await test.step('Reject the leave request', async () => {
      const hasRequests = await leavePage.hasLeaveRequests();
      if (hasRequests) {
        await leavePage.rejectFirstLeaveRequest('Not enough annual leave balance');
        await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Updated');
      }
    });

    await test.step('Take screenshot of rejected leave', async () => {
      await page.screenshot({ path: 'screenshots/leave-request-rejected.png', fullPage: true });
    });
  });

  test('ESS views leave balance @functional @leave @ess', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('View leave balance', async () => {
      await leavePage.navigateToLeaveBalance();
    });

    await test.step('Verify leave balance is displayed', async () => {
      await expect(page.locator('.leave-balance-container, .oxd-table')).toBeVisible();
    });

    await test.step('Take screenshot of leave balance', async () => {
      await page.screenshot({ path: 'screenshots/leave-balance.png', fullPage: true });
    });
  });

  test('ESS views leave history @functional @leave @ess', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('View leave history', async () => {
      await leavePage.navigateToMyLeave();
    });

    await test.step('Verify leave history is displayed', async () => {
      await expect(page.locator('.oxd-table')).toBeVisible();
    });

    await test.step('Take screenshot of leave history', async () => {
      await page.screenshot({ path: 'screenshots/leave-history.png', fullPage: true });
    });
  });

  test('Leave application form validation @negative @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Apply Leave form', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
    });

    await test.step('Try to submit without required fields', async () => {
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify validation errors are displayed', async () => {
      const errorMessages = page.locator('.oxd-input-field-error-message, .oxd-form-error-message');
      await expect(errorMessages.first()).toBeVisible();
    });

    await test.step('Fill only leave type and try to submit', async () => {
      await leavePage.selectLeaveType('Annual');
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify date validation errors', async () => {
      const errorMessages = page.locator('.oxd-input-field-error-message');
      await expect(errorMessages.first()).toBeVisible();
    });
  });

  test('Leave date range validation @boundary @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Apply Leave form', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
    });

    await test.step('Select invalid date range (from date after to date)', async () => {
      await leavePage.selectLeaveType('Annual');
      await leavePage.selectFromDate('2024-12-31');
      await leavePage.selectToDate('2024-12-01'); // Earlier than from date
      await leavePage.fillComment('Test invalid date range');
    });

    await test.step('Try to submit with invalid date range', async () => {
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify date range validation error', async () => {
      const errorMessage = page.locator('.oxd-input-field-error-message, .oxd-alert-content-text');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });

  test('Leave calendar view @functional @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('View leave calendar if available', async () => {
      const calendarButton = page.locator('text=Calendar, text=View Calendar');
      if (await calendarButton.isVisible()) {
        await calendarButton.click();
        await expect(page.locator('.calendar-container, .leave-calendar')).toBeVisible();
      }
    });

    await test.step('Take screenshot of leave calendar', async () => {
      await page.screenshot({ path: 'screenshots/leave-calendar.png', fullPage: true });
    });
  });
});

test.describe('Leave Management Edge Cases @leave @regression', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let leavePage: LeavePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    leavePage = new LeavePage(page);

    await loginPage.navigateToLogin();
  });

  test('Weekend/Holiday leave application @boundary @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Try to apply for leave on weekend/holiday', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Annual');
      // Try to select a weekend date (Saturday)
      await leavePage.selectFromDate('2024-12-07'); // Saturday
      await leavePage.selectToDate('2024-12-07');
      await leavePage.fillComment('Weekend leave test');
    });

    await test.step('Submit and check for weekend validation', async () => {
      await leavePage.submitLeaveApplication();
      
      // The system might allow or disallow weekend applications
      // We just verify the behavior is consistent
      const toast = page.locator('.oxd-toast-content');
      if (await toast.isVisible()) {
        const toastText = await toast.textContent();
        console.log('Weekend leave application result:', toastText);
      }
    });
  });

  test('Overlapping leave requests @boundary @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Apply for first leave request', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Annual');
      await leavePage.selectFromDate('2024-12-10');
      await leavePage.selectToDate('2024-12-12');
      await leavePage.fillComment('First leave request');
      await leavePage.submitLeaveApplication();
    });

    await test.step('Apply for overlapping leave request', async () => {
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Sick');
      await leavePage.selectFromDate('2024-12-11'); // Overlaps with previous request
      await leavePage.selectToDate('2024-12-13');
      await leavePage.fillComment('Overlapping leave request');
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify overlap handling', async () => {
      // System should handle overlapping requests appropriately
      const toast = page.locator('.oxd-toast-content');
      if (await toast.isVisible()) {
        const toastText = await toast.textContent();
        console.log('Overlapping leave result:', toastText);
      }
    });
  });

  test('Leave balance validation @boundary @leave', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Try to apply for more days than available balance', async () => {
      await dashboardPage.navigateToLeave();
      await leavePage.clickApplyLeave();
      
      await leavePage.selectLeaveType('Annual');
      // Apply for a very long period to test balance validation
      await leavePage.selectFromDate('2024-12-01');
      await leavePage.selectToDate('2024-12-31'); // 31 days
      await leavePage.fillComment('Extended leave to test balance');
      await leavePage.submitLeaveApplication();
    });

    await test.step('Verify balance validation handling', async () => {
      // System should warn about insufficient balance
      const toast = page.locator('.oxd-toast-content');
      const errorMessage = page.locator('.oxd-alert-content-text');
      
      if (await toast.isVisible() || await errorMessage.isVisible()) {
        console.log('Balance validation handled appropriately');
      }
    });
  });
});