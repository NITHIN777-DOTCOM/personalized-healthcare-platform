# Azure Resource & Provisioning Plan

This document details the Azure resources required to deploy the **Personalized Healthcare and Wellness Platform** in production, specifying configuration pricing tiers, dependencies, deployment sequencing, and cost-optimization strategies.

---

## 1. Resource Catalog

| Azure Service | Provisioned Resource Name | Purpose | Pricing Tier | Dependencies / Links |
| :--- | :--- | :--- | :--- | :--- |
| **Resource Group** | `rg-prod-healthcare` | Logical container grouping related resources. | N/A | None |
| **Azure Key Vault** | `kv-prod-healthcare` | Secure storage of connection strings, JWT keys, and API tokens. | Standard | None |
| **Azure SQL Server** | `sql-prod-healthcare` | Database engine instance. | N/A | None |
| **Azure SQL Database** | `sqldb-prod-healthcare` | Relational database containing platform tables. | Serverless (General Purpose, Gen5, Max 4 vCores, Auto-pause enabled) | `sql-prod-healthcare` |
| **API Management** | `apim-prod-healthcare` | Gatekeeper proxy routing frontend requests to backend APIs. | Basic (or Developer for staging) | `app-prod-backend` |
| **App Service Plan** | `asp-prod-backend` | Hardware resources allocating CPU and RAM for backend tasks. | Basic B1 (Staging) / Standard S1 (Production) | None |
| **Azure App Service** | `app-prod-backend` | Hosting runtime environment for the Express Node.js API. | Premium V3 (Production, autoscaling enabled) | `asp-prod-backend`, `kv-prod-healthcare` |
| **Function App** | `func-prod-reminders` | Serverless runtime executing background timers and ingestion queues. | Consumption (Pay-per-execution) | `kv-prod-healthcare`, `sqldb-prod-healthcare` |
| **Static Web App** | `swa-prod-frontend` | Global CDN hosting static compiled React, HTML, and CSS files. | Standard | None |
| **AI Language** | `cog-prod-language` | Unstructured text processing service for medical summaries. | Standard S | None |
| **Azure Personalizer** | `cog-prod-personalizer` | Machine learning engine for ranking patient wellness feeds. | Free F0 (Staging) / Standard S0 (Production) | None |
| **Application Insights** | `appi-prod-monitoring` | Log monitoring and request trace aggregation engine. | Pay-As-You-Go | None |

---

## 2. Infrastructure Deployment Sequencing

To prevent dependency errors during infrastructure creation (e.g., trying to associate a Key Vault reference on an App Service before the Key Vault is provisioned), resources must be created in the following order:

```
Step 1: Resource Group & App Insights
               │
               ▼
Step 2: Key Vault & Azure SQL Server
               │
               ▼
Step 3: Azure SQL Database (Depends on SQL Server)
               │
               ▼
Step 4: App Service Plan & Cognitive/AI Services
               │
               ▼
Step 5: App Service Backend & Azure Functions (Reference Key Vault & DB connection strings)
               │
               ▼
Step 6: Static Web App & API Management (Configures edge routing to App Service)
```

---

## 3. Cost-Optimization Strategies

1.  **Serverless Database Configuration:**
    The Azure SQL database uses a **Serverless** compute tier. If the application is idle for more than 1 hour (e.g., in staging during off-hours), the database automatically pauses. This stops database compute costs, leaving only storage costs active, and automatically resumes when the next query hits the database.
2.  **Serverless Compute for Background Workloads:**
    Azure Functions use a **Consumption Plan**. This billing model only charges for active execution time (rounded to the nearest millisecond), meaning the platform pays nothing when background medication checks or synchronization workers are idle.
3.  **Application Insights Cap Limits:**
    To prevent runaway logging ingestion costs, staging App Insights instances are configured with a daily data ingestion cap (e.g., 1 GB per day) and standard log telemetry retention is set to 30 days.
4.  **Auto-scaling Rules:**
    Production App Service Plans use dynamic auto-scaling rules. The platform scales out (adds instances) only when average CPU usage exceeds 70% for 5 consecutive minutes, and scales in (removes instances) when CPU usage drops below 30%, optimizing resource usage.
