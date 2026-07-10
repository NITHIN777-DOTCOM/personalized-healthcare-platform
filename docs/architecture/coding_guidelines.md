# Coding Guidelines & Standards

This document establishes the code quality rules, conventions, Git workflows, and testing expectations for the engineering team.

---

## 1. Naming & Folder Conventions

### 1.1 Naming Rules
*   **Variables, Functions, Properties:** Use `camelCase`. (e.g., `isUserAuthenticated`, `fetchMetricsData()`).
*   **Classes, Interfaces, Types, Enums:** Use `PascalCase`. (e.g., `PatientController`, `IHealthMetric`, `UserRole`).
*   **File Names:**
    *   **React Components:** `PascalCase` matching the component name (e.g., `DashboardCard.tsx`).
    *   **TypeScript Modules/Utilities:** `camelCase` or `kebab-case` (e.g., `patientService.ts`, `jwt-verify.ts`).
    *   **Style Sheets / Configs:** `kebab-case` (e.g., `global-theme.css`, `tailwind.config.js`).
*   **Database Tables (Prisma Models):** Singular `PascalCase` (e.g., `PatientProfile`, `ClinicalNote`).
*   **Constants:** `UPPER_CASE` with underscores (e.g., `MAX_RETRY_ATTEMPTS`, `JWT_EXPIRY_MS`).

### 1.2 Folder Conventions
*   **Backend:** Organised into self-contained domain feature folders under `src/modules/<feature>/` containing `routes.ts`, `controller.ts`, `service.ts`, `repository.ts`, and `schema.ts`.
*   **Frontend:** Group files by role (`components`, `hooks`, `pages`) with subdirectory structures separating shared components from feature-specific layout grids.

---

## 2. API Design & REST Principles

*   **HTTP Methods Usage:**
    *   `GET`: Retrieve resources. Must be idempotent and safe (no state modification).
    *   `POST`: Create new resources or trigger complex state actions (e.g., `/api/auth/login`).
    *   `PUT`: Replace an existing resource entirely.
    *   `PATCH`: Apply partial modifications to a resource.
    *   `DELETE`: Soft-delete or archive a resource.
*   **Endpoint Naming:** Use plural nouns representing resources. Avoid putting action verbs in paths.
    *   *Correct:* `POST /api/appointments`, `GET /api/patients/:id`
    *   *Incorrect:* `POST /api/createAppointment`, `GET /api/getPatientDetails/:id`
*   **Response Envelopes:**
    *   **Successful Response (2xx):**
        ```json
        {
          "success": true,
          "data": { ... }
        }
        ```
    *   **Failed Response (4xx/5xx):**
        ```json
        {
          "success": false,
          "error": {
            "code": "INVALID_INPUT",
            "message": "The provided daily steps value must be a positive integer.",
            "details": []
          }
        }
        ```

---

## 3. Input Validation & Error Handling

### 3.1 Validation Strategy
*   **Backend:** Validate all request query parameters, URL segments, and payload bodies at the route entry point using **Zod**. Reject invalid requests before they reach the controller layer.
*   **Frontend:** Integrate validation using tools like React Hook Form with Zod schema resolution, catching user interface errors prior to sending HTTP payloads.

### 3.2 Error Handling Architecture
*   Extend a baseline custom error class (`AppError`) to manage application-level exceptions:
    ```typescript
    export class AppError extends Error {
      constructor(
        public readonly statusCode: number,
        public readonly errorCode: string,
        message: string
      ) {
        super(message);
      }
    }
    ```
*   Use asynchronous Express routing wrappers (e.g. `express-async-errors`) to capture uncaught errors and route them automatically to the **Global Error Middleware**.
*   Never return raw system errors or SQL exceptions in production HTTP payloads.

---

## 4. Logging Strategy

*   **Log Engine:** Use a structured JSON logging tool (e.g., `winston` or `pino`).
*   **Metadata Requirements:** Every log message must include:
    *   Timestamp (ISO format).
    *   Environment level (`development`, `production`).
    *   Contextual request indicators (e.g., correlation ID).
    *   Matching log level (`INFO`, `WARN`, `ERROR`).
*   **Security Constraint:** **Never** log sensitive personal information (PII/PHI) such as patient names, birthdates, or authentication passwords.
*   **Production Streams:** Configure logs to forward directly to **Azure Application Insights**.

---

## 5. Branching & Git Commit Conventions

### 5.1 Git Branching
*   Follow a **Trunk-Based Development** model with short-lived feature branches branching from `main`.
*   Branch naming format: `feature/<ticket-id>-<description>` or `bugfix/<ticket-id>-<description>`.
*   Direct pushes to `main` are strictly blocked. All code must merge via Pull Requests (PRs).

### 5.2 Commit Message Format
Commit messages must conform to the **Conventional Commits** standard:
```
<type>(<scope>): <subject>

[optional body]
```
*   **Types:**
    *   `feat`: A new user-facing feature.
    *   `fix`: A bug fix.
    *   `docs`: Documentation changes.
    *   `refactor`: Code restructuring without modifying behavior.
    *   `test`: Adding or modifying tests.
    *   `ci`: CI/CD configuration files and scripts.
*   **Example:** `feat(auth): integrate JWT validation middleware`

---

## 6. Environment Variables

*   All runtime configurations must be read from environment variables.
*   Do not define secrets, keys, or endpoints inside the code repository.
*   Provide a `.env.example` file in the root directory outlining the required variables.
*   **Backend Validation:** Use a configuration loader module that parses and validates all `process.env` properties at application startup. If a required key is missing, crash the process immediately to prevent misconfigured instances.

---

## 7. Testing Standards

*   **Unit Tests:** Focus on testing business rules inside the services using mock databases. Write tests using Jest or Vitest. Aim for a minimum code coverage target of **80%**.
*   **Integration Tests:** Verify endpoint behaviors, controller parsing, and authentication middleware. Run tests against a Dockerized database instance.
*   **End-to-End Tests (E2E):** Use Playwright to automate vital user interactions (e.g., patient login, metric log entry, and doctor appointment scheduling).
