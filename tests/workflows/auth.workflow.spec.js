import { test, expect } from '@playwright/test';

test.describe('User Registration and Login Workflow', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test.user.${Date.now()}@example.com`,
    password: 'SecurePass123!'
  };

  test('@workflow User can register a new account', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.getByTestId('register-firstname').fill(testUser.firstName);
    await page.getByTestId('register-lastname').fill(testUser.lastName);
    await page.getByTestId('register-email').fill(testUser.email);
    await page.getByTestId('register-password').fill(testUser.password);

    // Submit form
    await page.getByTestId('register-submit').click();

    // Should redirect to products page
    await expect(page).toHaveURL('/products');
    
    // Should see user name in header
    await expect(page.locator('nav')).toContainText(testUser.firstName);
  });

  test('@workflow User can login with existing account', async ({ page }) => {
    // First create an account
    await page.goto('/register');
    await page.getByTestId('register-firstname').fill(testUser.firstName);
    await page.getByTestId('register-lastname').fill(testUser.lastName);
    await page.getByTestId('register-email').fill(testUser.email);
    await page.getByTestId('register-password').fill(testUser.password);
    await page.getByTestId('register-submit').click();
    
    // Logout
    await page.locator('nav a:has-text("Logout")').click();

    // Now login
    await page.goto('/login');
    await page.getByTestId('login-email').fill(testUser.email);
    await page.getByTestId('login-password').fill(testUser.password);
    await page.getByTestId('login-submit').click();

    // Should redirect to products page
    await expect(page).toHaveURL('/products');
    await expect(page.locator('nav')).toContainText(testUser.firstName);
  });

  test('@workflow Invalid login shows error', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByTestId('login-email').fill('invalid@example.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByTestId('login-submit').click();

    // Should show error message
    await expect(page.locator('.alert-danger')).toBeVisible();
    await expect(page.locator('.alert-danger')).toContainText('Invalid credentials');
  });
});
