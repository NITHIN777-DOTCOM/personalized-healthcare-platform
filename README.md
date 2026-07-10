# PulseCare: Personalized Healthcare and Wellness Platform

PulseCare is a complete, role-based healthcare and wellness system built using **React**, **TypeScript**, **Node.js/Express**, **Prisma ORM**, and **SQLite**. It has been optimized for rapid, local execution by utilizing a lightweight SQLite database instead of PostgreSQL/Docker.

---

## 1. Project Directory Structure

```
personalized-healthcare-platform/
├── package.json               # Root package manager orchestrating installations & builds
├── prisma/                    # Root Prisma directory (holds shared schema)
│   └── schema.prisma          # Schema mapping SQLite database and client generation output
├── backend/                   # Node.js + Express API server (TypeScript)
│   ├── prisma/
│   │   ├── schema.prisma      # Local schema file referencing SQLite dev.db
│   │   ├── seed.ts            # Seeding script (adds default admin, doctors, patients, vitals)
│   │   └── dev.db             # Local SQLite database file (ignored in git)
│   ├── src/
│   │   ├── config/            # DB client & Environment configs (Zod-validated)
│   │   ├── controllers/       # Auth, Patient, Doctor, Appointment, Recommendations, Admin controllers
│   │   ├── middlewares/       # JWT Auth, Roles-guard, Request Logging, Global Error Interceptor
│   │   ├── routes/            # Sub-routers mapped into main API namespace
│   │   └── server.ts          # Express entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/                  # React Client SPA (Vite / Tailwind / TypeScript)
    ├── public/                # Static assets (including HealthSync favicon.svg)
    ├── src/
    │   ├── App.tsx            # React router, landing pages, and protected guards
    │   ├── contexts/          # AuthContext and ThemeContext (Light/Dark theme support)
    │   ├── layouts/           # Responsive DashboardLayout with theme cycle menu
    │   ├── pages/             # Login, Register, Patient, Doctor, and Admin workspaces
    │   └── services/          # Axios instance mapping VITE_API_URL environment headers
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## 2. Production Deployment Instructions

Follow these instructions to configure and prepare the platform for production.

### Prerequisites
*   [Node.js](https://nodejs.org/) (version $\ge$ 20.x)
*   [npm](https://www.npmjs.com/) (version $\ge$ 10.x)

---

### Step 1: Set Up Environment Variables

Configure environment variables by copying `.env.example` in both directories.

#### Backend (`/backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="file:./dev.db"
FRONTEND_URL="http://localhost:3000"
JWT_ACCESS_SECRET="your-super-secret-access-token-key-should-be-very-long-and-secure"
JWT_REFRESH_SECRET="your-super-secret-refresh-token-key-should-be-very-long-and-secure"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

#### Frontend (`/frontend/.env`)
Create a `.env` file in the `frontend/` folder:
```env
VITE_API_URL="http://localhost:5000/api"
```

---

### Step 2: Single-Command Production Build

To install dependencies, sync the database schemas, seed accounts, and compile both frontend and backend for production, run these root-level orchestrations:

1.  **Install all dependencies (Root, Backend, and Frontend):**
    ```bash
    npm install
    ```

2.  **Generate client & sync database:**
    ```bash
    npx prisma db push
    ```

3.  **Compile both workspaces (TS compilation and Vite compression):**
    ```bash
    npm run build
    ```
    *   Backend code compiles from `src/` to `dist/`.
    *   Frontend static assets bundle into `frontend/dist/`.

---

### Step 3: Launch in Production

Start the concurrent production server using:
```bash
npm run start
```
*   The Express API server starts on http://localhost:5000.
*   The React client SPA is served in production mode on http://localhost:3000.

---

## 3. Required Environment Variables Reference

### Backend Configuration (`backend/.env`)

| Key Name | Sample Value | Purpose |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port the Express application server listens on. |
| `NODE_ENV` | `production` | Execution profile: `development`, `production`, `test`. |
| `DATABASE_URL` | `file:./dev.db` | Connection string pointing to the SQLite database file. |
| `FRONTEND_URL` | `http://localhost:3000` | CORS authorized domain origin. |
| `JWT_ACCESS_SECRET` | `cryptographically-long-and-secure-hash` | Key to sign short-lived Access Tokens. |
| `JWT_REFRESH_SECRET` | `cryptographically-long-and-secure-hash` | Key to sign long-lived Session Tokens. |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Lifetime span of an Access Token. |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Lifetime span of a Session Refresh Token. |

### Frontend Configuration (`frontend/.env`)

| Key Name | Sample Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:5000/api` | Base URL of the API gateway (Express server). |

---

## 4. Production Deployment Checklist

- [ ] **Secrets Rotation**: Ensure `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are rotated and kept secure using environment manager interfaces (e.g. AWS Secret Manager, Render, Heroku settings). Do not commit `.env` files to git repositories.
- [ ] **SQLite Volume Persistence**: SQLite database writes to a local file (`backend/prisma/dev.db`). Ensure your deployment server (e.g., Docker, virtual machines, VPS) configures persistent storage volumes for `backend/prisma/` to avoid data loss on container rebuilds.
- [ ] **HTTPS Setup**: In production, ensure both `FRONTEND_URL` and `VITE_API_URL` point to secure `https://` protocols, and configure reverse proxies (Nginx, Cloudflare) to route requests under TLS certificates.
- [ ] **Prisma Engine Binary**: Run `npx prisma generate` during deployment steps to compile appropriate OS binary engines for Prisma Client query executions.
