# GitHub CI/CD Demo - Project Structure

```
HMHcicddemo1/
├── .github/
│   ├── workflows/
│   │   ├── dev-pipeline.yml              # Dev auto-deployment
│   │   ├── test-pipeline.yml             # Test manual deployment
│   │   ├── prod-pipeline.yml             # Production with gates
│   │   └── dependabot-auto-merge.yml     # Auto-merge dependencies
│   ├── CODEOWNERS                        # Code review assignments
│   └── dependabot.yml                    # Dependency updates config
│
├── src/
│   ├── backend/
│   │   ├── config/
│   │   │   ├── database.js              # Azure SQL configuration
│   │   │   └── redis.js                 # Azure Redis configuration
│   │   ├── routes/
│   │   │   ├── auth.js                  # Authentication endpoints
│   │   │   ├── products.js              # Product catalog API
│   │   │   ├── cart.js                  # Shopping cart API
│   │   │   ├── orders.js                # Order management API
│   │   │   └── user.js                  # User profile API
│   │   ├── utils/
│   │   │   └── logger.js                # Winston logging
│   │   └── server.js                    # Express application
│   │
│   ├── frontend/
│   │   ├── views/
│   │   │   ├── partials/
│   │   │   │   ├── header.ejs           # Navigation header
│   │   │   │   └── footer.ejs           # Footer
│   │   │   ├── index.ejs                # Home page
│   │   │   ├── login.ejs                # Login page
│   │   │   ├── register.ejs             # Registration page
│   │   │   ├── products.ejs             # Product catalog
│   │   │   ├── cart.ejs                 # Shopping cart
│   │   │   └── profile.ejs              # User profile
│   │   ├── public/
│   │   │   ├── js/
│   │   │   │   ├── auth.js              # Authentication logic
│   │   │   │   ├── products.js          # Product browsing
│   │   │   │   ├── cart.js              # Cart management
│   │   │   │   ├── profile.js           # Profile updates
│   │   │   │   └── main.js              # Common utilities
│   │   │   └── css/
│   │   │       └── style.css            # Application styles
│   │
│   └── database/
│       ├── migrate.js                    # Database schema migration
│       └── seed.js                       # Sample data seeding
│
├── tests/
│   ├── workflows/
│   │   ├── auth.workflow.spec.js        # Auth user flows
│   │   ├── shopping.workflow.spec.js    # Shopping journeys
│   │   └── profile.workflow.spec.js     # Profile management
│   ├── e2e/
│   │   └── frontend.spec.js             # Frontend E2E tests
│   ├── integration/
│   │   └── api.spec.js                  # Backend API tests
│   └── setup.js                         # Jest test setup
│
├── specs/
│   ├── features/
│   │   ├── authentication.md            # Auth specifications
│   │   ├── shopping-cart.md             # Cart specifications
│   │   └── product-catalog.md           # Product specifications
│   ├── user-workflows/
│   │   └── complete-scenarios.md        # Full user scenarios
│   └── DEMO_GUIDE.md                    # Demo talking points
│
├── .env.example                         # Environment template
├── .gitignore                           # Git ignore rules
├── package.json                         # Node.js dependencies
├── playwright.config.js                 # Playwright configuration
├── jest.config.js                       # Jest configuration
├── .eslintrc.js                         # ESLint rules
├── .prettierrc                          # Prettier formatting
├── README.md                            # Project overview
├── SETUP.md                             # Detailed setup guide
└── QUICKSTART.md                        # Quick start guide
```

## Key Components

### Backend (Node.js/Express)
- RESTful API with Express.js
- Azure SQL Server for data persistence
- Azure Redis for session management & caching
- JWT authentication
- Winston logging

### Frontend (EJS Templates)
- Server-side rendering with EJS
- Bootstrap 5 for responsive design
- Vanilla JavaScript for interactivity
- Progressive enhancement

### Database (Azure SQL Server)
- Users table
- Products table
- CartItems table
- Orders & OrderItems tables
- Indexed for performance

### Testing (Playwright + Jest)
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for UI
- Workflow tests for critical paths
- Cross-browser testing (Chrome, Firefox, Safari, Mobile)

### CI/CD (GitHub Actions)
- Dev: Auto-deploy on push to `develop`
- Test: Manual deployment with approval
- Prod: Manual deployment with 2 approvals
- Parallel test execution
- Security scanning with CodeQL
- Dependency updates with Dependabot

### Specifications
- Feature specifications (Markdown)
- API documentation
- User workflow scenarios
- Demo presentation guide

## Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Azure SQL Server
- **Cache:** Azure Redis Cache
- **Hosting:** Azure App Service
- **Testing:** Playwright, Jest
- **CI/CD:** GitHub Actions
- **Security:** CodeQL, Dependabot, npm audit
- **Monitoring:** Winston logging (extensible to Application Insights)

## Environment Flow

```
Local Dev → Dev Environment → Test Environment → Production
   ↓             ↓                   ↓                 ↓
Manual      Auto-deploy         Manual +          Manual +
Testing     on commit         1 approval        2 approvals
```

## Test Strategy

1. **Unit Tests:** Fast, isolated tests for business logic
2. **Integration Tests:** API endpoints with real services
3. **E2E Tests:** Full browser automation across multiple browsers
4. **Workflow Tests:** Critical business flows end-to-end
5. **Security Tests:** CodeQL, npm audit, dependency scanning

## Deployment Strategy

### Development
- Auto-deploy on every push to `develop`
- All tests must pass
- Fast feedback loop

### Test
- Manual trigger with version selection
- Full test suite execution
- Creates release candidate
- Requires 1 approval

### Production
- Manual trigger with RC tag
- Full validation suite
- Database backup before deployment
- Requires 2 approvals
- Deployment window validation
- 15-minute post-deployment monitoring

## Security Features

- Passwords hashed with bcrypt
- JWT tokens for API access
- Session management with Redis
- Helmet.js security headers
- CORS configuration
- Rate limiting
- SQL injection prevention (parameterized queries)
- XSS protection
- HTTPS in production
- GitHub secret scanning
- CodeQL code analysis
- Dependabot vulnerability alerts
