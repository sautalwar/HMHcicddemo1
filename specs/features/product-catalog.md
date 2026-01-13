# Product Catalog

## Overview
This specification defines the product catalog browsing and search functionality.

## User Stories

### US-020: Browse Products
**As a** user  
**I want to** browse available products  
**So that** I can find items to purchase

#### Acceptance Criteria
- Products page accessible at `/products`
- Display products in grid layout (3 columns on desktop)
- Each product card shows:
  - Product image
  - Name
  - Description
  - Price
  - Category
  - Stock availability
  - "Add to Cart" button
- Products loaded from database
- Only active products displayed

### US-021: Search Products
**As a** user  
**I want to** search for products  
**So that** I can quickly find what I need

#### Acceptance Criteria
- Search box at top of products page
- Search queries name and description
- Results update with debounce (300ms)
- Empty state shown when no results
- Clear search returns to full catalog

### US-022: View Product Details
**As a** user  
**I want to** view detailed product information  
**So that** I can make informed decisions

#### Acceptance Criteria
- Product details available via API
- Shows all product attributes
- Stock status clearly indicated
- Add to cart available from details

## API Endpoints

### GET /api/products
**Response (200):**
```json
[
  {
    "ProductId": 1,
    "Name": "Laptop Pro 15",
    "Description": "High-performance laptop with 16GB RAM",
    "Price": 1299.99,
    "Stock": 50,
    "Category": "Electronics",
    "ImageUrl": "https://...",
    "CreatedAt": "2026-01-12T10:00:00Z"
  }
]
```

### GET /api/products/:id
**Response (200):**
```json
{
  "ProductId": 1,
  "Name": "Laptop Pro 15",
  "Description": "High-performance laptop with 16GB RAM and 512GB SSD",
  "Price": 1299.99,
  "Stock": 50,
  "Category": "Electronics",
  "ImageUrl": "https://...",
  "CreatedAt": "2026-01-12T10:00:00Z"
}
```

### GET /api/products/search/:query
**Response (200):**
```json
[
  {
    "ProductId": 1,
    "Name": "Laptop Pro 15",
    "Description": "High-performance laptop",
    "Price": 1299.99,
    "Stock": 50,
    "Category": "Electronics",
    "ImageUrl": "https://..."
  }
]
```

## Database Schema

### Products Table
```sql
CREATE TABLE Products (
  ProductId INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(255) NOT NULL,
  Description NVARCHAR(MAX),
  Price DECIMAL(10,2) NOT NULL,
  Stock INT NOT NULL DEFAULT 0,
  Category NVARCHAR(100),
  ImageUrl NVARCHAR(500),
  CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
  IsActive BIT NOT NULL DEFAULT 1
)

CREATE INDEX IX_Products_Category ON Products(Category)
```

## Caching Strategy

### Redis Cache
- Cache key: `products:all`
- TTL: 5 minutes (300 seconds)
- Invalidate on product updates
- Cache hit logged for monitoring

### Cache Flow
1. Check Redis for `products:all`
2. If hit, return cached data
3. If miss, query database
4. Store in Redis with TTL
5. Return data

## Testing Requirements

### E2E Tests
- Products page loads and displays products
- Search functionality works
- Product cards clickable
- Responsive design (mobile/desktop)

### Integration Tests
- GET all products returns array
- GET product by ID returns single product
- Search returns filtered results
- Cache returns same data as database

### Performance Tests
- Page load time < 2 seconds
- Search response < 500ms
- Cache hit ratio > 80%

## Business Rules
- Only active products visible to users
- Stock shown in real-time
- Out of stock products still visible but not purchasable
- Price changes don't affect existing carts/orders
