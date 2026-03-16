# CMS Backend Starter

Spring Boot backend starter for the Class Management System.

## Implemented
- Auth foundation with JWT login (direct public register disabled)
- `User` entity mapped to `users` schema
- `CourseClass` entity mapped to `classes` schema
- `Enrollment` entity + enrollment service foundation
- `Payment` entity with student submission and HR verification flow
- Public visitor onboarding flow (class browse + payment submission + HR account activation)
- Notification module (admin broadcast or class-targeted to confirmed students)
- Role-based user management endpoints for staff creation and pending student review
- Class group chat API for confirmed students (plus HR/ADMIN visibility)
- WebSocket/STOMP realtime channel for chat and push notifications (JWT-authenticated)
- Security config with stateless JWT authentication
- Basic validation and global error handling

## Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

- `GET /api/v1/public/classes` (visitor class browse)
- `GET /api/v1/public/classes/{classId}` (visitor class detail)
- `POST /api/v1/public/onboarding/payments` (visitor submits form + KBZ payment proof)

- `POST /api/v1/classes` (ADMIN only)
- `GET /api/v1/classes` (ADMIN/HR/STUDENT)

- `POST /api/v1/enrollments/classes/{classId}` (STUDENT enroll)
- `GET /api/v1/enrollments/my` (STUDENT enrollments)

- `POST /api/v1/payments` (STUDENT submits KBZ Pay transaction)
- `GET /api/v1/payments/my` (STUDENT payment history)
- `GET /api/v1/payments/pending` (HR pending verification queue)
- `PATCH /api/v1/payments/{paymentId}/verify` (HR/ADMIN verify/reject)

- `GET /api/v1/users/me` (authenticated profile)
- `POST /api/v1/users/staff` (ADMIN creates HR/ADMIN)
- `GET /api/v1/users/students/pending` (ADMIN/HR sees inactive applicants)

- `POST /api/v1/notifications` (ADMIN sends notification)
- `GET /api/v1/notifications/my` (STUDENT inbox)
- `PATCH /api/v1/notifications/{notificationId}/read` (STUDENT mark as read)

- `GET /api/v1/chat/classes/{classId}/messages` (confirmed class members, HR, ADMIN)
- `POST /api/v1/chat/classes/{classId}/messages` (confirmed class members, HR, ADMIN)

## Realtime (Phase 2)
- WebSocket endpoint: `/ws`
- STOMP app prefix: `/app`
- Topic broker prefixes: `/topic`, `/queue`
- User queue prefix: `/user`

Client STOMP `CONNECT` must include header:
- `Authorization: Bearer <JWT>`

Chat destinations:
- Send: `/app/chat/classes/{classId}/messages`
- Subscribe: `/topic/classes/{classId}/chat`

Notification destinations:
- Subscribe: `/user/queue/notifications`
- Triggered when ADMIN sends notification via `POST /api/v1/notifications`

## Core Flow (Recommended)
1. Visitor browses classes from public endpoints.
2. Visitor submits onboarding payment (`PENDING`) with KBZ transaction ID.
   - Onboarding form includes `email` + `password`.
   - These credentials are stored, but login remains blocked while account is inactive.
3. HR verifies payment:
   - `VERIFIED` => enrollment becomes `CONFIRMED`, student account becomes active, unique `studentId` is assigned, login allowed.
   - `REJECTED` => account stays inactive until a valid re-submission.
4. Admin can send notifications to all active students or only confirmed students in a specific class.
5. Confirmed students can access class chat using their activated account.

## PostgreSQL Setup
Create the database once:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE cms;"
```

Set DB credentials in your current terminal session before running the app:

```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/cms"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_postgres_password"
```

Do not hardcode real DB credentials in `application.properties`.

## Run
```powershell
.\mvnw.cmd spring-boot:run
```

## Test
```powershell
.\mvnw.cmd test
```

