const express = require('express');
const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');
const { createRedisClient } = require('../config/redis');

const router = express.Router();
const CACHE_TTL = 300; // 5 minutes

// Get all products (with caching)
router.get('/', async (req, res) => {
  try {
    const cacheKey = 'products:all';
    const redisClient = await createRedisClient();

    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      logger.info('Products retrieved from cache');
      return res.json(JSON.parse(cached));
    }

    // Get from database
    const pool = await getPool();
    const result = await pool.request()
      .query(`
        SELECT 
          ProductId, Name, Description, Price, 
          Stock, Category, ImageUrl, CreatedAt
        FROM Products
        WHERE IsActive = 1
        ORDER BY CreatedAt DESC
      `);

    const products = result.recordset;

    // Cache the results
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(products));

    logger.info(`Retrieved ${products.length} products from database`);
    res.json(products);

  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('productId', sql.Int, id)
      .query(`
        SELECT 
          ProductId, Name, Description, Price, 
          Stock, Category, ImageUrl, CreatedAt
        FROM Products
        WHERE ProductId = @productId AND IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const pool = await getPool();

    const result = await pool.request()
      .input('searchQuery', sql.NVarChar, `%${query}%`)
      .query(`
        SELECT 
          ProductId, Name, Description, Price, 
          Stock, Category, ImageUrl
        FROM Products
        WHERE IsActive = 1 
          AND (Name LIKE @searchQuery OR Description LIKE @searchQuery)
        ORDER BY Name
      `);

    res.json(result.recordset);

  } catch (error) {
    logger.error('Error searching products:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
