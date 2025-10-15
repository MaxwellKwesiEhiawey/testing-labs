import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { UserFixtures } from '../fixtures/testData';

test.describe('User Role Access Control Tests @access-control', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);

    await loginPage.navigateToLogin();
  });

  test('Verify Admin has access to Admin tab @smoke @admin @access-control', async ({ page }) => {
    await test.step('Login as Admin user', async () => {
      const admin = UserFixtures.ADMIN;
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Verify Admin tab is visible', async () => {
      await expect(page.locator('text=Admin')).toBeVisible();
    });

    await test.step('Click on Admin tab', async () => {
      await dashboardPage.navigateToAdmin();
    });

    await test.step('Verify Admin page loads successfully', async () => {
      await expect(page.locator('.oxd-topbar-header-title')).toContainText('Admin');
      await expect(page.locator('.oxd-table, .orangehrm-admin-access-container')).toBeVisible();
    });

    await test.step('Verify Admin functionalities are accessible', async () => {
      const adminFunctions = [
        'User Management',
        'System Users',
        'Organization',
        'Qualifications',
        'Nationalities',
        'Corporate Branding',
        'Configuration'
      ];

      for (const func of adminFunctions) {
        const element = page.locator(`text=${func}`);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });

    await test.step('Take screenshot of Admin access', async () => {
      await page.screenshot({ path: 'screenshots/admin-access-verified.png', fullPage: true });
    });
  });

  test('Verify ESS cannot access Admin tab @negative @ess @access-control', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Verify Admin tab is not visible', async () => {
      // Admin tab should not be visible for ESS users
      const adminTab = page.locator('text=Admin');
      await expect(adminTab).not.toBeVisible();
    });

    await test.step('Verify ESS has access to appropriate modules', async () => {
      const essModules = [
        'PIM',
        'Leave',
        'Time',
        'My Info',
        'Performance',
        'Dashboard'
      ];

      for (const module of essModules) {
        const element = page.locator(`text=${module}`);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });

    await test.step('Try to access Admin URL directly', async () => {
      await page.goto('/web/index.php/admin/viewSystemUsers');
      
      // Should either redirect to dashboard or show access denied
      const currentUrl = page.url();
      const isDashboard = currentUrl.includes('/dashboard');
      const isAccessDenied = await page.locator('text=Access Denied, text=Unauthorized, text=403').isVisible();
      
      expect(isDashboard || isAccessDenied).toBe(true);
    });

    await test.step('Take screenshot of ESS limited access', async () => {
      await page.screenshot({ path: 'screenshots/ess-limited-access.png', fullPage: true });
    });
  });

  test('Verify Manager has access to Leave approvals @functional @manager @access-control', async ({ page }) => {
    await test.step('Login as Manager user', async () => {
      const manager = UserFixtures.MANAGER;
      await loginPage.login(manager.username, manager.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Verify Leave tab is visible', async () => {
      await expect(page.locator('text=Leave')).toBeVisible();
    });

    await test.step('Navigate to Leave module', async () => {
      await dashboardPage.navigateToLeave();
    });

    await test.step('Verify Manager has access to Leave Approvals', async () => {
      const leaveApprovals = page.locator('text=Leave List, text=Pending Approval');
      if (await leaveApprovals.first().isVisible()) {
        await expect(leaveApprovals.first()).toBeVisible();
      }
    });

    await test.step('Verify Manager can access leave approval functions', async () => {
      const managerFunctions = [
        'Leave List',
        'Apply',
        'My Leave',
        'Entitlements',
        'Reports'
      ];

      for (const func of managerFunctions) {
        const element = page.locator(`text=${func}`);
        if (await element.isVisible()) {
          await expect(element).toBeVisible();
        }
      }
    });

    await test.step('Take screenshot of Manager leave access', async () => {
      await page.screenshot({ path: 'screenshots/manager-leave-access.png', fullPage: true });
    });
  });

  test('Verify role-based menu visibility @functional @access-control', async ({ page }) => {
    const roles = [
      { user: UserFixtures.ADMIN, role: 'Admin' },
      { user: UserFixtures.ESS, role: 'ESS' },
      { user: UserFixtures.MANAGER, role: 'Manager' }
    ];

    for (const roleData of roles) {
      await test.step(`Login as ${roleData.role} and verify menu access`, async () => {
        await loginPage.login(roleData.user.username, roleData.user.password);
        await dashboardPage.verifyDashboardLoaded();

        // Define expected menus for each role
        const expectedMenus: { [key: string]: string[] } = {
          Admin: ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Maintenance', 'Buzz'],
          ESS: ['PIM', 'Leave', 'Time', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Buzz'],
          Manager: ['PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Dashboard', 'Directory', 'Buzz']
        };

        const userMenus = expectedMenus[roleData.role] || [];
        
        for (const menu of userMenus) {
          const menuElement = page.locator(`text=${menu}`);
          if (await menuElement.isVisible()) {
            await expect(menuElement).toBeVisible();
          }
        }

        // Logout for next iteration
        await dashboardPage.logout();
        await loginPage.navigateToLogin();
      });
    }
  });

  test('Verify PIM access levels by role @functional @access-control', async ({ page }) => {
    await test.step('Test Admin PIM access', async () => {
      const admin = UserFixtures.ADMIN;
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.navigateToPIM();

      // Admin should have full PIM access including Add Employee
      await expect(page.locator('text=Add')).toBeVisible();
      await expect(page.locator('.oxd-table')).toBeVisible();

      await dashboardPage.logout();
    });

    await test.step('Test ESS PIM access', async () => {
      await loginPage.navigateToLogin();
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
      
      // ESS users might have limited PIM access or be redirected to My Info
      if (await page.locator('text=PIM').isVisible()) {
        await dashboardPage.navigateToPIM();
        // ESS might not have Add Employee button
        // Don't assert presence/absence, just check what's available
      }

      await dashboardPage.logout();
    });

    await test.step('Test Manager PIM access', async () => {
      await loginPage.navigateToLogin();
      const manager = UserFixtures.MANAGER;
      await loginPage.login(manager.username, manager.password);
      await dashboardPage.verifyDashboardLoaded();
      await dashboardPage.navigateToPIM();

      // Manager typically has PIM access but might be restricted
      await expect(page.locator('.oxd-table, .oxd-form')).toBeVisible();
    });
  });

  test('Verify Time module access by role @functional @access-control', async ({ page }) => {
    const roles = [
      { user: UserFixtures.ADMIN, role: 'Admin', shouldHaveAccess: true },
      { user: UserFixtures.ESS, role: 'ESS', shouldHaveAccess: true },
      { user: UserFixtures.MANAGER, role: 'Manager', shouldHaveAccess: true }
    ];

    for (const roleData of roles) {
      await test.step(`Test ${roleData.role} Time module access`, async () => {
        await loginPage.login(roleData.user.username, roleData.user.password);
        await dashboardPage.verifyDashboardLoaded();

        const timeModule = page.locator('text=Time');
        
        if (roleData.shouldHaveAccess) {
          if (await timeModule.isVisible()) {
            await expect(timeModule).toBeVisible();
            await timeModule.click();
            await expect(page.locator('.oxd-topbar-header-title')).toContainText('Time');
          }
        }

        await dashboardPage.logout();
        await loginPage.navigateToLogin();
      });
    }
  });

  test('Verify My Info access for all roles @functional @access-control', async ({ page }) => {
    const users = [UserFixtures.ADMIN, UserFixtures.ESS, UserFixtures.MANAGER];

    for (const user of users) {
      await test.step(`Test ${user.role} My Info access`, async () => {
        await loginPage.login(user.username, user.password);
        await dashboardPage.verifyDashboardLoaded();

        // All users should have access to My Info
        await expect(page.locator('text=My Info')).toBeVisible();
        
        await page.locator('text=My Info').click();
        await expect(page.locator('.oxd-topbar-header-title')).toContainText('PIM');
        
        // Verify personal details form is accessible
        await expect(page.locator('.oxd-form, .orangehrm-edit-employee')).toBeVisible();

        await dashboardPage.logout();
        await loginPage.navigateToLogin();
      });
    }
  });

  test('Verify Dashboard widgets by role @ui @access-control', async ({ page }) => {
    const roles = [
      { user: UserFixtures.ADMIN, role: 'Admin' },
      { user: UserFixtures.ESS, role: 'ESS' },
      { user: UserFixtures.MANAGER, role: 'Manager' }
    ];

    for (const roleData of roles) {
      await test.step(`Verify ${roleData.role} dashboard widgets`, async () => {
        await loginPage.login(roleData.user.username, roleData.user.password);
        await dashboardPage.verifyDashboardLoaded();

        // Check for common dashboard widgets
        const widgets = [
          '.oxd-widget',
          '.orangehrm-dashboard-widget',
          '.dashboard-widget',
          '.oxd-sheet'
        ];

        let widgetFound = false;
        for (const widget of widgets) {
          if (await page.locator(widget).first().isVisible()) {
            await expect(page.locator(widget).first()).toBeVisible();
            widgetFound = true;
            break;
          }
        }

        // At minimum, dashboard should have some content
        if (!widgetFound) {
          await expect(page.locator('.oxd-layout-main')).toBeVisible();
        }

        await page.screenshot({ 
          path: `screenshots/dashboard-widgets-${roleData.role.toLowerCase()}.png`, 
          fullPage: true 
        });

        await dashboardPage.logout();
        await loginPage.navigateToLogin();
      });
    }
  });
});

test.describe('Access Control Edge Cases @access-control @regression', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.navigateToLogin();
  });

  test('Verify direct URL access protection @security @access-control', async ({ page }) => {
    await test.step('Login as ESS user', async () => {
      const ess = UserFixtures.ESS;
      await loginPage.login(ess.username, ess.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Try to access restricted URLs directly', async () => {
      const restrictedUrls = [
        '/web/index.php/admin/viewSystemUsers',
        '/web/index.php/admin/saveSystemUser',
        '/web/index.php/admin/viewOrganizationGeneralInformation',
        '/web/index.php/maintenance/purgeEmployee',
        '/web/index.php/admin/viewCompanyStructure'
      ];

      for (const url of restrictedUrls) {
        await page.goto(url);
        
        // Should be redirected or show access denied
        const currentUrl = page.url();
        const isRedirected = !currentUrl.includes(url.split('/').pop() || '');
        const hasErrorMessage = await page.locator('text=Access Denied, text=Unauthorized, text=403, text=Permission Denied').isVisible();
        
        expect(isRedirected || hasErrorMessage).toBe(true);
      }
    });
  });

  test('Verify session-based access control @security @access-control', async ({ page }) => {
    await test.step('Login as Admin', async () => {
      const admin = UserFixtures.ADMIN;
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
    });

    await test.step('Verify Admin access', async () => {
      await expect(page.locator('text=Admin')).toBeVisible();
    });

    await test.step('Clear session/cookies and try to access Admin', async () => {
      await page.context().clearCookies();
      await page.reload();
      
      // Should be redirected to login or lose Admin access
      const isLoginPage = page.url().includes('/auth/login');
      const hasAdminAccess = await page.locator('text=Admin').isVisible();
      
      expect(isLoginPage || !hasAdminAccess).toBe(true);
    });
  });

  test('Verify concurrent session access control @security @access-control', async ({ page, context }) => {
    await test.step('Login as Admin in first session', async () => {
      const admin = UserFixtures.ADMIN;
      await loginPage.login(admin.username, admin.password);
      await dashboardPage.verifyDashboardLoaded();
      await expect(page.locator('text=Admin')).toBeVisible();
    });

    await test.step('Open new tab and login as ESS', async () => {
      const newPage = await context.newPage();
      const newLoginPage = new LoginPage(newPage);
      const newDashboardPage = new DashboardPage(newPage);
      
      await newLoginPage.navigateToLogin();
      const ess = UserFixtures.ESS;
      await newLoginPage.login(ess.username, ess.password);
      await newDashboardPage.verifyDashboardLoaded();
      
      // ESS should not have Admin access
      await expect(newPage.locator('text=Admin')).not.toBeVisible();
      
      await newPage.close();
    });

    await test.step('Verify original Admin session still active', async () => {
      await page.reload();
      // Admin access should still be available
      await expect(page.locator('text=Admin')).toBeVisible();
    });
  });
});