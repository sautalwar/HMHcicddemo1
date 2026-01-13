const { getPool, sql } = require('../backend/config/database');
const logger = require('../backend/utils/logger');

async function migrate() {
  try {
    const pool = await getPool();

    logger.info('Starting database migration...');

    // Create Users table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
      CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(100) NOT NULL,
        LastName NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        LastLoginAt DATETIME2 NULL,
        IsActive BIT NOT NULL DEFAULT 1
      )
    `);
    logger.info('Users table created/verified');

    // Create Products table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
      CREATE TABLE Products (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Description NVARCHAR(MAX),
        Price DECIMAL(10,2) NOT NULL,
        Stock INT NOT NULL DEFAULT 0,
        Category NVARCHAR(100),
        ImageUrl NVARCHAR(500),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        IsActive BIT NOT NULL DEFAULT 1
      )
    `);
    logger.info('Products table created/verified');

    // Create CartItems table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='CartItems' AND xtype='U')
      CREATE TABLE CartItems (
        CartItemId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity INT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
      )
    `);
    logger.info('CartItems table created/verified');

    // Create Orders table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
      CREATE TABLE Orders (
        OrderId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        TotalAmount DECIMAL(10,2) NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
        ShippingAddress NVARCHAR(500) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
      )
    `);
    logger.info('Orders table created/verified');

    // Create OrderItems table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
      CREATE TABLE OrderItems (
        OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
        OrderId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity INT NOT NULL,
        Price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
        FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
      )
    `);
    logger.info('OrderItems table created/verified');

    // Create indexes for better performance
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_CartItems_UserId')
      CREATE INDEX IX_CartItems_UserId ON CartItems(UserId)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Orders_UserId')
      CREATE INDEX IX_Orders_UserId ON Orders(UserId)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Products_Category')
      CREATE INDEX IX_Products_Category ON Products(Category)
    `);

    logger.info('Database migration completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();
