import { test, expect } from '../fixtures/testFixture';
import LoginPage from '../pages/LoginPage';

test('warm-up: title and valid login', async ({ page, usersData }) => {
  const login = new LoginPage(page);
  await login.goto();
  await expect(page).toHaveTitle(/Swag Labs/);
  await login.login(usersData.standard_user.username, usersData.standard_user.password);
  await expect(page).toHaveURL(/inventory.html/);
});