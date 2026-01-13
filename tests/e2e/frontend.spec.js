import { test, expect } from '@playwright/test';

test.describe('Frontend E2E Tests', () => {
  test('Home page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/GitHub CI\/CD Demo/);
    await expect(page.locator('h1')).toContainText('Welcome to GitHub CI/CD Demo');
    
    // Check key features are displayed
    await expect(page.locator('text=GitHub Actions')).toBeVisible();
    await expect(page.locator('text=Azure Integration')).toBeVisible();
    await expect(page.locator('text=Playwright Testing')).toBeVisible();
  });

  test('Navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to products
    await page.click('text=Products');
    await expect(page).toHaveURL('/products');
    
    // Test navigation back to home
    await page.click('text=Home');
    await expect(page).toHaveURL('/');
    
    // Test navigation to login
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');
    
    // Test navigation to register
    await page.click('text=Register here');
    await expect(page).toHaveURL('/register');
  });

  test('Products page displays products grid', async ({ page }) => {
    await page.goto('/products');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="products-grid"]');
    
    // Verify products are displayed
    const products = page.getByTestId('product-card');
    const count = await products.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Unauthenticated users redirected from protected pages', async ({ page }) => {
    await page.goto('/cart');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('Registration form validation', async ({ page }) => {
    await page.goto('/register');
    
    // Try to submit empty form
    await page.getByTestId('register-submit').click();
    
    // HTML5 validation should prevent submission
    const firstNameValidity = await page.getByTestId('register-firstname').evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(firstNameValidity).toBe(false);
  });

  test('Login form validation', async ({ page }) => {
    await page.goto('/login');
    
    // Enter invalid email format
    await page.getByTestId('login-email').fill('invalid-email');
    await page.getByTestId('login-password').fill('password123');
    
    // Try to submit
    await page.getByTestId('login-submit').click();
    
    // Email validation should trigger
    const emailValidity = await page.getByTestId('login-email').evaluate(
      (el: HTMLInputElement) => el.validity.valid
    );
    expect(emailValidity).toBe(false);
  });

  test('Responsive design - mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that navbar toggle is visible
    const navbarToggle = page.locator('.navbar-toggler');
    await expect(navbarToggle).toBeVisible();
    
    // Click to expand menu
    await navbarToggle.click();
    
    // Menu should be expanded
    await expect(page.locator('.navbar-collapse')).toHaveClass(/show/);
  });

  test('Health check endpoint returns healthy status', async ({ request }) => {
    const response = await request.get('/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.services.redis).toBe('connected');
    expect(data.services.database).toBe('connected');
  });
});
