# Environment Configuration Guide

This document explains how to configure different test environments for the OrangeHRM Playwright test framework.

## Overview

The test framework supports multiple environment configurations to allow testing across different deployment environments (development, staging, production) with different user credentials and settings.

## Environment Files

### 1. `.env` (Default)
The main environment file used when no specific environment is set. Contains current working credentials.

### 2. `.env.example`
Template file with placeholder values. Copy this to create your own `.env` file.

### 3. `.env.development`
Configuration for local development testing:
- Headless mode disabled for debugging
- Longer timeouts
- Console logging enabled
- Slow motion for visual debugging

### 4. `.env.staging`
Configuration for staging environment testing:
- Production-like settings
- Different base URL and credentials
- Optimized timeouts

## Environment Variables

### Application Settings
```bash
BASE_URL=https://opensource-demo.orangehrmlive.com/
TEST_ENVIRONMENT=demo|development|staging|production
API_BASE_URL=https://opensource-demo.orangehrmlive.com/web/index.php/api/v2
```

### Test Configuration
```bash
TEST_TIMEOUT=30000
HEADLESS=true|false
DEFAULT_WAIT_TIME=5000
PAGE_LOAD_TIMEOUT=15000
```

### Browser Settings
```bash
DEFAULT_BROWSER=chromium|firefox|webkit
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=720
```

### User Credentials
```bash
# Admin User
ADMIN_USERNAME=Admin
ADMIN_PASSWORD=admin123
ADMIN_DISPLAY_NAME=Administrator
ADMIN_EMPLOYEE_ID=EMP001

# ESS User  
ESS_USERNAME=ess_user
ESS_PASSWORD=ess_password
ESS_DISPLAY_NAME=ESS User
ESS_EMPLOYEE_ID=EMP002

# Manager User
MANAGER_USERNAME=manager_user
MANAGER_PASSWORD=manager_password
MANAGER_DISPLAY_NAME=Manager User
MANAGER_EMPLOYEE_ID=EMP003
```

### Allure Reporting
```bash
ALLURE_RESULTS_DIR=allure-results
ALLURE_REPORT_DIR=allure-report
ALLURE_DETAIL_REPORTING=true
ALLURE_ENVIRONMENT_INFO=true
```

## Usage

### Running Tests with Different Environments

```bash
# Default environment (.env)
npm test

# Development environment
npm run test:dev
npm run test:dev:headed

# Staging environment  
npm run test:staging
npm run test:staging:headed

# Production environment
npm run test:prod
```

### Running Tests by User Role

```bash
# Admin user tests
npm run test:admin

# ESS user tests
npm run test:ess

# Manager user tests
npm run test:manager
```

### Running Tests by Category

```bash
# Smoke tests only
npm run test:smoke

# Full regression suite
npm run test:regression
```

## Environment Configuration Class

The `EnvironmentConfig` utility class provides centralized access to environment settings:

```typescript
import { envConfig } from '../utils/environmentConfig';

// Get user credentials
const adminUser = envConfig.getUser('admin');
const essUser = envConfig.getUser('ess');
const managerUser = envConfig.getUser('manager');

// Get application settings
const baseURL = envConfig.getBaseURL();
const testTimeout = envConfig.getTestTimeout();
const browserConfig = envConfig.getBrowserConfig();
```

## Setting Up New Environment

1. **Create environment file:**
   ```bash
   cp .env.example .env.newenvironment
   ```

2. **Update variables:**
   Edit the new file with environment-specific values

3. **Add npm script:**
   ```json
   "test:newenvironment": "NODE_ENV=newenvironment playwright test"
   ```

4. **Run tests:**
   ```bash
   npm run test:newenvironment
   ```

## Security Best Practices

1. **Never commit sensitive credentials:**
   - Use `.env.example` for templates
   - Add actual `.env.*` files to `.gitignore`

2. **Use environment-specific credentials:**
   - Each environment should have its own test users
   - Avoid using production credentials in tests

3. **Rotate test credentials regularly:**
   - Update test user passwords periodically
   - Use dedicated test accounts, not real user accounts

## Troubleshooting

### Common Issues

1. **Environment variables not loading:**
   - Check file naming (`.env.development` not `.env.dev`)
   - Verify NODE_ENV is set correctly
   - Ensure dotenv is properly configured

2. **Wrong credentials being used:**
   - Check environment file precedence
   - Verify variable names match exactly
   - Test with `console.log(process.env.ADMIN_USERNAME)`

3. **Tests failing in different environments:**
   - Verify base URL is accessible
   - Check timeout values for slower environments
   - Ensure test users exist in target environment

### Debug Environment Loading

Add this to your test file to debug environment loading:

```typescript
console.log('Environment:', process.env.NODE_ENV);
console.log('Base URL:', process.env.BASE_URL);
console.log('Admin Username:', process.env.ADMIN_USERNAME);
```

## Example Usage in Tests

```typescript
import { test, expect } from '@playwright/test';
import { UserFixtures } from '../fixtures/testData';
import { envConfig } from '../utils/environmentConfig';

test('Login with environment-specific admin user', async ({ page }) => {
  const admin = UserFixtures.ADMIN; // Uses environment variables
  const baseURL = envConfig.getBaseURL();
  
  await page.goto(baseURL);
  await page.fill('[name="username"]', admin.username);
  await page.fill('[name="password"]', admin.password);
  await page.click('[type="submit"]');
  
  await expect(page.locator('.dashboard')).toBeVisible();
});
```