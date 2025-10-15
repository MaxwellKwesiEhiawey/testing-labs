import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { EmployeePage } from '../pages/EmployeePage';
import { LeavePage } from '../pages/LeavePage';
import { AdminPage } from '../pages/AdminPage';
import { UserFixtures, TestDataGenerator, UserFixture } from './testData';

// Extend base test with page objects and user fixtures
type TestFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  employeePage: EmployeePage;
  leavePage: LeavePage;
  adminPage: AdminPage;
  adminUser: UserFixture;
  essUser: UserFixture;
  managerUser: UserFixture;
  testData: ReturnType<typeof TestDataGenerator.getTestData>;
};

export const test = base.extend<TestFixtures>({
  // Page Objects
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  employeePage: async ({ page }, use) => {
    await use(new EmployeePage(page));
  },

  leavePage: async ({ page }, use) => {
    await use(new LeavePage(page));
  },

  adminPage: async ({ page }, use) => {
    await use(new AdminPage(page));
  },

  // User Fixtures
  adminUser: async ({ page }, use) => {
    await use(UserFixtures.ADMIN);
  },

  essUser: async ({ page }, use) => {
    await use(UserFixtures.ESS);
  },

  managerUser: async ({ page }, use) => {
    await use(UserFixtures.MANAGER);
  },

  // Test Data
  testData: async ({ page }, use) => {
    await use(TestDataGenerator.getTestData());
  },
});

export { expect } from '@playwright/test';

/**
 * Custom test groups for different test categories
 */
export const smokeTest = test.extend({});
export const regressionTest = test.extend({});
export const employeeTest = test.extend({});
export const leaveTest = test.extend({});
export const adminTest = test.extend({});
export const visualTest = test.extend({});