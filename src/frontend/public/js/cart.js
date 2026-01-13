// Cart functionality
document.addEventListener('DOMContentLoaded', async () => {
  await loadCart();
  setupCheckout();
});

async function loadCart() {
  try {
    const response = await fetch('/api/cart');
    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error('Failed to load cart');
    }

    const data = await response.json();
    displayCart(data);
  } catch (error) {
    console.error('Failed to load cart:', error);
  }
}

function displayCart(data) {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  if (data.items.length === 0) {
    cartItems.innerHTML = '<div class="alert alert-info">Your cart is empty</div>';
    cartTotal.textContent = '$0.00';
    document.getElementById('checkout-btn').disabled = true;
    return;
  }

  cartItems.innerHTML = data.items.map(item => `
    <div class="card mb-3" data-testid="cart-item-${item.ProductId}">
      <div class="row g-0">
        <div class="col-md-2">
          <img src="${item.ImageUrl}" class="img-fluid" alt="${item.Name}">
        </div>
        <div class="col-md-7">
          <div class="card-body">
            <h5 class="card-title">${item.Name}</h5>
            <p class="text-muted">$${item.Price.toFixed(2)} each</p>
            <div class="d-flex align-items-center">
              <label class="me-2">Quantity:</label>
              <input type="number" class="form-control form-control-sm" 
                     style="width: 80px;" 
                     value="${item.Quantity}" 
                     min="1" 
                     max="${item.Stock}"
                     onchange="updateQuantity(${item.CartItemId}, this.value)"
                     data-testid="quantity-${item.ProductId}">
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card-body text-end">
            <h5>$${item.subtotal.toFixed(2)}</h5>
            <button class="btn btn-danger btn-sm mt-2" 
                    onclick="removeItem(${item.CartItemId})"
                    data-testid="remove-${item.ProductId}">
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  cartTotal.textContent = `$${data.total.toFixed(2)}`;
  document.getElementById('checkout-btn').disabled = false;
}

async function updateQuantity(cartItemId, quantity) {
  try {
    const response = await fetch(`/api/cart/items/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: parseInt(quantity) })
    });

    if (response.ok) {
      await loadCart();
    }
  } catch (error) {
    console.error('Failed to update quantity:', error);
  }
}

async function removeItem(cartItemId) {
  try {
    const response = await fetch(`/api/cart/items/${cartItemId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadCart();
      updateCartCount();
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
  }
}

function setupCheckout() {
  const checkoutBtn = document.getElementById('checkout-btn');
  const placeOrderBtn = document.getElementById('place-order-btn');

  checkoutBtn.addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
  });

  placeOrderBtn.addEventListener('click', async () => {
    const shippingAddress = document.getElementById('shipping-address').value;
    
    if (!shippingAddress) {
      alert('Please enter a shipping address');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Order placed successfully! Order ID: ${data.orderId}`);
        window.location.href = '/profile';
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('An error occurred during checkout');
    }
  });
}
