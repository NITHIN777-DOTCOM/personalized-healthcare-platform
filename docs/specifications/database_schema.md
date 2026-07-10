# Database Schema Specifications

This document defines the schema design, tables, columns, indexes, relationships, and scalability configurations for the **Personalized Healthcare and Wellness Platform** database hosted on **Azure SQL Database**.

---

## 1. Table Definitions

### 1.1 User Table
*   **Purpose:** Stores user identity credentials, role classification, and account status indicators.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key (UUIDv4).
    *   `email`: `VARCHAR(255)` - Unique, indexed, login username.
    *   `passwordHash`: `VARCHAR(255)` - Cryptographic bcrypt hash.
    *   `role`: `VARCHAR(50)` - Enforced value: `PATIENT`, `CLINICIAN`, `ADMIN`.
    *   `createdAt`: `DATETIME2` - Timestamp of account creation.
    *   `updatedAt`: `DATETIME2` - Timestamp of last modification.
*   **Indexes:**
    *   `PK_User`: Clustered Index on `id`.
    *   `UQ_User_Email`: Unique Non-Clustered Index on `email`.

### 1.2 PatientProfile Table
*   **Purpose:** Holds demographic metadata for registered patients.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key (UUIDv4).
    *   `userId`: `VARCHAR(36)` - Foreign Key referencing `User(id)` (Unique constraint).
    *   `firstName`: `VARCHAR(100)` - Patient's first name.
    *   `lastName`: `VARCHAR(100)` - Patient's last name.
    *   `dateOfBirth`: `DATE` - Date of birth.
    *   `gender`: `VARCHAR(20)` - Enforced value: `MALE`, `FEMALE`, `OTHER`.
    *   `phoneNumber`: `VARCHAR(30)` - Standard format contact number.
    *   `createdAt`: `DATETIME2`.
    *   `updatedAt`: `DATETIME2`.
*   **Relationships:**
    *   1-to-1 relationship with `User` table.
*   **Indexes:**
    *   `PK_PatientProfile`: Clustered Index on `id`.
    *   `FK_PatientProfile_User`: Non-Clustered Index on `userId`.

### 1.3 ClinicianProfile Table
*   **Purpose:** Details specialty and credentials for healthcare practitioners.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key (UUIDv4).
    *   `userId`: `VARCHAR(36)` - Foreign Key referencing `User(id)` (Unique constraint).
    *   `firstName`: `VARCHAR(100)`.
    *   `lastName`: `VARCHAR(100)`.
    *   `specialty`: `VARCHAR(150)` - Medical focus area (e.g., `CARDIOLOGY`).
    *   `licenseNumber`: `VARCHAR(100)` - Unique medical registration string.
    *   `phoneNumber`: `VARCHAR(30)`.
    *   `createdAt`: `DATETIME2`.
    *   `updatedAt`: `DATETIME2`.
*   **Relationships:**
    *   1-to-1 relationship with `User` table.
*   **Indexes:**
    *   `PK_ClinicianProfile`: Clustered Index on `id`.
    *   `FK_ClinicianProfile_User`: Non-Clustered Index on `userId`.

### 1.4 HealthMetric Table
*   **Purpose:** Tracks daily wellness logs captured from users or synced devices.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key.
    *   `patientId`: `VARCHAR(36)` - Foreign Key referencing `PatientProfile(id)`.
    *   `logDate`: `DATE` - The logging day.
    *   `steps`: `INT` - Count of daily steps.
    *   `sleepHours`: `DECIMAL(4,2)` - Checked sleep duration.
    *   `waterIntakeMl`: `INT` - Fluid intake in milliliters.
    *   `heartRateAvg`: `INT` - Average daily heart rate.
    *   `createdAt`: `DATETIME2`.
*   **Relationships:**
    *   Many-to-1 relationship with `PatientProfile`.
*   **Indexes:**
    *   `PK_HealthMetric`: Clustered Index on `id`.
    *   `UQ_Patient_Date`: Unique Composite Index on `(patientId, logDate)`. Ensures only one entry exists per day per patient.

### 1.5 Appointment Table
*   **Purpose:** Manages scheduling, bookings, and states.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key.
    *   `patientId`: `VARCHAR(36)` - Foreign Key referencing `PatientProfile(id)`.
    *   `clinicianId`: `VARCHAR(36)` - Foreign Key referencing `ClinicianProfile(id)`.
    *   `appointmentTime`: `DATETIME2` - Time of the booking.
    *   `status`: `VARCHAR(30)` - Value: `SCHEDULED`, `COMPLETED`, `CANCELLED`.
    *   `notes`: `NVARCHAR(1000)` - Description/reason for the booking.
    *   `createdAt`: `DATETIME2`.
    *   `updatedAt`: `DATETIME2`.
*   **Indexes:**
    *   `PK_Appointment`: Clustered Index on `id`.
    *   `IX_Appt_Clinician_Time`: Composite Index on `(clinicianId, appointmentTime)`. Speeds up search queries for doctor calendars.

### 1.6 Recommendation Table
*   **Purpose:** Stores AI recommendations and records telemetry responses.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key.
    *   `patientId`: `VARCHAR(36)` - Foreign Key referencing `PatientProfile(id)`.
    *   `content`: `NVARCHAR(2000)` - Recommendation text.
    *   `category`: `VARCHAR(100)` - Classification tags (`DIET`, `EXERCISE`).
    *   `relevanceScore`: `REAL` - Prediction confidence value.
    *   `actionTaken`: `VARCHAR(50)` - Value: `IGNORED`, `VIEWED`, `COMPLETED`.
    *   `feedbackReward`: `REAL` - Numeric feedback weight (-1.0 to 1.0) for reinforcement models.
    *   `createdAt`: `DATETIME2`.
*   **Indexes:**
    *   `PK_Recommendation`: Clustered Index on `id`.

### 1.7 ClinicalNote Table
*   **Purpose:** Stores diagnostics, metadata, and extracted entities.
*   **Columns:**
    *   `id`: `VARCHAR(36)` - Primary Key.
    *   `patientId`: `VARCHAR(36)` - Foreign Key.
    *   `clinicianId`: `VARCHAR(36)` - Foreign Key.
    *   `appointmentId`: `VARCHAR(36)` - Foreign Key referencing `Appointment(id)` (Unique, Optional).
    *   `summary`: `NVARCHAR(MAX)` - Unstructured clinician notes.
    *   `nluEntities`: `NVARCHAR(MAX)` - Stringified JSON containing parsed medical entities.
    *   `createdAt`: `DATETIME2`.
*   **Indexes:**
    *   `PK_ClinicalNote`: Clustered Index on `id`.

---

## 2. Future Scalability Considerations

1.  **Table Partitioning:**
    The `HealthMetric` table will accumulate millions of records over time. To preserve lookup speeds, the table will be partitioned by range on `logDate` (e.g., monthly partitions). This ensures that queries requesting recent ranges only scan active partitions.
2.  **Archiving Strategy:**
    Historical logs older than 2 years will be moved out of the primary OLTP Azure SQL Database. Background jobs will export these rows to colder, cost-effective storage (such as Azure Blob Storage as Parquet files) to keep primary database indexes small.
3.  **Read Repositories (CQRS):**
    For heavy analytics dashboard reads, read-replicas of the Azure SQL Database will be configured. Heavy data reads will target the replica database to avoid blocking transaction processing on the primary database instance.
