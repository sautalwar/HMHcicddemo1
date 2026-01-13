import { test, expect } from '@playwright/test';

test.describe('User Profile Management Workflow', () => {
  let userEmail;

  test.beforeEach(async ({ page }) => {
    userEmail = `profile.${Date.now()}@example.com`;
    
    await page.goto('/register');
    await page.getByTestId('register-firstname').fill('Profile');
    await page.getByTestId('register-lastname').fill('Tester');
    await page.getByTestId('register-email').fill(userEmail);
    await page.getByTestId('register-password').fill('ProfilePass123!');
    await page.getByTestId('register-submit').click();
  });

  test('@workflow User can view and update profile', async ({ page }) => {
    await page.goto('/profile');

    // Verify profile fields are populated
    await expect(page.getByTestId('profile-firstname')).toHaveValue('Profile');
    await expect(page.getByTestId('profile-lastname')).toHaveValue('Tester');

    // Update profile
    await page.getByTestId('profile-firstname').fill('Updated');
    await page.getByTestId('profile-lastname').fill('Name');
    await page.getByTestId('update-profile-button').click();

    // Should show success message
    await expect(page.locator('.alert-success')).toBeVisible();
    await expect(page.locator('.alert-success')).toContainText('successfully');

    // Verify values persisted
    await expect(page.getByTestId('profile-firstname')).toHaveValue('Updated');
    await expect(page.getByTestId('profile-lastname')).toHaveValue('Name');
  });

  test('@workflow User can view order history', async ({ page }) => {
    // Place an order first
    await page.goto('/products');
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForSelector('.alert-success');

    await page.goto('/cart');
    await page.getByTestId('checkout-button').click();
    await page.getByTestId('shipping-address').fill('456 Order Ave, Test City, TC 12345');
    await page.getByTestId('place-order-button').click();

    // Should be on profile page
    await expect(page).toHaveURL('/profile');

    // Verify order appears
    await expect(page.getByTestId('orders-list')).toBeVisible();
    const orders = page.locator('[data-testid^="order-"]');
    await expect(orders).toHaveCount(1);
  });
});
