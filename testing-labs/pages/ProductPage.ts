import { Page } from '@playwright/test';

class ProductPage {
  readonly page: Page;
  readonly sortSelect: string;
  readonly items: string;
  readonly cartLink: string;
  readonly cartBadge: string;

  constructor(page: Page) {
    this.page = page;
    this.sortSelect = '.product_sort_container';
    this.items = '.inventory_item';
    this.cartLink = '.shopping_cart_link';
    this.cartBadge = '.shopping_cart_badge';
  }

  itemName(name: string): string {
    return `.inventory_item:has-text("${name}")`;
  }

  async isLoaded(): Promise<void> { 
    await this.page.waitForSelector(this.items); 
  }

  async sortBy(value: string): Promise<void> { 
    await this.page.selectOption(this.sortSelect, value); 
  }

  async addItemByName(name: string): Promise<void> { 
    await this.page.click(`${this.itemName(name)} button`); 
  }

  async addFirstNItems(n: number = 1): Promise<void> {
    const items = await this.page.$$(this.items);
    for (let i = 0; i < Math.min(n, items.length); i++) {
      const button = await items[i].$('button');
      if (button) {
        await button.click();
      }
    }
  }

  async getPrices(): Promise<number[]> {
    const priceEls = await this.page.$$('.inventory_item_price');
    return Promise.all(priceEls.map(async e => {
      const text = await e.textContent();
      return parseFloat(text?.replace('$', '') || '0');
    }));
  }

  async gotoCart(): Promise<void> { 
    await this.page.click(this.cartLink); 
  }

  async cartCount(): Promise<string | null> {
    try {
      return await this.page.locator(this.cartBadge).textContent();
    } catch {
      return null;
    }
  }
}

export default ProductPage;