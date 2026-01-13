const sql = require('mssql');
const { DefaultAzureCredential } = require('@azure/identity');
const logger = require('../utils/logger');

// Check if using Azure AD authentication
const useAzureAD = process.env.DB_USE_AZURE_AD === 'true' || 
                   process.env.DB_PASSWORD === 'not-used-azure-ad-only' ||
                   !process.env.DB_PASSWORD;

async function getConfig() {
  const baseConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.NODE_ENV === 'development',
      enableArithAbort: true,
      connectTimeout: 30000,
      requestTimeout: 30000
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  if (useAzureAD) {
    // Azure AD authentication
    try {
      const credential = new DefaultAzureCredential();
      const tokenResponse = await credential.getToken('https://database.windows.net/');
      
      logger.info('Using Azure AD authentication for SQL Server');
      return {
        ...baseConfig,
        authentication: {
          type: 'azure-active-directory-access-token',
          options: {
            token: tokenResponse.token
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get Azure AD token:', error);
      logger.warn('Falling back to SQL authentication if credentials are provided');
      // Fall through to SQL auth if Azure AD fails and credentials exist
      if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
        throw new Error('Azure AD authentication failed and no SQL credentials provided');
      }
    }
  }
  
  // SQL Server authentication (fallback)
  logger.info('Using SQL Server authentication');
  return {
    ...baseConfig,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };
}

let config;

let pool;

async function connectDatabase() {
  try {
    if (pool) {
      return pool;
    }
    
    // Get config (may need to fetch Azure AD token)
    if (!config) {
      config = await getConfig();
    }
    
    pool = await sql.connect(config);
    logger.info('Connected to Azure SQL Database');
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    logger.error('Make sure you are logged in with Azure CLI: az login');
    throw error;
  }
}

async function getPool() {
  if (!pool) {
    await connectDatabase();
  }
  return pool;
}

async function checkHealth() {
  try {
    const currentPool = await getPool();
    await currentPool.request().query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

async function closeDatabase() {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info('Database connection closed');
  }
}

module.exports = {
  connectDatabase,
  getPool,
  checkHealth,
  closeDatabase,
  sql
};
