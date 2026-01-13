# GitHub CI/CD Demo - Modern Application Platform

## Overview
This demo showcases GitHub's enterprise-grade CI/CD capabilities for a modern web application using:
- **Node.js** for backend API and frontend
- **Azure SQL Server** for relational data storage
- **Azure Redis Cache** for session management and caching
- **Playwright** for comprehensive end-to-end testing
- **GitHub Actions** for automated CI/CD pipelines
- **GitHub Environments** for deployment promotion with protection rules

## Why GitHub vs Jenkins/Concourse?

### Key Advantages:
1. **Native Integration**: CI/CD lives alongside your code - no separate infrastructure to maintain
2. **GitHub Environments**: Built-in approval gates, secrets management, and deployment history
3. **GitHub Actions Marketplace**: 20,000+ pre-built actions vs custom scripts
4. **Branch Protection Rules**: Enforce quality gates before merging
5. **Dependabot**: Automated dependency updates and security patches
6. **Code Scanning**: Built-in security analysis (CodeQL)
7. **Zero Infrastructure**: No Jenkins servers to maintain or Concourse workers to manage

## Architecture

```
┌─────────────────┐
│   User/Browser  │
└────────┬────────┘
         │
    ┌────▼────────────┐
    │  Frontend (SPA) │
    │   Node.js/EJS   │
    └────┬────────────┘
         │
    ┌────▼──────────────┐
    │   Backend API     │
    │   Express.js      │
    └─┬──────────────┬──┘
      │              │
┌─────▼─────┐  ┌────▼─────┐
│Azure SQL  │  │  Redis   │
│  Server   │  │  Cache   │
└───────────┘  └──────────┘
```

## Project Structure

```
.
├── .github/
│   ├── workflows/          # CI/CD pipelines
│   │   ├── dev-pipeline.yml
│   │   ├── test-pipeline.yml
│   │   └── prod-pipeline.yml
│   └── CODEOWNERS         # Auto-assign reviewers
├── specs/                 # Specification documents
│   ├── features/
│   ├── api/
│   └── user-workflows/
├── src/
│   ├── backend/           # Express.js API
│   ├── frontend/          # Frontend application
│   └── database/          # SQL scripts
├── tests/
│   ├── e2e/              # Playwright end-to-end tests
│   ├── integration/      # Backend integration tests
│   └── workflows/        # User workflow tests
└── infrastructure/        # Azure infrastructure as code
```

## Demo User Workflows

1. **User Registration & Login**
2. **Product Catalog Browsing**
3. **Shopping Cart Management**
4. **Order Placement**
5. **User Profile Management**

## Getting Started

### Prerequisites
- Node.js 18+
- Azure subscription
- GitHub account

### Local Development
```bash
npm install
npm run dev
```

### Running Tests
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

## Deployment Pipeline

### Environment Flow
```
Dev → Test → Production
```

### Protection Rules
- **Dev**: Auto-deploy on push to `develop` branch
- **Test**: Requires successful tests + manual approval
- **Production**: Requires successful tests + 2 approvals + scheduled deployment window

## Key GitHub Features Demonstrated

1. **GitHub Actions Workflows** - Automated CI/CD
2. **Environments & Protection Rules** - Controlled deployments
3. **Branch Protection** - Quality gates
4. **Code Review** - Pull request workflows
5. **Secrets Management** - Secure credential storage
6. **Deployment History** - Full audit trail
7. **Status Checks** - Required passing tests
8. **Dependabot** - Automated dependency updates

## License
MIT
