# System Input Validation Rules

This document establishes the validation rules for critical input fields across the system, ensuring data integrity at the client (React/TypeScript forms) and server (Express/Zod API schemas) levels.

---

## 1. Core Validation Table

| Field Name | Frontend Validation Rules | Backend (Zod Schema) Rules | Rationale |
| :--- | :--- | :--- | :--- |
| **Email Address** | • Input type: `email`<br>• Required field<br>• Regex validation for standard format | • `.string().email()` <br>• Normalize via `.toLowerCase().trim()` | Ensures compliance with standard RFC format and prevents duplicate lookups due to casing variations. |
| **Password** | • Min 8 characters, max 100 characters<br>• Requires 1 uppercase, 1 lowercase, 1 number, 1 special character | • `.string().min(8).max(100)`<br>• Regex validation against password strength rules | Enforces baseline password security before hashing algorithms execute. |
| **Heart Rate** | • Input type: `number`<br>• Enforced range: 30 to 250 BPM | • `.number().int().min(30).max(250)` | Prevents physical measurement outliers and malformed telemetry inputs. |
| **Blood Pressure (Systolic / Diastolic)** | • Separate input boxes<br>• Range checks: Systolic (70-200), Diastolic (40-130) | • `systolic: z.number().int().min(70).max(200)`<br>• `diastolic: z.number().int().min(40).max(130)` | Enforces logical physiological bounds for cardiovascular metrics. |
| **Weight (kg)** | • Decimals allowed<br>• Range check: 2.0 kg to 350.0 kg | • `.number().min(2.0).max(350.0)` | Prevents typos in weight logs. |
| **Height (cm)** | • Decimals allowed<br>• Range check: 50.0 cm to 250.0 cm | • `.number().min(50.0).max(250.0)` | Enforces valid physical height records. |
| **Appointment Date** | • Calendar block restricting past dates<br>• Enforced selection within clinician working hours | • `.string().datetime()`<br>• Custom validator checking date is in the future | Prevents booking appointments in the past or during off-hours. |
| **Medicine Name** | • Input type: `text`<br>• Max length: 150 characters<br>• Alphanumeric characters only | • `.string().trim().min(1).max(150)`<br>• Sanitized to strip script injection characters | Protects against database script injections while allowing chemical name variants. |
| **Dosage** | • Selection list or custom string<br>• Max length: 100 characters | • `.string().trim().min(1).max(100)` | Standardizes descriptions (e.g., "50mg", "1 tablet", "5ml"). |
| **Emergency Contact (Phone)** | • Validates local/international phone numbers (regex or libphone-js) | • `.string().regex(/^\+?[1-9]\d{1,14}$/)` (E.164 phone format) | Ensures contact phone numbers conform to the global E.164 standard. |

---

## 2. Frontend Validation Implementation Strategy
1.  **Form Management:** Form states must be controlled using **React Hook Form**. This prevents unnecessary UI re-renders while maintaining input states.
2.  **Schema Enforcement:** Integrate Zod schema validation using resolver packages:
    ```typescript
    // Example frontend schema declaration
    import { zodResolver } from '@hookform/resolvers/zod';
    const formOptions = { resolver: zodResolver(patientProfileSchema) };
    ```
3.  **UI Feedback:**
    *   Validation checks must run when input fields lose focus (`onBlur`).
    *   Validation errors must be displayed directly below the target input in a red alert text format.
    *   Form submit buttons must remain disabled until all required validation checks pass.

---

## 3. Backend Validation Implementation Strategy
1.  **Request Pipeline Ingestion:**
    Every Express route handler must include a schema validator middleware before reaching the controller logic.
2.  **Data Sanitization:**
    *   Strings must be trimmed (`.trim()`) to strip out leading and trailing whitespaces.
    *   Inputs containing raw HTML tags or script patterns must be rejected or escaped before database storage to prevent Cross-Site Scripting (XSS) attacks.
3.  **Validation Middleware Template:**
    ```typescript
    export const validateBody = (schema: z.ZodSchema) => {
      return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          throw new ValidationError(result.error.format());
        }
        req.body = result.data; // Assign verified data back to request
        next();
      };
    };
    ```
4.  **Transaction Sanitization:**
    If validation errors are encountered inside a database transaction block, the transaction must be explicitly aborted and rolled back to maintain database consistency.
