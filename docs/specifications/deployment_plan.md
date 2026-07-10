# Deployment Plan & Environments Configuration

This document outlines the hosting environments, containerization strategies, automation pipelines, and security mechanisms for deploying the platform.

---

## 1. Hosting Environments Configuration

```
[ Local Dev ] ──(PR/Merge)──> [ Testing/Staging Environment ] ──(Release Tags)──> [ Production Environment ]
  - Docker Compose              - Azure Container Apps                          - Azure App Services
  - Local SQLite/Postgres       - Azure SQL Serverless                          - Azure SQL (Elastic Pool)
  - Raw Env Variables           - Azure Key Vault (Staging)                     - Azure Key Vault (Prod)
```

### 1.1 Development Environment (Local)
*   **Hosting:** Run locally on developer machines.
*   **Database:** PostgreSQL running in a Docker container.
*   **Secrets:** Configured via a local `.env` file (not committed to source control).

### 1.2 Testing & Staging Environment (Staging)
*   **Hosting:** Deploy to **Azure Container Apps** (serverless containers) to minimize costs when idle.
*   **Database:** Azure SQL Database (Serverless Tier with auto-pause).
*   **Secrets:** Managed via Azure Key Vault (Staging instance), accessed securely using system-assigned managed identities.

### 1.3 Production Environment (Production)
*   **Hosting:**
    *   **Frontend:** Azure Static Web Apps (CDN-backed static hosting).
    *   **Backend API:** Azure App Service (Premium tier with autoscaling enabled).
*   **Database:** Azure SQL Database (Hyperscale or General Purpose with active-active geo-replication).
*   **Secrets:** Managed via Azure Key Vault (Production instance). Access is restricted to production resource instances.

---

## 2. Containerization Strategy (Docker)

*   **Multi-Stage Build Pattern:** Used to minimize production image sizes and prevent source code leakage.
*   **Backend Dockerfile Structure:**
    *   *Stage 1 (Builder):* Uses `node:20-alpine` to install all development dependencies and compile TypeScript files into JavaScript assets under a `/dist` folder. Runs Prisma client code generation.
    *   *Stage 2 (Runner):* Uses a clean `node:20-alpine` image. Copies only production-critical dependencies, compiled JS assets, and the `prisma/` folder. Runs the application process as a non-root user (`node`) to improve security.

---

## 3. CI/CD Pipelines (GitHub Actions)

The deployment pipeline is automated using GitHub Actions workflows, split into two main pipelines:

### 3.1 Continuous Integration (CI) - Run on Pull Requests to `main`
1.  **Code Check:** Performs syntax linting and formatting verifications.
2.  **Security Scan:** Scans dependencies for known vulnerabilities using Snyk or GitHub Dependabot.
3.  **Unit & Integration Tests:** Launches a local PostgreSQL Docker container, runs migrations, and executes the Jest/Vitest test suites.
4.  **Dry Run Build:** Compiles the React and Node.js applications to verify there are no compilation errors.

### 3.2 Continuous Deployment (CD) - Run on Merges to `main`
1.  **Build and Push:** Compiles the applications, builds production Docker images, and pushes them to the **Azure Container Registry (ACR)**.
2.  **Database Migration:** Runs Prisma schema migrations against the staging database using a temporary container.
3.  **Resource Deployment:** Deploys the new container image to the Azure App Service.
4.  **Slot Swap:** Swaps deployment slots (from staging to production) to enable zero-downtime releases.

---

## 4. Secrets & Environment Variables Management

*   **Zero Credentials in Source Code:** No connection strings, API tokens, or JWT signing keys are stored in the git repository or local deployment packages.
*   **Managed Identities:** Azure App Service resources connect to Azure Key Vault using system-assigned **Azure Managed Identities**. This eliminates the need to configure credentials to authenticate with the Key Vault.
*   **Configuration Mappings:**
    *   The App Service reads environment configuration variables (such as `NODE_ENV` or `PORT`) from its Application Settings.
    *   Sensitive parameters (such as `DATABASE_URL` or `JWT_SECRET`) reference Key Vault secrets directly using Key Vault reference syntax:
        `@Microsoft.KeyVault(SecretUri=https://kv-prod-platform.vault.azure.net/secrets/DatabaseUrl/)`
