# CMS Backend Starter

Spring Boot backend starter for the Class Management System.

## Implemented
- Auth foundation with JWT login/register
- `User` entity mapped to `users` schema
- `CourseClass` entity mapped to `classes` schema
- `Enrollment` entity + enrollment service foundation
- Security config with stateless JWT authentication
- Basic validation and global error handling

## Endpoints
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/classes` (ADMIN only)
- `GET /api/v1/classes` (ADMIN/HR/STUDENT)

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

## Run
```powershell
.\mvnw.cmd spring-boot:run
```

## Test
```powershell
.\mvnw.cmd test
```

