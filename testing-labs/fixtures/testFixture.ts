import { test as base, expect } from '@playwright/test';
import { users, checkout } from './testData';

interface TestFixtures {
  usersData: typeof users;
  checkoutData: typeof checkout;
}

const test = base.extend<TestFixtures>({
  usersData: async ({ page }, use) => { 
    await use(users); 
  },
  checkoutData: async ({ page }, use) => { 
    await use(checkout); 
  }
});

export { test, expect };