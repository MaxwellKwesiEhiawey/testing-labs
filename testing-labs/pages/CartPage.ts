import { Page } from '@playwright/test';

class CartPage {
  readonly page: Page;
  readonly cartItems: string;
  readonly checkoutBtn: string;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = '.cart_item';
    this.checkoutBtn = '[data-test="checkout"]';
  }

  async getItemNames(): Promise<(string | null)[]> {
    const items = await this.page.$$(this.cartItems);
    return Promise.all(items.map(i => i.$eval('.inventory_item_name', el => el.textContent)));
  }

  async removeItem(name: string): Promise<void> {
    await this.page.click(`.cart_item:has-text("${name}") button`);
  }

  async clickCheckout(): Promise<void> { 
    await this.page.click(this.checkoutBtn); 
  }
}

export default CartPage;