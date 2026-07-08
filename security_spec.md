# Firebase Security Specification

## 1. Data Invariants
- **Lead Access**: Only authenticated users of the agency can read or write leads.
- **Data Completeness**: Every lead must contain a unique `id`, `businessName`, `ownerName`, `email`, `phone`, `category`, `location`, and a valid workflow `status`.
- **Size Limits**: String attributes like `businessName` and `ownerName` are strictly capped at 200 characters to prevent buffer and Denial-of-Wallet attacks.

## 2. The "Dirty Dozen" Adversarial Payloads
Below are 12 test payloads designed to probe update gaps and privileged modifications. Each must be rejected by the hardened Firestore security layer:

1. **Unauthenticated Read**: Attempting to read `/leads/lead_1` without a valid token.
2. **Unauthenticated Write**: Attempting to create a lead without a valid token.
3. **Identity Spoofing**: Attempting to modify fields on behalf of another user.
4. **Massive ID Injection**: Attempting to set a 2MB string as the document ID.
5. **Shadow Field Injection**: Injecting a hidden field `isAdmin: true` into a lead update payload.
6. **Negative Budget Injection**: Updating invoice values to a negative price.
7. **Invalid Status Transition**: Bypassing CRM stages (e.g. going from `discovered` to `paid_and_deployed` without payment ref).
8. **Missing Required Fields**: Creating a lead without `businessName` or `ownerName`.
9. **String Size Overrun**: Sending a 10,000-character string as the category.
10. **Type Mismatch**: Sending `googleRating` as a boolean.
11. **Immutability Breach**: Attempting to change `id` or `createdAt` on update.
12. **Client-Assigned Timestamp**: Attempting to set `updatedAt` to a historical or future date instead of `request.time`.

## 3. Test Runner Definition
The `firestore.rules` are configured to intercept and reject all of these vectors.
