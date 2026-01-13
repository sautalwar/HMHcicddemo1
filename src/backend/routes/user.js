const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Get user profile
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const pool = await getPool();

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT UserId, Email, FirstName, LastName, CreatedAt, LastLoginAt
        FROM Users
        WHERE UserId = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.recordset[0]);

  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { firstName, lastName } = req.body;

    const schema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required()
    });

    const { error } = schema.validate({ firstName, lastName });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const pool = await getPool();

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .query(`
        UPDATE Users 
        SET FirstName = @firstName, LastName = @lastName
        WHERE UserId = @userId
      `);

    // Update session
    req.session.user.firstName = firstName;
    req.session.user.lastName = lastName;

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.userId;
    const { currentPassword, newPassword } = req.body;

    const schema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required()
    });

    const { error } = schema.validate({ currentPassword, newPassword });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const pool = await getPool();

    // Get current password hash
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT PasswordHash FROM Users WHERE UserId = @userId');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(
      currentPassword, 
      result.recordset[0].PasswordHash
    );

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('passwordHash', sql.NVarChar, newPasswordHash)
      .query('UPDATE Users SET PasswordHash = @passwordHash WHERE UserId = @userId');

    logger.info(`Password changed for user: ${userId}`);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
