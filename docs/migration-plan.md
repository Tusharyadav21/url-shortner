# Migration Plan: Monolith to Microservices

## Phase 0 - Preparation

1. Freeze existing production behavior and document current endpoints.
2. Capture current data model for users, urls, and visit history.
3. Define service boundaries: Auth, URL, Analytics.
4. Decide shared tech: MongoDB, Redis, Queue, JWT strategy.

## Phase 1 - Auth Service Extraction

1. Create auth service skeleton.
2. Implement signup, login, refresh token endpoints.
3. Add JWT issuance and verification strategy.
4. Add user store and password hashing.
5. Update monolith or URL service to validate JWT.

## Phase 2 - URL Service Isolation

1. Create URL service skeleton.
2. Move URL creation and redirect logic to URL service.
3. Add Redis caching for hot redirects.
4. Add queue producer for visit events.
5. Update frontend to use URL service routes.

## Phase 3 - Analytics Service

1. Create analytics service skeleton.
2. Implement queue consumer for visit events.
3. Build rollup tables for daily metrics.
4. Expose analytics endpoints.
5. Validate data retention and storage costs.

## Phase 4 - Gateway and Deployment

1. Add API gateway or edge routing for /auth, /url, /analytics.
2. Add unified Docker Compose for local dev.
3. Add CI for lint, tests, and container builds.
4. Deploy services and verify service-to-service auth.

## Phase 5 - Hardening

1. Add rate limiting and abuse protection.
2. Add audit logs for auth events.
3. Add monitoring and alerting.
4. Add backup and restore process.
