const express = require('express');
const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get cart items
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          c.CartItemId, c.Quantity,
          p.ProductId, p.Name, p.Price, p.ImageUrl, p.Stock
        FROM CartItems c
        INNER JOIN Products p ON c.ProductId = p.ProductId
        WHERE c.UserId = @userId
      `);

    const cartItems = result.recordset.map(item => ({
      ...item,
      subtotal: item.Price * item.Quantity
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      items: cartItems,
      total,
      itemCount: cartItems.length
    });

  } catch (error) {
    logger.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/items', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const pool = await getPool();

    // Check if product exists and has stock
    const productResult = await pool.request()
      .input('productId', sql.Int, productId)
      .query('SELECT Stock FROM Products WHERE ProductId = @productId');

    if (productResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (productResult.recordset[0].Stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existingItem = await pool.request()
      .input('userId', sql.Int, userId)
      .input('productId', sql.Int, productId)
      .query(`
        SELECT CartItemId, Quantity 
        FROM CartItems 
        WHERE UserId = @userId AND ProductId = @productId
      `);

    if (existingItem.recordset.length > 0) {
      // Update quantity
      const newQuantity = existingItem.recordset[0].Quantity + quantity;
      await pool.request()
        .input('cartItemId', sql.Int, existingItem.recordset[0].CartItemId)
        .input('quantity', sql.Int, newQuantity)
        .query('UPDATE CartItems SET Quantity = @quantity WHERE CartItemId = @cartItemId');

      res.json({ message: 'Cart updated', quantity: newQuantity });
    } else {
      // Add new item
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('productId', sql.Int, productId)
        .input('quantity', sql.Int, quantity)
        .query(`
          INSERT INTO CartItems (UserId, ProductId, Quantity, CreatedAt)
          VALUES (@userId, @productId, @quantity, GETDATE())
        `);

      res.status(201).json({ message: 'Item added to cart' });
    }

  } catch (error) {
    logger.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/items/:cartItemId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const pool = await getPool();

    await pool.request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('userId', sql.Int, userId)
      .input('quantity', sql.Int, quantity)
      .query(`
        UPDATE CartItems 
        SET Quantity = @quantity 
        WHERE CartItemId = @cartItemId AND UserId = @userId
      `);

    res.json({ message: 'Cart item updated' });

  } catch (error) {
    logger.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// Remove item from cart
router.delete('/items/:cartItemId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { cartItemId } = req.params;

    const pool = await getPool();

    await pool.request()
      .input('cartItemId', sql.Int, cartItemId)
      .input('userId', sql.Int, userId)
      .query('DELETE FROM CartItems WHERE CartItemId = @cartItemId AND UserId = @userId');

    res.json({ message: 'Item removed from cart' });

  } catch (error) {
    logger.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

// Clear cart
router.delete('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM CartItems WHERE UserId = @userId');

    res.json({ message: 'Cart cleared' });

  } catch (error) {
    logger.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
