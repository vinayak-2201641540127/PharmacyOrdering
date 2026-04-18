# Pharmacy Ordering Architecture

## 1. Purpose

This document describes the implemented architecture of the Pharmacy Ordering project in this repository. It is intended to help engineers, reviewers, and maintainers understand:

- how the system is split across frontend, backend, and persistence layers
- how the major business workflows are executed
- what security and operational assumptions the code currently makes
- where the current architecture is strong and where it still has MVP-era limitations

The document reflects the codebase as it exists in this repository on 2026-04-18, not only the original `hclPharma design.docx`.

## 2. System Overview

The application is a monorepo that implements an online pharmacy ordering MVP with prescription-aware checkout.

At a high level:

- the React frontend provides catalog browsing, authentication, cart, checkout, prescription upload, order history, and admin prescription review
- the Spring Boot backend exposes a REST API for authentication, products, prescriptions, and orders
- PostgreSQL stores users, products, prescriptions, orders, and order items
- prescription files are stored on the local filesystem, while file metadata is stored in PostgreSQL
- JWT is used for stateless authentication between frontend and backend

Core business rule:

- products flagged as prescription-only cannot be purchased unless the logged-in user has an approved prescription for that product

## 3. Repository Structure

```text
.
|- backend/    Spring Boot API, business logic, persistence, security
|- frontend/   React + TypeScript SPA
|- docs/       Supplemental design notes and implementation deltas
|- pom.xml     Root Maven aggregator
\- ARCHITECTURE.md
```

### Module responsibilities

- `backend/` owns domain rules, validation, authorization, order placement, prescription review, and persistence
- `frontend/` owns user interaction, route transitions, session persistence, cart state, and API consumption
- `docs/` contains supporting documentation beyond the original design handoff

## 4. Architecture Style

The solution follows a pragmatic layered monolith pattern:

- one deployable backend application
- one separately deployed SPA frontend
- one relational database
- local disk storage for uploaded files

This is not a microservices architecture. Domain areas are separated by package and by service boundary inside a single Spring Boot process.

### Why this style fits the current project

- the business scope is moderate and still cohesive
- cross-domain workflows like checkout require transactional consistency
- operational complexity remains low for local development and MVP deployment
- the codebase can evolve toward more explicit module boundaries without immediate distributed-systems overhead

## 5. Logical Topology

```text
+------------------------------+
| Browser                      |
| React SPA (Vite build)       |
+--------------+---------------+
               |
               | HTTPS / JSON / multipart
               v
+------------------------------+
| Spring Boot Backend          |
| - Auth                       |
| - Product catalog            |
| - Prescription workflows     |
| - Order workflows            |
| - JWT security               |
+---------+-----------+--------+
          |           |
          | JPA       | NIO file I/O
          v           v
+----------------+  +------------------------+
| PostgreSQL     |  | Local File Storage     |
| users          |  | prescription documents |
| products       |  | per-user subfolders    |
| prescriptions  |  +------------------------+
| orders         |
| order_items    |
+----------------+
```

## 6. Runtime Components

## 6.1 Frontend

Technology stack:

- React 18
- TypeScript
- Vite 5
- React Router 6
- Axios

Frontend entry and composition:

- `frontend/src/main.tsx` boots the SPA
- `frontend/src/App.tsx` defines the route tree
- `AuthProvider` supplies session and role state
- `CartProvider` supplies in-memory checkout/cart state
- `AppShell` provides shared navigation and page framing
- `ProtectedRoute` enforces authenticated and admin-only screens in the UI

Main route map:

- `/login`
- `/products`
- `/upload`
- `/checkout`
- `/orders`
- `/orders/:orderId`
- `/admin/prescriptions`

Frontend responsibilities:

- capture user intent and form input
- persist session in local storage
- attach bearer token to outgoing requests
- present backend validation and business-rule failures
- maintain cart state locally until checkout submission

Important architectural characteristic:

- the frontend is mostly thin and delegates business enforcement to the backend
- for example, prescription gating is inferred from backend order placement failures rather than fully prevalidated in the browser

## 6.2 Backend

Technology stack:

- Spring Boot 3.5.10
- Java 21
- Spring Web
- Spring Validation
- Spring Data JPA
- Spring Security
- Flyway
- PostgreSQL driver
- JJWT
- Lombok

Backend entry point:

- `com.hcl.pharmacyordering.PharmacyOrderingApplication`

Primary backend packages:

- `auth` for registration and login
- `product` for product retrieval
- `prescription` for upload and admin review
- `order` for order placement and retrieval
- `security` for JWT parsing and principal loading
- `user` for user model and repository
- `config` for application properties and bootstrapping
- `exception` for centralized API error handling

The backend is a layered design:

- controllers expose HTTP endpoints
- services hold business rules and orchestration
- repositories perform persistence access
- entities model relational data
- request and response DTOs isolate the API contract from JPA models

## 6.3 Database

Database platform:

- PostgreSQL

Schema management:

- Flyway migrations under `backend/src/main/resources/db/migration`
- `ddl-auto=validate` is used, so schema drift is detected instead of silently recreated

Current migrations:

- `V1__create_core_tables.sql`
- `V2__seed_products.sql`

## 6.4 File Storage

Prescription binaries are stored outside the database:

- physical files are written to `app.storage.prescriptions-dir`
- default path is `./storage/prescriptions`
- a per-user subdirectory is created at runtime
- the database stores the relative storage path and metadata, not the file contents

This keeps the relational schema simpler and avoids storing large blobs in PostgreSQL for the MVP.

## 7. Backend Domain Breakdown

## 7.1 Authentication Domain

Main classes:

- `AuthController`
- `AuthService`
- `UserAccount`
- `UserRepository`
- `JwtService`

Responsibilities:

- register customer accounts
- authenticate users by email and password
- hash passwords with BCrypt
- issue signed JWT access tokens
- return a compact user summary with each auth response

Current flow:

1. user submits email, password, and optionally full name for registration
2. email is normalized to lowercase
3. duplicate account check is performed
4. password is hashed
5. user is stored with role `CUSTOMER`
6. JWT is generated and returned

Login follows the same normalization pattern and compares the submitted password using `PasswordEncoder.matches`.

## 7.2 Product Domain

Main classes:

- `ProductController`
- `ProductService`
- `ProductRepository`
- `Product`

Responsibilities:

- list products
- retrieve a single product
- support simple search by product name at the API layer

Product records hold:

- name
- description
- price
- stock quantity
- prescription requirement flag

The product domain is currently read-oriented. There is no admin product management surface yet.

## 7.3 Prescription Domain

Main classes:

- `PrescriptionController`
- `AdminPrescriptionController`
- `PrescriptionService`
- `FileStorageService`
- `PrescriptionRepository`
- `Prescription`

Responsibilities:

- accept prescription uploads for prescription-required products
- validate file type and basic upload invariants
- persist file metadata
- expose a customer history view
- expose an admin review queue
- approve or reject pending prescriptions

Upload constraints implemented in code:

- allowed content types: PDF, PNG, JPEG
- max upload size: 5 MB via Spring multipart configuration
- only products marked `requires_prescription=true` accept uploads

Review model:

- `PENDING`
- `APPROVED`
- `REJECTED`

Architectural note:

- file access is write-only in the current API surface
- admins can review metadata and status, but there is no backend endpoint yet for downloading the stored document

## 7.4 Order Domain

Main classes:

- `OrderController`
- `OrderService`
- `OrderRepository`
- `CustomerOrder`
- `OrderItem`

Responsibilities:

- place orders
- fetch current user order history
- fetch order details

Key business rules enforced in `OrderService`:

- order requests cannot contain duplicate products
- all ordered products must exist
- prescription-only items require at least one approved prescription for the same user and product
- stock must be sufficient for each requested quantity
- stock is decremented inside the same transaction as order creation

Concurrency control:

- `ProductRepository.findAllByIdInForUpdate` uses pessimistic write locking
- this reduces oversell risk when multiple checkouts target the same product concurrently

## 8. API Design

Base path:

- `/api`

Public endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /products`
- `GET /products/{productId}`

Authenticated customer endpoints:

- `POST /prescriptions/upload`
- `GET /prescriptions/my`
- `POST /orders`
- `GET /orders/my`
- `GET /orders/{orderId}`

Admin-only endpoints:

- `GET /admin/prescriptions`
- `PATCH /admin/prescriptions/{id}`

API design characteristics:

- JSON for most requests and responses
- multipart form upload for prescriptions
- DTO responses rather than entity serialization
- `ProblemDetail` used for error payloads

## 9. Security Architecture

## 9.1 Authentication Model

The backend uses stateless bearer-token authentication:

- successful login or registration returns a JWT
- the frontend stores the token in local storage
- Axios request interceptor attaches `Authorization: Bearer <token>`
- `JwtAuthenticationFilter` resolves and validates the token for each request

JWT claims include:

- `userId`
- `role`
- `sub` as the user email

## 9.2 Authorization Model

Authorization is enforced at both backend and frontend levels.

Backend:

- `/auth/register` and `/auth/login` are public
- `GET /products/**` is public
- `/admin/**` requires role `ADMIN`
- all other routes require authentication

Frontend:

- `ProtectedRoute` blocks unauthenticated users
- `requireAdmin` blocks non-admin users from the admin review route

Important principle:

- backend authorization is the real enforcement point
- frontend route guards improve UX but do not provide security on their own

## 9.3 Password Handling

- passwords are hashed using BCrypt
- plaintext passwords are not persisted
- bootstrap admin credentials are provided through environment variables when used

## 9.4 CORS

- allowed origins are configured through `ALLOWED_ORIGINS`
- default origin is `http://localhost:5173`
- credentials are disabled

## 10. Data Model

The relational schema is intentionally compact and centered on the main business workflow.

### `users`

- stores customer and admin accounts
- unique email
- role constrained to `CUSTOMER` or `ADMIN`

### `products`

- catalog metadata and current stock position
- includes `requires_prescription` to gate regulated medication

### `prescriptions`

- links a user and a product
- stores file metadata and review state
- supports reviewer tracking and review timestamp

### `orders`

- order header owned by a user
- stores aggregate total and delivery address

### `order_items`

- line items under an order
- stores quantity and unit price snapshot

### Key relationships

- one user to many orders
- one order to many order items
- one user to many prescriptions
- one product to many prescriptions
- one product to many order items

## 11. End-to-End Business Flows

## 11.1 Registration and Login

```text
User -> Frontend login/register form
Frontend -> POST /api/auth/register or /api/auth/login
Backend AuthService -> validate + persist/verify user
Backend JwtService -> issue token
Frontend -> save session in localStorage and set bearer token
```

Outcome:

- the user becomes authenticated in the SPA
- role information becomes available for UI routing and admin navigation

## 11.2 Product Browsing

```text
User -> Products page
Frontend -> GET /api/products
Backend -> ProductService -> ProductRepository
Database -> product rows
Frontend -> render cards, search locally in memory
```

Architectural note:

- the frontend currently performs the visible search filtering client-side after fetching all products
- the backend also has search support, but the current page implementation does not call it during typing

## 11.3 Prescription Upload

```text
Authenticated user -> Upload page
Frontend -> GET /api/products + GET /api/prescriptions/my
User selects regulated product and file
Frontend -> multipart POST /api/prescriptions/upload
Backend -> validate product + validate file + store file
Backend -> persist prescription metadata with PENDING status
Frontend -> refresh local history list
```

## 11.4 Admin Review

```text
Admin -> Review Queue page
Frontend -> GET /api/admin/prescriptions
Backend -> return pending prescriptions
Admin approves/rejects
Frontend -> PATCH /api/admin/prescriptions/{id}
Backend -> update status, reviewer, reviewedAt
Frontend -> remove reviewed item from queue
```

## 11.5 Checkout and Order Placement

```text
User adds items to in-memory cart
User submits checkout form
Frontend -> POST /api/orders
Backend -> lock products for update
Backend -> validate prescriptions and stock
Backend -> decrement stock and save order
Frontend -> clear cart and navigate to order history
```

This is the most transactionally sensitive workflow in the system.

## 12. State Management

## 12.1 Frontend Session State

`AuthContext` manages:

- current access token
- current user summary
- authenticated/admin booleans
- login, logout, register actions

Persistence strategy:

- session is stored in `localStorage`
- token is mirrored into the Axios client through `setApiToken`

## 12.2 Frontend Cart State

`CartContext` manages:

- items in the cart
- quantity changes
- removal
- computed totals

Characteristics:

- cart state is only in memory
- cart is lost on full reload
- backend has no server-side cart resource

## 12.3 Backend State

The backend is stateless with respect to login session:

- no HTTP session storage
- no server-side shopping cart
- all request authentication is derived from JWT

## 13. Configuration and Environment

Main backend configuration areas in `application.yml`:

- datasource URL and credentials
- JWT secret and token lifetime
- CORS allowed origins
- prescription storage directory
- multipart upload limits
- optional bootstrap admin properties
- server port and `/api` context path

Frontend configuration:

- `VITE_API_BASE_URL` controls the API base URL
- default fallback is `http://localhost:8080/api`

## 14. Error Handling Strategy

The backend centralizes exception handling in `ApiExceptionHandler`.

Handled categories include:

- resource not found
- business rule violation
- bad credentials
- upload too large
- bean validation failure

Response format:

- Spring `ProblemDetail`
- validation errors also include an `errors` map keyed by field name

This gives the frontend a predictable structure for rendering failures.

## 15. Testing Posture

Current visible automated testing is minimal but present.

Observed test coverage:

- `OrderServiceTest` validates successful order placement and duplicate-product rejection

Implication:

- the most critical business workflow has at least a starter unit test
- overall coverage is still low for a production-grade system

Recommended next expansions:

- authentication service tests
- prescription service tests
- repository integration tests with Flyway schema
- controller/security tests for access control

## 16. Deployment View

The architecture supports straightforward deployment in three units:

1. static frontend build served by a web server or CDN
2. Spring Boot backend process
3. PostgreSQL instance

An additional writable filesystem location is required for prescription uploads.

Minimum deployment concerns:

- persistent storage for uploaded documents
- secure secret management for `JWT_SECRET`
- CORS alignment between deployed frontend and backend origins
- database backups
- file backup strategy aligned with prescription retention expectations

## 17. Scalability and Operational Characteristics

### Current strengths

- backend remains simple to deploy and reason about
- PostgreSQL provides strong consistency for core transactions
- pessimistic locking reduces stock race conditions
- stateless auth makes backend horizontal scaling feasible

### Current limits

- local filesystem storage makes multi-instance deployment harder unless shared storage is introduced
- no asynchronous processing for uploads, review notifications, or fulfillment
- no caching layer for product catalog or read-heavy endpoints
- no observability stack is defined in the repository

## 18. Architectural Risks and Gaps

These are important implementation realities surfaced by the codebase.

### 18.1 Frontend includes a built-in mock admin session

`AuthContext` initializes to a hardcoded `MOCK_DESIGN_SESSION` if no stored session exists.

Impact:

- the UI behaves as authenticated admin by default in a fresh browser session
- this does not bypass backend security, but it can confuse manual testing and architecture expectations

### 18.2 Upload UX and backend limit are inconsistent

The backend enforces a 5 MB upload limit, but the upload page text says files are allowed up to 10 MB.

Impact:

- users may receive unexpected server-side rejection

### 18.3 Admin review does not expose the actual document

Admins can see metadata and status but do not have an API to fetch or preview the uploaded file.

Impact:

- the review flow is incomplete from an operational standpoint

### 18.4 Product search behavior is split

The backend supports server-side search, but the frontend currently fetches all products and filters locally.

Impact:

- workable for MVP scale
- less efficient as catalog size grows

### 18.5 Payment is presentational only

The checkout page collects card-like fields, but no payment gateway integration exists in the backend.

Impact:

- payment fields are UX scaffolding rather than a real payment architecture

### 18.6 File storage is not cloud-ready by default

Prescription files are stored on local disk relative to the backend process.

Impact:

- replicas need shared storage or object storage migration
- disaster recovery must include both database and file assets

## 19. Recommended Evolution Path

If the project moves beyond MVP, the most valuable architectural next steps are:

1. remove the mock frontend session and rely only on real authentication
2. add secure prescription file retrieval for admin review
3. move prescription binaries to object storage or shared persistent storage
4. add integration tests for security, migrations, and end-to-end order rules
5. align frontend search with backend search parameters for larger catalogs
6. add audit logging and operational metrics around uploads, reviews, and order failures
7. replace placeholder payment UX with real payment orchestration or clearly mark it as non-functional

## 20. Summary

The implemented system is a layered monolith with a clean separation between SPA frontend, Spring Boot backend, PostgreSQL persistence, and filesystem-backed prescription storage. The architecture is appropriate for an MVP because it keeps operational complexity low while still enforcing important business rules such as stateless authentication, role-based admin review, approved-prescription gating, and transactional stock reduction.

The main architectural work remaining is not structural rewrites but production hardening:

- close the UX-to-backend inconsistencies
- complete the admin prescription review loop
- strengthen testing and observability
- replace local-only assumptions in authentication and file storage
