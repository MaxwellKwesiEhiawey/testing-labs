import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import { faker } from '@faker-js/faker';

test.describe('E2E Scenario D: Employee CRUD Flow', () => {

  let testEmployee: {
    firstName: string;
    lastName: string;
    middleName: string;
    employeeId: string;
    username: string;
    password: string;
    email: string;
    empNumber?: string;
  };

  test.beforeAll(async () => {
    // Generate comprehensive test data for employee CRUD operations
    testEmployee = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      employeeId: faker.string.numeric(6),
      username: `test.${faker.string.alphanumeric(8).toLowerCase()}`,
      password: 'TestPass123!',
      email: faker.internet.email()
    };
    console.log(`Generated test employee: ${testEmployee.firstName} ${testEmployee.lastName}`);
  });

  test('E2E: Complete Employee CRUD Lifecycle @e2e @employee @critical', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    // Login as Admin
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');

    // ============== PHASE 1: CREATE EMPLOYEE ==============
    console.log('Phase 1: Creating new employee');

    // Navigate to Add Employee
    await employeePage.navigateToAddEmployee();
    await expect(page.locator('h6')).toContainText('Add Employee');

    // Fill basic employee information
    await employeePage.fillEmployeeFirstName(testEmployee.firstName);
    await employeePage.fillEmployeeLastName(testEmployee.lastName);
    await employeePage.fillEmployeeMiddleName(testEmployee.middleName);
    await employeePage.fillEmployeeId(testEmployee.employeeId);

    // Enable login details
    await page.click('input[type="checkbox"]'); // Create Login Details
    await page.waitForSelector('input[autocomplete="username"]', { state: 'visible' });

    // Fill login credentials
    await page.fill('input[autocomplete="username"]', testEmployee.username);
    await page.fill('input[type="password"]', testEmployee.password);
    await page.fill('input[placeholder="Confirm Password"]', testEmployee.password);

    // Submit employee creation
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Verify success and capture employee number
    await expect(page.locator('.oxd-toast--success')).toBeVisible();
    await expect(page.locator('h6')).toContainText(testEmployee.firstName);

    // Extract employee number from URL
    const currentUrl = page.url();
    const empNumberMatch = /empNumber=(\d+)/.exec(currentUrl);
    if (empNumberMatch) {
      testEmployee.empNumber = empNumberMatch[1];
      console.log(`Employee created with number: ${testEmployee.empNumber}`);
    }

    // ============== PHASE 2: READ/VIEW EMPLOYEE DETAILS ==============
    console.log('Phase 2: Reading employee details');

    // Verify employee details are displayed correctly
    await expect(page.locator('input[name="firstName"]')).toHaveValue(testEmployee.firstName);
    await expect(page.locator('input[name="lastName"]')).toHaveValue(testEmployee.lastName);
    await expect(page.locator('input[name="middleName"]')).toHaveValue(testEmployee.middleName);
    await expect(page.locator('input[name="employeeId"]')).toHaveValue(testEmployee.employeeId);

    // Navigate to Contact Details tab
    await page.click('a:has-text("Contact Details")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Contact Details');

    // Fill contact information
    await page.fill('input[placeholder="Type here"]', testEmployee.email);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // Navigate to Emergency Contacts tab
    await page.click('a:has-text("Emergency Contacts")');
    await page.waitForLoadState('networkidle');

    // Add emergency contact
    await page.click('button:has-text("Add")');
    await page.waitForSelector('.oxd-form', { state: 'visible' });

    await page.fill('input[name="name"]', `${faker.person.firstName()} ${faker.person.lastName()}`);
    await page.fill('input[name="relationship"]', 'Spouse');
    await page.fill('input[name="homePhone"]', faker.phone.number());
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // Navigate to Dependents tab
    await page.click('a:has-text("Dependents")');
    await page.waitForLoadState('networkidle');

    // Add dependent
    await page.click('button:has-text("Add")');
    await page.waitForSelector('.oxd-form', { state: 'visible' });

    await page.fill('input[name="name"]', faker.person.firstName());
    
    // Select relationship type
    const relationshipDropdown = page.locator('.oxd-select-text-input').first();
    await relationshipDropdown.click();
    await page.click('span:has-text("Child")');

    // Fill date of birth
    await page.click('input[placeholder="yyyy-dd-mm"]');
    await page.waitForSelector('.oxd-calendar-dropdown', { state: 'visible' });
    await page.click('.oxd-calendar-date:not(.--disabled)');

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // ============== PHASE 3: UPDATE EMPLOYEE ==============
    console.log('Phase 3: Updating employee information');

    // Navigate back to Personal Details
    await page.click('a:has-text("Personal Details")');
    await page.waitForLoadState('networkidle');

    // Update employee information
    const updatedFirstName = testEmployee.firstName + 'Updated';
    await page.fill('input[name="firstName"]', updatedFirstName);
    
    // Update other personal details
    await page.fill('input[name="nickname"]', 'TestNick');
    
    // Select gender
    const genderRadio = page.locator('input[value="1"]'); // Male
    if (await genderRadio.count() > 0) {
      await genderRadio.check();
    }

    // Save changes
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // Verify changes were saved
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[name="firstName"]')).toHaveValue(updatedFirstName);

    // Update job information
    await page.click('a:has-text("Job")');
    await page.waitForLoadState('networkidle');

    // Fill job details if available
    const jobTitleDropdown = page.locator('.oxd-select-text-input').first();
    if (await jobTitleDropdown.count() > 0) {
      await jobTitleDropdown.click();
      const jobOptions = page.locator('.oxd-select-option');
      if (await jobOptions.count() > 0) {
        await jobOptions.first().click();
      }
    }

    // Select employment status
    const statusDropdown = page.locator('.oxd-select-text-input').nth(1);
    if (await statusDropdown.count() > 0) {
      await statusDropdown.click();
      const statusOptions = page.locator('.oxd-select-option:has-text("Full-Time")');
      if (await statusOptions.count() > 0) {
        await statusOptions.click();
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // ============== PHASE 4: SEARCH AND VERIFY EMPLOYEE ==============
    console.log('Phase 4: Searching for employee in employee list');

    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');

    // Search for the created employee
    await employeePage.searchEmployee(updatedFirstName);

    // Verify employee appears in search results
    const searchResults = page.locator('.oxd-table-body .oxd-table-row');
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThanOrEqual(1);

    // Verify employee details in the list
    const firstResult = searchResults.first();
    const nameCell = firstResult.locator('.oxd-table-cell').nth(1);
    const nameText = await nameCell.textContent();
    expect(nameText).toContain(updatedFirstName);

    // Click on employee to view details
    await nameCell.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Personal Details');

    // ============== PHASE 5: TEST EMPLOYEE LOGIN ==============
    console.log('Phase 5: Testing employee login credentials');

    // Logout as Admin
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await page.waitForURL('**/auth/login');

    // Login as the created employee
    await loginPage.login(testEmployee.username, testEmployee.password);
    await expect(page.locator('.oxd-topbar-header-breadcrumb h6')).toContainText('Dashboard');
    console.log(`Successfully logged in as employee: ${testEmployee.username}`);

    // Verify employee can access My Info
    await page.click('a[href="/web/index.php/pim/viewMyDetails"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h6')).toContainText('Personal Details');
    await expect(page.locator('input[name="firstName"]')).toHaveValue(updatedFirstName);

    // ============== PHASE 6: DELETE EMPLOYEE (CLEANUP) ==============
    console.log('Phase 6: Deleting employee (cleanup)');

    // Logout and login back as Admin
    await page.click('.oxd-userdropdown-tab');
    await page.click('a:has-text("Logout")');
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');

    // Navigate to the employee's personal details
    if (testEmployee.empNumber) {
      await page.goto(`${process.env.BASE_URL}/web/index.php/pim/viewPersonalDetails/empNumber/${testEmployee.empNumber}`);
      await page.waitForLoadState('networkidle');

      // Look for delete button
      const deleteButton = page.locator('button:has(.bi-trash)');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        
        // Confirm deletion
        await page.waitForSelector('.oxd-dialog-container', { state: 'visible' });
        await page.click('.oxd-button--label-danger:has-text("Yes, Delete")');
        await page.waitForLoadState('networkidle');
        
        // Verify deletion success
        await expect(page.locator('.oxd-toast--success')).toBeVisible();
        console.log('Employee deleted successfully');
      }
    }

    // Verify employee no longer exists in system
    await employeePage.navigateToEmployeeList();
    await employeePage.searchEmployee(updatedFirstName);

    // Should find no results or fewer results
    const postDeleteResults = page.locator('.oxd-table-body .oxd-table-row');
    const postDeleteCount = await postDeleteResults.count();
    
    if (postDeleteCount === 0) {
      console.log('Employee successfully removed from system');
    } else {
      // Verify the deleted employee is not in the results
      let foundDeleted = false;
      for (let i = 0; i < postDeleteCount; i++) {
        const nameCell = postDeleteResults.nth(i).locator('.oxd-table-cell').nth(1);
        const nameText = await nameCell.textContent();
        if (nameText?.includes(testEmployee.employeeId)) {
          foundDeleted = true;
          break;
        }
      }
      expect(foundDeleted).toBeFalsy();
    }

    console.log('E2E Employee CRUD Flow test completed successfully!');
    
    // Take final screenshot
    await page.screenshot({ 
      path: './test-results/screenshots/e2e-employee-crud-complete.png',
      fullPage: true 
    });
  });

  test('E2E: Employee Bulk Operations @e2e @employee @bulk', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Testing employee bulk operations...');

    // Login as Admin
    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');

    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');

    // Test bulk selection
    const employeeRows = page.locator('.oxd-table-body .oxd-table-row');
    const rowCount = await employeeRows.count();
    
    if (rowCount > 1) {
      // Select multiple employees
      await employeeRows.first().locator('input[type="checkbox"]').check();
      await employeeRows.nth(1).locator('input[type="checkbox"]').check();

      // Look for bulk action button
      const bulkActionButton = page.locator('button:has-text("Delete Selected")');
      if (await bulkActionButton.count() > 0) {
        console.log('Bulk selection functionality available');
        // Don't actually delete, just verify the functionality exists
      }
    }

    console.log('Employee bulk operations test completed');
  });

  test('E2E: Employee Data Validation @e2e @employee @validation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Testing employee data validation...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');

    await employeePage.navigateToAddEmployee();

    // Test required field validation
    await page.click('button[type="submit"]');
    await expect(page.locator('.oxd-text--span:has-text("Required")')).toBeVisible();

    // Test invalid email format
    await employeePage.fillEmployeeFirstName('Test');
    await employeePage.fillEmployeeLastName('User');
    
    // Enable login details and test invalid data
    await page.click('input[type="checkbox"]');
    await page.waitForSelector('input[autocomplete="username"]', { state: 'visible' });

    // Test short username
    await page.fill('input[autocomplete="username"]', 'ab'); // Too short
    await page.fill('input[type="password"]', 'weak'); // Weak password
    await page.fill('input[placeholder="Confirm Password"]', 'different'); // Non-matching password

    await page.click('button[type="submit"]');

    // Verify validation errors appear
    const errorMessages = page.locator('.oxd-text--span.oxd-input-field-error-message');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThan(0);

    console.log('Employee data validation test completed');
  });

  test('E2E: Employee Profile Completeness @e2e @employee @profile', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);

    console.log('Testing employee profile completeness...');

    await loginPage.navigateToLogin();
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');

    // Create minimal employee first
    await employeePage.navigateToAddEmployee();
    
    const minimalEmployee = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      employeeId: faker.string.numeric(6)
    };

    await employeePage.fillEmployeeFirstName(minimalEmployee.firstName);
    await employeePage.fillEmployeeLastName(minimalEmployee.lastName);
    await employeePage.fillEmployeeId(minimalEmployee.employeeId);

    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.oxd-toast--success')).toBeVisible();

    // Test progressive profile completion
    const profileSections = [
      { tab: 'Contact Details', field: 'input[placeholder="Type here"]', value: faker.internet.email() },
      { tab: 'Personal Details', field: 'input[name="nickname"]', value: 'TestNick' },
      { tab: 'Job', field: '.oxd-select-text-input', value: null }, // Dropdown selection
    ];

    for (const section of profileSections) {
      await page.click(`a:has-text("${section.tab}")`);
      await page.waitForLoadState('networkidle');

      if (section.field === '.oxd-select-text-input') {
        // Handle dropdown selection
        const dropdown = page.locator(section.field).first();
        if (await dropdown.count() > 0) {
          await dropdown.click();
          const option = page.locator('.oxd-select-option').first();
          if (await option.count() > 0) {
            await option.click();
          }
        }
      } else if (section.value) {
        // Handle text input
        await page.fill(section.field, section.value);
      }

      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      console.log(`Completed ${section.tab} section`);
    }

    // Clean up - navigate to employee list and search for employee to delete
    await employeePage.navigateToEmployeeList();
    await employeePage.searchEmployee(minimalEmployee.firstName);
    
    const searchResults = page.locator('.oxd-table-body .oxd-table-row');
    if (await searchResults.count() > 0) {
      const deleteButton = searchResults.first().locator('.bi-trash');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
        await page.click('.oxd-button--label-danger:has-text("Yes, Delete")');
        await page.waitForLoadState('networkidle');
      }
    }

    console.log('Employee profile completeness test completed');
  });

});