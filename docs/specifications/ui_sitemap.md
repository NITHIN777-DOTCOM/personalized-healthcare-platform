# User Interface Sitemap & Navigation

This document defines the page routing hierarchy, visual layout structures, navigation flows, and access controls for the frontend application.

---

## 1. Page Hierarchy Tree

```
/ (Root)
│
├── [Public Routes]
│   ├── Landing Page (Home)
│   │   ├── Features Overview
│   │   ├── Platform Security Overview
│   │   └── About Us / Support Link
│   │
│   ├── Authentication
│   │   ├── Login (`/login`)
│   │   ├── Register / Sign Up (`/register`)
│   │   └── Forgot Password (`/forgot-password`)
│   
├── [Protected Routes: Patient Context] (`/patient/*`)
│   ├── Dashboard Home (`/patient/dashboard`)
│   │   ├── Daily Metrics Logging Widget
│   │   ├── AI Wellness Feed (Personalizer recommendations)
│   │   └── Quick Stats Summary
│   │
│   ├── Analytics Trends (`/patient/analytics`)
│   │   ├── Steps & Sleep Charts (Recharts)
│   │   └── Export Clinical Log (PDF/CSV download)
│   │
│   ├── Appointments (`/patient/appointments`)
│   │   ├── Book New Appointment
│   │   └── Upcoming & Historic Bookings List
│   │
│   ├── Medication Tracker (`/patient/medications`)
│   │   ├── Schedule Reminders
│   │   └── Log Taken Medications
│   │
│   └── Profile & Settings (`/patient/profile`)
│       ├── Demographic details form
│       └── System Preferences (Dark mode, notifications)
│
├── [Protected Routes: Clinician Context] (`/doctor/*`)
│   ├── Dashboard Home (`/doctor/dashboard`)
│   │   ├── List of Assigned Patients
│   │   ├── Upcoming Consultations Queue
│   │   └── Clinician Availability Schedule Manager
│   │
│   ├── Patient Case File (`/doctor/patients/:id`)
│   │   ├── Patient Demographic Details
│   │   ├── Health Log Analytics & Visualizations
│   │   └── Clinical Notes Logger (Azure AI text processing)
│   │
│   └── Profile & Settings (`/doctor/profile`)
│
└── [Protected Routes: Admin Context] (`/admin/*`)
    ├── Dashboard Home (`/admin/dashboard`)
    │   ├── Core System Statistics
    │   └── Integration Status Console
    │
    ├── User Management (`/admin/users`)
    │   ├── User Search and Role Modification Console
    │   └── Audit Logging Logs
    │
    └── System Settings (`/admin/settings`)
```

---

## 2. Navigation Structure

### 2.1 Navigation Layout Modules
The UI contains two primary layout wrappers matching authorization states:
1.  **Guest Layout (Unauthenticated):**
    *   **Header:** Standard branding logo, "Features" link, "About" link, and a Call-to-Action (CTA) button routing to `/login` or `/register`.
    *   **Footer:** Privacy policies, terms of service, and support resources.
2.  **Dashboard Layout (Authenticated):**
    *   **Sidebar (Desktop) / Bottom Bar (Mobile):** Holds navigational icons matching the user's role context (e.g., Dashboard, Analytics, Appointments, Profile).
    *   **User Header Toolbar:** Displays current role indicators, system notification counters, and a user dropdown menu containing "Profile & Settings" and a "Sign Out" action.

### 2.2 Routing & Navigation Rules
*   **Redirect Rules:**
    *   If an unauthenticated user attempts to access any route under `/patient/*`, `/doctor/*`, or `/admin/*`, they are redirected to `/login`.
    *   If an authenticated user navigates to `/login` or `/register`, they are redirected to their corresponding home dashboard based on their role claims.
*   **Breadcrumbs:** All sub-dashboard views (e.g., Patient Case File `/doctor/patients/:id`) must display breadcrumbs to allow single-click return navigation.
*   **Responsive Collapsing Sidebar:** The main dashboard sidebar must automatically collapse into a hamburger menu on tablet and mobile viewports.
