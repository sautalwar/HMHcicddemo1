import { test, expect } from '@playwright/test';

test.describe('Shopping Workflow', () => {
  let userEmail;

  test.beforeEach(async ({ page }) => {
    // Register and login before each test
    userEmail = `shopper.${Date.now()}@example.com`;
    
    await page.goto('/register');
    await page.getByTestId('register-firstname').fill('Shopping');
    await page.getByTestId('register-lastname').fill('User');
    await page.getByTestId('register-email').fill(userEmail);
    await page.getByTestId('register-password').fill('ShopPass123!');
    await page.getByTestId('register-submit').click();

    await expect(page).toHaveURL('/products');
  });

  test('@workflow Complete shopping journey: Browse → Add to Cart → Checkout', async ({ page }) => {
    // Browse products
    await page.goto('/products');
    await expect(page.getByTestId('products-grid')).toBeVisible();

    // Verify products are loaded
    const productCards = page.getByTestId('product-card');
    await expect(productCards.first()).toBeVisible();

    // Add first product to cart
    const firstAddButton = page.locator('[data-testid^="add-to-cart-"]').first();
    await firstAddButton.click();

    // Wait for success toast
    await page.waitForSelector('.alert-success', { timeout: 5000 });

    // Go to cart
    await page.goto('/cart');
    await expect(page.getByTestId('cart-items')).toBeVisible();

    // Verify item is in cart
    const cartItems = page.locator('[data-testid^="cart-item-"]');
    await expect(cartItems.first()).toBeVisible();

    // Verify total is displayed
    const total = await page.getByTestId('cart-total').textContent();
    expect(total).toMatch(/\$\d+\.\d{2}/);

    // Proceed to checkout
    await page.getByTestId('checkout-button').click();

    // Fill shipping address
    await page.getByTestId('shipping-address').fill('123 Test Street, Test City, TC 12345');

    // Place order
    await page.getByTestId('place-order-button').click();

    // Should redirect to profile with order confirmation
    await expect(page).toHaveURL('/profile');
    
    // Verify order appears in profile
    await expect(page.getByTestId('orders-list')).toBeVisible();
    const orderRow = page.locator('[data-testid^="order-"]').first();
    await expect(orderRow).toBeVisible();
  });

  test('@workflow User can search for products', async ({ page }) => {
    await page.goto('/products');

    // Search for a product
    await page.getByTestId('search-input').fill('laptop');
    
    // Wait for search results
    await page.waitForTimeout(500); // Debounce delay

    // Verify search results
    const products = page.getByTestId('product-card');
    const firstProduct = products.first();
    await expect(firstProduct).toBeVisible();
  });

  test('@workflow User can update cart quantities', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForSelector('.alert-success');

    // Go to cart
    await page.goto('/cart');

    // Get initial total
    const initialTotal = await page.getByTestId('cart-total').textContent();

    // Update quantity
    const quantityInput = page.locator('[data-testid^="quantity-"]').first();
    await quantityInput.fill('2');
    await quantityInput.blur();

    // Wait for cart to update
    await page.waitForTimeout(1000);

    // Verify total changed
    const newTotal = await page.getByTestId('cart-total').textContent();
    expect(newTotal).not.toBe(initialTotal);
  });

  test('@workflow User can remove items from cart', async ({ page }) => {
    // Add product to cart
    await page.goto('/products');
    await page.locator('[data-testid^="add-to-cart-"]').first().click();
    await page.waitForSelector('.alert-success');

    // Go to cart
    await page.goto('/cart');
    
    // Remove item
    await page.locator('[data-testid^="remove-"]').first().click();

    // Wait for update
    await page.waitForTimeout(500);

    // Cart should show empty message
    await expect(page.locator('.alert-info')).toContainText('cart is empty');
  });
});
