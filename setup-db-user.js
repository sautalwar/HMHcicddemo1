// Setup database user for local development
require('dotenv').config();
const { getPool, sql, connectDatabase } = require('./src/backend/config/database');

async function setupUser() {
  try {
    console.log('Connecting to database as SQL admin...');
    await connectDatabase();
    const pool = await getPool();

    const userEmail = 'admin@MngEnvMCAP557563.onmicrosoft.com';
    
    console.log(`Creating user: ${userEmail}`);
    
    try {
      // Try to create the user
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = '${userEmail}')
        BEGIN
          CREATE USER [${userEmail}] FROM EXTERNAL PROVIDER;
        END
      `);
      console.log('User created successfully');
    } catch (err) {
      console.log('User might already exist:', err.message);
    }

    // Grant db_owner role
    await pool.request().query(`
      ALTER ROLE db_owner ADD MEMBER [${userEmail}];
    `);
    console.log('db_owner role granted successfully');
    
    console.log('Setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

setupUser();
