import dotenv from 'dotenv';
import path from 'path';

/**
 * Environment configuration manager
 * Handles loading different environment configurations based on NODE_ENV
 */
export class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: any;

  private constructor() {
    this.loadEnvironmentConfig();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  /**
   * Load environment configuration based on NODE_ENV
   */
  private loadEnvironmentConfig(): void {
    const environment = process.env.NODE_ENV || 'development';
    
    // Load base .env file first
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    
    // Load environment-specific config file
    const envFilePath = path.resolve(process.cwd(), `.env.${environment}`);
    dotenv.config({ path: envFilePath });

    this.config = {
      // Application Settings
      baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com/',
      testEnvironment: process.env.TEST_ENVIRONMENT || environment,
      apiBaseURL: process.env.API_BASE_URL || 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2',

      // Test Settings
      testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
      pageLoadTimeout: parseInt(process.env.PAGE_LOAD_TIMEOUT || '15000'),
      defaultWaitTime: parseInt(process.env.DEFAULT_WAIT_TIME || '5000'),
      headless: process.env.HEADLESS === 'true',
      
      // Browser Settings
      defaultBrowser: process.env.DEFAULT_BROWSER || 'chromium',
      viewportWidth: parseInt(process.env.VIEWPORT_WIDTH || '1280'),
      viewportHeight: parseInt(process.env.VIEWPORT_HEIGHT || '720'),
      
      // User Credentials
      users: {
        admin: {
          username: process.env.ADMIN_USERNAME || 'Admin',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          displayName: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
          employeeId: process.env.ADMIN_EMPLOYEE_ID || 'EMP001',
          role: 'Admin'
        },
        ess: {
          username: process.env.ESS_USERNAME || 'Admin',
          password: process.env.ESS_PASSWORD || 'admin123',
          displayName: process.env.ESS_DISPLAY_NAME || 'ESS User',
          employeeId: process.env.ESS_EMPLOYEE_ID || 'EMP002',
          role: 'ESS'
        },
        manager: {
          username: process.env.MANAGER_USERNAME || 'Admin',
          password: process.env.MANAGER_PASSWORD || 'admin123',
          displayName: process.env.MANAGER_DISPLAY_NAME || 'Manager User',
          employeeId: process.env.MANAGER_EMPLOYEE_ID || 'EMP003',
          role: 'Manager'
        }
      },

      // Allure Reporting
      allure: {
        resultsDir: process.env.ALLURE_RESULTS_DIR || 'allure-results',
        reportDir: process.env.ALLURE_REPORT_DIR || 'allure-report',
        detailReporting: process.env.ALLURE_DETAIL_REPORTING === 'true',
        environmentInfo: process.env.ALLURE_ENVIRONMENT_INFO === 'true'
      },

      // Development specific
      debugMode: process.env.DEBUG_MODE === 'true',
      enableConsoleLogs: process.env.ENABLE_CONSOLE_LOGS === 'true',
      slowMo: parseInt(process.env.SLOW_MO || '0')
    };
  }

  /**
   * Get the complete configuration object
   */
  public getConfig(): any {
    return this.config;
  }

  /**
   * Get base URL for the application
   */
  public getBaseURL(): string {
    return this.config.baseURL;
  }

  /**
   * Get test environment name
   */
  public getTestEnvironment(): string {
    return this.config.testEnvironment;
  }

  /**
   * Get user credentials by role
   */
  public getUser(role: 'admin' | 'ess' | 'manager'): any {
    return this.config.users[role];
  }

  /**
   * Get all users
   */
  public getAllUsers(): any {
    return this.config.users;
  }

  /**
   * Get test timeout value
   */
  public getTestTimeout(): number {
    return this.config.testTimeout;
  }

  /**
   * Get browser configuration
   */
  public getBrowserConfig(): any {
    return {
      defaultBrowser: this.config.defaultBrowser,
      headless: this.config.headless,
      viewport: {
        width: this.config.viewportWidth,
        height: this.config.viewportHeight
      }
    };
  }

  /**
   * Get Allure configuration
   */
  public getAllureConfig(): any {
    return this.config.allure;
  }

  /**
   * Check if running in debug mode
   */
  public isDebugMode(): boolean {
    return this.config.debugMode;
  }

  /**
   * Get environment info for reporting
   */
  public getEnvironmentInfo(): any {
    return {
      environment: this.config.testEnvironment,
      baseURL: this.config.baseURL,
      browser: this.config.defaultBrowser,
      headless: this.config.headless,
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    };
  }
}

/**
 * Export singleton instance for easy access
 */
export const envConfig = EnvironmentConfig.getInstance();