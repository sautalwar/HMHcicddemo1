# Quick Start Guide - GitHub CI/CD Demo

## 🚀 5-Minute Quick Start (Local Development)

### Prerequisites Check
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

### Step 1: Install Dependencies (1 minute)
```bash
npm install
npx playwright install
```

### Step 2: Set Up Environment (1 minute)
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your Azure credentials
# For local dev, you can use Docker for Redis and SQL Server (see below)
```

### Step 3: Local Services with Docker (Optional - 2 minutes)
```bash
# Start Redis and SQL Server locally
docker run -d -p 6379:6379 redis:7-alpine

# For SQL Server (Windows users may need Docker Desktop)
docker run -d \
  -e 'ACCEPT_EULA=Y' \
  -e 'SA_PASSWORD=YourStrong@Password123' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2022-latest

# Update .env for local development
# DB_SERVER=localhost
# REDIS_HOST=localhost
# REDIS_TLS=false
```

### Step 4: Initialize Database (1 minute)
```bash
npm run db:migrate
npm run db:seed
```

### Step 5: Start Application
```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

---

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Specific Test Suites
```bash
npm run test:unit           # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e            # End-to-end tests
npm run test:workflows      # User workflow tests
```

### Interactive Test UI
```bash
npm run test:e2e:ui
```

---

## 📋 Demo Checklist

### Before the Demo
- [ ] Azure resources created (Dev, Test, Prod)
- [ ] GitHub secrets configured
- [ ] GitHub environments set up
- [ ] Branch protection rules enabled
- [ ] Dependabot configured
- [ ] Application deployed to Dev
- [ ] Test deployment successful
- [ ] Production environment ready

### During the Demo
- [ ] Show architecture diagram (README.md)
- [ ] Explain tech stack (Node.js, SQL, Redis, Azure)
- [ ] Show GitHub Actions workflows
- [ ] Demonstrate parallel testing
- [ ] Show environment promotion (Dev → Test → Prod)
- [ ] Run Playwright workflow tests
- [ ] Show CodeQL security scanning
- [ ] Demonstrate approval gates
- [ ] Compare with Jenkins/Concourse
- [ ] Discuss cost savings

---

## 🎯 Key Demo Features

### 1. Complete Application
- User registration & login
- Product catalog with search
- Shopping cart functionality
- Order checkout process
- User profile management

### 2. Comprehensive Testing
- **Unit Tests:** Fast, isolated tests
- **Integration Tests:** API endpoint testing
- **E2E Tests:** Full browser automation
- **Workflow Tests:** Critical user journeys

### 3. Multi-Environment Pipeline
```
Dev (Auto) → Test (Manual + Approval) → Prod (2 Approvals)
```

### 4. Built-in Security
- CodeQL scanning
- Dependabot updates
- Secret scanning
- npm audit

### 5. Zero Infrastructure
- No servers to manage
- GitHub-hosted runners
- Azure PaaS services

---

## 📊 Demonstrable Metrics

### Test Coverage
- 5 Playwright browser configurations
- 15+ E2E test scenarios
- Critical workflow coverage
- API integration tests

### Deployment Speed
- Dev: ~5 minutes (auto-deploy)
- Test: ~8 minutes (with approval)
- Production: ~12 minutes (with gates)

### Cost Comparison
| Solution | Monthly Cost |
|----------|-------------|
| Jenkins  | ~$200+      |
| Concourse| ~$150+      |
| GitHub Actions | ~$20 |

---

## 🎤 Demo Script (15 minutes)

### Part 1: Overview (2 min)
- Show README architecture
- Explain the problem (Jenkins/Concourse complexity)
- Introduce the solution (GitHub Actions)

### Part 2: Application Demo (3 min)
- Live demo of the website
- User registration
- Browse products
- Add to cart
- Complete checkout

### Part 3: CI/CD Pipeline (5 min)
- Show `.github/workflows/` structure
- Explain dev pipeline (auto-deploy)
- Show test pipeline (manual trigger)
- Demonstrate production gates

### Part 4: Testing (3 min)
- Show Playwright tests
- Run workflow tests live
- Show test results with screenshots
- Explain parallel execution

### Part 5: GitHub Features (2 min)
- Show GitHub Environments
- Demonstrate approval process
- Show CodeQL results
- Highlight Dependabot

---

## 💡 Customer Value Proposition

### Problems Solved
1. **Infrastructure Overhead** → Zero server management
2. **Complex Pipelines** → Simple YAML workflows
3. **Manual Approvals** → Built-in environment gates
4. **Security Scanning** → Native CodeQL integration
5. **Testing Complexity** → Playwright Actions marketplace
6. **Cost** → 75% reduction vs. Jenkins

### Business Impact
- **Faster deployments:** 50% time reduction
- **Fewer errors:** Automated quality gates
- **Better security:** Built-in scanning
- **Lower costs:** $2,000+ annual savings
- **Developer productivity:** Native Git integration

---

## 🔧 Troubleshooting

### Local Development Issues

**Port already in use:**
```bash
# Change PORT in .env
PORT=3001
```

**Database connection failed:**
```bash
# Check Docker containers
docker ps

# Restart containers
docker restart <container-id>
```

**Redis connection failed:**
```bash
# Verify Redis is running
redis-cli ping
```

### Test Failures

**Playwright browser install:**
```bash
npx playwright install --with-deps
```

**Test timeout:**
```bash
# Increase timeout in playwright.config.js
timeout: 60000
```

---

## 📚 Additional Resources

- [Full Setup Guide](SETUP.md) - Detailed Azure setup
- [Demo Guide](specs/DEMO_GUIDE.md) - Talking points
- [API Documentation](specs/api/) - API specifications
- [User Workflows](specs/user-workflows/) - Test scenarios

---

## 🤝 Support

**Questions during demo prep?**
- Review the DEMO_GUIDE.md
- Check SETUP.md for Azure configuration
- Run through workflows locally first

**Live demo issues?**
- Have backup screenshots/videos ready
- Use local dev environment as fallback
- Point to GitHub repo for later review

---

## ✅ Success Criteria

Your demo is ready when:
- [ ] Application runs locally
- [ ] All tests pass
- [ ] Dev deployment successful
- [ ] You can explain each workflow
- [ ] You can answer Jenkins/Concourse comparisons
- [ ] Cost savings are clear
- [ ] Customer value proposition is memorized

---

## 🎉 Demo Day Checklist

**30 Minutes Before:**
- [ ] Start application locally (backup)
- [ ] Open GitHub repository
- [ ] Open Azure portal
- [ ] Have environment URLs ready
- [ ] Test all links
- [ ] Clear browser cache

**During Demo:**
- [ ] Record the session
- [ ] Take questions throughout
- [ ] Show real deployments
- [ ] Demonstrate failures (intentionally)
- [ ] Highlight GitHub differentiators

**After Demo:**
- [ ] Share repository link
- [ ] Provide setup documentation
- [ ] Schedule follow-up
- [ ] Send cost comparison sheet

---

**Good luck with your demo! 🚀**

Remember: The goal is to show how GitHub Actions simplifies CI/CD while providing enterprise-grade features that Jenkins and Concourse require extensive setup to achieve.
