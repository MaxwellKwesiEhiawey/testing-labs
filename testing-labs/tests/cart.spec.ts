import { test, expect } from '../fixtures/testFixture';
import LoginPage from '../pages/LoginPage';
import ProductPage from '../pages/ProductPage';
import CartPage from '../pages/CartPage';

test('add/remove items and cart badge', async ({ page, usersData }) => {
  const login = new LoginPage(page);
  const products = new ProductPage(page);
  const cart = new CartPage(page);

  await login.goto();
  await login.login(usersData.standard_user.username, usersData.standard_user.password);
  await products.isLoaded();

  await products.addFirstNItems(2);
  expect(await products.cartCount()).toBe('2');

  await products.gotoCart();
  const names = await cart.getItemNames();
  expect(names.length).toBeGreaterThanOrEqual(2);

  const firstItemName = names[0];
  if (firstItemName) {
    await cart.removeItem(firstItemName);
  }
  // After remove, badge should be 1 or missing
  await expect(page.locator('.shopping_cart_badge').first()).toHaveCount(1);
});