# Setup Instructions - GitHub CI/CD Demo

## Prerequisites

Before running this demo, you'll need:

1. **Azure Account**
   - Active Azure subscription
   - Contributor access to create resources

2. **GitHub Account**
   - GitHub repository
   - Actions enabled

3. **Local Development**
   - Node.js 18+ installed
   - Git installed
   - Code editor (VS Code recommended)

---

## Step 1: Clone and Setup Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd HMHcicddemo1

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

---

## Step 2: Azure Resources Setup

### 2.1 Create Azure Resources

```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "<your-subscription-id>"

# Create resource groups
az group create --name github-demo-dev-rg --location eastus2
az group create --name github-demo-test-rg --location eastus2
az group create --name github-demo-prod-rg --location eastus2
```

### 2.2 Create Azure SQL Server and Database

```bash
# Dev environment - Get your Azure AD user ID first
USER_ID=$(az ad signed-in-user show --query id -o tsv)

# Create SQL Server with Azure AD-only authentication (required by policy)
az sql server create \
  --name github-demo-dev-sql \
  --resource-group github-demo-dev-rg \
  --location eastus2 \
  --enable-ad-only-auth \
  --external-admin-principal-type User \
  --external-admin-name $(az ad signed-in-user show --query userPrincipalName -o tsv) \
  --external-admin-sid $USER_ID

# Create database
az sql db create \
  --resource-group github-demo-dev-rg \
  --server github-demo-dev-sql \
  --name github_demo \
  --service-objective S0

# Allow Azure services
az sql server firewall-rule create \
  --resource-group github-demo-dev-rg \
  --server github-demo-dev-sql \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Repeat for Test and Production environments
```

### 2.3 Create Azure Redis Cache

```bash
# Dev environment
az redis create \
  --name github-demo-dev-redis \
  --resource-group github-demo-dev-rg \
  --location eastus2 \
  --sku Basic \
  --vm-size c0

# Get Redis keys
az redis list-keys \
  --name github-demo-dev-redis \
  --resource-group github-demo-dev-rg

# Repeat for Test and Production environments
```

### 2.4 Create Azure Container Apps

```bash
# Create Container Apps environment (Dev)
az containerapp env create \
  --name github-demo-dev-env \
  --resource-group github-demo-dev-rg \
  --location eastus2

# Create Container App (Dev) - will be deployed via GitHub Actions
az containerapp create \
  --name github-demo-dev \
  --resource-group github-demo-dev-rg \
  --environment github-demo-dev-env \
  --image mcr.microsoft.com/azuredocs/containerapps-helloworld:latest \
  --target-port 3000 \
  --ingress external \
  --query properties.configuration.ingress.fqdn

# Note: Initial image is a placeholder. GitHub Actions will deploy your actual app.

# Repeat for Test and Production environments
```

---

## Step 3: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### 3.1 Development Environment Secrets

```
DEV_DB_SERVER: github-demo-dev-sql.database.windows.net
DEV_DB_DATABASE: github_demo
DEV_DB_USER: sqladmin
DEV_DB_PASSWORD: <your-password>
DEV_REDIS_HOST: github-demo-dev-redis.redis.cache.windows.net
DEV_REDIS_PASSWORD: <your-redis-key>
```

### 3.2 Test Environment Secrets

```
TEST_DB_SERVER: github-demo-test-sql.database.windows.net
TEST_DB_DATABASE: github_demo
TEST_DB_USER: sqladmin
TEST_DB_PASSWORD: <your-password>
TEST_REDIS_HOST: github-demo-test-redis.redis.cache.windows.net
TEST_REDIS_PASSWORD: <your-redis-key>
```

### 3.3 Production Environment Secrets

```
PROD_DB_SERVER: github-demo-prod-sql.database.windows.net
PROD_DB_DATABASE: github_demo
PROD_DB_USER: sqladmin
PROD_DB_PASSWORD: <your-password>
PROD_REDIS_HOST: github-demo-prod-redis.redis.cache.windows.net
PROD_REDIS_PASSWORD: <your-redis-key>
PROD_RESOURCE_GROUP: github-demo-prod-rg
STORAGE_KEY: <your-storage-key>
```

### 3.4 Azure Credentials

Create service principals for each environment:

```bash
# Dev
az ad sp create-for-rbac \
  --name "github-demo-dev-sp" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/github-demo-dev-rg \
  --sdk-auth

# Copy output to AZURE_CREDENTIALS_DEV secret

# Repeat for Test and Production
```

---

## Step 4: Configure GitHub Environments

Go to Settings → Environments

### 4.1 Create Development Environment

- Name: `development`
- No protection rules (auto-deploy)
- Add environment secrets

### 4.2 Create Test Environment

- Name: `test`
- Protection rules:
  - ☑ Required reviewers: 1
  - ☑ Wait timer: 0 minutes
- Add environment secrets

### 4.3 Create Production Environment

- Name: `production`
- Protection rules:
  - ☑ Required reviewers: 2
  - ☑ Deployment branches: Only `main` or tags matching `rc-*`
  - ☑ Wait timer: 5 minutes (optional)
- Add environment secrets

---

## Step 5: Configure Branch Protection

Go to Settings → Branches → Add rule

### For `develop` branch:

- ☑ Require pull request reviews before merging
- ☑ Require status checks to pass before merging
  - Select: lint-and-format, unit-tests, integration-tests, e2e-tests
- ☑ Require branches to be up to date before merging
- ☑ Include administrators

### For `main` branch:

- ☑ Require pull request reviews before merging (2 approvals)
- ☑ Require status checks to pass before merging
- ☑ Require branches to be up to date before merging
- ☑ Include administrators
- ☑ Restrict who can push to matching branches

---

## Step 6: Local Development Setup

### 6.1 Update `.env` file

```env
NODE_ENV=development
PORT=3000

DB_SERVER=github-demo-dev-sql.database.windows.net
DB_DATABASE=github_demo
DB_USER=sqladmin
DB_PASSWORD=<your-password>
DB_ENCRYPT=true

REDIS_HOST=github-demo-dev-redis.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=<your-redis-key>
REDIS_TLS=true

SESSION_SECRET=local-dev-secret-change-this
JWT_SECRET=local-dev-jwt-secret-change-this
```

### 6.2 Run Database Migrations

```bash
npm run db:migrate
```

### 6.3 Seed Database

```bash
npm run db:seed
```

### 6.4 Start Application

```bash
npm run dev
```

Visit http://localhost:3000

---

## Step 7: Run Tests Locally

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:workflows

# Run tests with UI
npm run test:e2e:ui
```

---

## Step 8: Deploy Application

### 8.1 Initial Development Deployment

```bash
# Create develop branch
git checkout -b develop
git push origin develop
```

This will trigger the dev pipeline automatically.

### 8.2 Deploy to Test

1. Go to Actions → Test Environment Pipeline
2. Click "Run workflow"
3. Enter the git commit SHA or tag to deploy
4. Click "Run workflow"
5. Approve the deployment when prompted

### 8.3 Deploy to Production

1. Get the release candidate tag from Test deployment
2. Go to Actions → Production Deployment Pipeline
3. Click "Run workflow"
4. Enter the RC tag (e.g., `rc-20260112-143022`)
5. Select deployment window
6. Click "Run workflow"
7. Two approvers must approve the deployment

---

## Step 9: Configure App Service Settings

For each App Service (Dev, Test, Prod):

```bash
az webapp config appsettings set \
  --resource-group github-demo-dev-rg \
  --name github-demo-dev \
  --settings \
    NODE_ENV=production \
    DB_SERVER=<your-db-server> \
    DB_DATABASE=github_demo \
    DB_USER=sqladmin \
    DB_PASSWORD=<your-password> \
    DB_ENCRYPT=true \
    REDIS_HOST=<your-redis-host> \
    REDIS_PORT=6380 \
    REDIS_PASSWORD=<your-redis-key> \
    REDIS_TLS=true \
    SESSION_SECRET=<generate-random-secret> \
    JWT_SECRET=<generate-random-secret>
```

---

## Step 10: Verify Deployment

### Health Checks

```bash
# Dev
curl https://github-demo-dev.azurewebsites.net/health

# Test
curl https://github-demo-test.azurewebsites.net/health

# Production
curl https://github-demo-prod.azurewebsites.net/health
```

### Check Application

1. Visit each environment URL
2. Register a test account
3. Browse products
4. Add to cart
5. Complete checkout
6. Verify order in profile

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if firewall rules allow your IP
az sql server firewall-rule create \
  --resource-group github-demo-dev-rg \
  --server github-demo-dev-sql \
  --name AllowMyIP \
  --start-ip-address <your-ip> \
  --end-ip-address <your-ip>
```

### Redis Connection Issues

```bash
# Verify Redis is running
az redis show \
  --name github-demo-dev-redis \
  --resource-group github-demo-dev-rg \
  --query provisioningState
```

### App Service Logs

```bash
# Enable logging
az webapp log config \
  --name github-demo-dev \
  --resource-group github-demo-dev-rg \
  --application-logging filesystem \
  --level information

# Stream logs
az webapp log tail \
  --name github-demo-dev \
  --resource-group github-demo-dev-rg
```

### GitHub Actions Debugging

Add to your workflow:

```yaml
- name: Debug
  run: |
    echo "Environment: ${{ github.environment }}"
    echo "Ref: ${{ github.ref }}"
    env
```

---

## Cost Management

### Estimate Monthly Costs

- **App Service (B1):** ~$13/month × 3 = $39
- **Azure SQL (S0):** ~$15/month × 3 = $45
- **Redis (Basic C0):** ~$16/month × 3 = $48
- **Total:** ~$132/month

### Cost Optimization

```bash
# Stop Dev/Test environments after hours
az webapp stop --name github-demo-dev --resource-group github-demo-dev-rg

# Start before work
az webapp start --name github-demo-dev --resource-group github-demo-dev-rg
```

---

## Next Steps

1. **Customize the application** for your specific demo needs
2. **Add more tests** to cover additional scenarios
3. **Integrate monitoring** (Application Insights)
4. **Set up alerts** for failures
5. **Configure custom domain** for production

---

## Support

For issues or questions:
- Open an issue in the repository
- Contact the Solution Engineering team
- Refer to the DEMO_GUIDE.md for presentation tips
