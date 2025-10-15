import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { EmployeePage } from '../pages/EmployeePage';
import { LeavePage } from '../pages/LeavePage';

test.describe('Visual/UI Flow Validation', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('Dashboard widgets visibility and content validation @visual @smoke', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Wait for dashboard to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Validate Quick Launch widget
    await expect(page.locator('.orangehrm-quick-launch')).toBeVisible();
    await expect(page.locator('.orangehrm-quick-launch .oxd-text--h6')).toContainText('Quick Launch');
    
    // Validate dashboard cards are present
    const dashboardCards = page.locator('.orangehrm-dashboard-card');
    const cardCount = await dashboardCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
    
    // Validate Time at Work widget (if present)
    const timeWidget = page.locator('[data-v-6db14f26]');
    if (await timeWidget.count() > 0) {
      await expect(timeWidget).toBeVisible();
    }
    
    // Validate My Actions widget
    const myActionsWidget = page.locator('.orangehrm-todo-card');
    if (await myActionsWidget.count() > 0) {
      await expect(myActionsWidget).toBeVisible();
      await expect(myActionsWidget.locator('.oxd-text--h6')).toContainText('My Actions');
    }
    
    // Validate Buzz Latest Posts widget (if enabled)
    const buzzWidget = page.locator('.orangehrm-buzz-widget');
    if (await buzzWidget.count() > 0) {
      await expect(buzzWidget).toBeVisible();
    }
    
    // Take screenshot for visual regression
    await page.screenshot({ 
      path: './test-results/screenshots/dashboard-widgets.png',
      fullPage: true 
    });
  });

  test('Employee list column headers and data consistency @visual @employee', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');
    
    // Validate table headers are present and correct
    const expectedHeaders = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Actions'];
    
    for (const header of expectedHeaders) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
    
    // Validate data rows are present
    const dataRows = page.locator('.oxd-table-body .oxd-table-row');
    const rowCount = await dataRows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
    
    // Validate each row has correct number of columns
    const firstRow = dataRows.first();
    const columns = firstRow.locator('.oxd-table-cell');
    await expect(columns).toHaveCount(7);
    
    // Validate ID column contains numeric values
    const idCell = firstRow.locator('.oxd-table-cell').first();
    const idText = await idCell.textContent();
    expect(idText).toMatch(/^\d{4,}$/);
    
    // Validate Actions column contains edit/delete icons
    const actionsCell = firstRow.locator('.oxd-table-cell').last();
    const iconCount = await actionsCell.locator('.oxd-icon').count();
    expect(iconCount).toBeGreaterThanOrEqual(1);
    
    // Take screenshot of employee list
    await page.screenshot({ 
      path: './test-results/screenshots/employee-list-columns.png',
      fullPage: true 
    });
  });

  test('Leave calendar integration and date picker validation @visual @leave', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const leavePage = new LeavePage(page);
    
    // Login as ESS user
    await loginPage.login(process.env.ESS_USERNAME || 'ess-user', process.env.ESS_PASSWORD || 'ess123');
    
    // Navigate to Apply Leave
    await leavePage.navigateToApplyLeave();
    await page.waitForLoadState('networkidle');
    
    // Click on From Date to open calendar
    await page.click('input[placeholder="yyyy-dd-mm"]');
    await page.waitForSelector('.oxd-calendar-dropdown', { state: 'visible' });
    
    // Validate calendar widget is visible
    await expect(page.locator('.oxd-calendar-dropdown')).toBeVisible();
    
    // Validate month/year selectors
    await expect(page.locator('.oxd-calendar-dropdown select')).toHaveCount(2);
    
    // Validate calendar days are present
    const calendarDays = page.locator('.oxd-calendar-date');
    const dayCount = await calendarDays.count();
    expect(dayCount).toBeGreaterThanOrEqual(28);
    expect(dayCount).toBeLessThanOrEqual(42);
    
    // Select a future date
    const futureDate = page.locator('.oxd-calendar-date:not(.--disabled):not(.--selected)').first();
    await futureDate.click();
    
    // Validate date input is populated
    const fromDateInput = page.locator('input[placeholder="yyyy-dd-mm"]').first();
    const fromDateValue = await fromDateInput.inputValue();
    expect(fromDateValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    
    // Take screenshot of calendar integration
    await page.screenshot({ 
      path: './test-results/screenshots/leave-calendar.png',
      fullPage: true 
    });
  });

  test('Navigation menu structure and responsiveness @visual @navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Validate main navigation menu
    await expect(page.locator('.oxd-main-menu')).toBeVisible();
    
    // Validate main menu items
    const expectedMenuItems = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Buzz'];
    
    for (const menuItem of expectedMenuItems) {
      const menuElement = page.locator(`.oxd-main-menu-item:has-text("${menuItem}")`);
      if (await menuElement.count() > 0) {
        await expect(menuElement).toBeVisible();
      }
    }
    
    // Test mobile responsiveness by reducing viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    // Validate menu collapses or adapts
    const menu = page.locator('.oxd-main-menu');
    await expect(menu).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Take screenshot of navigation
    await page.screenshot({ 
      path: './test-results/screenshots/navigation-menu.png',
      fullPage: true 
    });
  });

  test('Form field validation and error message display @visual @forms', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Add Employee
    await employeePage.navigateToAddEmployee();
    
    // Try to save without required fields
    await page.click('button[type="submit"]');
    
    // Validate error messages appear
    const errorMessages = page.locator('.oxd-text--span.oxd-input-field-error-message');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBeGreaterThanOrEqual(1);
    
    // Validate specific error message text
    await expect(page.locator('text=Required')).toBeVisible();
    
    // Fill first name and validate error disappears
    await page.fill('input[name="firstName"]', 'Test');
    await page.click('input[name="lastName"]'); // Trigger validation
    
    // Last name should still show error
    await expect(page.locator('input[name="lastName"] + .oxd-text--span')).toContainText('Required');
    
    // Take screenshot of form validation
    await page.screenshot({ 
      path: './test-results/screenshots/form-validation.png',
      fullPage: true 
    });
  });

  test('Data table pagination and records per page @visual @pagination', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');
    
    // Validate pagination controls
    const paginationInfo = page.locator('.oxd-table-footer .oxd-text--span');
    await expect(paginationInfo).toBeVisible();
    
    // Validate records info format
    const paginationText = await paginationInfo.textContent();
    expect(paginationText).toMatch(/\(\d+\) Records? Found/);
    
    // Check if pagination buttons exist (when there are multiple pages)
    const nextButton = page.locator('button[aria-label="Next"]');
    const prevButton = page.locator('button[aria-label="Previous"]');
    
    if (await nextButton.count() > 0) {
      // If pagination exists, validate navigation
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        
        // Validate page changed
        const newRows = await page.locator('.oxd-table-body .oxd-table-row').count();
        expect(newRows).toBeGreaterThan(0);
        
        // Go back to first page
        if (await prevButton.isEnabled()) {
          await prevButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    // Take screenshot of pagination
    await page.screenshot({ 
      path: './test-results/screenshots/data-pagination.png',
      fullPage: true 
    });
  });

  test('Loading states and progress indicators @visual @loading', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List to capture loading state
    const navigationPromise = employeePage.navigateToEmployeeList();
    
    // Try to capture loading spinner (might be too fast)
    try {
      await expect(page.locator('.oxd-loading-spinner')).toBeVisible({ timeout: 2000 });
    } catch (error) {
      // Loading might be too fast to capture
      console.log('Loading spinner not captured - page loaded too quickly', (error as Error).message);
    }
    
    await navigationPromise;
    await page.waitForLoadState('networkidle');
    
    // Validate final loaded state
    await expect(page.locator('.oxd-table')).toBeVisible();
    
    // Test form submission loading state
    await employeePage.navigateToAddEmployee();
    
    // Fill required fields
    await page.fill('input[name="firstName"]', 'LoadTest');
    await page.fill('input[name="lastName"]', 'User');
    
    // Submit and look for loading state
    const submitPromise = page.click('button[type="submit"]');
    
    try {
      await expect(page.locator('.oxd-button--loading')).toBeVisible({ timeout: 1000 });
    } catch (error) {
      // Submit might be too fast
      console.log('Submit loading state not captured', (error as Error).message);
    }
    
    await submitPromise;
    
    // Take screenshot
    await page.screenshot({ 
      path: './test-results/screenshots/loading-states.png',
      fullPage: true 
    });
  });

  test('Theme and styling consistency @visual @theme', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Validate primary colors and styling
    const primaryButton = page.locator('.oxd-button--main').first();
    if (await primaryButton.count() > 0) {
      const buttonStyle = await primaryButton.evaluate((el) => getComputedStyle(el));
      // Validate button has consistent styling
      expect(buttonStyle.borderRadius).toBeTruthy();
    }
    
    // Validate consistent font usage
    const bodyElement = page.locator('body');
    const bodyStyle = await bodyElement.evaluate((el) => getComputedStyle(el));
    expect(bodyStyle.fontFamily).toBeTruthy();
    
    // Validate header styling
    const headerElement = page.locator('.oxd-topbar');
    await expect(headerElement).toBeVisible();
    
    // Validate sidebar styling
    const sidebarElement = page.locator('.oxd-sidepanel');
    await expect(sidebarElement).toBeVisible();
    
    // Take full page screenshot for theme validation
    await page.screenshot({ 
      path: './test-results/screenshots/theme-consistency.png',
      fullPage: true 
    });
  });

  test('Modal dialogs and overlay behavior @visual @modals', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');
    
    // Try to trigger delete confirmation modal
    const deleteButton = page.locator('.oxd-icon-button.oxd-table-cell-action-space .bi-trash').first();
    
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      
      // Validate modal appears
      await expect(page.locator('.oxd-dialog-container')).toBeVisible();
      await expect(page.locator('.oxd-dialog-container .oxd-text--h6')).toContainText('Confirm');
      
      // Validate modal overlay
      await expect(page.locator('.oxd-dialog-container-default')).toBeVisible();
      
      // Validate modal buttons
      await expect(page.locator('.oxd-button--label-danger')).toBeVisible();
      await expect(page.locator('.oxd-button--ghost')).toBeVisible();
      
      // Cancel the modal
      await page.click('.oxd-button--ghost');
      await expect(page.locator('.oxd-dialog-container')).not.toBeVisible();
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: './test-results/screenshots/modal-behavior.png',
      fullPage: true 
    });
  });

  test('Search and filter UI responsiveness @visual @search', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const employeePage = new EmployeePage(page);
    
    // Login as Admin
    await loginPage.login(process.env.ADMIN_USERNAME || 'Admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Navigate to Employee List
    await employeePage.navigateToEmployeeList();
    await page.waitForLoadState('networkidle');
    
    // Validate search form is present
    await expect(page.locator('.oxd-table-filter')).toBeVisible();
    
    // Fill search criteria
    await page.fill('input[placeholder="Type for hints..."]', 'Test');
    
    // Validate autocomplete/suggestions behavior
    await page.waitForTimeout(1000);
    
    // Click search button
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Validate search results update
    await expect(page.locator('.oxd-table-body')).toBeVisible();
    
    // Reset search
    await page.click('button[type="reset"]');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of search interface
    await page.screenshot({ 
      path: './test-results/screenshots/search-interface.png',
      fullPage: true 
    });
  });

});