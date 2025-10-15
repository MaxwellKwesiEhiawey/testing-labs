import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Employee Page Object Model for PIM (Personnel Information Management)
 */
export class EmployeePage extends BasePage {
  // Locators
  private readonly addEmployeeButton: Locator;
  private readonly employeeListTable: Locator;
  private readonly searchBox: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly firstNameInput: Locator;
  private readonly middleNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly employeeIdInput: Locator;
  private readonly photoUpload: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;
  private readonly editIcon: Locator;
  private readonly deleteIcon: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly successMessage: Locator;
  private readonly employeeNameHeader: Locator;
  private readonly personalDetailsTab: Locator;
  private readonly contactDetailsTab: Locator;
  private readonly jobTab: Locator;
  private readonly salaryTab: Locator;
  private readonly reportToTab: Locator;
  private readonly qualificationsTab: Locator;
  private readonly jobTitleDropdown: Locator;
  private readonly employmentStatusDropdown: Locator;
  private readonly jobCategoryDropdown: Locator;
  private readonly subUnitDropdown: Locator;
  private readonly locationDropdown: Locator;
  private readonly employeeImage: Locator;
  private readonly tableRows: Locator;
  private readonly noRecordsFound: Locator;

  constructor(page: Page) {
    super(page);
    this.addEmployeeButton = page.locator('text=Add');
    this.employeeListTable = page.locator('.oxd-table');
    this.searchBox = page.locator('[placeholder="Type for hints..."]');
    this.searchButton = page.locator('[type="submit"]');
    this.resetButton = page.locator('.oxd-button--ghost');
    this.firstNameInput = page.locator('[name="firstName"]');
    this.middleNameInput = page.locator('[name="middleName"]');
    this.lastNameInput = page.locator('[name="lastName"]');
    this.employeeIdInput = page.locator('.oxd-input').nth(4); // Employee ID field
    this.photoUpload = page.locator('input[type="file"]');
    this.saveButton = page.locator('[type="submit"]');
    this.cancelButton = page.locator('.oxd-button--ghost');
    this.editIcon = page.locator('.oxd-icon-button .bi-pencil-fill');
    this.deleteIcon = page.locator('.oxd-icon-button .bi-trash');
    this.confirmDeleteButton = page.locator('.oxd-button--label-danger');
    this.successMessage = page.locator('.oxd-toast-content');
    this.employeeNameHeader = page.locator('.orangehrm-edit-employee-name h6');
    this.personalDetailsTab = page.locator('text=Personal Details');
    this.contactDetailsTab = page.locator('text=Contact Details');
    this.jobTab = page.locator('text=Job');
    this.salaryTab = page.locator('text=Salary');
    this.reportToTab = page.locator('text=Report-to');
    this.qualificationsTab = page.locator('text=Qualifications');
    this.jobTitleDropdown = page.locator('.oxd-select-text').first();
    this.employmentStatusDropdown = page.locator('.oxd-select-text').nth(1);
    this.jobCategoryDropdown = page.locator('.oxd-select-text').nth(2);
    this.subUnitDropdown = page.locator('.oxd-select-text').nth(3);
    this.locationDropdown = page.locator('.oxd-select-text').nth(4);
    this.employeeImage = page.locator('.employee-image');
    this.tableRows = page.locator('.oxd-table-body .oxd-table-row');
    this.noRecordsFound = page.locator('text=No Records Found');
  }

  /**
   * Navigate to employee list
   */
  async navigateToEmployeeList(): Promise<void> {
    await this.navigate('/web/index.php/pim/viewEmployeeList');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Navigate to add employee page
   */
  async navigateToAddEmployee(): Promise<void> {
    await this.clickElement('text=Add');
    await this.waitForElement('[name="firstName"]');
  }

  /**
   * Click Add Employee button
   */
  async clickAddEmployee(): Promise<void> {
    await this.clickElement('text=Add');
    await this.waitForElement('[name="firstName"]');
  }

  /**
   * Fill employee first name
   */
  async fillEmployeeFirstName(firstName: string): Promise<void> {
    await this.fillInput('[name="firstName"]', firstName);
  }

  /**
   * Fill employee last name
   */
  async fillEmployeeLastName(lastName: string): Promise<void> {
    await this.fillInput('[name="lastName"]', lastName);
  }

  /**
   * Fill employee middle name
   */
  async fillEmployeeMiddleName(middleName: string): Promise<void> {
    await this.fillInput('[name="middleName"]', middleName);
  }

  /**
   * Fill employee ID
   */
  async fillEmployeeId(employeeId: string): Promise<void> {
    await this.employeeIdInput.clear();
    await this.fillInput('.oxd-input', employeeId);
  }

  /**
   * Upload employee photo
   */
  async uploadEmployeePhoto(photoPath: string): Promise<void> {
    await this.uploadFile('input[type="file"]', photoPath);
  }

  /**
   * Save employee
   */
  async saveEmployee(): Promise<void> {
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Search employee by name
   */
  async searchEmployeeByName(employeeName: string): Promise<void> {
    await this.fillInput('[placeholder="Type for hints..."]', employeeName);
    await this.page.waitForTimeout(2000); // Wait for autocomplete
    
    // Select from autocomplete if available
    try {
      await this.page.locator('.oxd-autocomplete-option').first().click();
    } catch {
      // If no autocomplete, continue with search
    }
  }

  /**
   * Click search button
   */
  async clickSearchButton(): Promise<void> {
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Search employee by ID
   */
  async searchEmployeeById(employeeId: string): Promise<void> {
    await this.fillInput('.oxd-input', employeeId);
  }

  /**
   * Click first employee in results
   */
  async clickFirstEmployeeInResults(): Promise<void> {
    await this.clickElement('.oxd-table-body .oxd-table-row .oxd-table-cell a');
    await this.waitForElement('.orangehrm-edit-employee-name');
  }

  /**
   * Click Job tab
   */
  async clickJobTab(): Promise<void> {
    await this.clickElement('text=Job');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Select job title
   */
  async selectJobTitle(jobTitle: string): Promise<void> {
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${jobTitle}`);
  }

  /**
   * Select job category
   */
  async selectJobCategory(jobCategory: string): Promise<void> {
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${jobCategory}`);
  }

  /**
   * Select sub unit
   */
  async selectSubUnit(subUnit: string): Promise<void> {
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${subUnit}`);
  }

  /**
   * Save job details
   */
  async saveJobDetails(): Promise<void> {
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Select employee checkbox
   */
  async selectEmployeeCheckbox(): Promise<void> {
    await this.clickElement('.oxd-table-body .oxd-table-row .oxd-checkbox-input');
  }

  /**
   * Click delete button
   */
  async clickDeleteButton(): Promise<void> {
    await this.clickElement('.oxd-button--label-danger');
  }

  /**
   * Confirm deletion
   */
  async confirmDeletion(): Promise<void> {
    await this.clickElement('.oxd-button--label-danger');
    await this.waitForPageLoad();
  }

  /**
   * Select multiple employees
   */
  async selectMultipleEmployees(count: number): Promise<void> {
    const checkboxes = this.page.locator('.oxd-table-body .oxd-table-row .oxd-checkbox-input');
    const checkboxCount = await checkboxes.count();
    const selectCount = Math.min(count, checkboxCount);
    
    for (let i = 0; i < selectCount; i++) {
      await checkboxes.nth(i).click();
    }
  }

  /**
   * Attempt large file upload (for testing)
   */
  async attemptLargeFileUpload(): Promise<void> {
    // This would be used for boundary testing
    // In a real scenario, you'd reference a large test file
    try {
      await this.uploadFile('input[type="file"]', 'test-data/large-file.jpg');
    } catch (error) {
      // Expected to fail for oversized files
      console.log('Large file upload failed as expected:', error);
    }
  }

  /**
   * Add new employee
   */
  async addEmployee(firstName: string, lastName: string, employeeId?: string, photoPath?: string): Promise<void> {
    await this.navigateToAddEmployee();
    
    await this.fillInput('[name="firstName"]', firstName);
    await this.fillInput('[name="lastName"]', lastName);
    
    if (employeeId) {
      await this.employeeIdInput.clear();
      await this.fillInput('.oxd-input', employeeId);
    }
    
    if (photoPath) {
      await this.uploadFile('input[type="file"]', photoPath);
    }
    
    await this.clickElement('[type="submit"]');
    await this.waitForElement('.orangehrm-edit-employee-name h6');
  }

  /**
   * Search employee by name
   */
  async searchEmployee(employeeName: string): Promise<void> {
    await this.fillInput('[placeholder="Type for hints..."]', employeeName);
    await this.page.waitForTimeout(2000); // Wait for autocomplete
    
    // Select from autocomplete if available
    try {
      await this.page.locator('.oxd-autocomplete-option').first().click();
    } catch {
      // If no autocomplete, continue with search
    }
    
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Get employee list count
   */
  async getEmployeeCount(): Promise<number> {
    try {
      await this.waitForElement('.oxd-table-body .oxd-table-row', 5000);
      const rows = await this.tableRows.all();
      return rows.length;
    } catch {
      return 0;
    }
  }

  /**
   * Verify employee exists in list
   */
  async verifyEmployeeInList(employeeName: string): Promise<boolean> {
    return await this.isElementVisible(`text=${employeeName}`);
  }

  /**
   * Edit first employee in list
   */
  async editFirstEmployee(): Promise<void> {
    await this.clickElement('.oxd-icon-button .bi-pencil-fill');
    await this.waitForElement('.orangehrm-edit-employee-name');
  }

  /**
   * Delete first employee in list
   */
  async deleteFirstEmployee(): Promise<void> {
    await this.clickElement('.oxd-icon-button .bi-trash');
    await this.waitForElement('.orangehrm-modal-header');
    await this.clickElement('.oxd-button--label-danger');
    await this.waitForPageLoad();
  }

  /**
   * Update employee job details
   */
  async updateJobDetails(jobTitle?: string, employmentStatus?: string, jobCategory?: string): Promise<void> {
    await this.clickElement('text=Job');
    await this.waitForElement('.oxd-form');
    
    if (jobTitle) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${jobTitle}`);
    }
    
    if (employmentStatus) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${employmentStatus}`);
    }
    
    if (jobCategory) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${jobCategory}`);
    }
    
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Get employee details
   */
  async getEmployeeDetails(): Promise<{firstName: string, lastName: string, employeeId: string}> {
    const firstName = await this.page.locator('[name="firstName"]').inputValue();
    const lastName = await this.page.locator('[name="lastName"]').inputValue();
    const employeeId = await this.page.locator('.oxd-input').nth(4).inputValue();
    
    return { firstName, lastName, employeeId };
  }

  /**
   * Verify success message
   */
  async verifySuccessMessage(): Promise<void> {
    await this.waitForElement('.oxd-toast-content');
    await expect(this.successMessage).toBeVisible();
  }

  /**
   * Get success message text
   */
  async getSuccessMessage(): Promise<string> {
    await this.waitForElement('.oxd-toast-content');
    return await this.getElementText('.oxd-toast-content');
  }

  /**
   * Reset search form
   */
  async resetSearch(): Promise<void> {
    await this.clickElement('.oxd-button--ghost');
    await this.waitForPageLoad();
  }

  /**
   * Check if employee photo is uploaded
   */
  async isEmployeePhotoVisible(): Promise<boolean> {
    return await this.isElementVisible('.employee-image img');
  }

  /**
   * Navigate to personal details tab
   */
  async navigateToPersonalDetails(): Promise<void> {
    await this.clickElement('text=Personal Details');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Navigate to contact details tab
   */
  async navigateToContactDetails(): Promise<void> {
    await this.clickElement('text=Contact Details');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Get table column headers
   */
  async getTableHeaders(): Promise<string[]> {
    const headers = await this.page.locator('.oxd-table-header .oxd-table-header-cell').all();
    const headerTexts: string[] = [];
    
    for (const header of headers) {
      const text = await header.textContent();
      if (text) {
        headerTexts.push(text.trim());
      }
    }
    
    return headerTexts;
  }

  /**
   * Verify table headers are correct
   */
  async verifyTableHeaders(): Promise<void> {
    const expectedHeaders = ['Id', 'First (& Middle) Name', 'Last Name', 'Job Title', 'Employment Status', 'Sub Unit', 'Actions'];
    const actualHeaders = await this.getTableHeaders();
    
    for (const header of expectedHeaders) {
      expect(actualHeaders).toContain(header);
    }
  }

  /**
   * Check if no records found message is displayed
   */
  async isNoRecordsFoundDisplayed(): Promise<boolean> {
    return await this.isElementVisible('text=No Records Found');
  }

  /**
   * Take employee list screenshot
   */
  async takeEmployeeListScreenshot(): Promise<Buffer> {
    return await this.takeScreenshot('employee-list');
  }
}