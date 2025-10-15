import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 */
export class LoginPage extends BasePage {
  // Locators
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly forgotPasswordLink: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;
  private readonly logoImage: Locator;
  private readonly loadingSpinner: Locator;
  private readonly resetPasswordButton: Locator;
  private readonly resetUsernameInput: Locator;
  private readonly cancelButton: Locator;
  private readonly resetSuccessMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[name="username"]');
    this.passwordInput = page.locator('[name="password"]');
    this.loginButton = page.locator('[type="submit"]');
    this.forgotPasswordLink = page.locator('text=Forgot your password?');
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.loginForm = page.locator('.oxd-form');
    this.logoImage = page.locator('.orangehrm-login-branding img');
    this.loadingSpinner = page.locator('.oxd-loading-spinner');
    this.resetPasswordButton = page.locator('.oxd-button--secondary');
    this.resetUsernameInput = page.locator('[name="username"]');
    this.cancelButton = page.locator('.oxd-button--ghost');
    this.resetSuccessMessage = page.locator('.oxd-text--h6');
  }

  /**
   * Navigate to login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigate('/web/index.php/auth/login');
    await this.waitForElement('[name="username"]');
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillInput('[name="username"]', username);
    await this.fillInput('[name="password"]', password);
    await this.clickElement('[type="submit"]');
    
    // Wait a moment for the page to start transitioning
    await this.page.waitForTimeout(2000);
    
    // Check if we're still on login page (indicating login failure)
    const currentUrl = this.page.url();
    if (currentUrl.includes('/auth/login')) {
      throw new Error(`Login failed - still on login page. Current URL: ${currentUrl}`);
    }
    
    // Wait for navigation to dashboard (allow for different URL patterns)
    await this.page.waitForURL('**/index.php/dashboard/**', { timeout: 15000 });
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.waitForElement('.oxd-alert-content-text');
    return await this.getElementText('.oxd-alert-content-text');
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.clickElement('text=Forgot your password?');
    await this.waitForElement('.orangehrm-forgot-password-container');
  }

  /**
   * Reset password flow
   */
  async resetPassword(username: string): Promise<void> {
    await this.clickForgotPassword();
    await this.fillInput('[name="username"]', username);
    await this.clickElement('.oxd-button--secondary');
  }

  /**
   * Get reset password success message
   */
  async getResetSuccessMessage(): Promise<string> {
    await this.waitForElement('.oxd-text--h6');
    return await this.getElementText('.oxd-text--h6');
  }

  /**
   * Cancel reset password
   */
  async cancelResetPassword(): Promise<void> {
    await this.clickElement('.oxd-button--ghost');
    await this.waitForElement('[name="username"]');
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
    await expect(this.forgotPasswordLink).toBeVisible();
    await expect(this.logoImage).toBeVisible();
  }

  /**
   * Get login button text
   */
  async getLoginButtonText(): Promise<string> {
    return await this.getElementText('[type="submit"]');
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormDisplayed(): Promise<boolean> {
    return await this.isElementVisible('.oxd-form');
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete(): Promise<void> {
    try {
      await this.waitForElementToBeHidden('.oxd-loading-spinner', 10000);
    } catch {
      // Loading spinner might not appear, continue
    }
  }

  /**
   * Clear login fields
   */
  async clearLoginFields(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Get username field placeholder
   */
  async getUsernamePlaceholder(): Promise<string | null> {
    return await this.getAttributeValue('[name="username"]', 'placeholder');
  }

  /**
   * Get password field placeholder  
   */
  async getPasswordPlaceholder(): Promise<string | null> {
    return await this.getAttributeValue('[name="password"]', 'placeholder');
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(): Promise<void> {
    const title = await this.getTitle();
    expect(title).toContain('OrangeHRM');
  }

  /**
   * Take login page screenshot
   */
  async takeLoginPageScreenshot(): Promise<Buffer> {
    return await this.takeScreenshot('login-page');
  }
}