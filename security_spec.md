# Security Specification: Smart Study Tracker

## 1. Data Invariants
1. **Tenant Isolation**: Every resource belongs to a specific `schoolId`. A user belonging to School A cannot read, query, or write data belonging to School B.
2. **User Identity Integrity**: A user can only create or update their own user profile document (`/users/{uid}`) where `{uid} == request.auth.uid`.
3. **Role Elevation Prevention**: Regular users cannot elevate their own role (`role: 'principal'` or `role: 'teacher'`) after creation.
4. **Study Progress Ownership**: A student can only write study progress entries where `userId == request.auth.uid`. Parents, Teachers, and Principals of the same `schoolId` have read access to monitor progress.
5. **Study Notes Integrity**: Transcribed notes can be read by any verified member of the tenant school or global repository. Write access is restricted to Teachers and Principals.
6. **Bookmark Isolation**: User bookmarks are strictly owned by `request.auth.uid`.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Ghost Field Injection (User Profile)**: `{ uid: 'alice', email: 'alice@test.com', role: 'student', schoolId: 'school-1', ghostAdmin: true }` -> Rejected (keys mismatch).
2. **Cross-Tenant Hijack (Study Progress)**: User from `school-1` submits progress for `schoolId: 'school-2'` -> Rejected (schoolId mismatch).
3. **Identity Spoofing (Study Progress)**: User `bob` attempts to create progress with `userId: 'alice'` -> Rejected (`userId != request.auth.uid`).
4. **Role Self-Escalation**: User `student-1` attempts update `{ role: 'principal' }` -> Rejected (role is immutable).
5. **Malicious Giant ID**: Target document ID `a`.repeat(200) -> Rejected (`isValidId` size check).
6. **Denial of Wallet String Injection**: Payload with `personalNotes` exceeding limit -> Rejected.
7. **Unverified Email Access**: Write attempt by user with `email_verified == false` -> Rejected.
8. **Orphaned Bookmark**: Bookmark creation targeting non-existent or foreign user -> Rejected.
9. **Notes Deletion by Student**: Student attempts delete on `/study_notes/{noteId}` -> Rejected (only Teachers/Principals allowed).
10. **Arbitrary Status Injection**: Study progress with `status: 'hacked_status'` -> Rejected (enum restriction).
11. **Tenant Cross-Read**: Student querying `/study_progress` without tenant filter matching their own school -> Rejected.
12. **Unauthenticated Read/Write**: Anonymous request to write `/study_notes` -> Rejected.

## 3. Test Runner
Implemented in test suite verifying PERMISSION_DENIED on all 12 payloads.
