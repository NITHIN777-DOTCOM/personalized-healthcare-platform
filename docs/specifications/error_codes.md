# Standard API Error Specifications

This document defines the error response format, HTTP status mappings, and application-specific error codes for the API gateway and application servers.

---

## 1. Standard Error Envelope
All API errors returned by the backend must follow a standardized JSON structure. This ensures the frontend application can reliably parse error responses, log diagnostics, and display helpful error messages to the user.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "A user-friendly description of the error.",
    "statusCode": 400,
    "timestamp": "2026-07-08T13:52:00.000Z",
    "details": []
  }
}
```

*   **`code`:** A unique uppercase string that the client code can use to trigger conditional UI logic.
*   **`message`:** A human-readable description of the error (sanitized to remove system details in production).
*   **`statusCode`:** The HTTP status code returned in the response header.
*   **`timestamp`:** ISO 8601 timestamp of when the exception occurred.
*   **`details`:** Optional array containing detailed sub-errors (e.g., Zod schema validation errors).

---

## 2. Error Categorization & Codes

### 2.1 Validation Errors (HTTP 400 Bad Request)
Returned when request parameters, query tokens, or payload bodies fail Zod validation checks.

*   **`VAL_INVALID_FORMAT`:** An input field does not match the required format (e.g., invalid email, malformed phone number).
*   **`VAL_OUT_OF_RANGE`:** A numeric physical measurement falls outside allowed physiological bounds (e.g., heart rate > 250).
*   **`VAL_MISSING_FIELD`:** A required payload property is missing from the request body.

**Example Response for Validation Failures:**
```json
{
  "success": false,
  "error": {
    "code": "VAL_INVALID_FORMAT",
    "message": "Input validation failed.",
    "statusCode": 400,
    "timestamp": "2026-07-08T13:52:00.000Z",
    "details": [
      { "field": "email", "issue": "Invalid email address format." }
    ]
  }
}
```

### 2.2 Authentication Errors (HTTP 401 Unauthorized)
Returned when authentication credentials are missing, invalid, or expired.

*   **`AUTH_MISSING_TOKEN`:** No JWT access token was provided in the `Authorization` request header.
*   **`AUTH_INVALID_TOKEN`:** The provided JWT signature is invalid or has been modified.
*   **`AUTH_EXPIRED_TOKEN`:** The JWT token expiration time (`exp`) has passed.
*   **`AUTH_INVALID_CREDENTIALS`:** The email or password does not match any database record.

### 2.3 Authorization Errors (HTTP 403 Forbidden)
Returned when an authenticated user attempts to access a resource beyond their permitted scope.

*   **`AZ_INSUFFICIENT_ROLE`:** The user does not hold the required system role (e.g., a Patient trying to write Clinical Notes).
*   **`AZ_RECORD_OWNERSHIP`:** The user is authenticated but is attempting to access private data belonging to another patient.

### 2.4 Database & Persistence Errors (HTTP 500 / 409 Conflict)
Returned when database integrity constraints are violated or connections fail.

*   **`DB_DUPLICATE_RECORD` (HTTP 409 Conflict):** An insert query violates a unique constraint (e.g., writing duplicate logs for the same day).
*   **`DB_RECORD_NOT_FOUND` (HTTP 404 Not Found):** A lookup query returns no results (e.g., updating a patient profile that does not exist).
*   **`DB_CONNECTION_FAILURE` (HTTP 500 Internal Server Error):** The API server cannot establish a connection to the Azure SQL Database.

### 2.5 Azure Service Errors (HTTP 502 Bad Gateway)
Returned when downstream Azure cognitive or security integrations fail.

*   **`AZURE_KEY_VAULT_OUTAGE`:** Secrets, API keys, or certificates cannot be retrieved from Azure Key Vault.
*   **`AZURE_AI_LANGUAGE_ERROR`:** The Azure AI Language NLU parser returns an error or timeout.
*   **`AZURE_PERSONALIZER_FAILURE`:** The Azure Personalizer endpoint fails to rank recommendations, requiring the application to fall back to default rankings.

### 2.6 Internal Server Errors (HTTP 500)
*   **`SYS_UNKNOWN_ERROR`:** Caught by the global catch-all exception block. Details are logged securely in Application Insights, and a sanitized response is returned to the user.
