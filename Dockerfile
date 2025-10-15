# Multi-stage Dockerfile for OrangeHRM E2E Testing
FROM node:20-alpine AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    git \
    gnupg \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci

# Install Playwright browsers and dependencies
RUN npx playwright install --with-deps

# Copy source code
COPY . .

# Create directories for test results
RUN mkdir -p test-results playwright-report allure-results allure-report

# Set permissions
RUN chmod +x scripts/run-tests.sh

# Expose ports for report servers
EXPOSE 8080 9999

# Default command
CMD ["npm", "test"]

# Production/CI stage
FROM base AS production

# Install Playwright
RUN npm install @playwright/test

# Install Playwright browsers and dependencies
RUN npx playwright install --with-deps

# Copy source code
COPY . .

# Create test result directories
RUN mkdir -p test-results playwright-report allure-results

# Set permissions
RUN chmod +x scripts/run-tests.sh

# Add non-root user for security
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Switch to non-root user
USER playwright

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Default command for CI
CMD ["./scripts/run-tests.sh", "--suite", "smoke", "--browser", "chromium"]

# Allure reporting stage
FROM base AS allure

# Install Java for Allure and Allure CLI
ADD https://github.com/allure-framework/allure2/releases/download/2.24.0/allure-2.24.0.tgz /tmp/allure-commandline.tgz
RUN apt-get update && apt-get install -y openjdk-17-jre && rm -rf /var/lib/apt/lists/* \
    && tar -zxf /tmp/allure-commandline.tgz -C /tmp \
    && mv /tmp/allure-2.24.0 /opt/allure \
    && ln -s /opt/allure/bin/allure /usr/local/bin/allure \
    && rm /tmp/allure-commandline.tgz

# Copy test results and generate report
COPY --from=production /app/allure-results ./allure-results

# Generate Allure report
RUN allure generate allure-results --clean -o allure-report

# Serve Allure report
EXPOSE 4040
CMD ["allure", "serve", "allure-results", "--port", "4040"]