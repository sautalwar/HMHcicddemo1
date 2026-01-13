// Jest setup file for tests
require('dotenv').config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_SERVER = process.env.TEST_DB_SERVER || 'localhost';
process.env.REDIS_HOST = process.env.TEST_REDIS_HOST || 'localhost';
process.env.REDIS_TLS = 'false';

// Global test timeout
jest.setTimeout(30000);

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
