# Allure Reporting Setup for Playwright Tests

This guide explains how to use Allure reporting with your multi-user Playwright test suite for enhanced test reporting and analytics.

## 🎯 **What is Allure?**

Allure is a flexible, lightweight multi-language test reporting tool that provides:
- **Rich visual reports** with charts, graphs, and timelines
- **Detailed test execution information** including steps, attachments, and parameters
- **Historical trends** and test analytics
- **Categorization and filtering** by features, stories, and severity
- **Integration capabilities** with CI/CD pipelines

## 📦 **Installation**

Allure packages are already installed:
```bash
npm install --save-dev allure-playwright allure-commandline
```

## ⚙️ **Configuration**

### Playwright Configuration
The `playwright.config.ts` is configured with Allure reporter:
```typescript
reporter: [
  ['html'],
  ['allure-playwright', {
    detail: true,
    outputFolder: 'allure-results',
    suiteTitle: false,
    environmentInfo: {
      framework: 'Playwright',
      node_version: process.version,
      test_environment: process.env.NODE_ENV || 'test'
    }
  }]
]
```

### Environment Variables
Added to `.env`:
```bash
ALLURE_RESULTS_DIR=allure-results
ALLURE_REPORT_DIR=allure-report
ALLURE_DETAIL_REPORTING=true
ALLURE_ENVIRONMENT_INFO=true
```

## 🚀 **Running Tests with Allure**

### NPM Scripts Available:

#### Basic Test Execution:
```bash
# Run all tests and generate Allure report
npm run test:allure

# Run tests only
npm test

# Run specific user role tests
npm run test:admin
npm run test:ess
npm run test:manager
```

#### Allure Report Generation:
```bash
# Generate static Allure report
npm run allure:generate

# Open generated report in browser
npm run allure:open

# Generate and serve report (live server)
npm run allure:serve

# Clean all reports
npm run clean:reports
```

#### Manual Allure Commands:
```bash
# Generate report from results
npx allure generate allure-results --clean

# Serve report with live server
npx allure serve allure-results

# Open existing report
npx allure open allure-report
```

## 📊 **Using Allure Annotations**

### Import Allure Utils:
```typescript
import { AllureUtils } from '../utils/allure-utils';
```

### Test Organization:
```typescript
test('test name', async ({ page }) => {
  // Epic (highest level grouping)
  AllureUtils.epic('User Management');
  
  // Feature (functionality group)
  AllureUtils.feature('System Users');
  
  // Story (specific user story)
  AllureUtils.story('Admin User Management');
  
  // Test description
  AllureUtils.description('Verify admin can manage system users');
  
  // Severity level
  AllureUtils.severity('critical'); // blocker, critical, normal, minor, trivial
  
  // Tags for filtering
  AllureUtils.tag('smoke', 'admin', 'user-management');
});
```

### Test Steps:
```typescript
await AllureUtils.step('Navigate to Admin section', async () => {
  await page.click('text=Admin');
  await page.waitForLoadState('networkidle');
});

await AllureUtils.step('Verify User Management section', async () => {
  await expect(page.locator('text=User Management')).toBeVisible();
});
```

### Attachments:
```typescript
// Screenshot
await AllureUtils.attachScreenshot(page, 'Admin Dashboard');

// Text content
AllureUtils.attachText('API Response', responseBody);

// JSON data
AllureUtils.attachJSON('Test Data', testDataObject);
```

### Parameters and Environment:
```typescript
// Test parameters
AllureUtils.parameter('User Role', 'admin');
AllureUtils.parameter('Browser', 'chromium');

// Environment info
AllureUtils.addEnvironmentInfo('Test Environment', 'staging');
```

### Role-specific Setup:
```typescript
test.beforeEach(async ({ page }) => {
  AllureUtils.setUserRoleCategories('admin'); // auto-sets epic, feature, tags
  AllureUtils.setBrowserInfo('chromium');
  AllureUtils.setEnvironment('OrangeHRM Demo');
});
```

## 📁 **Report Structure**

After running tests, you'll have:
```
├── allure-results/          # Raw test results (JSON files)
├── allure-report/           # Generated HTML report
├── allure.config.json       # Allure configuration
└── playwright-report/       # Standard Playwright HTML report
```

## 📈 **Report Features**

### 1. **Overview Dashboard**
- Test execution statistics
- Success/failure rates
- Duration trends
- Environment information

### 2. **Test Results by Categories**
- **Epics**: High-level feature groupings
- **Features**: Functionality areas
- **Stories**: Specific user stories
- **Tags**: Custom categorization

### 3. **User Role Organization**
- **Admin Tests**: User management, system configuration
- **ESS Tests**: Personal information, leave requests
- **Manager Tests**: Team management, approvals

### 4. **Browser Coverage**
- Cross-browser test results
- Browser-specific failures
- Performance comparisons

### 5. **Timeline View**
- Test execution sequence
- Parallel execution visualization
- Duration analysis

### 6. **Detailed Test Information**
- Step-by-step execution
- Screenshots and attachments
- Error logs and stack traces
- Test parameters and environment

## 🔍 **Advanced Features**

### Test Retries and History:
```typescript
// Allure automatically tracks:
// - Test retries
// - Historical results
// - Flaky test detection
// - Trend analysis
```

### Categories and Filtering:
```typescript
// Tests are automatically categorized by:
// - User roles (admin, ess, manager)
// - Browsers (chromium, firefox, webkit)
// - Severity levels
// - Custom tags
```

### Integration Links:
```typescript
// Link to issue tracker
AllureUtils.issue('BUG-123', 'https://jira.company.com/BUG-123');

// Link to test management system
AllureUtils.tms('TC-456', 'https://testlink.company.com/TC-456');
```

## 🐛 **Troubleshooting**

### Common Issues:

#### 1. **Report Generation Fails**
```bash
# Clean old results and try again
npm run clean:reports
npm test
npm run allure:generate
```

#### 2. **Missing Screenshots**
```bash
# Ensure screenshot capture is enabled in test
await AllureUtils.attachScreenshot(page, 'Step Description');
```

#### 3. **Report Server Won't Start**
```bash
# Kill existing processes and restart
pkill -f allure
npm run allure:serve
```

#### 4. **Empty Report**
```bash
# Verify tests are generating results
ls -la allure-results/
# Should contain *.json files
```

## 🎨 **Customization**

### Custom Categories:
Edit `allure.config.json` to add custom failure categories:
```json
{
  "categories": [
    {
      "name": "Login Issues",
      "messageRegex": ".*login.*failed.*",
      "traceRegex": ".*AuthUtils.*"
    }
  ]
}
```

### Environment Information:
Modify `playwright.config.ts` to add more environment details:
```typescript
environmentInfo: {
  framework: 'Playwright',
  node_version: process.version,
  test_environment: process.env.NODE_ENV || 'test',
  base_url: process.env.BASE_URL,
  browser_versions: 'Latest'
}
```

## 📝 **Best Practices**

1. **Use Meaningful Step Names**: Clear, descriptive step names improve report readability
2. **Attach Screenshots**: Always attach screenshots for visual verification
3. **Categorize Tests**: Use epics, features, and stories for better organization
4. **Add Context**: Use parameters and descriptions to provide test context
5. **Tag Appropriately**: Use consistent tagging for easy filtering
6. **Clean Results**: Regular cleanup of old results keeps reports fast

## 🔄 **CI/CD Integration**

For CI/CD pipelines, add these commands:
```bash
# Run tests and generate report
npm test
npm run allure:generate

# Publish report artifacts
# (Pipeline-specific commands to upload allure-report/ folder)
```

## 📚 **Additional Resources**

- [Allure Documentation](https://docs.qameta.io/allure/)
- [Allure Playwright Integration](https://github.com/allure-framework/allure-js/tree/master/packages/allure-playwright)
- [Report Examples](https://demo.qameta.io/allure/)

Your Allure reporting setup is now complete and ready to provide comprehensive test analytics! 🎉