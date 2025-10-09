import { test, expect } from '../fixtures/testFixture';
import LoginPage from '../pages/LoginPage';
import ProductPage from '../pages/ProductPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';

test('checkout flow: valid and invalid data & price validation', async ({ page, usersData, checkoutData }) => {
  const login = new LoginPage(page);
  const products = new ProductPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);

  await login.goto();
  await login.login(usersData.standard_user.username, usersData.standard_user.password);
  await products.isLoaded();

  await products.addFirstNItems(2);
  await products.gotoCart();
  await cart.clickCheckout();

  await checkout.fillForm(checkoutData.invalid.firstName, checkoutData.invalid.lastName, checkoutData.invalid.postalCode);
  
  expect(await page.locator('[data-test="error"]').count()).toBeGreaterThanOrEqual(0);

  await checkout.fillForm(checkoutData.valid.firstName, checkoutData.valid.lastName, checkoutData.valid.postalCode);

  const total = await checkout.getSummaryTotal();
  expect(total).toBeGreaterThan(0);

  await checkout.finish();
  const completeText = await checkout.getCompleteText();
  expect(completeText).toContain('Thank you for your order!');
});