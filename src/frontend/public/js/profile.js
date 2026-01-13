// Profile and orders functionality
document.addEventListener('DOMContentLoaded', async () => {
  setupProfileForm();
  await loadOrders();
});

function setupProfileForm() {
  const form = document.getElementById('profile-form');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName })
      });

      const data = await response.json();

      if (response.ok) {
        successDiv.textContent = 'Profile updated successfully!';
        successDiv.classList.remove('d-none');
        errorDiv.classList.add('d-none');
        
        setTimeout(() => {
          successDiv.classList.add('d-none');
        }, 3000);
      } else {
        errorDiv.textContent = data.error || 'Failed to update profile';
        errorDiv.classList.remove('d-none');
        successDiv.classList.add('d-none');
      }
    } catch (error) {
      errorDiv.textContent = 'An error occurred';
      errorDiv.classList.remove('d-none');
    }
  });
}

async function loadOrders() {
  try {
    const response = await fetch('/api/orders');
    const orders = await response.json();

    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="text-muted">No orders yet</p>';
      return;
    }

    ordersList.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr data-testid="order-${order.OrderId}">
              <td>${order.OrderId}</td>
              <td>${new Date(order.CreatedAt).toLocaleDateString()}</td>
              <td>$${order.TotalAmount.toFixed(2)}</td>
              <td><span class="badge bg-${getStatusColor(order.Status)}">${order.Status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error('Failed to load orders:', error);
  }
}

function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pending': return 'warning';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'delivered': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}
