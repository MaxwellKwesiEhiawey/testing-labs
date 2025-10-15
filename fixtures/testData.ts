import { faker } from '@faker-js/faker';

/**
 * User types for OrangeHRM
 */
export type UserRole = 'Admin' | 'ESS' | 'Manager';

/**
 * User fixture interface
 */
export interface UserFixture {
  username: string;
  password: string;
  role: UserRole;
  displayName?: string;
  employeeId?: string;
}

/**
 * Employee test data interface
 */
export interface EmployeeData {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  location: string;
  dateOfBirth: string;
  nationality: string;
  maritalStatus: string;
  gender: string;
}

/**
 * Leave request data interface
 */
export interface LeaveData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  comment: string;
  partialDays?: string;
  duration?: string;
}

/**
 * User fixtures for testing
 * Uses environment variables for flexible configuration across different environments
 */
export class UserFixtures {
  static readonly ADMIN: UserFixture = {
    username: process.env.ADMIN_USERNAME || 'Admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'Admin',
    displayName: process.env.ADMIN_DISPLAY_NAME || 'Administrator',
    employeeId: process.env.ADMIN_EMPLOYEE_ID || 'EMP001'
  };

  static readonly ESS: UserFixture = {
    username: process.env.ESS_USERNAME || 'Admin',
    password: process.env.ESS_PASSWORD || 'admin123',
    role: 'ESS',
    displayName: process.env.ESS_DISPLAY_NAME || 'ESS User',
    employeeId: process.env.ESS_EMPLOYEE_ID || 'EMP002'
  };

  static readonly MANAGER: UserFixture = {
    username: process.env.MANAGER_USERNAME || 'Admin',
    password: process.env.MANAGER_PASSWORD || 'admin123',
    role: 'Manager',
    displayName: process.env.MANAGER_DISPLAY_NAME || 'Manager User',
    employeeId: process.env.MANAGER_EMPLOYEE_ID || 'EMP003'
  };

  /**
   * Get user configuration from environment
   */
  static getEnvironmentUsers(): { [key: string]: UserFixture } {
    return {
      admin: this.ADMIN,
      ess: this.ESS,
      manager: this.MANAGER
    };
  }

  /**
   * Get user by role
   */
  static getUserByRole(role: UserRole): UserFixture {
    switch (role) {
      case 'Admin':
        return this.ADMIN;
      case 'ESS':
        return this.ESS;
      case 'Manager':
        return this.MANAGER;
      default:
        throw new Error(`Unknown user role: ${role}`);
    }
  }

  /**
   * Get all users
   */
  static getAllUsers(): UserFixture[] {
    return [this.ADMIN, this.ESS, this.MANAGER];
  }
}

/**
 * Test data generator using Faker
 */
export class TestDataGenerator {
  /**
   * Generate random employee data
   */
  static generateEmployee(): EmployeeData {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      middleName: faker.person.middleName(),
      employeeId: this.generateEmployeeId(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      jobTitle: faker.helpers.arrayElement([
        'Software Engineer',
        'QA Tester',
        'Project Manager',
        'Business Analyst',
        'HR Manager',
        'Account Executive',
        'Sales Representative',
        'Marketing Specialist'
      ]),
      department: faker.helpers.arrayElement([
        'Engineering',
        'Quality Assurance',
        'Human Resources',
        'Sales',
        'Marketing',
        'Finance',
        'Operations',
        'Customer Support'
      ]),
      location: faker.helpers.arrayElement([
        'New York Office',
        'California Office',
        'Texas Office',
        'Florida Office',
        'Remote'
      ]),
      dateOfBirth: faker.date.birthdate({ min: 22, max: 65, mode: 'age' }).toISOString().split('T')[0],
      nationality: faker.helpers.arrayElement([
        'American',
        'Canadian',
        'British',
        'German',
        'French',
        'Indian',
        'Chinese',
        'Japanese'
      ]),
      maritalStatus: faker.helpers.arrayElement(['Single', 'Married', 'Divorced', 'Widowed']),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other'])
    };
  }

  /**
   * Generate employee ID in format EMP####
   */
  static generateEmployeeId(): string {
    return `EMP${faker.number.int({ min: 1000, max: 9999 })}`;
  }

  /**
   * Generate username
   */
  static generateUsername(): string {
    return faker.internet.username().toLowerCase();
  }

  /**
   * Generate password
   */
  static generatePassword(): string {
    return faker.internet.password({ length: 12, memorable: true });
  }

  /**
   * Generate leave request data
   */
  static generateLeaveRequest(): LeaveData {
    const startDate = faker.date.future({ years: 1 });
    const endDate = faker.date.soon({ days: 7, refDate: startDate });
    
    return {
      leaveType: faker.helpers.arrayElement([
        'Annual Leave',
        'Sick Leave',
        'Personal Leave',
        'Maternity Leave',
        'Paternity Leave'
      ]),
      fromDate: startDate.toISOString().split('T')[0],
      toDate: endDate.toISOString().split('T')[0],
      comment: faker.lorem.sentence({ min: 5, max: 15 }),
      partialDays: faker.helpers.arrayElement(['All Days', 'Start Day Only', 'End Day Only']),
      duration: faker.helpers.arrayElement(['Full Day', 'Half Day - Morning', 'Half Day - Afternoon'])
    };
  }

  /**
   * Generate multiple employees
   */
  static generateEmployees(count: number): EmployeeData[] {
    return Array.from({ length: count }, () => this.generateEmployee());
  }

  /**
   * Generate system user data
   */
  static generateSystemUser(): {
    username: string;
    password: string;
    confirmPassword: string;
    userRole: string;
    status: string;
  } {
    const password = this.generatePassword();
    return {
      username: this.generateUsername(),
      password: password,
      confirmPassword: password,
      userRole: faker.helpers.arrayElement(['Admin', 'ESS']),
      status: faker.helpers.arrayElement(['Enabled', 'Disabled'])
    };
  }

  /**
   * Generate date in YYYY-MM-DD format
   */
  static generateFutureDate(daysFromNow: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate past date in YYYY-MM-DD format
   */
  static generatePastDate(daysAgo: number = 30): string {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate today's date in YYYY-MM-DD format
   */
  static getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Generate job title data
   */
  static generateJobTitle(): {
    title: string;
    description: string;
    specification: string;
  } {
    return {
      title: faker.person.jobTitle(),
      description: faker.lorem.paragraph({ min: 2, max: 4 }),
      specification: faker.lorem.paragraph({ min: 1, max: 3 })
    };
  }

  /**
   * Generate location data
   */
  static generateLocation(): {
    name: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    fax: string;
    address: string;
  } {
    return {
      name: `${faker.company.name()} Office`,
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zipCode: faker.location.zipCode(),
      phone: faker.phone.number(),
      fax: faker.phone.number(),
      address: faker.location.streetAddress()
    };
  }

  /**
   * Generate invalid credentials for negative testing
   */
  static generateInvalidCredentials(): Array<{
    username: string;
    password: string;
    expectedError: string;
  }> {
    return [
      {
        username: 'invaliduser',
        password: 'invalidpass',
        expectedError: 'Invalid credentials'
      },
      {
        username: '',
        password: '',
        expectedError: 'Required'
      },
      {
        username: 'Admin',
        password: 'wrongpassword',
        expectedError: 'Invalid credentials'
      },
      {
        username: 'nonexistentuser',
        password: 'admin123',
        expectedError: 'Invalid credentials'
      }
    ];
  }

  /**
   * Generate test data for specific test scenarios
   */
  static getTestData() {
    return {
      validUsers: UserFixtures.getAllUsers(),
      sampleEmployee: this.generateEmployee(),
      sampleEmployees: this.generateEmployees(5),
      sampleLeaveRequest: this.generateLeaveRequest(),
      sampleSystemUser: this.generateSystemUser(),
      invalidCredentials: this.generateInvalidCredentials(),
      futureDate: this.generateFutureDate(),
      pastDate: this.generatePastDate(),
      todayDate: this.getTodayDate()
    };
  }
}

/**
 * Predefined test data sets for specific scenarios
 */
export class TestDataSets {
  static readonly EMPLOYEE_LIFECYCLE = {
    employee: {
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP9999',
      email: 'john.doe@test.com',
      jobTitle: 'Software Engineer'
    },
    credentials: {
      username: 'johndoe',
      password: 'JohnDoe123!'
    },
    leaveRequest: {
      leaveType: 'Annual Leave',
      fromDate: TestDataGenerator.generateFutureDate(10),
      toDate: TestDataGenerator.generateFutureDate(15),
      comment: 'Vacation with family'
    }
  };

  static readonly VISUAL_BASELINE = {
    pages: [
      'login-page',
      'dashboard',
      'employee-list',
      'leave-calendar',
      'admin-page'
    ],
    viewports: [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1024, height: 768 }
    ]
  };

  static readonly PERFORMANCE_THRESHOLDS = {
    pageLoadTime: 5000, // 5 seconds
    loginTime: 3000,    // 3 seconds
    searchTime: 2000,   // 2 seconds
    formSubmissionTime: 3000 // 3 seconds
  };
}

/**
 * Utility functions for test data
 */
export class TestDataUtils {
  /**
   * Format date for OrangeHRM date pickers
   */
  static formatDateForOrangeHRM(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generate date range
   */
  static generateDateRange(startDaysFromNow: number, endDaysFromNow: number): {
    fromDate: string;
    toDate: string;
  } {
    return {
      fromDate: TestDataGenerator.generateFutureDate(startDaysFromNow),
      toDate: TestDataGenerator.generateFutureDate(endDaysFromNow)
    };
  }

  /**
   * Clean test data (remove special characters for usernames)
   */
  static cleanUsername(username: string): string {
    return username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  /**
   * Generate unique identifier
   */
  static generateUniqueId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 7);
  }
}