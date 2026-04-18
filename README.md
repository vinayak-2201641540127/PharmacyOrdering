# HCL Pharmacy Ordering Monorepo

This repository contains the HCL online pharmacy MVP as a monorepo with a React frontend and a Spring Boot backend. The implementation is based on `hclPharma design.docx`, with production-oriented updates documented in [docs/design-delta.md](docs/design-delta.md).

## Monorepo Layout

```text
.
|- backend/           # Spring Boot 3.5.10 + Java 21 + Flyway + Lombok
|- frontend/          # React + TypeScript + Vite
|- docs/              # Design updates beyond the original Word document
|- docker-compose.yml # Optional fallback, not required for local PostgreSQL
\- pom.xml            # Root Maven aggregator
```

## Architecture

### Frontend

- React with TypeScript and Vite
- Route-based screens for products, login/register, prescription upload, checkout, order history, order details, and admin review
- `AuthContext` for session state
- `CartContext` for in-memory checkout state
- Axios interceptor for automatic bearer token injection

### Backend

- Spring Boot `3.5.10`
- Java `21`
- Lombok for constructor and model boilerplate reduction
- Spring Web, Validation, Security, Data JPA
- JWT-based stateless authentication
- Flyway-managed PostgreSQL schema
- Layered package structure for `auth`, `product`, `prescription`, `order`, `security`, `config`, and `exception`

### Database

- PostgreSQL
- Flyway migrations under `backend/src/main/resources/db/migration`
- Sample product seed data included
- Core tables:
  - `users`
  - `products`
  - `prescriptions`
  - `orders`
  - `order_items`

## Local Startup

### Prerequisites

- Java `21`
- Maven `3.9+`
- Node.js `20+`
- npm `10+`
- PostgreSQL running locally

### 1. Prepare PostgreSQL

Make sure your local PostgreSQL service is running and that you have a database available for the backend.

Recommended local defaults:

- host: `localhost`
- port: `5432`
- database: `hclPharma`
- username: `postgres`
- password: `postgres`

If your local PostgreSQL uses a different port, database name, username, or password, set the matching environment variables before starting the backend.

### 2. Start The Backend

The backend reads configuration from `backend/src/main/resources/application.yml`. The datasource is environment-driven and defaults to:

```text
jdbc:postgresql://localhost:5432/hclPharma
```

Optional environment variables:

- `DATABASE_URL`
- `DATABASE_HOST`
- `DATABASE_PORT`
- `DATABASE_NAME`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`
- `PRESCRIPTION_STORAGE_DIR`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `BOOTSTRAP_ADMIN_FULL_NAME`

Run:

```bash
cd backend
mvn spring-boot:run
```

Example for a custom local setup in PowerShell:

```powershell
$env:DATABASE_PORT="5433"
$env:DATABASE_NAME="hclPharma"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="your-password"
mvn spring-boot:run
```

The API starts on `http://localhost:8080/api`.

If you want a local admin user on first startup, set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` before launching the backend.

### 3. Start The Frontend

The frontend expects the backend at `http://localhost:8080/api` by default. An example env file is available at `frontend/.env.example`.

Run:

```bash
cd frontend
npm install
npm run dev
```

The UI starts on `http://localhost:5173`.

## Key API Flows

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/prescriptions/upload`
- `GET /api/prescriptions/my`
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/{id}`
- `GET /api/admin/prescriptions`
- `PATCH /api/admin/prescriptions/{id}`

## Notes

- Uploaded prescription files are stored under the backend storage directory configured by `PRESCRIPTION_STORAGE_DIR`.
- Restricted medicines require an approved prescription before checkout succeeds.
- If PostgreSQL reports `database "hclPharma" does not exist`, verify the exact database name on your local server. If it was created through SQL without quotes, PostgreSQL may have stored it in lowercase as `hclpharma`.
- The original Word design document is preserved in the repository; implementation additions are tracked in [docs/design-delta.md](docs/design-delta.md).
