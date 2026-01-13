const express = require('express');
const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get user orders
router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          OrderId, TotalAmount, Status, 
          ShippingAddress, CreatedAt
        FROM Orders
        WHERE UserId = @userId
        ORDER BY CreatedAt DESC
      `);

    res.json(result.recordset);

  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { orderId } = req.params;
    const pool = await getPool();

    // Get order
    const orderResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM Orders 
        WHERE OrderId = @orderId AND UserId = @userId
      `);

    if (orderResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const itemsResult = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query(`
        SELECT 
          oi.OrderItemId, oi.Quantity, oi.Price,
          p.Name, p.ImageUrl
        FROM OrderItems oi
        INNER JOIN Products p ON oi.ProductId = p.ProductId
        WHERE oi.OrderId = @orderId
      `);

    res.json({
      ...orderResult.recordset[0],
      items: itemsResult.recordset
    });

  } catch (error) {
    logger.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Create order (checkout)
router.post('/', requireAuth, async (req, res) => {
  const transaction = new sql.Transaction(await getPool());
  
  try {
    const userId = req.session.user.userId;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address required' });
    }

    await transaction.begin();

    // Get cart items
    const cartResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT c.ProductId, c.Quantity, p.Price, p.Stock
        FROM CartItems c
        INNER JOIN Products p ON c.ProductId = p.ProductId
        WHERE c.UserId = @userId
      `);

    if (cartResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Check stock availability
    for (const item of cartResult.recordset) {
      if (item.Stock < item.Quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: `Insufficient stock for product ${item.ProductId}` });
      }
    }

    // Calculate total
    const totalAmount = cartResult.recordset.reduce(
      (sum, item) => sum + (item.Price * item.Quantity), 
      0
    );

    // Create order
    const orderResult = await transaction.request()
      .input('userId', sql.Int, userId)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount)
      .input('shippingAddress', sql.NVarChar, shippingAddress)
      .query(`
        INSERT INTO Orders (UserId, TotalAmount, Status, ShippingAddress, CreatedAt)
        OUTPUT INSERTED.OrderId
        VALUES (@userId, @totalAmount, 'Pending', @shippingAddress, GETDATE())
      `);

    const orderId = orderResult.recordset[0].OrderId;

    // Create order items and update stock
    for (const item of cartResult.recordset) {
      await transaction.request()
        .input('orderId', sql.Int, orderId)
        .input('productId', sql.Int, item.ProductId)
        .input('quantity', sql.Int, item.Quantity)
        .input('price', sql.Decimal(10, 2), item.Price)
        .query(`
          INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price)
          VALUES (@orderId, @productId, @quantity, @price)
        `);

      await transaction.request()
        .input('productId', sql.Int, item.ProductId)
        .input('quantity', sql.Int, item.Quantity)
        .query(`
          UPDATE Products 
          SET Stock = Stock - @quantity 
          WHERE ProductId = @productId
        `);
    }

    // Clear cart
    await transaction.request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM CartItems WHERE UserId = @userId');

    await transaction.commit();

    logger.info(`Order created: ${orderId} for user: ${userId}`);

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount
    });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
