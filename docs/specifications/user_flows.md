# User Journeys & Flows

This document details the user journeys and operational flows for the three primary system actors: Patients, Doctors, and Administrators.

---

## 1. Patient User Journey

### 1.1 Overview
The patient journey covers registration, onboarding, daily wellness journaling, reviewing AI-powered wellness feeds, and booking medical appointments.

### 1.2 Patient Flowchart

```mermaid
graph TD
    Start([Patient visits Web App]) --> IsRegistered{Has Account?}
    
    %% Registration Pathway
    IsRegistered -- No --> Register[Register: Input Email & Password]
    Register --> ProfileOnboarding[Onboarding: Input DOB, Gender, Phone]
    ProfileOnboarding --> Login
    
    %% Authenticated Dashboard
    IsRegistered -- Yes --> Login[Login: Input Credentials]
    Login --> VerifySession{JWT Valid?}
    VerifySession -- No --> Login
    VerifySession -- Yes --> Dashboard[Patient Dashboard Home]
    
    %% Dashboard Options
    Dashboard --> SelectAction{Select Action}
    
    SelectAction -->|Log Metrics| InputMetrics[Log steps, sleep, water]
    InputMetrics --> SaveMetrics[Save Log to Database]
    SaveMetrics --> UpdateDashboard[Refresh Graphs & Goals]
    UpdateDashboard --> Dashboard
    
    SelectAction -->|View Wellness Feed| ViewRecommendations[View Personalizer Feed]
    ViewRecommendations --> ActOnRec{Click 'Complete'?}
    ActOnRec -- Yes --> LogInteraction[Send telemetry: Feed reward to Azure]
    LogInteraction --> ViewRecommendations
    ActOnRec -- No --> Dashboard
    
    SelectAction -->|Schedule Appointment| ViewClinicians[Select Clinician & Available Slot]
    ViewClinicians --> SubmitBooking[Confirm Appointment Booking]
    SubmitBooking --> APINotification[Trigger Notification Queue]
    APINotification --> Dashboard
```

---

## 2. Doctor User Journey

### 2.1 Overview
The clinician journey covers accessing patient records, analyzing health charts, and logging clinical summaries during consults, which automates medical concept extraction.

### 2.2 Clinician Flowchart

```mermaid
graph TD
    Start([Clinician visits Web App]) --> Login[Secure Login: Credentials + MFA]
    Login --> AuthCheck{Is Clinician?}
    AuthCheck -- No --> Deny[HTTP 403 Forbidden]
    AuthCheck -- Yes --> ClinDashboard[Clinician Dashboard Home]
    
    ClinDashboard --> ViewPatients[List Assigned Patients]
    ViewPatients --> SelectPatient[Select Patient Profile]
    
    SelectPatient --> ViewCharts[Analyze Health Metric Trends]
    SelectPatient --> StartConsult[Start Consultation]
    
    StartConsult --> WriteNotes[Write Unstructured Clinical Summary]
    WriteNotes --> SubmitNotes[Submit Note to Backend API]
    
    %% NLU pipeline interaction
    SubmitNotes --> ProcessNLU["Call Azure AI Language (Extract concepts)"]
    ProcessNLU --> SaveNoteDB[Save notes & parsed entities in SQL]
    SaveNoteDB --> CompleteConsult[Complete Consultation]
    CompleteConsult --> ClinDashboard
```

---

## 3. Administrator User Journey

### 3.1 Overview
The admin journey covers access control governance, monitoring system operations, and managing API routes and integrations.

### 3.2 Administrator Flowchart

```mermaid
graph TD
    Start([Admin visits Web App]) --> Login[Admin Login: Enterprise Auth]
    Login --> AuthCheck{Is Admin?}
    AuthCheck -- No --> Deny[HTTP 403 Forbidden]
    AuthCheck -- Yes --> AdminDashboard[Admin Management Portal]
    
    AdminDashboard --> SelectTool{Select Tool}
    
    SelectTool -->|User Management| ListUsers[Query Database Users]
    ListUsers --> ModifyUser[Update User Role / Revoke Access]
    ModifyUser --> SaveAudit[Write System Audit Log]
    SaveAudit --> AdminDashboard
    
    SelectTool -->|System Monitoring| ViewMonitor[Access Azure Monitor Integrations]
    ViewMonitor --> CheckMetrics[Analyze API latencies, DB lock times]
    CheckMetrics --> HealthCheck[Query /health Endpoint status]
    HealthCheck --> AdminDashboard
```
