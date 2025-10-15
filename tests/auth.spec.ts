import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserFixtures, TestDataGenerator } from '../fixtures/testData';

test.describe('Authentication Tests @smoke @auth', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigateToLogin();
  });

  test('Valid login for Admin user @admin', async ({ page }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step('Login with admin credentials', async () => {
      await loginPage.login(admin.username, admin.password);
    });

    await test.step('Verify successful login and dashboard access', async () => {
      await dashboardPage.verifyDashboardLoaded();
      expect(await dashboardPage.getDashboardTitle()).toContain('Dashboard');
    });

    await test.step('Verify admin has access to Admin tab', async () => {
      expect(await dashboardPage.isAdminTabVisible()).toBe(true);
    });

    await test.step('Take screenshot of admin dashboard', async () => {
      await dashboardPage.takeDashboardScreenshot();
    });
  });

  test('Valid login for ESS user @ess', async ({ page }) => {
    const ess = UserFixtures.ESS;
    
    await test.step('Login with ESS credentials', async () => {
      await loginPage.login(ess.username, ess.password);
    });

    await test.step('Verify successful login and dashboard access', async () => {
      await dashboardPage.verifyDashboardLoaded();
      expect(await dashboardPage.getDashboardTitle()).toContain('Dashboard');
    });

    await test.step('Verify ESS user dashboard elements', async () => {
      expect(await dashboardPage.isPIMTabVisible()).toBe(true);
      expect(await dashboardPage.isLeaveTabVisible()).toBe(true);
    });
  });

  test('Valid login for Manager user @manager', async ({ page }) => {
    const manager = UserFixtures.MANAGER;
    
    await test.step('Login with Manager credentials', async () => {
      await loginPage.login(manager.username, manager.password);
    });

    await test.step('Verify successful login and dashboard access', async () => {
      await dashboardPage.verifyDashboardLoaded();
      expect(await dashboardPage.getDashboardTitle()).toContain('Dashboard');
    });

    await test.step('Verify manager access to key modules', async () => {
      expect(await dashboardPage.isPIMTabVisible()).toBe(true);
      expect(await dashboardPage.isLeaveTabVisible()).toBe(true);
    });
  });

  test('Login with invalid credentials @negative', async ({ page }) => {
    const invalidCredentials = TestDataGenerator.generateInvalidCredentials();
    
    for (const credentials of invalidCredentials) {
      await test.step(`Test invalid login: ${credentials.username}`, async () => {
        await loginPage.clearLoginFields();
        await loginPage.fillInput('[name="username"]', credentials.username);
        await loginPage.fillInput('[name="password"]', credentials.password);
        await loginPage.clickElement('[type="submit"]');
        
        if (credentials.username === '' || credentials.password === '') {
          // For empty fields, check for required field validation
          expect(await loginPage.isElementVisible('.oxd-input-field-error-message')).toBe(true);
        } else {
          // For invalid credentials, check for error message
          await loginPage.waitForElement('.oxd-alert-content-text');
          const errorMessage = await loginPage.getErrorMessage();
          expect(errorMessage.toLowerCase()).toContain('invalid');
        }
      });
    }
  });

  test('Password reset flow @functional', async ({ page }) => {
    await test.step('Navigate to forgot password', async () => {
      await loginPage.clickForgotPassword();
      expect(await loginPage.isElementVisible('.orangehrm-forgot-password-container')).toBe(true);
    });

    await test.step('Enter username for password reset', async () => {
      const admin = UserFixtures.ADMIN;
      await loginPage.fillInput('[name="username"]', admin.username);
      await loginPage.clickElement('.oxd-button--secondary');
    });

    await test.step('Verify reset password confirmation', async () => {
      await loginPage.waitForElement('.oxd-text--h6');
      const successMessage = await loginPage.getResetSuccessMessage();
      expect(successMessage.toLowerCase()).toContain('reset');
    });
  });

  test('Cancel password reset flow @functional', async ({ page }) => {
    await test.step('Navigate to forgot password', async () => {
      await loginPage.clickForgotPassword();
    });

    await test.step('Cancel password reset', async () => {
      await loginPage.cancelResetPassword();
      expect(await loginPage.isLoginFormDisplayed()).toBe(true);
    });
  });

  test('Login page elements validation @ui', async ({ page }) => {
    await test.step('Verify login page elements are present', async () => {
      await loginPage.verifyLoginPageElements();
    });

    await test.step('Verify page title', async () => {
      await loginPage.verifyPageTitle();
    });

    await test.step('Verify form field placeholders', async () => {
      const usernamePlaceholder = await loginPage.getUsernamePlaceholder();
      const passwordPlaceholder = await loginPage.getPasswordPlaceholder();
      
      expect(usernamePlaceholder).toBeTruthy();
      expect(passwordPlaceholder).toBeTruthy();
    });

    await test.step('Take login page screenshot', async () => {
      await loginPage.takeLoginPageScreenshot();
    });
  });

  test('Login button states @ui', async ({ page }) => {
    await test.step('Verify login button text', async () => {
      const buttonText = await loginPage.getLoginButtonText();
      expect(buttonText.toLowerCase()).toContain('login');
    });

    await test.step('Verify form submission with empty fields', async () => {
      await loginPage.clickElement('[type="submit"]');
      expect(await loginPage.isElementVisible('.oxd-input-field-error-message')).toBe(true);
    });
  });

  test('Session timeout handling @security', async ({ page }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step('Login successfully', async () => {
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Simulate session timeout by clearing cookies', async () => {
      await page.context().clearCookies();
      await page.reload();
    });

    await test.step('Verify redirect to login page', async () => {
      await loginPage.waitForElement('[name="username"]');
      expect(await loginPage.isLoginFormDisplayed()).toBe(true);
    });
  });

  test('Multiple login attempts with same user @security', async ({ page }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step('First login attempt', async () => {
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Logout', async () => {
      await dashboardPage.logout();
      expect(await loginPage.isLoginFormDisplayed()).toBe(true);
    });

    await test.step('Second login attempt with same user', async () => {
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
    });
  });

  test('Login performance validation @performance', async ({ page }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step('Measure login performance', async () => {
      const startTime = Date.now();
      
      await loginPage.fillInput('[name="username"]', admin.username);
      await loginPage.fillInput('[name="password"]', admin.password);
      await loginPage.clickElement('[type="submit"]');
      
      await dashboardPage.verifyDashboardLoaded();
      
      const endTime = Date.now();
      const loginTime = endTime - startTime;
      
      console.log(`Login time: ${loginTime}ms`);
      expect(loginTime).toBeLessThan(5000); // Login should complete within 5 seconds
    });
  });

  test('Cross-browser login validation @cross-browser', async ({ page, browserName }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step(`Login validation on ${browserName}`, async () => {
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // Verify browser-specific elements work correctly
      const visibleMenuItems = await dashboardPage.getVisibleMenuItems();
      expect(visibleMenuItems.length).toBeGreaterThan(0);
    });
  });

  test('Login with special characters in password @security', async ({ page }) => {
    // This test uses a hypothetical user with special characters in password
    const specialUser = {
      username: 'testuser',
      password: 'P@ssw0rd!@#$%^&*()'
    };
    
    await test.step('Attempt login with special characters', async () => {
      await loginPage.fillInput('[name="username"]', specialUser.username);
      await loginPage.fillInput('[name="password"]', specialUser.password);
      await loginPage.clickElement('[type="submit"]');
      
      // This will likely fail as the user doesn't exist, but tests password field handling
      await loginPage.waitForElement('.oxd-alert-content-text');
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid');
    });
  });
});

test.describe('Authentication Edge Cases @regression', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('SQL injection attempt in login fields @security', async ({ page }) => {
    const sqlInjectionAttempts = [
      "admin'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin' OR '1'='1' --",
      "' UNION SELECT * FROM users --"
    ];

    for (const attempt of sqlInjectionAttempts) {
      await test.step(`Test SQL injection: ${attempt}`, async () => {
        await loginPage.clearLoginFields();
        await loginPage.fillInput('[name="username"]', attempt);
        await loginPage.fillInput('[name="password"]', attempt);
        await loginPage.clickElement('[type="submit"]');
        
        // Should receive invalid credentials error, not SQL error
        await loginPage.waitForElement('.oxd-alert-content-text');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage.toLowerCase()).toContain('invalid');
        expect(errorMessage.toLowerCase()).not.toContain('sql');
        expect(errorMessage.toLowerCase()).not.toContain('error');
      });
    }
  });

  test('XSS attempt in login fields @security', async ({ page }) => {
    const xssAttempts = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">'
    ];

    for (const attempt of xssAttempts) {
      await test.step(`Test XSS attempt: ${attempt}`, async () => {
        await loginPage.clearLoginFields();
        await loginPage.fillInput('[name="username"]', attempt);
        await loginPage.fillInput('[name="password"]', 'password');
        await loginPage.clickElement('[type="submit"]');
        
        // Should receive invalid credentials, and no script execution
        await loginPage.waitForElement('.oxd-alert-content-text');
        const errorMessage = await loginPage.getErrorMessage();
        expect(errorMessage.toLowerCase()).toContain('invalid');
      });
    }
  });

  test('Extremely long input values @boundary', async ({ page }) => {
    const longString = 'a'.repeat(1000);
    
    await test.step('Test with extremely long username', async () => {
      await loginPage.fillInput('[name="username"]', longString);
      await loginPage.fillInput('[name="password"]', 'password');
      await loginPage.clickElement('[type="submit"]');
      
      // Should handle gracefully
      await loginPage.waitForElement('.oxd-alert-content-text');
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid');
    });
  });

  test('Rapid consecutive login attempts @load', async ({ page }) => {
    const admin = UserFixtures.ADMIN;
    
    await test.step('Perform rapid login attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await loginPage.clearLoginFields();
        await loginPage.fillInput('[name="username"]', admin.username);
        await loginPage.fillInput('[name="password"]', 'wrongpassword');
        await loginPage.clickElement('[type="submit"]');
        
        if (i < 4) {
          await loginPage.waitForElement('.oxd-alert-content-text');
          await page.waitForTimeout(500); // Small delay between attempts
        }
      }
      
      // After multiple failed attempts, system should still respond
      await loginPage.waitForElement('.oxd-alert-content-text');
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage.toLowerCase()).toContain('invalid');
    });
  });
});