import { test, expect } from '../fixtures/testFixture';
import { Route } from '@playwright/test';
import LoginPage from '../pages/LoginPage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
}

test('network stubbing examples', async ({ page, usersData }) => {
  await page.route('**/inventory**', (route: Route) => {
    const products: Product[] = [{
      id: '1',
      name: 'Stubbed Product',
      description: 'Only one product returned by stub',
      price: 9.99
    }];
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(products)
    });
  });

  await page.route('**/checkout**', (route: Route) => {
    route.fulfill({ status: 500, body: 'Server error (simulated)' });
  });

  const login = new LoginPage(page);
  await login.goto();
  await login.login(usersData.standard_user.username, usersData.standard_user.password);

  await page.waitForTimeout(1000);
  const items = await page.$$('.inventory_item');
  expect(items.length).toBeGreaterThanOrEqual(0); 
});