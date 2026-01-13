# GitHub CI/CD Demo - User Workflow Scenarios

## Overview
This document outlines the complete user workflows that are tested in the Playwright workflow tests. These scenarios represent real-world usage patterns and critical business flows.

---

## Workflow 1: New User Registration and First Purchase

### Actors
- New User (Jane)

### Preconditions
- Application is running
- Database is seeded with products
- User does not have an account

### Steps

1. **User Registration**
   - Navigate to `/register`
   - Fill in registration form:
     - First Name: Jane
     - Last Name: Smith
     - Email: jane.smith@example.com
     - Password: SecurePass123!
   - Click "Register"
   - System creates account
   - Automatically logged in
   - Redirected to `/products`

2. **Browse Products**
   - View product grid
   - See product details (name, price, image, stock)
   - Products loaded from database

3. **Search for Product**
   - Enter "laptop" in search box
   - Results filter to matching products
   - View filtered results

4. **Add to Cart**
   - Click "Add to Cart" on Laptop Pro 15
   - See success notification
   - Cart count updates in navigation

5. **View Cart**
   - Navigate to `/cart`
   - See selected product with:
     - Product details
     - Quantity: 1
     - Price: $1,299.99
     - Total: $1,299.99

6. **Checkout**
   - Click "Proceed to Checkout"
   - Enter shipping address:
     ```
     123 Main Street
     San Francisco, CA 94102
     ```
   - Click "Place Order"
   - Order created successfully
   - Cart cleared
   - Redirected to `/profile`

7. **View Order History**
   - See new order in order list
   - Order status: Pending
   - Order total: $1,299.99

### Expected Results
- ✅ User account created
- ✅ User can browse and search products
- ✅ Cart functionality works
- ✅ Order placed successfully
- ✅ Stock decreased by 1
- ✅ Order visible in profile

### Test Coverage
- File: `tests/workflows/auth.workflow.spec.js`
- File: `tests/workflows/shopping.workflow.spec.js`
- File: `tests/workflows/profile.workflow.spec.js`

---

## Workflow 2: Returning User - Multiple Items Purchase

### Actors
- Returning User (John)

### Preconditions
- User has existing account
- User is not logged in

### Steps

1. **Login**
   - Navigate to `/login`
   - Enter credentials
   - Click "Login"
   - Redirected to `/products`

2. **Add Multiple Products**
   - Add "Laptop Pro 15" to cart
   - Add "Wireless Mouse" to cart
   - Add "Mechanical Keyboard" to cart
   - Cart count shows: 3

3. **Manage Cart**
   - Navigate to `/cart`
   - Update Laptop quantity to 2
   - Remove Wireless Mouse
   - Cart now has:
     - 2x Laptop Pro 15
     - 1x Mechanical Keyboard

4. **Checkout**
   - Proceed to checkout
   - Enter shipping address
   - Place order
   - Total: $2,689.98

5. **Profile Update**
   - Navigate to `/profile`
   - Update first name to "Jonathan"
   - Save changes
   - See success message

### Expected Results
- ✅ Login successful
- ✅ Multiple products added
- ✅ Cart quantities updated correctly
- ✅ Item removal works
- ✅ Total calculated correctly
- ✅ Order placed with correct items
- ✅ Profile updated

### Test Coverage
- File: `tests/workflows/auth.workflow.spec.js`
- File: `tests/workflows/shopping.workflow.spec.js`
- File: `tests/workflows/profile.workflow.spec.js`

---

## Workflow 3: Browse and Exit (No Purchase)

### Actors
- Potential Customer (Sarah)

### Preconditions
- User has account
- User is logged in

### Steps

1. **Browse Products**
   - View all products
   - Click through different products
   - Use search functionality

2. **Add Items to Cart**
   - Add 3 products to cart
   - Navigate to cart

3. **Review and Exit**
   - Review cart contents
   - Change mind
   - Click "Remove" on all items
   - Cart is empty
   - Log out

4. **Return Later**
   - Log back in
   - Navigate to cart
   - Cart still empty (items were removed)

### Expected Results
- ✅ Browsing works seamlessly
- ✅ Cart can be emptied
- ✅ Cart state persists across sessions
- ✅ Removed items don't reappear

### Test Coverage
- File: `tests/workflows/shopping.workflow.spec.js`

---

## Workflow 4: Error Scenarios

### Scenario 4a: Insufficient Stock

1. Product with stock: 1
2. User tries to add quantity: 5
3. System shows error
4. Checkout blocked

### Scenario 4b: Invalid Login

1. Navigate to login
2. Enter wrong password
3. See error message
4. Not logged in

### Scenario 4c: Missing Required Field

1. Registration form
2. Leave password empty
3. Submit
4. HTML5 validation prevents submission

### Expected Results
- ✅ Stock validation works
- ✅ Authentication errors shown
- ✅ Form validation prevents bad data

### Test Coverage
- File: `tests/workflows/auth.workflow.spec.js`
- File: `tests/workflows/shopping.workflow.spec.js`

---

## Performance Requirements

### Page Load Times
- Home page: < 2 seconds
- Products page: < 2 seconds
- Cart operations: < 1 second

### API Response Times
- GET /api/products: < 500ms
- POST /api/cart/items: < 300ms
- POST /api/orders: < 1000ms

### Concurrent Users
- Support 100 concurrent users
- No degradation in response time

---

## Accessibility Requirements

- All forms keyboard navigable
- Screen reader compatible
- WCAG 2.1 Level AA compliance
- Proper ARIA labels
- Focus indicators visible

---

## Mobile Workflow

Same workflows should work on:
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)
- Responsive design adapts
- Touch interactions work
- No horizontal scrolling

---

## Monitoring and Analytics

### Key Metrics to Track
- Conversion rate (visitors → purchasers)
- Cart abandonment rate
- Average order value
- Search success rate
- Page load times
- Error rates

### Alerts
- Order failure rate > 1%
- Page load time > 3 seconds
- API error rate > 0.5%
- Health check failures
