import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Admin Page Object Model
 */
export class AdminPage extends BasePage {
  // Locators
  private readonly userManagementCard: Locator;
  private readonly jobCard: Locator;
  private readonly organizationCard: Locator;
  private readonly qualificationsCard: Locator;
  private readonly nationalitiesCard: Locator;
  private readonly corporateBrandingCard: Locator;
  private readonly configurationCard: Locator;
  private readonly addUserButton: Locator;
  private readonly userRoleDropdown: Locator;
  private readonly employeeNameInput: Locator;
  private readonly statusDropdown: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly saveButton: Locator;
  private readonly cancelButton: Locator;
  private readonly usersTable: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly editIcon: Locator;
  private readonly deleteIcon: Locator;
  private readonly confirmDeleteButton: Locator;
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly systemUsersLink: Locator;
  private readonly jobTitlesLink: Locator;
  private readonly payGradesLink: Locator;
  private readonly employmentStatusLink: Locator;
  private readonly jobCategoriesLink: Locator;
  private readonly workShiftsLink: Locator;
  private readonly generalInformationLink: Locator;
  private readonly locationsLink: Locator;
  private readonly structureLink: Locator;
  private readonly emailConfigurationLink: Locator;
  private readonly emailSubscriptionsLink: Locator;
  private readonly localizationLink: Locator;
  private readonly languagePackagesLink: Locator;
  private readonly modulesLink: Locator;
  private readonly socialMediaAuthLink: Locator;
  private readonly registerOAuthClientLink: Locator;

  constructor(page: Page) {
    super(page);
    this.userManagementCard = page.locator('.orangehrm-admin-access-module-card').first();
    this.jobCard = page.locator('.orangehrm-admin-access-module-card').nth(1);
    this.organizationCard = page.locator('.orangehrm-admin-access-module-card').nth(2);
    this.qualificationsCard = page.locator('.orangehrm-admin-access-module-card').nth(3);
    this.nationalitiesCard = page.locator('.orangehrm-admin-access-module-card').nth(4);
    this.corporateBrandingCard = page.locator('.orangehrm-admin-access-module-card').nth(5);
    this.configurationCard = page.locator('.orangehrm-admin-access-module-card').nth(6);
    this.addUserButton = page.locator('text=Add');
    this.userRoleDropdown = page.locator('.oxd-select-text').first();
    this.employeeNameInput = page.locator('[placeholder="Type for hints..."]');
    this.statusDropdown = page.locator('.oxd-select-text').nth(1);
    this.usernameInput = page.locator('.oxd-input').nth(1);
    this.passwordInput = page.locator('.oxd-input').nth(2);
    this.confirmPasswordInput = page.locator('.oxd-input').nth(3);
    this.saveButton = page.locator('[type="submit"]');
    this.cancelButton = page.locator('.oxd-button--ghost');
    this.usersTable = page.locator('.oxd-table');
    this.searchButton = page.locator('[type="submit"]');
    this.resetButton = page.locator('.oxd-button--ghost');
    this.editIcon = page.locator('.bi-pencil-fill');
    this.deleteIcon = page.locator('.bi-trash');
    this.confirmDeleteButton = page.locator('.oxd-button--label-danger');
    this.successMessage = page.locator('.oxd-toast-content');
    this.errorMessage = page.locator('.oxd-form-error-message');
    this.systemUsersLink = page.locator('text=System Users');
    this.jobTitlesLink = page.locator('text=Job Titles');
    this.payGradesLink = page.locator('text=Pay Grades');
    this.employmentStatusLink = page.locator('text=Employment Status');
    this.jobCategoriesLink = page.locator('text=Job Categories');
    this.workShiftsLink = page.locator('text=Work Shifts');
    this.generalInformationLink = page.locator('text=General Information');
    this.locationsLink = page.locator('text=Locations');
    this.structureLink = page.locator('text=Structure');
    this.emailConfigurationLink = page.locator('text=Email Configuration');
    this.emailSubscriptionsLink = page.locator('text=Email Subscriptions');
    this.localizationLink = page.locator('text=Localization');
    this.languagePackagesLink = page.locator('text=Language Packages');
    this.modulesLink = page.locator('text=Modules');
    this.socialMediaAuthLink = page.locator('text=Social Media Authentication');
    this.registerOAuthClientLink = page.locator('text=Register OAuth Client');
  }

  /**
   * Navigate to User Management section
   */
  async navigateToUserManagement(): Promise<void> {
    await this.clickElement('text=User Management');
    await this.waitForElement('.orangehrm-paper-container');
  }

  /**
   * Navigate to System Users
   */
  async navigateToSystemUsers(): Promise<void> {
    await this.clickElement('text=System Users');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Navigate to Add User page
   */
  async navigateToAddUser(): Promise<void> {
    await this.navigateToSystemUsers();
    await this.clickElement('text=Add');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Add new system user
   */
  async addSystemUser(
    userRole: string,
    employeeName: string,
    status: string,
    username: string,
    password: string
  ): Promise<void> {
    await this.navigateToAddUser();
    
    // Select user role
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${userRole}`);
    
    // Enter employee name
    await this.fillInput('[placeholder="Type for hints..."]', employeeName);
    await this.page.waitForTimeout(2000);
    try {
      await this.page.locator('.oxd-autocomplete-option').first().click();
    } catch {
      // Continue if no autocomplete
    }
    
    // Select status
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${status}`);
    
    // Enter username and passwords
    await this.fillInput('.oxd-input', username);
    await this.fillInput('.oxd-input', password);
    await this.fillInput('.oxd-input', password); // Confirm password
    
    // Save user
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Search system user
   */
  async searchSystemUser(
    username?: string,
    userRole?: string,
    employeeName?: string,
    status?: string
  ): Promise<void> {
    if (username) {
      await this.fillInput('.oxd-input', username);
    }
    
    if (userRole) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${userRole}`);
    }
    
    if (employeeName) {
      await this.fillInput('[placeholder="Type for hints..."]', employeeName);
      await this.page.waitForTimeout(2000);
      try {
        await this.page.locator('.oxd-autocomplete-option').first().click();
      } catch {
        // Continue if no autocomplete
      }
    }
    
    if (status) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${status}`);
    }
    
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Delete first system user
   */
  async deleteFirstSystemUser(): Promise<void> {
    await this.clickElement('.bi-trash');
    await this.waitForElement('.orangehrm-modal-header');
    await this.clickElement('.oxd-button--label-danger');
    await this.waitForPageLoad();
  }

  /**
   * Edit first system user
   */
  async editFirstSystemUser(): Promise<void> {
    await this.clickElement('.bi-pencil-fill');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Get system users count
   */
  async getSystemUsersCount(): Promise<number> {
    try {
      await this.waitForElement('.oxd-table-body .oxd-table-row', 5000);
      const rows = await this.page.locator('.oxd-table-body .oxd-table-row').all();
      return rows.length;
    } catch {
      return 0;
    }
  }

  /**
   * Verify user exists in table
   */
  async verifyUserInTable(username: string): Promise<boolean> {
    return await this.isElementVisible(`text=${username}`);
  }

  /**
   * Navigate to Job section
   */
  async navigateToJob(): Promise<void> {
    await this.clickElement('text=Job');
    await this.waitForElement('.orangehrm-paper-container');
  }

  /**
   * Navigate to Job Titles
   */
  async navigateToJobTitles(): Promise<void> {
    await this.navigateToJob();
    await this.clickElement('text=Job Titles');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Navigate to Organization section
   */
  async navigateToOrganization(): Promise<void> {
    await this.clickElement('text=Organization');
    await this.waitForElement('.orangehrm-paper-container');
  }

  /**
   * Navigate to General Information
   */
  async navigateToGeneralInformation(): Promise<void> {
    await this.navigateToOrganization();
    await this.clickElement('text=General Information');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Navigate to Configuration section
   */
  async navigateToConfiguration(): Promise<void> {
    await this.clickElement('text=Configuration');
    await this.waitForElement('.orangehrm-paper-container');
  }

  /**
   * Navigate to Email Configuration
   */
  async navigateToEmailConfiguration(): Promise<void> {
    await this.navigateToConfiguration();
    await this.clickElement('text=Email Configuration');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Verify admin access cards are visible
   */
  async verifyAdminAccessCards(): Promise<void> {
    await expect(this.userManagementCard).toBeVisible();
    await expect(this.jobCard).toBeVisible();
    await expect(this.organizationCard).toBeVisible();
    await expect(this.configurationCard).toBeVisible();
  }

  /**
   * Get admin module cards count
   */
  async getAdminModuleCardsCount(): Promise<number> {
    const cards = await this.page.locator('.orangehrm-admin-access-module-card').all();
    return cards.length;
  }

  /**
   * Check if User Management card is accessible
   */
  async isUserManagementAccessible(): Promise<boolean> {
    return await this.isElementVisible('text=User Management');
  }

  /**
   * Check if Add button is visible (admin privilege)
   */
  async isAddButtonVisible(): Promise<boolean> {
    return await this.isElementVisible('text=Add');
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
   * Get available user roles
   */
  async getAvailableUserRoles(): Promise<string[]> {
    await this.clickElement('.oxd-select-text');
    await this.waitForElement('.oxd-select-dropdown');
    
    const options = await this.page.locator('.oxd-select-option').all();
    const roles: string[] = [];
    
    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        roles.push(text.trim());
      }
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    
    return roles;
  }

  /**
   * Check if no records found message is displayed
   */
  async isNoRecordsFoundDisplayed(): Promise<boolean> {
    return await this.isElementVisible('text=No Records Found');
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
   * Take admin page screenshot
   */
  async takeAdminPageScreenshot(): Promise<Buffer> {
    return await this.takeScreenshot('admin-page');
  }
}