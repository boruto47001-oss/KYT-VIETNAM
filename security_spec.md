# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Global Default-Deny**: All paths not explicitly matched (`/{document=**}`) deny all read and write access (`allow read, write: if false;`).
2. **Verified Identity**: Every authenticated operation requires `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Bootstrapped & DB-Backed Admin Gate**: Administrator access (`isAdmin()`) requires a verified signed-in user whose email matches the bootstrapped owner (`boruto47001@gmail.com`) with `email_verified == true`, OR whose UID exists in `/databases/$(database)/documents/admins/$(request.auth.uid)`.
4. **Path Variable Hardening (`isValidId`)**: All single-document target path variables (`{adminId}`, `{eventId}`, `{configId}`) must match `^[a-zA-Z0-9_\-]+$` and have length `>= 1` and `<= 128`.
5. **Strict Key & Volumetric Validation (`isValidTrackingEvent`, `isValidTrackingConfig`, `isValidAdminUser`)**:
   - Every string field enforces strict `.size()` bounds matching `firebase-blueprint.json`.
   - `hasAll` and `hasOnly` enforce exact key sets so shadow fields are impossible.
   - `ownerId` must equal `request.auth.uid`.
6. **Temporal Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on update. `updatedAt` must equal `request.time` on both creation and update.
7. **Immutable Event Ledger**: Documents in `/tracking_events/{eventId}` are append-only (immutable after creation; updates are forbidden except for admin cleanup via delete).
8. **Secure List Queries**: `allow list` on `/tracking_events` and `/tracking_configs` enforces `resource.data.ownerId == request.auth.uid || isAdmin()` without any `get()` or `exists()` inside the list evaluation for non-admin owner queries.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Shadow Field Injection on `tracking_events`)**: Includes `isVerified: true` alongside required fields. Rejected by `.keys().hasOnly(...)`.
2. **Payload 2 (Identity Spoofing on `tracking_events`)**: Sets `ownerId: "victim-uid-999"` while authenticated as `"attacker-uid-111"`. Rejected by `data.ownerId == request.auth.uid`.
3. **Payload 3 (Unverified Email Admin Spoof)**: Uses `email: "boruto47001@gmail.com"` with `email_verified: false`. Rejected by `request.auth.token.email_verified == true`.
4. **Payload 4 (Resource Poisoning / Oversized String)**: Sends a 10,000-character string in `targetLabel` (max 200). Rejected by `data.targetLabel.size() <= 200`.
5. **Payload 5 (ID Poisoning Attack)**: Uses document ID `event/../../bad$id!` containing invalid characters. Rejected by `isValidId(eventId)`.
6. **Payload 6 (Timestamp Forgery on `create`)**: Sends a past/future client timestamp instead of `request.time` for `createdAt`. Rejected by `incoming().createdAt == request.time`.
7. **Payload 7 (Immutable Field Mutation on `tracking_configs` update)**: Attempts to mutate `createdAt` or `ownerId` during an update. Rejected by `incoming().createdAt == existing().createdAt && incoming().ownerId == existing().ownerId`.
8. **Payload 8 (Invalid Enum Value in `eventType`)**: Sends `eventType: "sql_injection_drop_table"`. Rejected by `data.eventType in [...]`.
9. **Payload 9 (Unauthorized Self-Promotion to Admin)**: Non-admin user attempts to create `/admins/attacker-uid` with `role: "admin"`. Rejected because only `isBootstrappedAdmin()` can create `/admins/{adminId}`.
10. **Payload 10 (Update-Gap / Type Poisoning on `tracking_configs`)**: Attempts to update `ga4MeasurementId` with a boolean `true` or 500-char string. Rejected because `isValidTrackingConfig(incoming())` wraps the entire `allow update` block.
11. **Payload 11 (Unauthorized Cross-User List Scrape)**: Authenticated non-admin user queries `/tracking_events` belonging to another `ownerId`. Rejected by `resource.data.ownerId == request.auth.uid`.
12. **Payload 12 (Direct Mutation of Immutable Tracking Event)**: Attempts `update` on `/tracking_events/{eventId}`. Rejected by `allow update: if false;`.
