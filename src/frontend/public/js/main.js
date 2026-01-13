// Main application JavaScript
async function updateCartCount() {
  try {
    const response = await fetch('/api/cart');
    if (response.ok) {
      const data = await response.json();
      const cartCount = document.getElementById('cart-count');
      if (cartCount) {
        cartCount.textContent = data.itemCount || 0;
      }
    }
  } catch (error) {
    // User might not be logged in
    console.debug('Failed to update cart count');
  }
}

// Update cart count on page load
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
});
