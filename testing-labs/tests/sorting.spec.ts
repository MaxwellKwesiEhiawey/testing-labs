import { test, expect } from '../fixtures/testFixture';
import LoginPage from '../pages/LoginPage';
import ProductPage from '../pages/ProductPage';

test('product sorting low->high and high->low', async ({ page, usersData }) => {
  const login = new LoginPage(page);
  const products = new ProductPage(page);
  await login.goto();
  await login.login(usersData.standard_user.username, usersData.standard_user.password);
  await products.isLoaded();

  await products.sortBy('lohi');
  const lowToHigh: number[] = await products.getPrices();
  const sorted: number[] = [...lowToHigh].sort((a: number, b: number) => a - b);
  expect(lowToHigh).toEqual(sorted);

  await products.sortBy('hilo'); 
  const highToLow: number[] = await products.getPrices();
  expect(highToLow).toEqual([...highToLow].sort((a: number, b: number) => b - a));
});