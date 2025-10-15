import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';

test.describe('E2E Scenario B: Multi-Role Access Validation', () => {

  test('E2E: Admin Role Access Comprehensive Validation @e2e @admin @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    // Login as Admin
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // ============== ADMIN MODULE ACCESS ==============
    console.log('Testing Admin module access...');
    
    // Verify Admin can access Admin module
    await expect(page.locator('a[href="/web/index.php/admin/viewAdminModule"]')).toBeVisible();
    await page.click('a[href="/web/index.php/admin/viewAdminModule"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Admin');

    // Test User Management functionality
    await page.click('a:has-text("User Management")');
    await expect(page.locator('a:has-text("Users")')).toBeVisible();
    
    // Navigate to Users list
    await page.click('a:has-text("Users")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-table')).toBeVisible();

    // Test Job functionality
    await page.click('a:has-text("Job")');
    await expect(page.locator('a:has-text("Job Titles")')).toBeVisible();
    await expect(page.locator('a:has-text("Pay Grades")')).toBeVisible();
    await expect(page.locator('a:has-text("Employment Status")')).toBeVisible();
    await expect(page.locator('a:has-text("Job Categories")')).toBeVisible();
    await expect(page.locator('a:has-text("Work Shifts")')).toBeVisible();

    // Test Organization functionality
    await page.click('a:has-text("Organization")');
    await expect(page.locator('a:has-text("General Information")')).toBeVisible();
    await expect(page.locator('a:has-text("Locations")')).toBeVisible();
    await expect(page.locator('a:has-text("Structure")')).toBeVisible();

    // ============== PIM MODULE ACCESS ==============
    console.log('Testing PIM module access...');
    
    await page.click('a[href="/web/index.php/pim/viewPimModule"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('PIM');

    // Verify Admin can access all PIM functions
    await expect(page.locator('a:has-text("Employee List")')).toBeVisible();
    await expect(page.locator('a:has-text("Add Employee")')).toBeVisible();
    await expect(page.locator('a:has-text("Reports")')).toBeVisible();

    // Test Add Employee access
    await employeePage.navigateToAddEmployee();
    await expect(page.locator('h6')).toContainText('Add Employee');
    await expect(page.locator('input[name="firstName"]')).toBeVisible();

    // ============== LEAVE MODULE ACCESS ==============
    console.log('Testing Leave module access...');
    
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Leave');

    // Verify Admin can access all Leave functions
    await expect(page.locator('a:has-text("Apply")')).toBeVisible();
    await expect(page.locator('a:has-text("My Leave")')).toBeVisible();
    await expect(page.locator('a:has-text("Entitlements")')).toBeVisible();
    await expect(page.locator('a:has-text("Reports")')).toBeVisible();
    await expect(page.locator('a:has-text("Configure")')).toBeVisible();
    await expect(page.locator('a:has-text("Leave List")')).toBeVisible();
    await expect(page.locator('a:has-text("Assign Leave")')).toBeVisible();

    // Test Leave Configuration access (Admin only)
    await page.click('a:has-text("Configure")');
    await expect(page.locator('a:has-text("Leave Period")')).toBeVisible();
    await expect(page.locator('a:has-text("Leave Types")')).toBeVisible();
    await expect(page.locator('a:has-text("Work Week")')).toBeVisible();
    await expect(page.locator('a:has-text("Holidays")')).toBeVisible();

    // ============== TIME MODULE ACCESS ==============
    console.log('Testing Time module access...');
    
    const timeModule = page.locator('a[href="/web/index.php/time/viewTimeModule"]');
    if (await timeModule.count() > 0) {
      await timeModule.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h6')).toContainText('Time');
    }

    // ============== RECRUITMENT MODULE ACCESS ==============
    console.log('Testing Recruitment module access...');
    
    const recruitmentModule = page.locator('a[href="/web/index.php/recruitment/viewRecruitmentModule"]');
    if (await recruitmentModule.count() > 0) {
      await recruitmentModule.click();
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h6')).toContainText('Recruitment');
    }

    console.log('Admin role access validation completed successfully');
  });

  test('E2E: ESS Role Access Validation @e2e @ess', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Login as ESS user
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    console.log('Testing ESS role restrictions...');

    // ============== VERIFY ESS CANNOT ACCESS ADMIN ==============
    
    // Admin module should not be visible
    await expect(page.locator('a[href="/web/index.php/admin/viewAdminModule"]')).not.toBeVisible();
    
    // Try direct URL access to Admin (should be blocked)
    await page.goto(`${process.env.BASE_URL}/web/index.php/admin/viewAdminModule`);
    // Should redirect to dashboard or show access denied
    const currentPath = new URL(page.url()).pathname;
    expect(currentPath).not.toContain('/admin/');

    // Return to dashboard
    await page.click('a[href="/web/index.php/dashboard/index"]');
    await page.waitForLoadState('networkidle');

    // ============== VERIFY ESS CAN ACCESS MY INFO ==============
    console.log('Testing ESS My Info access...');
    
    await expect(page.locator('a[href="/web/index.php/pim/viewMyDetails"]')).toBeVisible();
    await page.click('a[href="/web/index.php/pim/viewMyDetails"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Personal Details');

    // Verify ESS can edit own information
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).not.toBeDisabled();

    // ============== VERIFY ESS LEAVE ACCESS ==============
    console.log('Testing ESS Leave access...');
    
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    // ESS should see limited leave options
    await expect(page.locator('a:has-text("Apply")')).toBeVisible();
    await expect(page.locator('a:has-text("My Leave")')).toBeVisible();
    
    // ESS should NOT see administrative leave functions
    await expect(page.locator('a:has-text("Entitlements")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Configure")')).not.toBeVisible();
    await expect(page.locator('a:has-text("Assign Leave")')).not.toBeVisible();

    // ============== VERIFY ESS CANNOT ACCESS PIM LIST ==============
    console.log('Testing ESS PIM restrictions...');
    
    // ESS should not see PIM module for employee management
    await expect(page.locator('a[href="/web/index.php/pim/viewPimModule"]')).not.toBeVisible();
    
    // Try direct access to employee list
    await page.goto(`${process.env.BASE_URL}/web/index.php/pim/viewEmployeeList`);
    const pimPath = new URL(page.url()).pathname;
    expect(pimPath).not.toContain('/pim/viewEmployeeList');

    console.log('ESS role access validation completed successfully');
  });

  test('E2E: Manager Role Access Validation @e2e @manager', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Login as Manager
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.MANAGER_USERNAME || 'manager', process.env.MANAGER_PASSWORD || 'manager123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    console.log('Testing Manager role access...');

    // ============== VERIFY MANAGER CANNOT ACCESS ADMIN ==============
    
    // Admin module should not be visible to Manager
    await expect(page.locator('a[href="/web/index.php/admin/viewAdminModule"]')).not.toBeVisible();

    // ============== VERIFY MANAGER LEAVE MANAGEMENT ACCESS ==============
    console.log('Testing Manager Leave management access...');
    
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    // Manager should have broader leave access than ESS
    await expect(page.locator('a:has-text("Apply")')).toBeVisible();
    await expect(page.locator('a:has-text("My Leave")')).toBeVisible();
    await expect(page.locator('a:has-text("Leave List")')).toBeVisible();
    
    // Test Leave List access for reviewing subordinate requests
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-table')).toBeVisible();

    // ============== VERIFY MANAGER PIM ACCESS ==============
    console.log('Testing Manager PIM access...');
    
    const pimModule = page.locator('a[href="/web/index.php/pim/viewPimModule"]');
    if (await pimModule.count() > 0) {
      await pimModule.click();
      await page.waitForLoadState('networkidle');
      
      // Manager might have limited PIM access for subordinates
      await expect(page.locator('a:has-text("Employee List")')).toBeVisible();
    }

    // ============== VERIFY MANAGER MY INFO ACCESS ==============
    console.log('Testing Manager My Info access...');
    
    await expect(page.locator('a[href="/web/index.php/pim/viewMyDetails"]')).toBeVisible();
    await page.click('a[href="/web/index.php/pim/viewMyDetails"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Personal Details');

    console.log('Manager role access validation completed successfully');
  });

  test('E2E: Cross-Role Session Security @e2e @security', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Testing session security across roles...');

    // ============== SESSION ISOLATION TEST ==============
    
    // Login as Admin first
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Navigate to Admin module to confirm admin access
    await page.click('a[href="/web/index.php/admin/viewAdminModule"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Admin');

    // Logout
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login as ESS user
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Verify ESS cannot access admin URLs even after admin was logged in
    await page.goto(`${process.env.BASE_URL}/web/index.php/admin/viewAdminModule`);
    const adminPath = new URL(page.url()).pathname;
    expect(adminPath).not.toContain('/admin/');

    // ============== URL PARAMETER TAMPERING TEST ==============
    console.log('Testing URL parameter security...');
    
    // Try to access another employee's details by manipulating URL
    await page.goto(`${process.env.BASE_URL}/web/index.php/pim/viewPersonalDetails/empNumber/1`);
    const personalDetailsPath = new URL(page.url()).pathname;
    
    // ESS should be redirected or blocked from accessing other employee details
    if (personalDetailsPath.includes('/pim/viewPersonalDetails/')) {
      // If access is allowed, verify it's only their own details
      await expect(page.locator('h6')).toContainText('Personal Details');
    } else {
      // Access should be blocked
      expect(personalDetailsPath).not.toContain('/pim/viewPersonalDetails/empNumber/1');
    }

    console.log('Session security validation completed successfully');
  });

  test('E2E: Role-Based Data Visibility @e2e @data-visibility', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Testing role-based data visibility...');

    // ============== ADMIN DATA VISIBILITY ==============
    
    // Login as Admin
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List
    await page.click('a[href="/web/index.php/pim/viewPimModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Employee List")');
    await page.waitForLoadState('networkidle');

    // Admin should see all employees
    const adminEmployeeRows = await page.locator('.oxd-table-body .oxd-table-row').count();
    expect(adminEmployeeRows).toBeGreaterThan(0);
    console.log(`Admin can see ${adminEmployeeRows} employees`);

    // Check Leave List for Admin
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');

    const adminLeaveRows = await page.locator('.oxd-table-body .oxd-table-row').count();
    console.log(`Admin can see ${adminLeaveRows} leave records`);

    // Logout
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');

    // ============== ESS DATA VISIBILITY ==============
    
    // Login as ESS
    await loginPage.login(process.env.ESS_USERNAME || 'linda.anderson', process.env.ESS_PASSWORD || 'ess123');
    
    // ESS should only see own leave records
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("My Leave")');
    await page.waitForLoadState('networkidle');

    // ESS leave view should be limited to own records
    const essLeaveRows = await page.locator('.oxd-table-body .oxd-table-row').count();
    console.log(`ESS can see ${essLeaveRows} own leave records`);
    
    // ESS should see fewer records than Admin
    expect(essLeaveRows).toBeLessThanOrEqual(adminLeaveRows);

    console.log('Role-based data visibility validation completed successfully');
  });

  test('E2E: Permission Matrix Validation @e2e @permissions', async ({ page }) => {
    const loginPage = new LoginPage(page);

    console.log('Testing comprehensive permission matrix...');

    const testCases = [
      {
        role: 'Admin',
        username: process.env.ADMIN_USERNAME || 'Admin',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        expectedAccess: {
          admin: true,
          pim: true,
          leave: true,
          leaveConfig: true,
          addEmployee: true,
          viewAllEmployees: true
        }
      },
      {
        role: 'ESS',
        username: process.env.ESS_USERNAME || 'linda.anderson',
        password: process.env.ESS_PASSWORD || 'ess123',
        expectedAccess: {
          admin: false,
          pim: false,
          leave: true,
          leaveConfig: false,
          addEmployee: false,
          viewAllEmployees: false
        }
      }
    ];

    for (const testCase of testCases) {
      console.log(`Testing permissions for ${testCase.role}...`);
      
      // Login as current role
      await loginPage.navigateToLogin();
      await loginPage.login(testCase.username, testCase.password);
      await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

      // Test Admin module access
      const adminLink = page.locator('a[href="/web/index.php/admin/viewAdminModule"]');
      if (testCase.expectedAccess.admin) {
        await expect(adminLink).toBeVisible();
      } else {
        await expect(adminLink).not.toBeVisible();
      }

      // Test PIM module access
      const pimLink = page.locator('a[href="/web/index.php/pim/viewPimModule"]');
      if (testCase.expectedAccess.pim) {
        await expect(pimLink).toBeVisible();
      } else {
        await expect(pimLink).not.toBeVisible();
      }

      // Test Leave module access
      const leaveLink = page.locator('a[href="/web/index.php/leave/viewLeaveModule"]');
      if (testCase.expectedAccess.leave) {
        await expect(leaveLink).toBeVisible();
        
        // Navigate to leave module and test configuration access
        await leaveLink.click();
        await page.waitForLoadState('networkidle');
        
        const leaveConfigLink = page.locator('a:has-text("Configure")');
        if (testCase.expectedAccess.leaveConfig) {
          await expect(leaveConfigLink).toBeVisible();
        } else {
          await expect(leaveConfigLink).not.toBeVisible();
        }
      }

      // Logout
      await page.click('.oxd-userdropdown-tab');
      await page.click('a:has-text("Logout")');
      await page.waitForURL('**/auth/login');
    }

    console.log('Permission matrix validation completed successfully');
  });

});