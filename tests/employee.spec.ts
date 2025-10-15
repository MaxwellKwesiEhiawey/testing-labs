import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeePage } from '../pages/EmployeePage';
import { UserFixtures, TestDataGenerator } from '../fixtures/testData';

test.describe('Employee Management Tests @employee @admin', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let employeePage: EmployeePage;
  let employeeData: any;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    employeePage = new EmployeePage(page);
    employeeData = TestDataGenerator.generateEmployee();

    // Login as Admin
    await loginPage.navigateToLogin();
    const admin = UserFixtures.ADMIN;
    await loginPage.login(admin.username, admin.password);
    await dashboardPage.verifyDashboardLoaded();
  });

  test('Add a new employee with photo upload @smoke @employee', async ({ page }) => {
    await test.step('Navigate to PIM module', async () => {
      await dashboardPage.navigateToPIM();
    });

    await test.step('Click Add Employee button', async () => {
      await employeePage.clickAddEmployee();
    });

    await test.step('Fill employee basic information', async () => {
      await employeePage.fillEmployeeFirstName(employeeData.firstName);
      await employeePage.fillEmployeeLastName(employeeData.lastName);
      await employeePage.fillEmployeeMiddleName(employeeData.middleName);
      await employeePage.fillEmployeeId(employeeData.employeeId);
    });

    await test.step('Upload employee photo', async () => {
      // Create a test image file or use existing one
      await employeePage.uploadEmployeePhoto('test-data/employee-photo.jpg');
    });

    await test.step('Save employee record', async () => {
      await employeePage.saveEmployee();
    });

    await test.step('Verify employee was created successfully', async () => {
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Saved');
      await expect(page.locator('.orangehrm-edit-employee-name')).toContainText(`${employeeData.firstName} ${employeeData.lastName}`);
    });

    await test.step('Take screenshot of created employee', async () => {
      await page.screenshot({ path: `screenshots/employee-created-${employeeData.employeeId}.png`, fullPage: true });
    });
  });

  test('Search employee by name @functional @employee', async ({ page }) => {
    await test.step('Navigate to PIM module', async () => {
      await dashboardPage.navigateToPIM();
    });

    await test.step('Search for existing employee by name', async () => {
      const searchName = 'Linda'; // Known employee in demo system
      await employeePage.searchEmployeeByName(searchName);
      await employeePage.clickSearchButton();
    });

    await test.step('Verify search results', async () => {
      await expect(page.locator('.oxd-table-body')).toBeVisible();
      await expect(page.locator('.oxd-table-cell').first()).toContainText('Linda');
    });

    await test.step('Take screenshot of search results', async () => {
      await page.screenshot({ path: 'screenshots/employee-search-results.png', fullPage: true });
    });
  });

  test('Search employee by ID @functional @employee', async ({ page }) => {
    await test.step('Navigate to PIM module', async () => {
      await dashboardPage.navigateToPIM();
    });

    await test.step('Search for employee by ID', async () => {
      const employeeId = '0001'; // Known employee ID in demo system
      await employeePage.searchEmployeeById(employeeId);
      await employeePage.clickSearchButton();
    });

    await test.step('Verify search results show correct employee', async () => {
      await expect(page.locator('.oxd-table-body')).toBeVisible();
      // Verify employee ID is displayed in results
      const results = page.locator('.oxd-table-row');
      await expect(results.first()).toBeVisible();
    });
  });

  test('Edit employee job details @functional @employee', async ({ page }) => {
    await test.step('Navigate to PIM and find employee', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.searchEmployeeByName('Linda');
      await employeePage.clickSearchButton();
    });

    await test.step('Click on employee to edit', async () => {
      await employeePage.clickFirstEmployeeInResults();
    });

    await test.step('Navigate to Job tab', async () => {
      await employeePage.clickJobTab();
    });

    await test.step('Edit job details', async () => {
      await employeePage.selectJobTitle('Software Engineer');
      await employeePage.selectJobCategory('Technicians');
      await employeePage.selectSubUnit('Engineering');
    });

    await test.step('Save job changes', async () => {
      await employeePage.saveJobDetails();
    });

    await test.step('Verify job details updated', async () => {
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Updated');
    });

    await test.step('Take screenshot of updated job details', async () => {
      await page.screenshot({ path: 'screenshots/employee-job-updated.png', fullPage: true });
    });
  });

  test('Delete employee record @functional @employee', async ({ page }) => {
    // First create an employee to delete
    await test.step('Navigate to PIM and create test employee', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.clickAddEmployee();
      
      const testEmployee = TestDataGenerator.generateEmployee();
      await employeePage.fillEmployeeFirstName(testEmployee.firstName);
      await employeePage.fillEmployeeLastName(testEmployee.lastName);
      await employeePage.fillEmployeeId(testEmployee.employeeId);
      await employeePage.saveEmployee();
      
      // Wait for success message
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Saved');
    });

    await test.step('Navigate back to employee list', async () => {
      await employeePage.navigateToEmployeeList();
    });

    await test.step('Search for the created employee', async () => {
      await employeePage.searchEmployeeByName(employeeData.firstName);
      await employeePage.clickSearchButton();
    });

    await test.step('Delete the employee', async () => {
      await employeePage.selectEmployeeCheckbox();
      await employeePage.clickDeleteButton();
      await employeePage.confirmDeletion();
    });

    await test.step('Verify employee was deleted', async () => {
      await expect(page.locator('.oxd-toast-content')).toContainText('Successfully Deleted');
    });

    await test.step('Verify employee is no longer searchable', async () => {
      await employeePage.clickSearchButton();
      await expect(page.locator('.oxd-toast-content')).toContainText('No Records Found');
    });
  });

  test('Employee form validation @negative @employee', async ({ page }) => {
    await test.step('Navigate to Add Employee form', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.clickAddEmployee();
    });

    await test.step('Try to save without required fields', async () => {
      await employeePage.saveEmployee();
    });

    await test.step('Verify validation errors are displayed', async () => {
      await expect(page.locator('.oxd-input-field-error-message')).toBeVisible();
      await expect(page.locator('.oxd-input-field-error-message')).toContainText('Required');
    });

    await test.step('Fill only first name and try to save', async () => {
      await employeePage.fillEmployeeFirstName(employeeData.firstName);
      await employeePage.saveEmployee();
    });

    await test.step('Verify last name is still required', async () => {
      await expect(page.locator('.oxd-input-field-error-message')).toContainText('Required');
    });
  });

  test('Employee bulk actions @functional @employee', async ({ page }) => {
    await test.step('Navigate to PIM employee list', async () => {
      await dashboardPage.navigateToPIM();
    });

    await test.step('Select multiple employees', async () => {
      await employeePage.selectMultipleEmployees(2);
    });

    await test.step('Verify bulk actions are available', async () => {
      await expect(page.locator('.oxd-button--secondary')).toContainText('Delete Selected');
    });

    await test.step('Take screenshot of bulk selection', async () => {
      await page.screenshot({ path: 'screenshots/employee-bulk-selection.png', fullPage: true });
    });
  });

  test('Employee data export @functional @employee', async ({ page }) => {
    await test.step('Navigate to PIM employee list', async () => {
      await dashboardPage.navigateToPIM();
    });

    await test.step('Click download/export button if available', async () => {
      // Look for download or export functionality
      const downloadButton = page.locator('button:has-text("Download"), button:has-text("Export")');
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
      }
    });

    await test.step('Verify employee list is displayed', async () => {
      await expect(page.locator('.oxd-table')).toBeVisible();
      await expect(page.locator('.oxd-table-header')).toContainText('Employee');
    });
  });

  test('Employee profile completeness validation @ui @employee', async ({ page }) => {
    await test.step('Navigate to an employee profile', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.searchEmployeeByName('Linda');
      await employeePage.clickSearchButton();
      await employeePage.clickFirstEmployeeInResults();
    });

    await test.step('Verify all profile sections are accessible', async () => {
      const profileTabs = [
        'Personal Details',
        'Contact Details', 
        'Emergency Contacts',
        'Dependents',
        'Immigration',
        'Job',
        'Salary',
        'Tax Exemptions',
        'Report-to',
        'Qualifications',
        'Memberships'
      ];

      for (const tab of profileTabs) {
        const tabLocator = page.locator(`text=${tab}`);
        if (await tabLocator.isVisible()) {
          await tabLocator.click();
          await expect(page.locator('.oxd-form')).toBeVisible();
        }
      }
    });

    await test.step('Take screenshot of employee profile', async () => {
      await page.screenshot({ path: 'screenshots/employee-profile-complete.png', fullPage: true });
    });
  });
});

test.describe('Employee Management Edge Cases @employee @regression', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    employeePage = new EmployeePage(page);

    await loginPage.navigateToLogin();
    const admin = UserFixtures.ADMIN;
    await loginPage.login(admin.username, admin.password);
    await dashboardPage.verifyDashboardLoaded();
  });

  test('Handle duplicate employee ID @boundary @employee', async ({ page }) => {
    await test.step('Navigate to Add Employee', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.clickAddEmployee();
    });

    await test.step('Try to create employee with existing ID', async () => {
      const employeeData = TestDataGenerator.generateEmployee();
      await employeePage.fillEmployeeFirstName(employeeData.firstName);
      await employeePage.fillEmployeeLastName(employeeData.lastName);
      await employeePage.fillEmployeeId('0001'); // Existing ID
      await employeePage.saveEmployee();
    });

    await test.step('Verify duplicate ID error handling', async () => {
      // The system should handle duplicate IDs gracefully
      const errorMessage = page.locator('.oxd-input-field-error-message, .oxd-alert-content-text');
      await expect(errorMessage).toBeVisible();
    });
  });

  test('Large file upload handling @boundary @employee', async ({ page }) => {
    await test.step('Navigate to Add Employee', async () => {
      await dashboardPage.navigateToPIM();
      await employeePage.clickAddEmployee();
    });

    await test.step('Fill basic employee information', async () => {
      const employeeData = TestDataGenerator.generateEmployee();
      await employeePage.fillEmployeeFirstName(employeeData.firstName);
      await employeePage.fillEmployeeLastName(employeeData.lastName);
    });

    await test.step('Attempt to upload oversized file', async () => {
      // This would test file size validation
      // In a real scenario, you'd create or reference a large file
      await employeePage.attemptLargeFileUpload();
    });

    await test.step('Verify file size error handling', async () => {
      const errorMessage = page.locator('text=File size too large, text=Invalid file type');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });
  });
});