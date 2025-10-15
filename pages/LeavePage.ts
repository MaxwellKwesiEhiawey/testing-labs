import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Leave Page Object Model
 */
export class LeavePage extends BasePage {
  // Locators
  private readonly applyLeaveButton: Locator;
  private readonly myLeaveButton: Locator;
  private readonly leaveListButton: Locator;
  private readonly assignLeaveButton: Locator;
  private readonly leaveRequestsButton: Locator;
  private readonly leaveTypeDropdown: Locator;
  private readonly fromDatePicker: Locator;
  private readonly toDatePicker: Locator;
  private readonly partialDaysDropdown: Locator;
  private readonly durationDropdown: Locator;
  private readonly commentTextarea: Locator;
  private readonly applyButton: Locator;
  private readonly cancelButton: Locator;
  private readonly leaveTable: Locator;
  private readonly approveButton: Locator;
  private readonly rejectButton: Locator;
  private readonly deleteButton: Locator;
  private readonly confirmButton: Locator;
  private readonly successMessage: Locator;
  private readonly errorMessage: Locator;
  private readonly leaveStatusFilter: Locator;
  private readonly employeeNameInput: Locator;
  private readonly searchButton: Locator;
  private readonly resetButton: Locator;
  private readonly leaveBalanceWidget: Locator;
  private readonly pendingApprovalCount: Locator;
  private readonly scheduledLeaveCount: Locator;
  private readonly takenLeaveCount: Locator;
  private readonly leaveCalendar: Locator;
  private readonly monthNavigator: Locator;
  private readonly yearNavigator: Locator;
  private readonly todayButton: Locator;

  constructor(page: Page) {
    super(page);
    this.applyLeaveButton = page.locator('text=Apply');
    this.myLeaveButton = page.locator('text=My Leave');
    this.leaveListButton = page.locator('text=Leave List');
    this.assignLeaveButton = page.locator('text=Assign Leave');
    this.leaveRequestsButton = page.locator('text=Leave Requests');
    this.leaveTypeDropdown = page.locator('.oxd-select-text').first();
    this.fromDatePicker = page.locator('[placeholder="yyyy-mm-dd"]').first();
    this.toDatePicker = page.locator('[placeholder="yyyy-mm-dd"]').last();
    this.partialDaysDropdown = page.locator('.oxd-select-text').nth(1);
    this.durationDropdown = page.locator('.oxd-select-text').nth(2);
    this.commentTextarea = page.locator('textarea');
    this.applyButton = page.locator('[type="submit"]');
    this.cancelButton = page.locator('.oxd-button--ghost');
    this.leaveTable = page.locator('.oxd-table');
    this.approveButton = page.locator('text=Approve');
    this.rejectButton = page.locator('text=Reject');
    this.deleteButton = page.locator('.bi-trash');
    this.confirmButton = page.locator('.oxd-button--label-danger');
    this.successMessage = page.locator('.oxd-toast-content');
    this.errorMessage = page.locator('.oxd-form-error-message');
    this.leaveStatusFilter = page.locator('[placeholder="-- Select --"]');
    this.employeeNameInput = page.locator('[placeholder="Type for hints..."]');
    this.searchButton = page.locator('[type="submit"]');
    this.resetButton = page.locator('.oxd-button--ghost');
    this.leaveBalanceWidget = page.locator('.orangehrm-leave-balance-card');
    this.pendingApprovalCount = page.locator('.orangehrm-leave-card').first();
    this.scheduledLeaveCount = page.locator('.orangehrm-leave-card').nth(1);
    this.takenLeaveCount = page.locator('.orangehrm-leave-card').nth(2);
    this.leaveCalendar = page.locator('.orangehrm-calendar');
    this.monthNavigator = page.locator('.orangehrm-calendar-month-navigator');
    this.yearNavigator = page.locator('.orangehrm-calendar-year-navigator');
    this.todayButton = page.locator('text=Today');
  }

  /**
   * Navigate to Apply Leave page
   */
  async navigateToApplyLeave(): Promise<void> {
    await this.clickElement('text=Apply');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Click Apply Leave button
   */
  async clickApplyLeave(): Promise<void> {
    await this.clickElement('text=Apply');
    await this.waitForElement('.oxd-form');
  }

  /**
   * Select leave type
   */
  async selectLeaveType(leaveType: string): Promise<void> {
    await this.clickElement('.oxd-select-text');
    await this.waitForElement('.oxd-select-dropdown');
    await this.clickElement(`text=${leaveType}`);
  }

  /**
   * Select from date
   */
  async selectFromDate(date: string): Promise<void> {
    await this.fillInput('[placeholder="yyyy-mm-dd"]', date);
  }

  /**
   * Select to date
   */
  async selectToDate(date: string): Promise<void> {
    const toDateInputs = this.page.locator('[placeholder="yyyy-mm-dd"]');
    await toDateInputs.last().fill(date);
  }

  /**
   * Fill comment
   */
  async fillComment(comment: string): Promise<void> {
    await this.fillInput('textarea', comment);
  }

  /**
   * Submit leave application
   */
  async submitLeaveApplication(): Promise<void> {
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Leave Approvals
   */
  async navigateToLeaveApprovals(): Promise<void> {
    await this.clickElement('text=Leave List');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Check if there are leave requests
   */
  async hasLeaveRequests(): Promise<boolean> {
    try {
      await this.waitForElement('.oxd-table-body .oxd-table-row', 5000);
      const rows = await this.page.locator('.oxd-table-body .oxd-table-row').count();
      return rows > 0;
    } catch {
      return false;
    }
  }

  /**
   * Approve first leave request
   */
  async approveFirstLeaveRequest(): Promise<void> {
    await this.clickElement('.oxd-table-body .oxd-table-row .oxd-button--success, .oxd-table-body .oxd-table-row .bi-check');
    await this.waitForPageLoad();
  }

  /**
   * Reject first leave request
   */
  async rejectFirstLeaveRequest(comment?: string): Promise<void> {
    await this.clickElement('.oxd-table-body .oxd-table-row .oxd-button--danger, .oxd-table-body .oxd-table-row .bi-x');
    
    if (comment) {
      await this.waitForElement('textarea');
      await this.fillInput('textarea', comment);
      await this.clickElement('[type="submit"]');
    }
    
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Leave Balance
   */
  async navigateToLeaveBalance(): Promise<void> {
    await this.clickElement('text=Entitlements');
    await this.clickElement('text=My Entitlements');
    await this.waitForElement('.oxd-table, .leave-balance-container');
  }

  /**
   * Navigate to My Leave page
   */
  async navigateToMyLeave(): Promise<void> {
    await this.clickElement('text=My Leave');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Navigate to Leave List page
   */
  async navigateToLeaveList(): Promise<void> {
    await this.clickElement('text=Leave List');
    await this.waitForElement('.oxd-table');
  }

  /**
   * Apply for leave
   */
  async applyLeave(
    leaveType: string,
    fromDate: string,
    toDate: string,
    comment?: string,
    partialDays?: string
  ): Promise<void> {
    await this.navigateToApplyLeave();
    
    // Select leave type
    await this.clickElement('.oxd-select-text');
    await this.clickElement(`text=${leaveType}`);
    
    // Fill dates
    await this.fillInput('[placeholder="yyyy-mm-dd"]', fromDate);
    await this.page.keyboard.press('Tab');
    await this.fillInput('[placeholder="yyyy-mm-dd"]', toDate);
    
    // Add partial days if specified
    if (partialDays) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${partialDays}`);
    }
    
    // Add comment if provided
    if (comment) {
      await this.fillInput('textarea', comment);
    }
    
    // Submit application
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Search leave requests
   */
  async searchLeaveRequests(
    employeeName?: string,
    leaveType?: string,
    status?: string,
    fromDate?: string,
    toDate?: string
  ): Promise<void> {
    if (employeeName) {
      await this.fillInput('[placeholder="Type for hints..."]', employeeName);
      await this.page.waitForTimeout(2000);
      // Select from autocomplete
      try {
        await this.page.locator('.oxd-autocomplete-option').first().click();
      } catch {
        // Continue if no autocomplete
      }
    }
    
    if (leaveType) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${leaveType}`);
    }
    
    if (status) {
      await this.clickElement('.oxd-select-text');
      await this.clickElement(`text=${status}`);
    }
    
    if (fromDate) {
      await this.fillInput('[placeholder="yyyy-mm-dd"]', fromDate);
    }
    
    if (toDate) {
      await this.fillInput('[placeholder="yyyy-mm-dd"]', toDate);
    }
    
    await this.clickElement('[type="submit"]');
    await this.waitForPageLoad();
  }

  /**
   * Cancel first leave request
   */
  async cancelFirstLeaveRequest(): Promise<void> {
    await this.clickElement('.bi-trash');
    await this.waitForElement('.orangehrm-modal-header');
    await this.clickElement('.oxd-button--label-danger');
    await this.waitForPageLoad();
  }

  /**
   * Get leave requests count
   */
  async getLeaveRequestsCount(): Promise<number> {
    try {
      await this.waitForElement('.oxd-table-body .oxd-table-row', 5000);
      const rows = await this.page.locator('.oxd-table-body .oxd-table-row').all();
      return rows.length;
    } catch {
      return 0;
    }
  }

  /**
   * Verify leave request in table
   */
  async verifyLeaveRequestExists(employeeName: string, leaveType: string): Promise<boolean> {
    const nameExists = await this.isElementVisible(`text=${employeeName}`);
    const typeExists = await this.isElementVisible(`text=${leaveType}`);
    return nameExists && typeExists;
  }

  /**
   * Get leave status for first request
   */
  async getFirstLeaveRequestStatus(): Promise<string> {
    const statusCell = this.page.locator('.oxd-table-body .oxd-table-row').first().locator('.oxd-table-cell').nth(5);
    return await statusCell.textContent() || '';
  }

  /**
   * Get leave balance information
   */
  async getLeaveBalance(): Promise<{pending: string, scheduled: string, taken: string}> {
    const pending = await this.getElementText('.orangehrm-leave-card');
    const scheduled = await this.getElementText('.orangehrm-leave-card');
    const taken = await this.getElementText('.orangehrm-leave-card');
    
    return { pending, scheduled, taken };
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
   * Verify error message
   */
  async verifyErrorMessage(): Promise<void> {
    await this.waitForElement('.oxd-form-error-message');
    await expect(this.errorMessage).toBeVisible();
  }

  /**
   * Reset search filters
   */
  async resetSearchFilters(): Promise<void> {
    await this.clickElement('.oxd-button--ghost');
    await this.waitForPageLoad();
  }

  /**
   * Check if leave calendar is visible
   */
  async isLeaveCalendarVisible(): Promise<boolean> {
    return await this.isElementVisible('.orangehrm-calendar');
  }

  /**
   * Navigate to specific month in calendar
   */
  async navigateToMonth(month: string, year: string): Promise<void> {
    await this.clickElement('.orangehrm-calendar-month-navigator');
    await this.clickElement(`text=${month}`);
    await this.clickElement('.orangehrm-calendar-year-navigator');
    await this.clickElement(`text=${year}`);
  }

  /**
   * View leave details
   */
  async viewLeaveDetails(): Promise<void> {
    await this.clickElement('.oxd-table-body .oxd-table-row .bi-eye');
    await this.waitForElement('.orangehrm-horizontal-padding');
  }

  /**
   * Get available leave types
   */
  async getAvailableLeaveTypes(): Promise<string[]> {
    await this.clickElement('.oxd-select-text');
    await this.waitForElement('.oxd-select-dropdown');
    
    const options = await this.page.locator('.oxd-select-option').all();
    const leaveTypes: string[] = [];
    
    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        leaveTypes.push(text.trim());
      }
    }
    
    // Close dropdown
    await this.page.keyboard.press('Escape');
    
    return leaveTypes;
  }

  /**
   * Check if apply leave form is valid
   */
  async isApplyLeaveFormValid(): Promise<boolean> {
    const leaveTypeSelected = await this.getElementText('.oxd-select-text');
    const fromDate = await this.page.locator('[placeholder="yyyy-mm-dd"]').first().inputValue();
    const toDate = await this.page.locator('[placeholder="yyyy-mm-dd"]').last().inputValue();
    
    return leaveTypeSelected !== '-- Select --' && fromDate !== '' && toDate !== '';
  }

  /**
   * Take leave calendar screenshot
   */
  async takeLeaveCalendarScreenshot(): Promise<Buffer> {
    return await this.takeScreenshot('leave-calendar');
  }
}