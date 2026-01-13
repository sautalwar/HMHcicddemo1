const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { getPool, sql } = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password, firstName, lastName } = value;
    const pool = await getPool();

    // Check if user exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserId FROM Users WHERE Email = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('passwordHash', sql.NVarChar, passwordHash)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .query(`
        INSERT INTO Users (Email, PasswordHash, FirstName, LastName, CreatedAt)
        OUTPUT INSERTED.UserId, INSERTED.Email, INSERTED.FirstName, INSERTED.LastName
        VALUES (@email, @passwordHash, @firstName, @lastName, GETDATE())
      `);

    const user = result.recordset[0];

    // Create session
    req.session.user = {
      userId: user.UserId,
      email: user.Email,
      firstName: user.FirstName,
      lastName: user.LastName
    };

    logger.info(`User registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: user.UserId,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName
      }
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;
    const pool = await getPool();

    // Get user
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.recordset[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.PasswordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.request()
      .input('userId', sql.Int, user.UserId)
      .query('UPDATE Users SET LastLoginAt = GETDATE() WHERE UserId = @userId');

    // Create session
    req.session.user = {
      userId: user.UserId,
      email: user.Email,
      firstName: user.FirstName,
      lastName: user.LastName
    };

    // Generate JWT token (optional, for API access)
    const token = jwt.sign(
      { userId: user.UserId, email: user.Email },
      process.env.JWT_SECRET || 'change-this-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Login successful',
      user: {
        userId: user.UserId,
        email: user.Email,
        firstName: user.FirstName,
        lastName: user.LastName
      },
      token
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

module.exports = router;
