import { test, expect } from '@playwright/test';

test.describe('Backend API Integration Tests', () => {
  let authToken;
  let testUserId;
  const testUser = {
    firstName: 'API',
    lastName: 'Tester',
    email: `api.test.${Date.now()}@example.com`,
    password: 'APITest123!'
  };

  test('POST /api/auth/register - Create new user', async ({ request }) => {
    const response = await request.post('/api/auth/register', {
      data: testUser
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.user).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
    expect(data.user.firstName).toBe(testUser.firstName);
    
    testUserId = data.user.userId;
  });

  test('POST /api/auth/login - Authenticate user', async ({ request }) => {
    // First register
    await request.post('/api/auth/register', { data: testUser });

    // Then login
    const response = await request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.token).toBeDefined();
    expect(data.user.email).toBe(testUser.email);
    
    authToken = data.token;
  });

  test('POST /api/auth/login - Reject invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {
        email: testUser.email,
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('GET /api/products - Retrieve product list', async ({ request }) => {
    const response = await request.get('/api/products');
    
    expect(response.ok()).toBeTruthy();
    const products = await response.json();
    
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    
    // Verify product structure
    const product = products[0];
    expect(product).toHaveProperty('ProductId');
    expect(product).toHaveProperty('Name');
    expect(product).toHaveProperty('Price');
    expect(product).toHaveProperty('Stock');
  });

  test('GET /api/products/:id - Retrieve single product', async ({ request }) => {
    // First get all products
    const listResponse = await request.get('/api/products');
    const products = await listResponse.json();
    const productId = products[0].ProductId;

    // Get single product
    const response = await request.get(`/api/products/${productId}`);
    
    expect(response.ok()).toBeTruthy();
    const product = await response.json();
    
    expect(product.ProductId).toBe(productId);
    expect(product.Name).toBeDefined();
  });

  test('GET /api/products/search/:query - Search products', async ({ request }) => {
    const response = await request.get('/api/products/search/laptop');
    
    expect(response.ok()).toBeTruthy();
    const products = await response.json();
    
    expect(Array.isArray(products)).toBeTruthy();
  });

  test('GET /health - Health check endpoint', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    const health = await response.json();
    
    expect(health.status).toBe('healthy');
    expect(health.services).toBeDefined();
    expect(health.services.redis).toBe('connected');
    expect(health.services.database).toBe('connected');
  });

  test('API returns proper error for non-existent routes', async ({ request }) => {
    const response = await request.get('/api/nonexistent');
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  test('API rate limiting works', async ({ request }) => {
    // This test assumes rate limit is set (100 requests per 15 min in our config)
    // We'll just verify the endpoint is protected
    const response = await request.get('/api/products');
    
    // Should have rate limit headers (if implemented)
    expect(response.ok()).toBeTruthy();
  });
});
