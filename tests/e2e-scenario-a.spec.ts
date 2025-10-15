import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeePage } from '../pages/EmployeePage';
import { LeavePage } from '../pages/LeavePage';
import { faker } from '@faker-js/faker';

test.describe('E2E Scenario A: Employee Lifecycle (Admin → ESS → Manager)', () => {
  
  let employeeId: string;
  let employeeUsername: string;
  let employeeFirstName: string;
  let employeeLastName: string;
  let managerUsername: string;
  const employeePassword = 'TestPass123!';

  test.beforeAll(async () => {
    // Generate test data for the complete employee lifecycle
    employeeFirstName = faker.person.firstName();
    employeeLastName = faker.person.lastName();
    employeeUsername = `${employeeFirstName.toLowerCase()}.${employeeLastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    managerUsername = process.env.MANAGER_USERNAME || 'Linda.Anderson';
  });

  test('E2E: Complete Employee Lifecycle Flow @e2e @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    const leavePage = new LeavePage(page);

    // ============== PHASE 1: ADMIN CREATES EMPLOYEE ==============
    console.log('Phase 1: Admin creates new employee');
    
    // Login as Admin
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Navigate to Add Employee
    await employeePage.navigateToAddEmployee();
    
    // Create new employee with login credentials
    await employeePage.fillEmployeeFirstName(employeeFirstName);
    await employeePage.fillEmployeeLastName(employeeLastName);
    
    // Enable login details
    await page.click('input[type="checkbox"]'); // Create Login Details checkbox
    await page.waitForSelector('input[autocomplete="username"]', { state: 'visible' });
    
    // Fill login credentials
    await page.fill('input[autocomplete="username"]', employeeUsername);
    await page.fill('input[type="password"]', employeePassword);
    await page.fill('input[placeholder="Confirm Password"]', employeePassword);
    
    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Capture employee ID from URL or page
    const currentUrl = page.url();
    const empNumberRegex = /empNumber=(\d+)/;
    const idMatch = empNumberRegex.exec(currentUrl);
    if (idMatch) {
      employeeId = idMatch[1];
      console.log(`Created employee with ID: ${employeeId}`);
    }

    // Verify employee was created successfully
    await expect(page.locator('.oxd-toast--success')).toBeVisible();
    await expect(page.locator('h6')).toContainText(employeeFirstName);

    // Assign employee to Manager (navigate to Job tab)
    await page.click('a:has-text("Job")');
    await page.waitForLoadState('networkidle');
    
    // Select a supervisor (Manager)
    const supervisorInput = page.locator('input[placeholder="Type for hints..."]').first();
    await supervisorInput.fill('Linda');
    await page.waitForSelector('.oxd-autocomplete-dropdown', { state: 'visible' });
    await page.click('.oxd-autocomplete-option:has-text("Linda")');
    
    // Save job information
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    console.log('Phase 1 Complete: Employee created and assigned to manager');

    // ============== PHASE 2: ESS EMPLOYEE LOGIN & ACTIONS ==============
    console.log('Phase 2: ESS employee logs in and performs actions');
    
    // Logout as Admin
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login as newly created employee (ESS)
    await loginPage.login(employeeUsername, employeePassword);
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');
    console.log(`Successfully logged in as employee: ${employeeUsername}`);

    // ESS: View My Info
    await page.click('a[href="/web/index.php/pim/viewMyDetails"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Personal Details');
    
    // Update personal information
    await page.fill('input[name="firstName"]', employeeFirstName + 'Updated');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // ESS: Apply for leave
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    // Fill leave application
    await leavePage.selectLeaveType('Annual');
    
    // Select future dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    
    await leavePage.selectFromDate(tomorrow.toISOString().split('T')[0]);
    await leavePage.selectToDate(dayAfter.toISOString().split('T')[0]);
    await leavePage.fillComment('ESS Employee leave request for E2E testing');
    
    // Submit leave request
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();
    console.log('ESS employee applied for leave successfully');

    // ============== PHASE 3: MANAGER REVIEWS & APPROVES ==============
    console.log('Phase 3: Manager reviews and approves leave request');
    
    // Logout as ESS employee
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login as Manager
    await loginPage.login(managerUsername, process.env.MANAGER_PASSWORD || 'manager123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');
    console.log(`Successfully logged in as manager: ${managerUsername}`);

    // Navigate to Leave module
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');

    // Check leave requests requiring approval
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');

    // Search for the employee's leave request
    await page.fill('input[placeholder="Type for hints..."]', employeeFirstName);
    await page.waitForTimeout(1000);
    
    // Submit search
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Find and approve the leave request
    const leaveRow = page.locator('.oxd-table-body .oxd-table-row').first();
    if (await leaveRow.count() > 0) {
      // Click on the actions button (three dots)
      await leaveRow.locator('.oxd-icon-button').first().click();
      
      // Select approve option
      const approveOption = page.locator('li:has-text("Approve")');
      if (await approveOption.count() > 0) {
        await approveOption.click();
        await page.waitForLoadState('networkidle');
        console.log('Manager approved the leave request');
      }
    }

    // ============== PHASE 4: ADMIN VERIFICATION ==============
    console.log('Phase 4: Admin verifies the complete lifecycle');
    
    // Logout as Manager
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login back as Admin for verification
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // Verify employee still exists in system
    await employeePage.navigateToEmployeeList();
    await employeePage.searchEmployee(employeeFirstName);
    
    // Verify search results show the employee
    const employeeSearchResults = page.locator('.oxd-table-body .oxd-table-row');
    const searchResultCount = await employeeSearchResults.count();
    expect(searchResultCount).toBeGreaterThanOrEqual(1);
    
    // Navigate to Leave module to verify leave was processed
    await page.click('a[href="/web/index.php/leave/viewLeaveModule"]');
    await page.waitForLoadState('networkidle');
    await page.click('a:has-text("Leave List")');
    await page.waitForLoadState('networkidle');

    // Search for the employee's leave
    await page.fill('input[placeholder="Type for hints..."]', employeeFirstName);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Verify leave status is approved
    const leaveStatusCell = page.locator('.oxd-table-body .oxd-table-row .oxd-table-cell').nth(5);
    if (await leaveStatusCell.count() > 0) {
      const status = await leaveStatusCell.textContent();
      expect(status).toMatch(/(Approved|Scheduled)/i);
      console.log(`Leave request status verified: ${status}`);
    }

    console.log('E2E Employee Lifecycle test completed successfully!');
    
    // Take final screenshot for documentation
    await page.screenshot({ 
      path: './test-results/screenshots/e2e-employee-lifecycle-complete.png',
      fullPage: true 
    });
  });

  test('E2E: Employee Access Rights Progression @e2e @access', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Test that employee can only access ESS functions
    await loginPage.navigateToLogin();
    await loginPage.login(employeeUsername, employeePassword);
    
    // Verify ESS user cannot access Admin functions
    const adminMenu = page.locator('a[href="/web/index.php/admin/viewAdminModule"]');
    await expect(adminMenu).not.toBeVisible();
    
    // Verify ESS can access My Info
    await expect(page.locator('a[href="/web/index.php/pim/viewMyDetails"]')).toBeVisible();
    
    // Verify ESS can access Leave
    await expect(page.locator('a[href="/web/index.php/leave/viewLeaveModule"]')).toBeVisible();
    
    console.log('ESS access rights verified correctly');
  });

  test('E2E: Data Consistency Across Roles @e2e @data', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    // Login as Admin and verify employee data
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    await employeePage.navigateToEmployeeList();
    await employeePage.searchEmployee(employeeFirstName);
    
    // Get employee details from admin view
    const adminViewName = await page.locator('.oxd-table-body .oxd-table-row .oxd-table-cell').nth(1).textContent();
    
    // Logout and login as employee
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await loginPage.login(employeeUsername, employeePassword);
    
    // Check My Info page
    await page.click('a[href="/web/index.php/pim/viewMyDetails"]');
    await page.waitForLoadState('networkidle');
    
    const employeeViewFirstName = await page.locator('input[name="firstName"]').inputValue();
    
    // Verify data consistency
    expect(adminViewName).toContain(employeeViewFirstName);
    console.log('Data consistency verified across Admin and ESS views');
  });

  test.afterAll(async ({ page }) => {
    // Cleanup: Optionally delete the test employee
    if (employeeId) {
      const loginPage = new LoginPage(page);
      
      // Login as Admin
      await loginPage.navigateToLogin();
      await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
      
      // Navigate to employee and delete
      await page.goto(`${process.env.BASE_URL}/web/index.php/pim/viewPersonalDetails/empNumber/${employeeId}`);
      
      // Delete employee (if delete button exists)
      const deleteButton = page.locator('button:has(.bi-trash)');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.click('.oxd-button--label-danger:has-text("Yes, Delete")');
        await page.waitForLoadState('networkidle');
        console.log(`Cleanup: Deleted test employee ID ${employeeId}`);
      }
    }
  });

});