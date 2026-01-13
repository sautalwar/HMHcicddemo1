# Shopping Cart and Checkout

## Overview
This specification defines the shopping cart and checkout workflows for the e-commerce functionality.

## User Stories

### US-010: Add Product to Cart
**As a** logged-in user  
**I want to** add products to my cart  
**So that** I can purchase them later

#### Acceptance Criteria
- User must be logged in to add to cart
- Click "Add to Cart" button on product card
- Success message displayed
- Cart count updated in navigation
- If product already in cart, quantity is increased
- Stock availability checked before adding

### US-011: View Shopping Cart
**As a** logged-in user  
**I want to** view my shopping cart  
**So that** I can review items before checkout

#### Acceptance Criteria
- Cart accessible at `/cart`
- Display all cart items with:
  - Product image
  - Product name
  - Price per unit
  - Quantity selector
  - Subtotal
- Display total amount
- Empty cart shows appropriate message

### US-012: Update Cart Quantity
**As a** logged-in user  
**I want to** update product quantities in my cart  
**So that** I can adjust my order

#### Acceptance Criteria
- Quantity can be changed via input field
- Min quantity: 1
- Max quantity: Available stock
- Total updates automatically
- Changes persisted in database

### US-013: Remove from Cart
**As a** logged-in user  
**I want to** remove items from my cart  
**So that** I can finalize my order

#### Acceptance Criteria
- Remove button available for each item
- Item removed immediately
- Cart total recalculated
- Empty cart message shown if no items remain

### US-014: Checkout Process
**As a** logged-in user  
**I want to** complete checkout  
**So that** I can purchase my items

#### Acceptance Criteria
- Checkout button visible when cart has items
- Shipping address required
- Order validation:
  - All items still in stock
  - Prices haven't changed
- Transaction creates:
  - Order record
  - Order items
  - Updates product stock
  - Clears cart
- Order confirmation shown
- Redirect to profile/orders

## API Endpoints

### GET /api/cart
**Response (200):**
```json
{
  "items": [
    {
      "CartItemId": 1,
      "ProductId": 5,
      "Name": "Laptop Pro 15",
      "Price": 1299.99,
      "Quantity": 1,
      "ImageUrl": "https://...",
      "Stock": 50,
      "subtotal": 1299.99
    }
  ],
  "total": 1299.99,
  "itemCount": 1
}
```

### POST /api/cart/items
**Request:**
```json
{
  "productId": 5,
  "quantity": 1
}
```

**Response (201):**
```json
{
  "message": "Item added to cart"
}
```

### PUT /api/cart/items/:cartItemId
**Request:**
```json
{
  "quantity": 2
}
```

**Response (200):**
```json
{
  "message": "Cart item updated"
}
```

### DELETE /api/cart/items/:cartItemId
**Response (200):**
```json
{
  "message": "Item removed from cart"
}
```

### POST /api/orders (Checkout)
**Request:**
```json
{
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**Response (201):**
```json
{
  "message": "Order placed successfully",
  "orderId": 42,
  "totalAmount": 1299.99
}
```

## Database Schema

### CartItems Table
```sql
CREATE TABLE CartItems (
  CartItemId INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NOT NULL,
  ProductId INT NOT NULL,
  Quantity INT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
)
```

### Orders Table
```sql
CREATE TABLE Orders (
  OrderId INT IDENTITY(1,1) PRIMARY KEY,
  UserId INT NOT NULL,
  TotalAmount DECIMAL(10,2) NOT NULL,
  Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
  ShippingAddress NVARCHAR(500) NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  FOREIGN KEY (UserId) REFERENCES Users(UserId)
)
```

### OrderItems Table
```sql
CREATE TABLE OrderItems (
  OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
  OrderId INT NOT NULL,
  ProductId INT NOT NULL,
  Quantity INT NOT NULL,
  Price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (OrderId) REFERENCES Orders(OrderId) ON DELETE CASCADE,
  FOREIGN KEY (ProductId) REFERENCES Products(ProductId)
)
```

## Business Rules

### Stock Management
- Check stock before adding to cart
- Reserve stock during checkout transaction
- Update stock after successful order
- Rollback on checkout failure

### Pricing
- Prices captured at checkout time
- Historical prices preserved in OrderItems
- Current prices can change without affecting past orders

## Testing Requirements

### User Workflow Tests
- Complete shopping journey: Browse → Add → Checkout
- Add multiple products to cart
- Update quantities
- Remove items
- Checkout with insufficient stock (should fail)
- Checkout with valid cart

### Integration Tests
- Cart operations (add, update, remove)
- Order creation with transaction handling
- Stock updates during checkout
- Cart clearing after order

## Performance Considerations
- Cart data cached in Redis (session-based)
- Database transactions for checkout atomicity
- Optimistic locking for stock updates
