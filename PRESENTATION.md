# GitHub CI/CD Demo - Sales Presentation

## Presentation Overview (30 minutes)

**Audience:** Customer using Jenkins and Concourse  
**Goal:** Demonstrate GitHub's superior CI/CD capabilities  
**Key Message:** GitHub Actions replaces complex CI infrastructure with native, powerful automation

---

## Opening (3 minutes)

### Introduction
"Good [morning/afternoon]. Today I'm going to show you how GitHub Actions can transform your CI/CD pipeline while eliminating the complexity and cost of Jenkins and Concourse."

### Current State Assessment
**Questions to ask:**
- How much time does your team spend maintaining Jenkins/Concourse?
- How many people are dedicated to CI/CD infrastructure?
- What's your monthly cloud cost for CI/CD runners?
- How long does a typical deployment take?
- How do you handle approvals and compliance?

### Demo Preview
"I'm going to show you a real-world application with:
- Full-stack Node.js application
- Azure SQL Server and Redis
- Comprehensive testing with Playwright
- Multi-environment deployment pipeline
- Built-in security scanning
- All running on GitHub Actions"

---

## Part 1: The Application (5 minutes)

### Live Demo
**Navigate to:** https://github-demo-dev.azurewebsites.net

**Demonstrate:**
1. **Home Page**
   - "This is a production-ready e-commerce application"
   - Point out the environment badge (Dev/Test/Prod)

2. **User Registration**
   - Register with: demo-[timestamp]@example.com
   - "Notice instant registration and login"

3. **Product Catalog**
   - Show products with real-time stock
   - Demonstrate search functionality
   - "Products cached in Redis for performance"

4. **Shopping Cart**
   - Add items to cart
   - Update quantities
   - "Cart state persisted in SQL Server"

5. **Checkout**
   - Complete an order
   - Show order in profile
   - "Full transactional integrity with database"

**Key Points:**
- Real application, not a toy demo
- Azure SQL Server backend
- Redis caching
- Production-ready architecture

---

## Part 2: The Problem with Jenkins/Concourse (5 minutes)

### Jenkins Pain Points

**1. Infrastructure Overhead**
```
Your Current Setup:
┌─────────────┐
│   Jenkins   │ ← EC2 instance ($50-200/mo)
│   Master    │ ← Always running
└──────┬──────┘
       │
   ┌───┴────┬────────┐
   │        │        │
   Agent  Agent  Agent  ← More EC2 ($50+/each)
```

"You need to:
- Provision and maintain servers
- Apply security patches
- Manage plugins
- Scale manually
- Pay for idle time"

**2. Complex Configuration**
```groovy
// Jenkins Groovy Pipeline (complex)
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        // ... more complex syntax
    }
}
```

**3. Separate Tools**
- Jenkins for CI/CD
- GitHub for code
- Separate approval system
- Different authentication
- Multiple UIs to manage

### Concourse Pain Points

**1. Heavy YAML Configuration**
```yaml
# Concourse requires extensive YAML for simple tasks
resources:
  - name: repo
    type: git
jobs:
  - name: test
    plan:
      - get: repo
        trigger: true
      # ... many more lines
```

**2. Resource Management**
- Workers to maintain
- Complex resource types
- Steep learning curve

---

## Part 3: The GitHub Actions Solution (10 minutes)

### Architecture Comparison

**Before (Jenkins/Concourse):**
```
Code → Jenkins/Concourse → Manual Scripts → Azure
       ↑                   ↑
   Separate Login    Custom Everything
```

**After (GitHub Actions):**
```
Code → GitHub Actions → Azure
       ↑
   One Platform
```

### Live Demo: The Workflows

**Open GitHub Repository**

#### 1. Development Pipeline

**Navigate to:** `.github/workflows/dev-pipeline.yml`

**Highlight:**
```yaml
jobs:
  lint-and-format:
    runs-on: ubuntu-latest  # ← No infrastructure setup!
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4  # ← Marketplace action
      - run: npm run lint
```

**Key Points:**
- "See `runs-on: ubuntu-latest`? That's it. No EC2, no maintenance."
- "Notice `uses: actions/setup-node@v4` - from marketplace, not custom script"
- "Parallel jobs - lint, unit tests, integration tests, e2e tests"

**Show the workflow running:**
- Click "Actions" tab
- Show recent dev pipeline run
- Point out parallel execution
- Show test results

#### 2. Environment Promotion

**Navigate to:** "Environments" tab

**Show:**
- Development (auto-deploy)
- Test (1 approval required)
- Production (2 approvals required)

**Explain:**
"This is built into GitHub. No plugins, no custom code. Just:
```yaml
environment:
  name: production
```

And you get:
- Approval gates
- Deployment history
- Audit trail
- Environment-specific secrets"

#### 3. Testing Excellence

**Navigate to:** `tests/workflows/shopping.workflow.spec.js`

**Show code:**
```javascript
test('@workflow Complete shopping journey', async ({ page }) => {
  // User registration
  await page.goto('/register');
  
  // Browse products
  await page.goto('/products');
  
  // Add to cart
  await page.click('[data-testid="add-to-cart"]');
  
  // Checkout
  await page.click('[data-testid="checkout-button"]');
  
  // Verify order
  await expect(page).toHaveURL('/profile');
});
```

**Explain:**
"These are full end-to-end user workflow tests. They:
- Run on every PR
- Test across 5 browsers (Chrome, Firefox, Safari, Mobile)
- Produce screenshots on failure
- Run in parallel on GitHub runners"

**Show test results:**
- Navigate to Actions → Recent run
- Click on E2E tests
- Show playwright report artifact
- Download and open report (if time)

#### 4. Security Built-In

**Navigate to:** "Security" tab

**Show:**
- CodeQL analysis results
- Dependabot PRs
- Secret scanning (if available)

**Explain:**
"This is all built-in. No configuration needed:
```yaml
- uses: github/codeql-action/analyze@v3  # One line!
```

Compare to Jenkins:
- Need plugins
- Manual setup
- Separate scanning tools
- Different dashboards"

---

## Part 4: Deployment in Action (5 minutes)

### Trigger a Test Deployment

**Live Demo:**

1. **Navigate to:** Actions → Test Environment Pipeline

2. **Click:** "Run workflow"

3. **Show workflow inputs:**
   - Version to deploy
   - Explain how to select commit/tag

4. **Explain the pipeline:**
   ```
   Validation
      ↓
   Full Test Suite (parallel)
      ↓
   Security Scan
      ↓
   Deploy to Test ← Requires approval
      ↓
   Smoke Tests
      ↓
   Create Release Candidate
   ```

5. **Show approval gate:**
   - Someone must approve
   - Can require specific people
   - Can set wait times

6. **Compare to Jenkins:**
   - "In Jenkins, you'd need custom code for approvals"
   - "In GitHub, it's built-in configuration"

### Production Deployment Protection

**Navigate to:** Settings → Environments → production

**Show:**
- Required reviewers: 2
- Deployment branches: only `rc-*` tags
- Protection rules

**Explain:**
"For production, we require:
- 2 approvals from specific teams
- Deployment from release candidate tags only
- Automated smoke tests after deployment
- 15-minute monitoring period
- All built into GitHub"

---

## Part 5: Cost & ROI (2 minutes)

### Cost Comparison

**Current Jenkins/Concourse Setup:**
```
Infrastructure:
- Jenkins master:        $100/month
- 3 build agents:        $150/month
- Storage:               $30/month
- Maintenance:           10 hours/month × $100/hr = $1,000

Total: $1,280/month = $15,360/year
```

**GitHub Actions:**
```
Usage:
- 2,000 free minutes/month
- Typical usage: ~300 minutes/month
- Additional if needed: ~$10-20/month
- Maintenance: 0 hours

Total: $20/month = $240/year
```

**Savings: $15,120/year**

**Plus:**
- No infrastructure management
- No security patching
- No downtime maintenance
- Developer time saved

### Time Savings

**Jenkins/Concourse:**
- Deploy time: 30-45 minutes
- Manual approvals: Email/Slack coordination
- Pipeline debugging: Hours

**GitHub Actions:**
- Deploy time: 15-20 minutes
- Approvals: Built-in UI, notifications
- Pipeline debugging: Live logs, easy re-runs

---

## Q&A Preparation

### Common Questions

**Q: "Can we use our existing Azure infrastructure?"**
A: "Absolutely! GitHub Actions integrates seamlessly with Azure. We use:
- Azure Web Apps for hosting
- Azure SQL for database
- Azure Redis for caching
All deployed directly from GitHub Actions."

**Q: "What about our Jenkins jobs we've already built?"**
A: "We can migrate incrementally:
1. Start with new projects on GitHub Actions
2. Migrate simple pipelines first
3. Run both in parallel during transition
4. Move complex pipelines last
Typical migration: 6-8 weeks"

**Q: "How do we handle secrets and credentials?"**
A: "GitHub has built-in secrets management:
- Repository secrets
- Environment-specific secrets
- Organization secrets
- OIDC for Azure (no static credentials needed)"

**Q: "Can we use self-hosted runners if needed?"**
A: "Yes! GitHub Actions supports:
- GitHub-hosted runners (free tier included)
- Self-hosted runners (on your infrastructure)
- Mix of both
Most customers use GitHub-hosted for 95% of workloads"

**Q: "What about compliance and audit trails?"**
A: "GitHub provides:
- Full deployment history
- Who approved what and when
- Immutable logs
- SOC 2, ISO 27001 certified
- Better audit trail than Jenkins"

**Q: "How does testing work for mobile apps?"**
A: "This demo shows web with Playwright across desktop and mobile browsers. GitHub Actions also supports:
- iOS testing with macOS runners
- Android testing with Linux runners
- Device farms integration
- Appium for native apps"

---

## Closing (2 minutes)

### Summary

"Let me summarize what we've seen today:

**1. Real Application**
- Full-stack e-commerce site
- Production-ready architecture
- Azure SQL and Redis backend

**2. Zero Infrastructure**
- No servers to maintain
- Instant runners
- Auto-scaling included

**3. Comprehensive Testing**
- Unit, integration, E2E, workflow tests
- Parallel execution across 5 browsers
- Screenshots and videos on failure

**4. Built-in Security**
- CodeQL code scanning
- Dependabot for dependencies
- Secret scanning
- One line of YAML

**5. Native Approvals**
- Environment protection rules
- Multiple approvers
- Deployment history
- Full audit trail

**6. Massive Savings**
- $15,000+ per year
- 80 hours of maintenance time saved
- Faster deployments
- Better developer experience"

### Call to Action

"I'd like to propose:

**Next Week:**
- Technical deep-dive with your DevOps team
- Review your current Jenkins/Concourse setup
- Create migration plan

**Month 1:**
- Pilot project on GitHub Actions
- Run in parallel with existing CI
- Training for your team

**Month 2:**
- Migrate 2-3 key pipelines
- Measure time and cost savings
- Expand to more projects

**Does this timeline work for you?"**

### Leave-Behind Materials

"I'm sharing with you:
1. **This demo repository** - clone and try yourself
2. **Setup guide** - step-by-step Azure configuration
3. **Cost comparison spreadsheet** - your specific savings
4. **Migration checklist** - phase-by-phase plan

Any questions?"

---

## Demo Checklist

### Before Presentation
- [ ] Application deployed and working
- [ ] Test accounts created
- [ ] Recent successful pipeline runs
- [ ] Test results available to show
- [ ] CodeQL results visible
- [ ] Dependabot PRs available
- [ ] Approval workflow ready
- [ ] Cost spreadsheet prepared
- [ ] Migration timeline ready

### During Presentation
- [ ] Record the session
- [ ] Share screen clearly
- [ ] Show live application
- [ ] Demonstrate workflows
- [ ] Highlight test results
- [ ] Compare costs
- [ ] Answer questions

### After Presentation
- [ ] Share repository link
- [ ] Send documentation
- [ ] Provide cost analysis
- [ ] Schedule follow-up
- [ ] Send meeting notes

---

## Backup Plans

### If Application is Down
- Use local development version
- Show screenshots/videos
- Focus on workflow YAML files

### If Pipeline Fails During Demo
- "This is actually perfect - let me show you the debugging features"
- Show logs, re-run capabilities
- Explain how GitHub helps troubleshoot

### If Questions Get Technical
- Offer to schedule technical deep-dive
- Provide documentation links
- Connect with Solutions Architect

---

## Success Metrics

**Demo is successful if:**
- Customer understands GitHub Actions value
- Clear cost savings identified
- Technical feasibility confirmed
- Next steps scheduled
- Migration timeline agreed

**Follow-up actions:**
- Send proposal within 24 hours
- Schedule technical workshop
- Provide trial access
- Assign Solutions Architect

---

**Remember:** The goal isn't just to show features—it's to demonstrate how GitHub Actions solves their specific pain points with Jenkins/Concourse while saving money and improving developer experience.
