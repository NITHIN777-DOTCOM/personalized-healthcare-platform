# REST API Specifications

This document defines the REST API endpoints, request/response payloads, authentication requirements, and HTTP response codes.

---

## 1. Authentication Module

### 1.1 User Registration
*   **Method:** `POST`
*   **Route:** `/api/auth/register`
*   **Purpose:** Register a new user account.
*   **Authentication Required:** No
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!",
      "role": "PATIENT"
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "usr_981273",
        "email": "user@example.com",
        "role": "PATIENT",
        "createdAt": "2026-07-08T13:48:00.000Z"
      }
    }
    ```
*   **Status Codes:**
    *   `201 Created`: Account successfully registered.
    *   `400 Bad Request`: Validation failure (e.g., weak password, invalid email format).
    *   `409 Conflict`: Email is already registered.

### 1.2 User Login
*   **Method:** `POST`
*   **Route:** `/api/auth/login`
*   **Purpose:** Verify credentials and issue tokens.
*   **Authentication Required:** No
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "Password123!"
    }
    ```
*   **Response Body (200 OK):**
    *   *Headers:* `Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict`
    *   *Body:*
        ```json
        {
          "success": true,
          "data": {
            "accessToken": "eyJhbGciOi...",
            "user": {
              "id": "usr_981273",
              "email": "user@example.com",
              "role": "PATIENT"
            }
          }
        }
        ```
*   **Status Codes:**
    *   `200 OK`: Successful authentication.
    *   `401 Unauthorized`: Invalid credentials.

### 1.3 Token Refresh
*   **Method:** `POST`
*   **Route:** `/api/auth/refresh`
*   **Purpose:** Ingest the Refresh Token cookie and issue a new Access Token.
*   **Authentication Required:** No (Verifies incoming HttpOnly Cookie)
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOi..."
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Access Token renewed.
    *   `401 Unauthorized`: Refresh Token is expired or revoked.

### 1.4 User Logout
*   **Method:** `POST`
*   **Route:** `/api/auth/logout`
*   **Purpose:** Revoke active refresh token session and clear the authentication cookie.
*   **Authentication Required:** Yes
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logged out successfully."
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Session terminated.
    *   `401 Unauthorized`: Invalid authorization token.

---

## 2. Patients Module

### 2.1 Get Patient Profile
*   **Method:** `GET`
*   **Route:** `/api/patients/profile`
*   **Purpose:** Fetch the profile details of the authenticated patient.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "pat_129038",
        "userId": "usr_981273",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-05-15",
        "gender": "MALE",
        "phoneNumber": "+15550199"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Profile retrieved.
    *   `403 Forbidden`: User does not hold the PATIENT role.
    *   `404 Not Found`: Profile not yet created.

### 2.2 Update Patient Profile
*   **Method:** `PUT`
*   **Route:** `/api/patients/profile`
*   **Purpose:** Update demographic profile details.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:**
    ```json
    {
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1990-05-15",
      "gender": "MALE",
      "phoneNumber": "+15550199"
    }
    ```
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "pat_129038",
        "firstName": "John",
        "lastName": "Doe",
        "dateOfBirth": "1990-05-15",
        "gender": "MALE",
        "phoneNumber": "+15550199"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Profile updated.
    *   `400 Bad Request`: Validation failure.

---

## 3. Doctors Module

### 3.1 Get Clinician Profile
*   **Method:** `GET`
*   **Route:** `/api/doctors/profile`
*   **Purpose:** Fetch professional clinician profile.
*   **Authentication Required:** Yes (Role: `CLINICIAN`)
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "cln_348912",
        "userId": "usr_239847",
        "firstName": "Sarah",
        "lastName": "Smith",
        "specialty": "CARDIOLOGY",
        "licenseNumber": "LIC-987123"
      }
    }
    ```
*   **Status Codes:**
    *   `200 OK`: Profile details returned.

### 3.2 List Assigned Patients
*   **Method:** `GET`
*   **Route:** `/api/doctors/patients`
*   **Purpose:** List patients who have appointments or assignments with this clinician.
*   **Authentication Required:** Yes (Role: `CLINICIAN`)
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "pat_129038",
          "firstName": "John",
          "lastName": "Doe",
          "dateOfBirth": "1990-05-15"
        }
      ]
    }
    ```

### 3.3 Create Clinical Note
*   **Method:** `POST`
*   **Route:** `/api/doctors/notes`
*   **Purpose:** Log clinical diagnostics for a patient, triggering NLU processing.
*   **Authentication Required:** Yes (Role: `CLINICIAN`)
*   **Request Body:**
    ```json
    {
      "patientId": "pat_129038",
      "appointmentId": "apt_778129",
      "summary": "Patient reports mild chest pain. Prescribed Metoprolol 50mg daily."
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "note_556123",
        "patientId": "pat_129038",
        "clinicianId": "cln_348912",
        "summary": "Patient reports mild chest pain. Prescribed Metoprolol 50mg daily.",
        "nluEntities": {
          "medications": [{ "name": "Metoprolol", "dosage": "50mg", "frequency": "daily" }],
          "symptoms": ["chest pain"]
        },
        "createdAt": "2026-07-08T13:48:00.000Z"
      }
    }
    ```

---

## 4. Appointments Module

### 4.1 List Appointments
*   **Method:** `GET`
*   **Route:** `/api/appointments`
*   **Purpose:** View list of upcoming and past appointments. Filterable by date and role context.
*   **Authentication Required:** Yes (Role: `PATIENT` or `CLINICIAN`)
*   **Request Body:** None
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "apt_778129",
          "clinician": {
            "firstName": "Sarah",
            "lastName": "Smith"
          },
          "appointmentTime": "2026-07-15T10:00:00.000Z",
          "status": "SCHEDULED",
          "notes": "Routine checkup"
        }
      ]
    }
    ```

### 4.2 Book Appointment
*   **Method:** `POST`
*   **Route:** `/api/appointments`
*   **Purpose:** Reserve an appointment slot.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:**
    ```json
    {
      "clinicianId": "cln_348912",
      "appointmentTime": "2026-07-15T10:00:00.000Z",
      "notes": "Routine checkup"
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "apt_778129",
        "patientId": "pat_129038",
        "clinicianId": "cln_348912",
        "appointmentTime": "2026-07-15T10:00:00.000Z",
        "status": "SCHEDULED"
      }
    }
    ```

---

## 5. Health Metrics Module

### 5.1 Log Health Metrics
*   **Method:** `POST`
*   **Route:** `/api/metrics`
*   **Purpose:** Records daily logs of patient wellness metrics.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:**
    ```json
    {
      "logDate": "2026-07-08",
      "steps": 8500,
      "sleepHours": 7.5,
      "waterIntakeMl": 2200,
      "heartRateAvg": 72
    }
    ```
*   **Response Body (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "id": "mtr_441290",
        "logDate": "2026-07-08",
        "steps": 8500,
        "sleepHours": 7.5,
        "waterIntakeMl": 2200,
        "heartRateAvg": 72
      }
    }
    ```

### 5.2 Get Metrics History
*   **Method:** `GET`
*   **Route:** `/api/metrics`
*   **Purpose:** Fetch list of logs. Supports query parameters `startDate` and `endDate`.
*   **Authentication Required:** Yes (Role: `PATIENT` or `CLINICIAN`)

---

## 6. Recommendations Module

### 6.1 Get Wellness Feed
*   **Method:** `GET`
*   **Route:** `/api/recommendations`
*   **Purpose:** Call Azure Personalizer to rank and retrieve current suggestions feed.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "rec_00912",
          "content": "Drink 500ml of water now to stay hydrated.",
          "category": "HYDRATION",
          "relevanceScore": 0.95
        }
      ]
    }
    ```

### 6.2 Log Feedback / Action Taken
*   **Method:** `POST`
*   **Route:** `/api/recommendations/:id/action`
*   **Purpose:** Update recommendation state and trigger Azure Personalizer reward updates.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:**
    ```json
    {
      "action": "COMPLETED"
    }
    ```
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "message": "Feedback registered successfully."
    }
    ```

---

## 7. Medication Reminders Module

### 7.1 Create Medication Schedule
*   **Method:** `POST`
*   **Route:** `/api/medications`
*   **Purpose:** Add a prescription schedule for alerts.
*   **Authentication Required:** Yes (Role: `PATIENT`)
*   **Request Body:**
    ```json
    {
      "name": "Metoprolol",
      "dosage": "50mg",
      "frequency": "DAILY",
      "alertTime": "08:00"
    }
    ```

---

## 8. Admin Module

### 8.1 List Users
*   **Method:** `GET`
*   **Route:** `/api/admin/users`
*   **Purpose:** Fetch database users with registration metadata.
*   **Authentication Required:** Yes (Role: `ADMIN`)

---

## 9. Analytics Module

### 9.1 Fetch Health Trend Metrics
*   **Method:** `GET`
*   **Route:** `/api/analytics/trends`
*   **Purpose:** Returns statistical aggregates (averages, maximums) of health logs over time.
*   **Authentication Required:** Yes (Role: `PATIENT` or `CLINICIAN`)
*   **Response Body (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "avgSteps": 7820,
        "avgSleep": 6.8,
        "complianceRate": 0.88
      }
    }
    ```
