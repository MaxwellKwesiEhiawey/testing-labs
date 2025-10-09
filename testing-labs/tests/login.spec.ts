import { test, expect } from '../fixtures/testFixture';
import LoginPage from '../pages/LoginPage';

test.describe('login scenarios', () => {
  test('invalid login shows error', async ({ page, usersData }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(usersData.invalid_user.username, usersData.invalid_user.password);
    const txt = await login.getErrorText();
    expect(txt.length).toBeGreaterThan(0);
  });

  test('locked out user cannot login', async ({ page, usersData }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(usersData.locked_out_user.username, usersData.locked_out_user.password);
    const txt = await login.getErrorText();
    expect(txt.toLowerCase()).toContain('locked out');
  });
});