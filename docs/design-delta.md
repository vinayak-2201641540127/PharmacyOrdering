# HCL Pharma Design Delta

This document captures implementation decisions and architectural updates that were required while turning `hclPharma design.docx` into a maintainable monorepo.

## Source Baseline

The Word document defines the MVP scope clearly:

- React frontend
- Spring Boot backend
- PostgreSQL database
- JWT-based authentication
- Product browsing
- Prescription uploads
- Order placement with stock updates

It also reflects hackathon assumptions such as a two-hour build window and `spring.jpa.hibernate.ddl-auto=create-drop`.

## Changes Added Beyond The Word Document

### Repository Structure

- Created a monorepo layout with `frontend/`, `backend/`, and `docs/`.
- Added a root `pom.xml` to make the backend module explicit inside the repository.
- Added a root `.gitignore` for Java, React, IDE, and runtime storage artifacts.

### Backend Runtime And Architecture

- Locked the backend to Spring Boot `3.5.10`.
- Locked Java to `21`.
- Added Lombok for constructor, builder, and accessor reduction without using overly broad annotations such as `@Data` on entities.
- Introduced a layered backend structure with separate packages for `auth`, `product`, `order`, `prescription`, `security`, `config`, `exception`, and `user`.
- Added DTO-based request and response models instead of exposing JPA entities directly.
- Added validation and central API error handling with `ProblemDetail`.

### Database And Persistence

- Replaced the hackathon `create-drop` approach with Flyway migrations and `ddl-auto=validate`.
- Added explicit SQL constraints and indexes for the core tables.
- Extended the schema with fields that were implied but not modeled in the Word file:
  - `products.description`
  - `created_at` timestamps
  - `prescriptions.reviewed_by`
  - `prescriptions.reviewed_at`
  - `prescriptions.content_type`
  - `prescriptions.file_size`
  - `prescriptions.storage_path`
- Added a `REJECTED` prescription status because real review flows need both approval and rejection outcomes.
- Seeded sample products through Flyway to make the local environment usable immediately after migration.

### Security

- Implemented BCrypt password hashing and stateless JWT authentication.
- Added role-based authorization with `CUSTOMER` and `ADMIN`.
- Added an optional bootstrap admin flow through environment variables:
  - `BOOTSTRAP_ADMIN_EMAIL`
  - `BOOTSTRAP_ADMIN_PASSWORD`
  - `BOOTSTRAP_ADMIN_FULL_NAME`
- Kept public product browsing open while protecting order and prescription operations.

### API Surface Adjustments

The Word document listed the patient-facing APIs, but the business logic also required admin review support. The backend therefore adds:

- `GET /api/admin/prescriptions`
- `PATCH /api/admin/prescriptions/{id}`
- `GET /api/prescriptions/my`

These were necessary to complete the prescription review loop described in the business flow.

### Order Processing Improvements

- Added duplicate-product validation for a single order request.
- Added pessimistic row locking on products during checkout to reduce stock race conditions.
- Enforced approved prescriptions before restricted items can be ordered.
- Kept order creation and stock mutation in one transaction.

### Prescription File Handling

- Implemented local filesystem storage for uploaded prescription files under the configured storage directory.
- Restricted uploads to `pdf`, `png`, and `jpeg`.
- Enforced the 5 MB upload limit through Spring multipart configuration.

### Frontend Architecture

- Implemented the React app with TypeScript and Vite.
- Added route-level separation for:
  - login/register
  - products
  - prescription upload
  - checkout
  - order history
  - order details
  - admin prescription review
- Implemented `AuthContext`, `CartContext`, and an Axios bearer-token interceptor as requested in the design.
- Added a dedicated admin queue page because the original frontend page list did not include the review UI required by the prescription business flow.

### Local Development Experience

- Added environment-driven datasource settings for local PostgreSQL instances.
- Added `docker-compose.yml` as an optional fallback for teams that want a disposable PostgreSQL instance.
- Added `.env.example` for the frontend API URL.
- Replaced the Word document's hardcoded local settings with environment-driven configuration where appropriate.

## Word Document Items Updated In Practice

These are the most important places where the implementation intentionally diverges from the original document:

- `spring.jpa.hibernate.ddl-auto=create-drop` was replaced with Flyway migrations plus schema validation.
- The prescription flow now supports both approval and rejection, not only approval.
- Admin APIs and UI were added because the business flow depended on them even though the original page/API list did not show them.
- The schema is more explicit and safer than the abbreviated SQL shown in the document.
