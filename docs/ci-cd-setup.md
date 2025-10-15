# CI/CD Setup Guide for OrangeHRM E2E Testing

## Overview

This guide covers the comprehensive CI/CD setup for the OrangeHRM E2E test automation framework, including GitHub Actions workflows, Docker containerization, parallel execution, and advanced reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Git
- Java 17+ (for Allure reports)

### Local Execution
```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run smoke tests
npm run test:smoke

# Run with custom options
./scripts/run-tests.sh --suite regression --browser all --workers 4
```

### Docker Execution
```bash
# Build and run tests
docker-compose up --build

# Run specific test suite
TEST_SUITE=employee BROWSER=chromium docker-compose up playwright-tests

# Scale browser nodes for parallel execution
docker-compose up --scale chrome-node=3 --scale firefox-node=2
```

## 📋 Test Execution Options

### Available Test Suites
- **smoke**: Critical smoke tests (fastest execution)
- **regression**: Full regression suite (comprehensive coverage)
- **employee**: Employee management functionality
- **leave**: Leave management functionality
- **access-control**: Security and access control tests
- **visual**: Visual regression and UI tests
- **e2e**: End-to-end scenario tests
- **critical**: Business-critical workflows

### Supported Browsers
- **chromium**: Google Chrome/Chromium
- **firefox**: Mozilla Firefox
- **webkit**: Safari WebKit
- **all**: Run across all browsers

### Execution Modes
- **Local**: Direct execution on development machine
- **Docker**: Containerized execution with isolation
- **Grid**: Distributed execution using Selenium Grid
- **CI/CD**: Automated execution in GitHub Actions

## 🔄 GitHub Actions Workflows

### Workflow Triggers
- **Push/PR**: Smoke tests on all pushes and pull requests
- **Nightly**: Full regression tests at 2 AM UTC
- **Manual**: On-demand execution with custom parameters
- **Scheduled**: Health checks and monitoring

### Workflow Jobs
1. **smoke-tests**: Fast feedback on PRs (3 browsers × parallel)
2. **regression-tests**: Comprehensive testing (4 shards × 3 browsers)
3. **feature-tests**: Targeted testing for specific modules
4. **allure-report**: Centralized reporting and GitHub Pages deployment
5. **performance-monitoring**: Performance metrics collection
6. **security-accessibility**: Security and accessibility validation
7. **health-check**: Environment health monitoring

### Environment Variables
Configure these secrets in GitHub repository settings:

```bash
# Required secrets
BASE_URL=https://your-orangehrm-instance.com
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-admin-password
ESS_USERNAME=your-ess-username
ESS_PASSWORD=your-ess-password
MANAGER_USERNAME=your-manager-username
MANAGER_PASSWORD=your-manager-password

# Optional secrets for staging/production
STAGING_BASE_URL=https://staging.orangehrm.com
PROD_BASE_URL=https://prod.orangehrm.com
```

## 🐳 Docker Configuration

### Multi-stage Build
- **base**: Common dependencies and Node.js setup
- **development**: Full development environment with all tools
- **production**: Optimized for CI/CD with minimal footprint
- **allure**: Dedicated Allure report generation and serving

### Container Services
- **playwright-tests**: Main test execution container
- **selenium-hub**: Selenium Grid hub for distributed testing
- **chrome-node**: Chrome browser nodes (scalable)
- **firefox-node**: Firefox browser nodes (scalable)
- **edge-node**: Edge browser nodes (scalable)
- **allure-server**: Allure report server (port 4040)
- **report-server**: Nginx server for test reports (port 8080)
- **test-db**: PostgreSQL for test data persistence
- **redis**: Session management and caching
- **prometheus**: Metrics collection
- **grafana**: Metrics visualization (port 3000)
- **minio**: Artifact storage

### Docker Commands
```bash
# Build specific stage
docker build --target production -t orangehrm-tests .

# Run with environment override
docker run -e BASE_URL=https://demo.orangehrm.com orangehrm-tests

# Access running container
docker exec -it orangehrm-tests-container bash

# View logs
docker-compose logs -f playwright-tests
```

## 📊 Reporting and Monitoring

### Report Types
1. **Playwright HTML**: Interactive HTML reports with screenshots/videos
2. **Allure**: Enterprise-grade reporting with trends and analytics
3. **JUnit XML**: CI/CD integration and test result parsing
4. **JSON**: Programmatic analysis and custom dashboards

### Report Access
- **Local HTML**: `playwright-report/index.html`
- **Local Allure**: `allure serve allure-results`
- **Docker Reports**: `http://localhost:8080`
- **GitHub Pages**: Auto-deployed on main branch

### Monitoring Features
- **Health Checks**: Automated environment health monitoring
- **Performance Metrics**: Page load times, network performance
- **Test Trends**: Historical test execution data
- **Failure Analysis**: Categorized failure types and patterns
- **Alerting**: Slack/email notifications on failures

## 🔧 Configuration Management

### Test Configuration (`config/test-config.json`)
Centralized configuration for:
- Environment-specific settings
- Test suite definitions
- Browser configurations
- Timeout and retry policies
- Reporting preferences
- Performance thresholds
- Security settings

### Environment-specific Overrides
```bash
# Development
export NODE_ENV=development

# Staging
export NODE_ENV=staging
export BASE_URL=$STAGING_BASE_URL

# Production
export NODE_ENV=production
export BASE_URL=$PROD_BASE_URL
```

## 🚦 Parallel Execution

### Strategy Options
- **Workers**: Parallel test execution within single browser
- **Shards**: Distribution across multiple CI runners
- **Grid**: Distribution across multiple browser nodes
- **Matrix**: Combination of browsers × test suites

### Performance Optimization
```bash
# Optimal for CI (4 workers, 2 retries)
npx playwright test --workers=4 --retries=2

# Memory-optimized (lower workers)
npx playwright test --workers=2 --retries=1

# Speed-optimized (higher workers, no retries)
npx playwright test --workers=8 --retries=0
```

## 🔐 Security and Best Practices

### Security Measures
- Non-root container execution
- Secrets management via GitHub Secrets
- HTTPS enforcement in production
- Access control for test reports
- Secure cookie handling

### Best Practices
- **Test Isolation**: Each test is independent
- **Data Management**: Automated test data cleanup
- **Error Handling**: Comprehensive error capture
- **Resource Management**: Proper browser cleanup
- **Version Control**: All configurations tracked

## 🔍 Troubleshooting

### Common Issues
1. **Browser Installation**: `npx playwright install --with-deps`
2. **Permission Errors**: Check file permissions on scripts
3. **Network Issues**: Verify BASE_URL accessibility
4. **Memory Issues**: Reduce workers or increase container memory
5. **Timeout Issues**: Increase timeout values in configuration

### Debug Mode
```bash
# Run with debug output
DEBUG=pw:* npm test

# Run in headed mode
npm test -- --headed

# Generate trace files
npm test -- --trace on
```

### Log Analysis
```bash
# View container logs
docker-compose logs playwright-tests

# Follow logs in real-time
docker-compose logs -f --tail=100 playwright-tests

# Export logs for analysis
docker-compose logs playwright-tests > test-execution.log
```

## 📈 Metrics and Analytics

### Key Metrics
- **Test Execution Time**: Total and per-test duration
- **Success Rate**: Pass/fail ratios across suites
- **Browser Performance**: Comparative performance metrics
- **Flaky Test Detection**: Tests with inconsistent results
- **Coverage Metrics**: Feature coverage assessment

### Grafana Dashboards
Access via `http://localhost:3000` (admin/admin):
- Test execution trends
- Performance metrics
- Error rate analysis
- Resource utilization
- Environment health status

## 🎯 Future Enhancements

### Planned Features
- **AI-powered Test Generation**: Automated test case creation
- **Visual AI**: Advanced visual regression detection
- **Auto-healing**: Self-repairing test scripts
- **Performance Budgets**: Automated performance regression detection
- **Multi-environment**: Parallel testing across environments

### Integration Opportunities
- **Slack/Teams**: Real-time notifications
- **Jira**: Automatic bug reporting
- **DataDog**: Advanced monitoring integration
- **AWS/Azure**: Cloud-based execution
- **Kubernetes**: Container orchestration

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Allure Framework](https://docs.qameta.io/allure/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Compose](https://docs.docker.com/compose/)
- [Test Strategy Guide](./docs/test-strategy.md)

---

For questions or support, please create an issue in the repository or contact the QA team.