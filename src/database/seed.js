const { getPool, sql } = require('../backend/config/database');
const logger = require('../backend/utils/logger');

async function seed() {
  try {
    const pool = await getPool();

    logger.info('Starting database seeding...');

    // Check if products already exist
    const existingProducts = await pool.request()
      .query('SELECT COUNT(*) as count FROM Products');

    if (existingProducts.recordset[0].count > 0) {
      logger.info('Products already exist, skipping seed');
      process.exit(0);
    }

    // Seed products
    const products = [
      {
        name: 'Laptop Pro 15',
        description: 'High-performance laptop with 16GB RAM and 512GB SSD',
        price: 1299.99,
        stock: 50,
        category: 'Electronics',
        imageUrl: 'https://via.placeholder.com/300x200?text=Laptop'
      },
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking',
        price: 29.99,
        stock: 200,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=Mouse'
      },
      {
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches',
        price: 89.99,
        stock: 100,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=Keyboard'
      },
      {
        name: '4K Monitor 27"',
        description: 'Ultra HD 4K monitor with HDR support',
        price: 399.99,
        stock: 75,
        category: 'Electronics',
        imageUrl: 'https://via.placeholder.com/300x200?text=Monitor'
      },
      {
        name: 'USB-C Hub',
        description: '7-in-1 USB-C hub with HDMI and USB 3.0 ports',
        price: 49.99,
        stock: 150,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=USB+Hub'
      },
      {
        name: 'Webcam HD',
        description: '1080p webcam with built-in microphone',
        price: 79.99,
        stock: 120,
        category: 'Electronics',
        imageUrl: 'https://via.placeholder.com/300x200?text=Webcam'
      },
      {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand',
        price: 39.99,
        stock: 180,
        category: 'Accessories',
        imageUrl: 'https://via.placeholder.com/300x200?text=Stand'
      },
      {
        name: 'Headphones',
        description: 'Noise-canceling over-ear headphones',
        price: 199.99,
        stock: 90,
        category: 'Electronics',
        imageUrl: 'https://via.placeholder.com/300x200?text=Headphones'
      }
    ];

    for (const product of products) {
      await pool.request()
        .input('name', sql.NVarChar, product.name)
        .input('description', sql.NVarChar, product.description)
        .input('price', sql.Decimal(10, 2), product.price)
        .input('stock', sql.Int, product.stock)
        .input('category', sql.NVarChar, product.category)
        .input('imageUrl', sql.NVarChar, product.imageUrl)
        .query(`
          INSERT INTO Products (Name, Description, Price, Stock, Category, ImageUrl, CreatedAt, IsActive)
          VALUES (@name, @description, @price, @stock, @category, @imageUrl, GETDATE(), 1)
        `);
    }

    logger.info(`Seeded ${products.length} products successfully`);
    process.exit(0);

  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
