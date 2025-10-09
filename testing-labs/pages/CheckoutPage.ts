import { Page } from '@playwright/test';

class CheckoutPage {
  readonly page: Page;
  readonly first: string;
  readonly last: string;
  readonly postal: string;
  readonly continue: string;
  readonly finishBtn: string;
  readonly summaryTotal: string;
  readonly completeHeader: string;

  constructor(page: Page) {
    this.page = page;
    this.first = '[data-test="firstName"]';
    this.last = '[data-test="lastName"]';
    this.postal = '[data-test="postalCode"]';
    this.continue = '[data-test="continue"]';
    this.finishBtn = '[data-test="finish"]';
    this.summaryTotal = '.summary_total_label';
    this.completeHeader = '.complete-header';
  }

  async fillForm(first: string, last: string, postal: string): Promise<void> {
    await this.page.fill(this.first, first);
    await this.page.fill(this.last, last);
    await this.page.fill(this.postal, postal);
    await this.page.click(this.continue);
  }

  async getSummaryTotal(): Promise<number> {
    const text = await this.page.locator(this.summaryTotal).textContent();
    return parseFloat(text?.replace(/[^0-9.]/g, '') || '0');
  }

  async finish(): Promise<void> { 
    await this.page.click(this.finishBtn); 
  }
  
  async getCompleteText(): Promise<string | null> { 
    return this.page.locator(this.completeHeader).textContent(); 
  }
}

export default CheckoutPage;