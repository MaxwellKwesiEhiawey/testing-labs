import { Page } from '@playwright/test';

class LoginPage {
  readonly page: Page;
  readonly username: string;
  readonly password: string;
  readonly loginBtn: string;
  readonly error: string;

  constructor(page: Page) {
    this.page = page;
    this.username = '#user-name';
    this.password = '#password';
    this.loginBtn = '#login-button';
    this.error = '[data-test="error"]';
  }

  async goto(): Promise<void> { 
    await this.page.goto('/'); 
  }
  
  async login(username: string, pwd: string): Promise<void> {
    await this.page.fill(this.username, username);
    await this.page.fill(this.password, pwd);
    await this.page.click(this.loginBtn);
  }
  
  async getErrorText(): Promise<string> {
    const el = this.page.locator(this.error);
    const count = await el.count();
    return count > 0 ? (await el.textContent())?.trim() || '' : '';
  }
}

export default LoginPage;