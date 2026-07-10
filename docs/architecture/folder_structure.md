# Scalable Production Folder Structure

This document outlines the directory structure designed for the **Personalized Healthcare and Wellness Platform**. It outlines modular boundaries, separating backend domain logic from frontend presentation, and organizing configuration scripts.

---

## 1. Directory Tree Overview

```
personalized-healthcare-platform/
├── .github/
│   ├── workflows/            # GitHub Actions CI/CD pipelines
│   └── ISSUE_TEMPLATE/       # Automated templates for bug reports & features
├── docker/
│   ├── backend.dockerfile    # Multi-stage Dockerfile for the Express API
│   ├── frontend.dockerfile   # Dockerfile for React build and Nginx hosting
│   └── docker-compose.yml    # Orchestration configuration for local development
├── docs/
│   ├── architecture/         # Architectural specification documents (NFRs, ERD)
│   └── guides/               # Onboarding, environment setup, and deployment guides
├── scripts/
│   ├── db-seed.ts            # Script to populate mock patients & clinical slots
│   └── provision-azure.sh    # Azure CLI scripts for infrastructure creation
├── tests/
│   ├── e2e/                  # End-to-End integration test suite (Playwright)
│   └── load/                 # Performance and load testing scripts (k6)
├── frontend/                 # React Client SPA (TypeScript / Tailwind)
│   ├── public/               # Public assets (icons, manifest.json)
│   ├── src/
│   │   ├── assets/           # Images, logo graphics, global styles
│   │   ├── components/       # Reusable atom/molecule UI components (Buttons, Inputs)
│   │   ├── context/          # React context instances (e.g., AuthContext)
│   │   ├── hooks/            # Custom React Query state hooks
│   │   ├── layouts/          # Grid frame components (DashboardLayout, GuestLayout)
│   │   ├── pages/            # Page view controllers (Login, PatientDashboard)
│   │   ├── routes/           # Route configuration and authentication guards
│   │   ├── services/         # API HTTP client configurations (Axios wrappers)
│   │   ├── utils/            # General helpers, date formatters, and assertions
│   │   ├── App.tsx           # Base application component
│   │   └── main.tsx          # Frontend entry point
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tsconfig.json         # TypeScript compiler configurations
│   └── vite.config.ts        # Vite build tool settings
└── backend/                  # Node.js Express API (TypeScript)
    ├── prisma/
    │   ├── schema.prisma     # Prisma relational database design
    │   ├── seed.ts           # Primary Prisma database seeding entry
    │   └── migrations/       # Auto-generated SQL migration history files
    ├── src/
    │   ├── config/           # Application configuration variables & SDK initializers
    │   ├── middleware/       # Global Express middlewares (Auth, Error, Logging)
    │   ├── modules/          # Domain-driven features (Clean Architecture slices)
    │   │   ├── auth/         # Sign-in, sign-up, JWT generation module
    │   │   ├── patient/      # Profile management, health logging module
    │   │   ├── doctor/       # Clinician dashboard, clinical logging module
    │   │   ├── appointment/  # Booking, calendar schedules module
    │   │   └── recommendation/ # Personalizer recommendations feed module
    │   │       ├── controller.ts  # Input parsing and HTTP response mapping
    │   │       ├── service.ts     # Core domain logic and cognitive orchestration
    │   │       ├── repository.ts  # Database access layer (Prisma calls)
    │   │       ├── schema.ts      # Zod validation schema definition
    │   │       └── routes.ts      # Routing registration path declarations
    │   ├── utils/            # Loggers, errors, mathematical utils
    │   └── server.ts         # Server bootstrapper & port listener
    ├── package.json          # Backend dependencies & run scripts
    └── tsconfig.json         # TypeScript configurations
```

---

## 2. Directory Mappings & Explanations

### 2.1 `.github/`
*   **Purpose:** Houses configurations specific to GitHub repository automation.
*   **Key Contents:** 
    *   `workflows/`: Declarative YAML pipelines executing tests, running code formatting linters, building Docker images, and deploying changes to Azure App Services.
    *   `ISSUE_TEMPLATE/`: Prompts developers to supply reproducible steps and environmental variables when logging bugs.

### 2.2 `docker/`
*   **Purpose:** Contains container configuration files ensuring development environments match cloud production specifications.
*   **Key Contents:** Separate, multi-stage `Dockerfiles` for frontend and backend compilation. Production builds utilize a lightweight Alpine-Node base for the API, and an Nginx container to serve the static frontend bundles.

### 2.3 `docs/`
*   **Purpose:** Serves as the central knowledge base of the platform.
*   **Key Contents:** Contains system architecture blueprints, user onboarding documentation, API schemas, and non-functional requirements.

### 2.4 `scripts/`
*   **Purpose:** Stores CLI utility automation scripts.
*   **Key Contents:** Includes database seeding routines to generate mock medical metrics, and Azure Bicep/ARM configuration files for standard infrastructure provisioning.

### 2.5 `tests/`
*   **Purpose:** Houses system-level integration and performance validation assets.
*   **Key Contents:**
    *   `e2e/`: Intercepts client navigation paths via Playwright/Cypress to verify form completion, login sequences, and route protections.
    *   `load/`: Integrates tool configuration scripts (such as k6 or Artillery) to simulate concurrent active user conditions.

### 2.6 `frontend/`
*   **Purpose:** Contains the React SPA codebase.
*   **Design Pattern:** Organizes files by mechanical role (e.g., components vs. hooks) while keeping routing separate. 
    *   `components/`: Holds visual widgets (e.g., standard layout containers, input fields, notification popups).
    *   `hooks/`: Decouples React Query API data fetching logic from the presentation layer. Each hook manages data synchronization, loading states, and mutations.

### 2.7 `backend/`
*   **Purpose:** Contains the Express API codebase.
*   **Design Pattern:** Employs a **feature-slice** pattern within `modules/`. Each domain slice encapsulates its controllers, services, repositories, schemas, and routes. This encapsulates code changes within the module, improving maintainability compared to having separate, global controllers or repositories folders.
    *   `prisma/`: Declares database tables and schema structures. Maintains standard migration scripts.
