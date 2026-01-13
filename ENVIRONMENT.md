# Environment Configuration Guide

This project uses different environment configurations for local development and production deployment.

## Environment Files

- **`.env.example`** - Template file showing all required variables (commit to git)
- **`.env.development`** - Local development with Azure resources (DO NOT commit)
- **`.env.production`** - Production/container settings (DO NOT commit)

## Local Development Setup

1. Copy the example file:
   ```bash
   cp .env.example .env.development
   ```

2. Update `.env.development` with your Azure resource details:
   - SQL Server name
   - Database name
   - Redis host and password
   - Session and JWT secrets

3. Make sure you're logged into Azure CLI:
   ```bash
   az login
   ```

4. Start the app:
   ```bash
   npm run start:local
   # or with auto-reload
   npm run dev
   ```

## Running Database Migrations

```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

## Production/Container Deployment

The production environment uses:
- **Managed Identity** for SQL Server authentication (no password needed)
- **Container App secrets** for Redis password, session secret, and JWT secret
- Environment variables set directly in Azure Container App

The `.env.production` file is only used as a fallback. Container App environment variables take precedence.

## Available Scripts

- `npm run start:local` - Start with local development environment
- `npm run start:prod` - Start with production environment
- `npm run dev` - Development mode with auto-reload
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Security Notes

⚠️ **Never commit `.env.development` or `.env.production` to git!**

These files are in `.gitignore` to prevent accidental commits of sensitive credentials.
