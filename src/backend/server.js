const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { createRedisClient } = require('./config/redis');
const { connectDatabase } = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required for Azure App Service)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Initialize Redis and Database
let redisClient;

async function initializeApp() {
  try {
    // Connect to Redis
    redisClient = await createRedisClient();
    logger.info('Redis connected successfully');

    // Connect to Database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Session middleware with Redis
    app.use(session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'change-this-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
      }
    }));

    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productsRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', ordersRoutes);
    app.use('/api/user', userRoutes);

    // Frontend routes
    app.get('/', (req, res) => {
      res.render('index', { 
        user: req.session.user || null,
        env: process.env.NODE_ENV || 'development'
      });
    });

    app.get('/login', (req, res) => {
      res.render('login');
    });

    app.get('/register', (req, res) => {
      res.render('register');
    });

    app.get('/products', (req, res) => {
      res.render('products', { user: req.session.user || null });
    });

    app.get('/cart', (req, res) => {
      res.render('cart', { user: req.session.user || null });
    });

    app.get('/profile', (req, res) => {
      if (!req.session.user) {
        return res.redirect('/login');
      }
      res.render('profile', { user: req.session.user });
    });

    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        const redisHealth = await redisClient.ping();
        const dbHealth = await require('./config/database').checkHealth();
        
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          services: {
            redis: redisHealth === 'PONG' ? 'connected' : 'disconnected',
            database: dbHealth ? 'connected' : 'disconnected'
          }
        });
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    });

    // Error handling
    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal Server Error',
          ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });

  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  if (redisClient) {
    await redisClient.quit();
  }
  process.exit(0);
});

initializeApp();

module.exports = app;
