// Products page functionality
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  setupSearch();
});

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();

    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.map(product => `
      <div class="col-md-4 mb-4" data-testid="product-card">
        <div class="card h-100">
          <img src="${product.ImageUrl}" class="card-img-top" alt="${product.Name}">
          <div class="card-body">
            <h5 class="card-title">${product.Name}</h5>
            <p class="card-text">${product.Description}</p>
            <p class="text-muted">${product.Category}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="h5 mb-0">$${product.Price.toFixed(2)}</span>
              <span class="text-muted">Stock: ${product.Stock}</span>
            </div>
            <button class="btn btn-primary w-100 mt-2" 
                    onclick="addToCart(${product.ProductId})"
                    data-testid="add-to-cart-${product.ProductId}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let debounceTimer;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const query = e.target.value.trim();
      if (query) {
        await searchProducts(query);
      } else {
        await loadProducts();
      }
    }, 300);
  });
}

async function searchProducts(query) {
  try {
    const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
    const products = await response.json();

    const grid = document.getElementById('products-grid');
    if (products.length === 0) {
      grid.innerHTML = '<div class="col-12"><p class="text-center">No products found.</p></div>';
      return;
    }

    grid.innerHTML = products.map(product => `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src="${product.ImageUrl}" class="card-img-top" alt="${product.Name}">
          <div class="card-body">
            <h5 class="card-title">${product.Name}</h5>
            <p class="card-text">${product.Description}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="h5 mb-0">$${product.Price.toFixed(2)}</span>
              <span class="text-muted">Stock: ${product.Stock}</span>
            </div>
            <button class="btn btn-primary w-100 mt-2" onclick="addToCart(${product.ProductId})">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Search failed:', error);
  }
}

async function addToCart(productId) {
  try {
    const response = await fetch('/api/cart/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    if (response.ok) {
      showToast('Product added to cart!');
      updateCartCount();
    } else if (response.status === 401) {
      window.location.href = '/login';
    } else {
      const data = await response.json();
      showToast(data.error || 'Failed to add to cart', 'error');
    }
  } catch (error) {
    showToast('An error occurred', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed top-0 end-0 m-3`;
  toast.style.zIndex = '9999';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
