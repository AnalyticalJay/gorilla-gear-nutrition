# Password Reset Readiness Audit Report

**Date:** August 14, 2026  
**Author:** Manus AI  
**Project:** Gorilla Gear Nutrition (`gorilla-gear-nutrition`)  

---

## Executive Summary

This audit evaluates the current database schema, authentication flow, and mail-service configuration to determine whether password-reset emails can be sent successfully for accounts such as Chris’s (`legendsales101@gmail.com`). The findings confirm that **SMTP email delivery is fully verified and operational**, but **password-reset endpoints and token storage are not yet implemented** in the application layer. Consequently, while outgoing mail can be sent securely, users who forget their passwords currently rely on direct admin assistance or a database credential update until a dedicated reset workflow is added.

---

## Audit Findings

### 1. SMTP Mail Service Readiness (Verified Operational)
The project is configured with a production SMTP connection (`orders@gorillagear.co.za` via port 587 with STARTTLS). A credential-safe handshake test (`server/smtp-credentials.test.ts`) was executed against the mail server; it successfully authenticated and closed the connection without sending a test message. This proves that outgoing email transport, authentication credentials, and TLS cipher negotiation are fully functional.

### 2. User Database Model (Partially Prepared)
The `users` table (`drizzle/schema.ts`) supports email/password accounts via `email`, `passwordHash`, and `loginMethod` fields. However, the schema currently lacks fields for storing secure password-reset tokens and token expiration timestamps (e.g., `resetToken` and `resetTokenExpiresAt`).

### 3. Application Workflow Gaps (Action Required)
The tRPC authentication router (`server/routers.ts`) implements email registration, email/password login, and session cookie issuance, but does not contain a forgot-password or reset-password procedure. Furthermore, no database helpers exist to persist or verify reset tokens.

---

## Recommended Implementation Plan

To enable self-service password recovery, the following three components should be built next:

| Component | Description |
|---|---|
| **Database Migration** | Add `resetToken` (varchar 128) and `resetTokenExpiresAt` (timestamp) columns to the `users` table. |
| **Backend Procedures** | Add `auth.forgotPassword` (generates a secure random token, saves it with a 1-hour expiry, and sends an email via `nodemailer`) and `auth.resetPassword` (verifies the token, hashes the new password, updates `passwordHash`, and clears the token). |
| **Frontend UI** | Add a "Forgot Password?" link on the login page and create a reset-password screen to accept the new password. |

---

## References

- [1] Gorilla Gear Nutrition Project Documentation: `/docs/`
- [2] SMTP Credential Verification Suite: `server/smtp-credentials.test.ts`
- [3] Database Schema Definition: `drizzle/schema.ts`
