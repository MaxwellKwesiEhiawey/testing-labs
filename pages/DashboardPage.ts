import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard Page Object Model
 */
export class DashboardPage extends BasePage {
  // Locators
  private readonly pageTitle: Locator;
  private readonly userDropdown: Locator;
  private readonly logoutLink: Locator;
  private readonly mainMenu: Locator;
  private readonly adminTab: Locator;
  private readonly pimTab: Locator;
  private readonly leaveTab: Locator;
  private readonly timeTab: Locator;
  private readonly recruitmentTab: Locator;
  private readonly myInfoTab: Locator;
  private readonly performanceTab: Locator;
  private readonly dashboardTab: Locator;
  private readonly directoryTab: Locator;
  private readonly maintenanceTab: Locator;
  private readonly buzzTab: Locator;
  private readonly quickLaunchWidget: Locator;
  private readonly timeAtWorkWidget: Locator;
  private readonly myActionsWidget: Locator;
  private readonly employeeDistributionWidget: Locator;
  private readonly searchBox: Locator;
  private readonly profilePicture: Locator;
  private readonly employeeName: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.oxd-topbar-header-title');
    this.userDropdown = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.locator('text=Logout');
    this.mainMenu = page.locator('.oxd-main-menu');
    this.adminTab = page.locator('text=Admin');
    this.pimTab = page.locator('text=PIM');
    this.leaveTab = page.locator('text=Leave');
    this.timeTab = page.locator('text=Time');
    this.recruitmentTab = page.locator('text=Recruitment');
    this.myInfoTab = page.locator('text=My Info');
    this.performanceTab = page.locator('text=Performance');
    this.dashboardTab = page.locator('text=Dashboard');
    this.directoryTab = page.locator('text=Directory');
    this.maintenanceTab = page.locator('text=Maintenance');
    this.buzzTab = page.locator('text=Buzz');
    this.quickLaunchWidget = page.locator('.orangehrm-quick-launch');
    this.timeAtWorkWidget = page.locator('.orangehrm-attendance-card');
    this.myActionsWidget = page.locator('.orangehrm-todo-list');
    this.employeeDistributionWidget = page.locator('.orangehrm-dashboard-widget');
    this.searchBox = page.locator('.oxd-main-menu-search input');
    this.profilePicture = page.locator('.oxd-userdropdown-img');
    this.employeeName = page.locator('.oxd-userdropdown-name');
  }

  /**
   * Verify user is on dashboard
   */
  async verifyDashboardLoaded(): Promise<void> {
    await this.waitForElement('.oxd-topbar-header-title');
    await expect(this.pageTitle).toContainText('Dashboard');
  }

  /**
   * Get dashboard title
   */
  async getDashboardTitle(): Promise<string> {
    return await this.getElementText('.oxd-topbar-header-title');
  }

  /**
   * Logout from application
   */
  async logout(): Promise<void> {
    await this.clickElement('.oxd-userdropdown-tab');
    await this.waitForElement('text=Logout');
    await this.clickElement('text=Logout');
    await this.waitForURL('**/auth/login');
  }

  /**
   * Navigate to Admin section
   */
  async navigateToAdmin(): Promise<void> {
    await this.clickElement('text=Admin');
    await this.waitForURL('**/admin/**');
  }

  /**
   * Navigate to PIM section
   */
  async navigateToPIM(): Promise<void> {
    await this.clickElement('text=PIM');
    await this.waitForURL('**/pim/**');
  }

  /**
   * Navigate to Leave section
   */
  async navigateToLeave(): Promise<void> {
    await this.clickElement('text=Leave');
    await this.waitForURL('**/leave/**');
  }

  /**
   * Navigate to My Info section
   */
  async navigateToMyInfo(): Promise<void> {
    await this.clickElement('text=My Info');
    await this.waitForURL('**/pim/viewMyDetails');
  }

  /**
   * Navigate to Time section
   */
  async navigateToTime(): Promise<void> {
    await this.clickElement('text=Time');
    await this.waitForURL('**/time/**');
  }

  /**
   * Check if Admin tab is visible
   */
  async isAdminTabVisible(): Promise<boolean> {
    return await this.isElementVisible('text=Admin');
  }

  /**
   * Check if PIM tab is visible
   */
  async isPIMTabVisible(): Promise<boolean> {
    return await this.isElementVisible('text=PIM');
  }

  /**
   * Check if Leave tab is visible
   */
  async isLeaveTabVisible(): Promise<boolean> {
    return await this.isElementVisible('text=Leave');
  }

  /**
   * Get visible menu items
   */
  async getVisibleMenuItems(): Promise<string[]> {
    const menuItems = await this.page.locator('.oxd-main-menu-item-wrapper').all();
    const visibleItems: string[] = [];
    
    for (const item of menuItems) {
      if (await item.isVisible()) {
        const text = await item.textContent();
        if (text) {
          visibleItems.push(text.trim());
        }
      }
    }
    
    return visibleItems;
  }

  /**
   * Verify dashboard widgets are visible
   */
  async verifyDashboardWidgets(): Promise<void> {
    // Check for common dashboard elements
    await expect(this.page.locator('.oxd-dashboard-widget')).toBeVisible();
  }

  /**
   * Search in main menu
   */
  async searchInMenu(searchTerm: string): Promise<void> {
    await this.fillInput('.oxd-main-menu-search input', searchTerm);
    await this.page.waitForTimeout(1000); // Wait for search results
  }

  /**
   * Get employee name from dropdown
   */
  async getEmployeeName(): Promise<string> {
    return await this.getElementText('.oxd-userdropdown-name');
  }

  /**
   * Get user dropdown options
   */
  async getUserDropdownOptions(): Promise<string[]> {
    await this.clickElement('.oxd-userdropdown-tab');
    await this.waitForElement('.oxd-dropdown-menu');
    
    const options = await this.page.locator('.oxd-dropdown-menu li').all();
    const optionTexts: string[] = [];
    
    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        optionTexts.push(text.trim());
      }
    }
    
    return optionTexts;
  }

  /**
   * Take dashboard screenshot
   */
  async takeDashboardScreenshot(): Promise<Buffer> {
    return await this.takeScreenshot('dashboard');
  }

  /**
   * Verify page load performance
   */
  async verifyPageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForPageLoad();
    const endTime = Date.now();
    return endTime - startTime;
  }

  /**
   * Check if Quick Launch widget is present
   */
  async isQuickLaunchVisible(): Promise<boolean> {
    return await this.isElementVisible('.orangehrm-quick-launch');
  }

  /**
   * Get dashboard widget count
   */
  async getDashboardWidgetCount(): Promise<number> {
    const widgets = await this.page.locator('.oxd-dashboard-widget').all();
    return widgets.length;
  }

  /**
   * Verify main menu is collapsed/expanded
   */
  async isMainMenuExpanded(): Promise<boolean> {
    const menuClass = await this.getAttributeValue('.oxd-main-menu', 'class');
    return !menuClass?.includes('toggled');
  }

  /**
   * Toggle main menu
   */
  async toggleMainMenu(): Promise<void> {
    await this.clickElement('.oxd-main-menu-button');
    await this.page.waitForTimeout(500); // Wait for animation
  }
}